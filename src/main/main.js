const { app, BrowserWindow, ipcMain, dialog, shell, Menu, nativeTheme } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs-extra');
const glob = require('fast-glob');
const os = require('os');
const Store = require('electron-store');
const sudoPrompt = require('sudo-prompt');

// Promisify exec for better async handling
const execPromise = promisify(exec);

// Custom file size formatter to avoid dependency issues
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Default app settings
const defaultSettings = {
    appearance: {
        theme: 'auto', // 'light', 'dark', or 'auto'
        accentColor: '#667eea',
        showAnimations: true
    },
    scan: {
        includeHiddenFiles: false,
        minimumFileSize: 1024 * 1024, // 1MB
        notificationOnComplete: true,
        scanOnStartup: false
    },
    cleanup: {
        confirmBeforeDelete: true,
        moveToTrashFirst: true,
        showDeleteWarnings: true,
        skipSystemFiles: true
    },
    general: {
        startMinimized: false,
        checkForUpdatesAutomatically: true,
        analyticsEnabled: false,
        lastScanDate: null
    }
};

// Initialize settings store with schema validation
const store = new Store({
    defaults: defaultSettings,
    schema: {
        appearance: {
            type: 'object',
            properties: {
                theme: { type: 'string', enum: ['light', 'dark', 'auto'] },
                accentColor: { type: 'string' },
                showAnimations: { type: 'boolean' }
            }
        },
        scan: {
            type: 'object',
            properties: {
                includeHiddenFiles: { type: 'boolean' },
                minimumFileSize: { type: 'number' },
                notificationOnComplete: { type: 'boolean' },
                scanOnStartup: { type: 'boolean' }
            }
        },
        cleanup: {
            type: 'object',
            properties: {
                confirmBeforeDelete: { type: 'boolean' },
                moveToTrashFirst: { type: 'boolean' },
                showDeleteWarnings: { type: 'boolean' },
                skipSystemFiles: { type: 'boolean' }
            }
        },
        general: {
            type: 'object',
            properties: {
                startMinimized: { type: 'boolean' },
                checkForUpdatesAutomatically: { type: 'boolean' },
                analyticsEnabled: { type: 'boolean' },
                lastScanDate: { type: ['string', 'null'] }
            }
        }
    }
});

let mainWindow;
const scanCache = new Map();

// Security whitelist for safe deletion
const SAFE_DELETION_PATHS = [
    '/node_modules',
    '/.npm',
    '/.yarn',
    '/.pnpm-store',
    '/Library/Caches',
    '/Library/Logs',
    '/.Trash',
    '/Downloads',
    '/Library/Developer/Xcode/DerivedData',
    '/Library/Developer/CoreSimulator/Devices',
    '/__pycache__',
    '/.venv',
    // Homebrew related paths
    '/usr/local/Homebrew',
    '/opt/homebrew',
    '/usr/homebrew',
    '/usr/local/Cellar',
    '/Library/Caches/Homebrew',
    '/opt/homebrew/var/homebrew'
];

function createWindow() {
    // Check if we should start minimized based on settings
    const startMinimized = store.get('general.startMinimized', false);

    // Get user's theme preference
    const themePreference = store.get('appearance.theme', 'auto');

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false
        },
        titleBarStyle: 'hiddenInset',
        show: !startMinimized,
        icon: path.join(__dirname, '../../assets/icon.icns'),
        vibrancy: 'under-window',
        visualEffectState: 'active'
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../../build/index.html')}`;

    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        if (!startMinimized) {
            mainWindow.show();
        }

        // Apply theme immediately after window is ready
        applyTheme(themePreference);

        // Run startup scan if enabled in settings
        if (store.get('scan.scanOnStartup', false)) {
            mainWindow.webContents.send('trigger-startup-scan');
        }
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Check required permissions
async function checkPermissions() {
    try {
        // Get main directories we'll need to access
        const homeDir = os.homedir();
        const testPaths = [
            path.join(homeDir, 'Library'),
            path.join(homeDir, 'Downloads'),
            path.join(homeDir, 'Documents')
        ];

        // Test basic read access
        for (const testPath of testPaths) {
            try {
                await fs.access(testPath, fs.constants.R_OK);
                console.log(`Read permission OK: ${testPath}`);
            } catch (err) {
                console.log(`Read permission issues with ${testPath}: ${err.message}`);
            }
        }

        return true;
    } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
    }
}

app.whenReady().then(async () => {
    // Check permissions before creating window
    await checkPermissions();
    createWindow();
    createMenu();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC Handlers with security validation
ipcMain.handle('scan-system', async (event, options = {}) => {
    try {
        const cacheKey = JSON.stringify(options);

        // Check cache first (5 minute expiry)
        if (scanCache.has(cacheKey)) {
            const cached = scanCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
                return { success: true, data: cached.data, fromCache: true };
            }
        }

        const results = await scanSystem(options);

        // Cache results
        scanCache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });

        return { success: true, data: results };
    } catch (error) {
        console.error('Scan error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-files', async (event, filePaths, options = {}) => {
    try {
        // Security validation
        if (!Array.isArray(filePaths) || filePaths.length === 0) {
            throw new Error('Invalid file paths provided');
        }

        // Validate all paths are safe for deletion
        const criticalPaths = filePaths.filter(filePath => !isPathSafeForDeletion(filePath));

        // Show extra confirmation for critical system paths
        if (criticalPaths.length > 0) {
            const choice = await dialog.showMessageBox(mainWindow, {
                type: 'warning',
                buttons: ['Cancel', 'Delete Anyway'],
                defaultId: 0,
                title: 'Critical System Files Detected',
                message: `WARNING: You are about to delete ${criticalPaths.length} system-critical file(s).`,
                detail: `This could potentially harm your system. Are you absolutely sure you want to continue?\n\nCritical files:\n${criticalPaths.slice(0, 5).join('\n')}${criticalPaths.length > 5 ? '\n...' : ''}`
            });

            if (choice.response === 0) {
                return { success: false, cancelled: true };
            }
        }

        // Check if any paths are not in safe deletion list - show warning but don't block
        const potentiallyUnsafePaths = filePaths.filter(filePath => {
            const normalizedPath = filePath.replace(/\/+$/, '');
            return !SAFE_DELETION_PATHS.some(safePath => normalizedPath.includes(safePath));
        });

        // Show extra confirmation for paths not in safe list
        if (potentiallyUnsafePaths.length > 0 && options.requireConfirmation !== false) {
            const choice = await dialog.showMessageBox(mainWindow, {
                type: 'warning',
                buttons: ['Cancel', 'Delete Anyway'],
                defaultId: 0,
                title: 'Unsafe Path Warning',
                message: `${potentiallyUnsafePaths.length} path(s) are not in the safe deletion list.`,
                detail: `This includes:\n${potentiallyUnsafePaths.slice(0, 3).join('\n')}${potentiallyUnsafePaths.length > 3 ? '\n...' : ''}\n\nAre you absolutely sure you want to delete these?`
            });

            if (choice.response === 0) {
                return { success: false, cancelled: true };
            }
        }

        // Show standard confirmation dialog
        if (options.requireConfirmation !== false) {
            const choice = await dialog.showMessageBox(mainWindow, {
                type: 'warning',
                buttons: ['Cancel', 'Delete'],
                defaultId: 0,
                title: 'Confirm Deletion',
                message: `Are you sure you want to delete ${filePaths.length} item(s)?`,
                detail: 'This action cannot be undone.'
            });

            if (choice.response === 0) {
                return { success: false, cancelled: true };
            }
        }

        const result = await deleteFiles(filePaths, options);

        // Clear cache after deletion
        scanCache.clear();

        return { success: true, data: result };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-file-size', async (event, filePath) => {
    try {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Invalid file path');
        }

        const stats = await fs.stat(filePath);
        return { success: true, size: stats.size };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-in-finder', async (event, filePath) => {
    try {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Invalid file path');
        }

        shell.showItemInFolder(filePath);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-disk-usage', async () => {
    try {
        const usage = await getDiskUsage();
        return { success: true, data: usage };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('empty-trash', async () => {
    try {
        const result = await emptyTrash();
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-app-settings', async () => {
    try {
        return { success: true, data: store.store };
    } catch (error) {
        console.error('Failed to get app settings:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-app-settings', async (event, settings) => {
    try {
        // Handle nested settings objects
        const mergeSettings = (target, source) => {
            for (const key in source) {
                if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    // Get current value or create empty object if it doesn't exist
                    const currentValue = store.get(key) || {};
                    // Recursively merge
                    store.set(key, mergeSettings(currentValue, source[key]));
                } else {
                    // Directly set value
                    store.set(key, source[key]);
                }
            }
            return store.get(key);
        };

        mergeSettings(store.store, settings);

        // Apply theme changes immediately if needed
        if (settings.appearance && settings.appearance.theme && mainWindow) {
            applyTheme(settings.appearance.theme);
        }

        return { success: true, data: store.store };
    } catch (error) {
        console.error('Failed to save app settings:', error);
        return { success: false, error: error.message };
    }
});

// Helper function to get settings with defaults
ipcMain.handle('get-settings-with-default', async (event, key, defaultValue) => {
    try {
        const value = store.get(key, defaultValue);
        return { success: true, data: value };
    } catch (error) {
        console.error(`Failed to get setting ${key}:`, error);
        return { success: false, error: error.message };
    }
});

// Reset settings to defaults
ipcMain.handle('reset-app-settings', async () => {
    try {
        store.clear();
        store.store = JSON.parse(JSON.stringify(defaultSettings)); // Deep clone defaults
        return { success: true, data: store.store };
    } catch (error) {
        console.error('Failed to reset app settings:', error);
        return { success: false, error: error.message };
    }
});

// Apply theme based on settings
function applyTheme(theme) {
    if (!mainWindow) return;

    if (theme === 'auto') {
        // Use system preference
        const isDarkMode = nativeTheme.shouldUseDarkColors;
        mainWindow.webContents.send('theme-changed', isDarkMode ? 'dark' : 'light');
    } else {
        mainWindow.webContents.send('theme-changed', theme);
    }
}

// System scanning functions with enhanced performance and timeout protection
async function scanSystem(options = {}) {
    const scanId = `scanSystem_${Date.now()}`;
    console.time(scanId);
    const homeDir = os.homedir();
    const categories = {
        developer: {
            name: 'Developer Files',
            description: 'Node modules, Python environments, Xcode data, and more',
            items: [],
            totalSize: 0
        },
        cache: {
            name: 'Cache & Temp Files',
            description: 'Browser caches, app caches, and temporary files',
            items: [],
            totalSize: 0
        },
        media: {
            name: 'Media & Downloads',
            description: 'Large media files, downloads, and screenshots',
            items: [],
            totalSize: 0
        },
        apps: {
            name: 'App Data',
            description: 'Application support files and user data',
            items: [],
            totalSize: 0
        },
        misc: {
            name: 'Miscellaneous',
            description: 'Mail data, logs, and other system files',
            items: [],
            totalSize: 0
        },
        trash: {
            name: 'Trash',
            description: 'Files in your trash bin',
            items: [],
            totalSize: 0
        }
    };

    try {
        // Use a quick scan approach with a timeout to prevent hanging
        const fastScanTimeout = options.fastScan ? 10000 : 30000; // 10s for fast scan, 30s otherwise

        // Create scan functions with timeout protection
        const createTimedScan = (scanFn, category, options, timeout) => {
            return new Promise(resolve => {
                // Set timeout to resolve even if the scan gets stuck
                const timer = setTimeout(() => {
                    console.warn(`Scan timeout for ${category.name}`);
                    resolve();
                }, timeout);

                scanFn(homeDir, category, options)
                    .catch(error => console.error(`Error in ${category.name} scan:`, error))
                    .finally(() => {
                        clearTimeout(timer);
                        resolve();
                    });
            });
        };

        // Run scans in parallel with timeouts for each category
        await Promise.all([
            createTimedScan(scanDeveloperFiles, categories.developer, options, fastScanTimeout),
            createTimedScan(scanCacheFiles, categories.cache, options, fastScanTimeout),
            createTimedScan(scanMediaFiles, categories.media, options, fastScanTimeout),
            createTimedScan(scanAppData, categories.apps, options, fastScanTimeout),
            createTimedScan(scanMiscFiles, categories.misc, options, fastScanTimeout),
            createTimedScan(scanTrash, categories.trash, options, fastScanTimeout)
        ]);

        // Calculate total sizes
        Object.values(categories).forEach(category => {
            category.totalSize = category.items.reduce((sum, item) => sum + item.size, 0);
            category.totalSizeFormatted = formatFileSize(category.totalSize);
        });

        console.timeEnd(scanId);
        return categories;
    } catch (error) {
        console.error('Scan system error:', error);
        console.timeEnd(scanId);

        // Ensure we return at least empty data structure even if scan fails
        Object.values(categories).forEach(category => {
            category.totalSizeFormatted = '0 B';
        });

        return categories;
    }
}

async function scanDeveloperFiles(homeDir, category, options = {}) {
    const minSize = options.minSize || 10 * 1024 * 1024; // 10MB

    const scanTargets = [
        // Node.js
        { pattern: '**/node_modules', type: 'Node.js', description: 'Node.js dependencies' },
        { pattern: `${homeDir}/.npm`, type: 'NPM Cache', description: 'NPM package cache' },
        { pattern: `${homeDir}/.yarn`, type: 'Yarn Cache', description: 'Yarn package cache' },
        { pattern: `${homeDir}/.pnpm-store`, type: 'PNPM Cache', description: 'PNPM package cache' },
        { pattern: `${homeDir}/.nvm/versions`, type: 'NVM', description: 'Node version manager files' },

        // Python
        { pattern: '**/.venv', type: 'Python', description: 'Python virtual environments' },
        { pattern: '**/venv', type: 'Python', description: 'Python virtual environments' },
        { pattern: '**/__pycache__', type: 'Python', description: 'Python cache files' },
        { pattern: `${homeDir}/anaconda3`, type: 'Anaconda', description: 'Anaconda Python distribution' },
        { pattern: `${homeDir}/miniconda3`, type: 'Miniconda', description: 'Miniconda Python distribution' },

        // Development Tools
        { pattern: `${homeDir}/Library/Developer/Xcode/DerivedData/*`, type: 'Xcode', description: 'Xcode build data' },
        { pattern: `${homeDir}/Library/Developer/CoreSimulator/Devices/*`, type: 'iOS Simulator', description: 'iOS Simulator devices' },
        { pattern: `${homeDir}/Library/Caches/com.apple.dt.Xcode`, type: 'Xcode Cache', description: 'Xcode cache files' },

        // Package Managers
        { pattern: '/usr/local/Cellar/*', type: 'Homebrew', description: 'Homebrew packages' },
        { pattern: '/opt/homebrew/Cellar/*', type: 'Homebrew', description: 'Homebrew packages (Apple Silicon)' },
        { pattern: '/Library/Caches/Homebrew', type: 'Homebrew Cache', description: 'Homebrew cache' },

        // Docker
        { pattern: `${homeDir}/Library/Containers/com.docker.docker`, type: 'Docker', description: 'Docker containers and images' },

        // IDEs
        { pattern: `${homeDir}/.vscode/extensions`, type: 'VS Code', description: 'VS Code extensions' },
        { pattern: `${homeDir}/Library/Application Support/Code`, type: 'VS Code', description: 'VS Code application data' },
        { pattern: `${homeDir}/Library/Caches/JetBrains`, type: 'JetBrains', description: 'IntelliJ/PyCharm caches' }
    ];

    for (const target of scanTargets) {
        try {
            const matches = await glob(target.pattern, {
                onlyDirectories: true,
                absolute: true,
                ignore: ['**/.*/**'],
                suppressErrors: true,
                followSymbolicLinks: false
            });

            for (const match of matches) {
                try {
                    const size = await getDirectorySizeFast(match);
                    if (size >= minSize) {
                        category.items.push({
                            path: match,
                            name: path.basename(match),
                            size: size,
                            sizeFormatted: formatFileSize(size),
                            type: target.type,
                            description: target.description,
                            selected: false,
                            lastModified: await getLastModified(match),
                            canDelete: isPathSafeForDeletion(match)
                        });
                    }
                } catch (error) {
                    // Skip files that can't be accessed
                    continue;
                }
            }
        } catch (error) {
            console.log(`Error scanning pattern ${target.pattern}:`, error.message);
        }
    }
}

async function scanCacheFiles(homeDir, category, options = {}) {
    const minSize = options.minSize || 50 * 1024 * 1024; // 50MB

    const cacheTargets = [
        // System Caches
        { path: `${homeDir}/Library/Caches`, type: 'System Cache', description: 'System application caches' },
        { path: '/Library/Caches', type: 'Global Cache', description: 'System-wide caches' },

        // Browser Caches
        { path: `${homeDir}/Library/Application Support/Google/Chrome`, type: 'Chrome', description: 'Chrome browser data' },
        { path: `${homeDir}/Library/Caches/Google/Chrome`, type: 'Chrome Cache', description: 'Chrome cache files' },
        { path: `${homeDir}/Library/Application Support/Firefox`, type: 'Firefox', description: 'Firefox browser data' },
        { path: `${homeDir}/Library/Safari`, type: 'Safari', description: 'Safari browser data' },
        { path: `${homeDir}/Library/Caches/com.apple.Safari`, type: 'Safari Cache', description: 'Safari cache files' },

        // Communication Apps
        { path: `${homeDir}/Library/Application Support/Slack`, type: 'Slack', description: 'Slack application data' },
        { path: `${homeDir}/Library/Application Support/discord`, type: 'Discord', description: 'Discord application data' },
        { path: `${homeDir}/Library/Application Support/Zoom`, type: 'Zoom', description: 'Zoom application data' },

        // Development Caches
        { path: `${homeDir}/.gradle/caches`, type: 'Gradle Cache', description: 'Gradle build cache' },
        { path: `${homeDir}/.m2/repository`, type: 'Maven Cache', description: 'Maven repository cache' },

        // Logs
        { path: `${homeDir}/Library/Logs`, type: 'User Logs', description: 'User application logs' },
        { path: '/Library/Logs', type: 'System Logs', description: 'System logs' }
    ];

    for (const target of cacheTargets) {
        try {
            if (await fs.pathExists(target.path)) {
                const size = await getDirectorySizeFast(target.path);
                if (size >= minSize) {
                    category.items.push({
                        path: target.path,
                        name: path.basename(target.path),
                        size: size,
                        sizeFormatted: formatFileSize(size),
                        type: target.type,
                        description: target.description,
                        selected: false,
                        lastModified: await getLastModified(target.path),
                        canDelete: isPathSafeForDeletion(target.path)
                    });
                }
            }
        } catch (error) {
            console.log(`Error scanning cache ${target.path}:`, error.message);
        }
    }
}

async function scanMediaFiles(homeDir, category, options = {}) {
    const minSize = options.minSize || 100 * 1024 * 1024; // 100MB
    const mediaExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.mp3', '.wav', '.flac', '.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', '.dmg', '.iso'];

    const mediaPaths = [
        { path: `${homeDir}/Downloads`, type: 'Downloads', description: 'Downloaded files' },
        { path: `${homeDir}/Movies`, type: 'Movies', description: 'Movie files' },
        { path: `${homeDir}/Pictures/Screenshots`, type: 'Screenshots', description: 'Screenshot files' },
        { path: `${homeDir}/Desktop`, type: 'Desktop', description: 'Desktop files' }
    ];

    for (const mediaPath of mediaPaths) {
        try {
            if (await fs.pathExists(mediaPath.path)) {
                const files = await fs.readdir(mediaPath.path);

                for (const file of files) {
                    const filePath = path.join(mediaPath.path, file);
                    try {
                        const stats = await fs.stat(filePath);
                        const ext = path.extname(file).toLowerCase();

                        if (stats.isFile() && stats.size >= minSize && mediaExtensions.includes(ext)) {
                            category.items.push({
                                path: filePath,
                                name: file,
                                size: stats.size,
                                sizeFormatted: formatFileSize(stats.size),
                                type: mediaPath.type,
                                description: mediaPath.description,
                                selected: false,
                                lastModified: stats.mtime,
                                canDelete: true,
                                extension: ext
                            });
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
        } catch (error) {
            console.log(`Error scanning media ${mediaPath.path}:`, error.message);
        }
    }
}

async function scanAppData(homeDir, category, options = {}) {
    const minSize = options.minSize || 100 * 1024 * 1024; // 100MB
    const appDataPath = `${homeDir}/Library/Application Support`;

    try {
        if (await fs.pathExists(appDataPath)) {
            const apps = await fs.readdir(appDataPath);

            for (const app of apps) {
                const appPath = path.join(appDataPath, app);
                try {
                    const stats = await fs.stat(appPath);

                    if (stats.isDirectory()) {
                        const size = await getDirectorySizeFast(appPath);
                        if (size >= minSize) {
                            category.items.push({
                                path: appPath,
                                name: app,
                                size: size,
                                sizeFormatted: formatFileSize(size),
                                type: 'App Data',
                                description: `Application support files for ${app}`,
                                selected: false,
                                lastModified: await getLastModified(appPath),
                                canDelete: isPathSafeForDeletion(appPath)
                            });
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
        }
    } catch (error) {
        console.log('Error scanning app data:', error.message);
    }
}

async function scanMiscFiles(homeDir, category, options = {}) {
    const minSize = options.minSize || 50 * 1024 * 1024; // 50MB

    const miscTargets = [
        { path: `${homeDir}/.Trash`, type: 'Trash', description: 'Files in trash bin' },
        { path: `${homeDir}/Library/Mail`, type: 'Mail', description: 'Mail application data' },
        { path: `${homeDir}/Library/Containers`, type: 'Containers', description: 'App sandboxed data' },
        { path: '/private/var/folders', type: 'Temp Files', description: 'System temporary files' },
        { path: `${homeDir}/Library/Mobile Documents`, type: 'iCloud', description: 'iCloud Drive local cache' }
    ];

    for (const target of miscTargets) {
        try {
            if (await fs.pathExists(target.path)) {
                const size = await getDirectorySizeFast(target.path);
                if (size >= minSize) {
                    category.items.push({
                        path: target.path,
                        name: path.basename(target.path),
                        size: size,
                        sizeFormatted: formatFileSize(size),
                        type: target.type,
                        description: target.description,
                        selected: false,
                        lastModified: await getLastModified(target.path),
                        canDelete: isPathSafeForDeletion(target.path)
                    });
                }
            }
        } catch (error) {
            console.log(`Error scanning misc ${target.path}:`, error.message);
        }
    }
}

async function scanTrash(homeDir, category, options = {}) {
    const trashPath = `${homeDir}/.Trash`;

    try {
        if (await fs.pathExists(trashPath)) {
            const size = await getDirectorySizeFast(trashPath);
            if (size > 0) {
                category.items.push({
                    path: trashPath,
                    name: 'Trash',
                    size: size,
                    sizeFormatted: formatFileSize(size),
                    type: 'Trash',
                    description: 'Files waiting to be permanently deleted',
                    selected: false,
                    lastModified: await getLastModified(trashPath),
                    canDelete: true
                });
            }
        }
    } catch (error) {
        console.log('Error scanning trash:', error.message);
    }
}

async function getDirectorySize(dirPath) {
    try {
        const stats = await fs.stat(dirPath);
        if (stats.isFile()) {
            return stats.size;
        }

        let size = 0;
        const files = await fs.readdir(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            try {
                const fileStats = await fs.stat(filePath);
                if (fileStats.isDirectory()) {
                    size += await getDirectorySize(filePath);
                } else {
                    size += fileStats.size;
                }
            } catch (error) {
                // Skip files that can't be accessed
                continue;
            }
        }

        return size;
    } catch (error) {
        return 0;
    }
}

function getDeveloperFileType(filePath) {
    if (filePath.includes('node_modules')) return 'Node.js';
    if (filePath.includes('.venv') || filePath.includes('__pycache__')) return 'Python';
    if (filePath.includes('Xcode')) return 'Xcode';
    if (filePath.includes('Cellar')) return 'Homebrew';
    if (filePath.includes('.npm')) return 'NPM Cache';
    if (filePath.includes('.yarn')) return 'Yarn Cache';
    return 'Developer';
}

async function getDirectorySizeFast(dirPath) {
    try {
        return new Promise((resolve) => {
            // Add timeout to prevent hanging
            const timeout = setTimeout(() => {
                // Only log timeout for directories we're actually trying to clean
                if (!isSystemProtectedPath(dirPath)) {
                    console.warn(`Directory size calculation timed out for: ${dirPath}`);
                }
                resolve(0);
            }, 5000); // 5 second timeout

            // Escape path properly for shell command
            const escapedPath = dirPath.replace(/'/g, "'\\''");

            exec(`du -sk '${escapedPath}' 2>/dev/null`, { timeout: 4000 }, (error, stdout) => {
                clearTimeout(timeout);

                if (error) {
                    // Only log errors for directories we're actually trying to clean
                    if (!isSystemProtectedPath(dirPath)) {
                        console.log(`Error getting size for ${dirPath}: ${error.message}`);
                    }
                    resolve(0);
                    return;
                }

                try {
                    const sizeInKB = parseInt(stdout.split('\t')[0]) || 0;
                    resolve(sizeInKB * 1024);
                } catch (parseError) {
                    if (!isSystemProtectedPath(dirPath)) {
                        console.log(`Parse error for ${dirPath}: ${parseError.message}`);
                    }
                    resolve(0);
                }
            });
        });
    } catch (error) {
        if (!isSystemProtectedPath(dirPath)) {
            console.error(`Critical error measuring directory size for ${dirPath}:`, error);
        }
        return 0;
    }
}

// Helper function to check if a path is system-protected (to reduce noise in logs)
function isSystemProtectedPath(dirPath) {
    const protectedPaths = [
        '/System/', '/private/', 'DifferentialPrivacy', 'FaceTime', 'FileProvider',
        'Knowledge', 'com.apple.TCC', 'com.apple.avfoundation', 'com.apple.sharedfilelist',
        'Safari', 'com.apple.Safari', '/Library/Application Support/com.apple'
    ];

    return protectedPaths.some(protectedPath => dirPath.includes(protectedPath));
}

async function getLastModified(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats.mtime;
    } catch (error) {
        return new Date();
    }
}

// Check if a path needs admin privileges to delete
async function needsAdminForPath(filePath) {
    try {
        // Test if we can write to the parent directory
        const parentDir = path.dirname(filePath);
        await fs.access(parentDir, fs.constants.W_OK);

        // Test if we can write to the file/directory itself
        await fs.access(filePath, fs.constants.W_OK);
        return false;
    } catch (error) {
        // If we can't write, we likely need admin privileges
        return true;
    }
}

function isPathSafeForDeletion(filePath) {
    // Normalize path for consistent comparison
    const normalizedPath = filePath.replace(/\/+$/, '');

    // Always prevent deletion of system critical paths
    const CRITICAL_PATHS = [
        '/System',
        '/usr/bin',
        '/bin',
        '/sbin',
        '/var/db',
        '/private/var/db',
        '/etc',
        '/Applications'
    ];

    for (const criticalPath of CRITICAL_PATHS) {
        // Block paths that could be system critical
        if (normalizedPath === criticalPath ||
            normalizedPath.startsWith(criticalPath + '/')) {
            return false;
        }
    }

    // For paths not in safe list, we'll allow deletion but show extra confirmation
    return true;
}

async function getDiskUsage() {
    return new Promise((resolve, reject) => {
        exec('df -h /', (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }

            const lines = stdout.trim().split('\n');
            const dataLine = lines[1].split(/\s+/);

            resolve({
                total: dataLine[1],
                used: dataLine[2],
                available: dataLine[3],
                percentage: dataLine[4]
            });
        });
    });
}

async function emptyTrash() {
    return new Promise((resolve, reject) => {
        const options = {
            name: 'Mac Cleanup Wizard'
        };

        sudoPrompt.exec('rm -rf ~/.Trash/*', options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({ success: true, message: 'Trash emptied successfully' });
        });
    });
}

// Enhanced file deletion with better error handling
async function deleteFiles(filePaths, options = {}) {
    const results = [];
    // Get user preference from settings, falling back to options parameter
    const useTrash = options.moveToTrash !== undefined
        ? options.moveToTrash
        : store.get('cleanup.moveToTrashFirst', true);

    console.log(`Deleting ${filePaths.length} files, useTrash: ${useTrash}`);

    for (const filePath of filePaths) {
        try {
            // Skip if file doesn't exist
            const exists = await fs.pathExists(filePath);
            if (!exists) {
                results.push({
                    path: filePath,
                    success: false,
                    error: 'File not found'
                });
                continue;
            }

            // Check if we need admin rights for this path
            const needsAdmin = await needsAdminForPath(filePath);

            if (useTrash) {
                // Move to trash instead of permanent deletion
                if (needsAdmin) {
                    // For paths requiring admin, we need a different approach
                    const command = `osascript -e 'tell application "Finder" to delete POSIX file "${filePath}"'`;
                    await execPromise(command);
                } else {
                    await shell.trashItem(filePath);
                }
            } else {
                if (needsAdmin) {
                    // Use sudo-prompt for admin deletion
                    await new Promise((resolve, reject) => {
                        sudoPrompt.exec(`rm -rf "${filePath}"`, {
                            name: 'Mac Cleanup Wizard'
                        }, (error) => {
                            if (error) reject(error);
                            else resolve();
                        });
                    });
                } else {
                    await fs.remove(filePath);
                }
            }

            results.push({
                path: filePath,
                success: true,
                method: useTrash ? 'trash' : 'delete',
                adminRequired: needsAdmin
            });
        } catch (error) {
            console.error(`Error deleting ${filePath}:`, error);
            results.push({
                path: filePath,
                success: false,
                error: error.message
            });
        }
    }

    return results;
}

// Create application menu
function createMenu() {
    const template = [
        {
            label: 'Mac Cleanup Wizard',
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'Scan System',
                    accelerator: 'Cmd+R',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('trigger-scan');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Empty Trash',
                    accelerator: 'Cmd+Shift+Delete',
                    click: async () => {
                        try {
                            await emptyTrash();
                        } catch (error) {
                            console.error('Failed to empty trash:', error);
                        }
                    }
                },
                { type: 'separator' },
                { role: 'close' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
