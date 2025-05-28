import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import LoadingScreen from './components/LoadingScreen';
import { useCleanupData } from './hooks/useCleanupData';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }
  
  button {
    outline: none;
    border: none;
    background: none;
    cursor: pointer;
  }
  
  input {
    outline: none;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  border-radius: 12px;
  margin: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

function App() {
    const [selectedCategory, setSelectedCategory] = useState('overview');
    const [isScanning, setIsScanning] = useState(false);
    const [appSettings, setAppSettings] = useState({});
    const { cleanupData, loading, error, refreshData, lastScanTime } = useCleanupData();

    useEffect(() => {
        loadAppSettings();
    }, []);

    const loadAppSettings = async () => {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.getAppSettings();
                if (result.success) {
                    setAppSettings(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const saveAppSettings = async (newSettings) => {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.saveAppSettings(newSettings);
                if (result.success) {
                    setAppSettings(prev => ({ ...prev, ...newSettings }));
                }
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const handleScan = async (options = {}) => {
        setIsScanning(true);
        try {
            await refreshData(options);
        } catch (error) {
            console.error('Scan failed:', error);
        } finally {
            setIsScanning(false);
        }
    };

    if (loading && !cleanupData) {
        return (
            <>
                <GlobalStyle />
                <LoadingScreen
                    message="Initializing Mac Cleanup Wizard..."
                    subtext="Please wait while we prepare the application"
                />
            </>
        );
    }

    if (isScanning) {
        return (
            <>
                <GlobalStyle />
                <LoadingScreen
                    message="Scanning your Mac..."
                    subtext="Analyzing files and directories for cleanup opportunities"
                />
            </>
        );
    }

    return (
        <>
            <GlobalStyle />
            <AppContainer>
                <ContentArea>
                    <Sidebar
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                        cleanupData={cleanupData}
                        onScan={handleScan}
                        lastScanTime={lastScanTime}
                        settings={appSettings}
                        onSettingsChange={saveAppSettings}
                    />
                    <MainContent
                        selectedCategory={selectedCategory}
                        cleanupData={cleanupData}
                        onRefresh={refreshData}
                        onCategorySelect={setSelectedCategory}
                    />
                </ContentArea>
            </AppContainer>
        </>
    );
}

export default App;
