import { useState, useEffect, useCallback } from 'react';

export const useCleanupData = () => {
    const [cleanupData, setCleanupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastScanTime, setLastScanTime] = useState(null);

    const fetchData = useCallback(async (options = {}) => {
        try {
            setLoading(true);
            setError(null);

            if (window.electronAPI) {
                // Add a timeout to prevent stuck loading screen
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Scan timed out')), 30000);
                });

                try {
                    const result = await Promise.race([
                        window.electronAPI.scanSystem(options),
                        timeoutPromise
                    ]);

                    if (result.success) {
                        setCleanupData(result.data);
                        setLastScanTime(new Date());
                    } else {
                        console.error('Scan error:', result.error);
                        setError(result.error);
                        // Use mock data if scan fails
                        setCleanupData(getMockData());
                    }
                } catch (timeoutError) {
                    console.error('Scan timeout:', timeoutError);
                    setError('Scan timed out. Using sample data instead.');
                    setCleanupData(getMockData());
                    setLastScanTime(new Date());
                }
            } else {
                // Fallback for development
                setCleanupData(getMockData());
                setLastScanTime(new Date());
            }
        } catch (err) {
            setError(err.message);
            console.error('Scan failed:', err);
            // Use mock data if scan fails
            setCleanupData(getMockData());
            setLastScanTime(new Date());
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshData = useCallback(async (options = {}) => {
        await fetchData(options);
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        cleanupData,
        loading,
        error,
        refreshData,
        lastScanTime
    };
};

// Mock data for development
const getMockData = () => ({
    developer: {
        name: 'Developer Files',
        items: [
            {
                path: '/Users/test/project/node_modules',
                name: 'node_modules',
                size: 524288000,
                sizeFormatted: '500 MB',
                type: 'Node.js',
                selected: false
            },
            {
                path: '/Users/test/.npm',
                name: '.npm',
                size: 268435456,
                sizeFormatted: '256 MB',
                type: 'NPM Cache',
                selected: false
            }
        ]
    },
    cache: {
        name: 'Cache & Temp Files',
        items: [
            {
                path: '/Users/test/Library/Caches/com.apple.Safari',
                name: 'Safari Cache',
                size: 1073741824,
                sizeFormatted: '1 GB',
                type: 'cache',
                selected: false
            }
        ]
    },
    media: {
        name: 'Media & Downloads',
        items: []
    },
    apps: {
        name: 'App Data',
        items: []
    },
    misc: {
        name: 'Miscellaneous',
        items: []
    },
    trash: {
        name: 'Trash',
        items: []
    }
});
