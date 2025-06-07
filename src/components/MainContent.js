import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaEye, FaChartPie, FaExclamationTriangle, FaCheckCircle, FaCog } from 'react-icons/fa';
import OverviewPanel from './OverviewPanel';
import StorageViewer from './StorageViewer';
import CategoryPanel from './CategoryPanel';
import CleanupModal from './CleanupModal';
import Settings from './Settings';

const MainContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    position: relative;
`;const Header = styled.div`
    padding: 24px 32px;
    border-bottom: 1px solid #e5e5e5;
    background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const HeaderInfo = styled.div`
    flex: 1;
`;

const HeaderTitle = styled.h2`
    font-size: 28px;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const HeaderSubtitle = styled.p`
    color: #718096;
    font-size: 16px;
    margin: 0;
`;

const HeaderStats = styled.div`
    display: flex;
    gap: 24px;
    align-items: center;
`;

const StatCard = styled.div`
    padding: 12px 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    text-align: center;
    min-width: 100px;
`;

const StatValue = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${props => props.color || '#2d3748'};
`;

const StatLabel = styled.div`
    font-size: 12px;
    color: #718096;
    margin-top: 4px;
`;

const Content = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 24px 32px;
`;

const ActionBar = styled.div`
    padding: 20px 32px;
    border-top: 1px solid #e5e5e5;
    background: #f8f9fa;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SelectedInfo = styled.div`
    color: #4a5568;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
`;

const ActionButton = styled(motion.button)`
    background: ${props => props.danger ? '#e53e3e' : '#4299e1'};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;

    &:disabled {
        background: #a0aec0;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background: ${props => props.danger ? '#c53030' : '#3182ce'};
    }
`;

const Button = styled(motion.button)`
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    ${props => props.primary ? `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
    ` : `
        background: white;
        color: #4a5568;
        border: 2px solid #e2e8f0;

        &:hover {
            border-color: #cbd5e0;
            background: #f7fafc;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `}
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #718096;
    text-align: center;
`;

const EmptyStateIcon = styled.div`
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
`;

const EmptyStateText = styled.h3`
    font-size: 20px;
    margin-bottom: 8px;
`;

const EmptyStateSubtext = styled.p`
    font-size: 14px;
    max-width: 300px;
    margin: 0;
`; const categoryTitles = {
    overview: 'System Overview',
    developer: 'Developer Files',
    cache: 'Cache & Temporary Files',
    media: 'Media & Downloads',
    apps: 'Application Data',
    misc: 'Miscellaneous Files',
    trash: 'Trash Management',
    settings: 'Application Settings'
};

const categoryDescriptions = {
    overview: 'Get a complete overview of your Mac\'s storage usage and cleanup opportunities',
    developer: 'Clean up development-related files like node_modules, build caches, and tools',
    cache: 'Remove application caches, temporary files, and browser data',
    media: 'Manage large media files, downloads, and screenshots',
    apps: 'Clean up application support files and leftover data',
    misc: 'Remove miscellaneous files, logs, and system clutter',
    trash: 'Empty trash and recover disk space',
    settings: 'Configure application preferences and behavior'
};const MainContent = ({ selectedCategory, cleanupData, onRefresh }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [showCleanupModal, setShowCleanupModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const categoryData = cleanupData?.[selectedCategory] || {};

    const totalSelectedSize = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + (item.size || 0), 0);
    }, [selectedItems]);

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'overview': return <FaChartPie />;
            case 'developer': return '💻';
            case 'cache': return '📦';
            case 'media': return '🎬';
            case 'apps': return '📱';
            case 'misc': return '📂';
            case 'trash': return <FaTrash />;
            case 'settings': return <FaCog />;
            default: return '📁';
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleItemSelect = (item, selected) => {
        if (selected) {
            setSelectedItems(prev => [...prev, item]);
        } else {
            setSelectedItems(prev => prev.filter(i => i.path !== item.path));
        }
    };

    const handleSelectAll = (category) => {
        if (!cleanupData[category]) return;

        const categoryItems = cleanupData[category].items || [];
        const allSelected = categoryItems.every(item =>
            selectedItems.some(selected => selected.path === item.path)
        );

        if (allSelected) {
            setSelectedItems(prev =>
                prev.filter(item => !categoryItems.some(catItem => catItem.path === item.path))
            );
        } else {
            const newItems = categoryItems.filter(item =>
                !selectedItems.some(selected => selected.path === item.path)
            );
            setSelectedItems(prev => [...prev, ...newItems]);
        }
    };

    const handleCleanup = async () => {
        if (selectedItems.length === 0) return;
        setShowCleanupModal(true);
    };

    const confirmCleanup = async () => {
        setIsDeleting(true);
        try {
            if (window.electronAPI) {
                const filePaths = selectedItems.map(item => item.path);
                console.log('Starting deletion of', filePaths.length, 'files');
                
                const result = await window.electronAPI.deleteFiles(filePaths);
                
                console.log('Deletion result:', result);
                
                if (result.success) {
                    if (result.cancelled) {
                        // User cancelled the operation in confirmation dialog
                        console.log('Deletion cancelled by user');
                    } else {
                        // Deletion was successful
                        const deletionResults = result.data || [];
                        const successCount = deletionResults.filter(r => r.success).length;
                        const failureCount = deletionResults.filter(r => !r.success).length;
                        
                        console.log(`Deletion completed: ${successCount} successful, ${failureCount} failed`);
                        
                        // Clear selected items and refresh data
                        setSelectedItems([]);
                        await onRefresh();
                        
                        // Show success notification
                        if (failureCount > 0) {
                            console.warn(`${failureCount} files could not be deleted`);
                        }
                    }
                } else {
                    console.error('Deletion failed:', result.error);
                }
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
        } finally {
            setIsDeleting(false);
            setShowCleanupModal(false);
        }
    }; const renderContent = () => {
        // Handle Settings view
        if (selectedCategory === 'settings') {
            return <Settings />;
        }

        // Handle Overview
        if (selectedCategory === 'overview') {
            return (
                <>
                    <StorageViewer cleanupData={cleanupData} />
                    <div style={{ marginTop: '30px' }}>
                        <OverviewPanel cleanupData={cleanupData} onCategorySelect={() => { }} />
                    </div>
                </>
            );
        }

        // Handle empty categories
        if (!categoryData.items || categoryData.items.length === 0) {
            return (
                <EmptyState>
                    <EmptyStateIcon>
                        <FaCheckCircle />
                    </EmptyStateIcon>
                    <EmptyStateText>All Clean!</EmptyStateText>
                    <EmptyStateSubtext>
                        No files found in this category. Your Mac is looking good!
                    </EmptyStateSubtext>
                </EmptyState>
            );
        }

        // Handle regular category views
        return (
            <CategoryPanel
                category={selectedCategory}
                data={categoryData}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                onSelectAll={handleSelectAll}
            />
        );
    }; return (<MainContainer>      <Header>        <HeaderInfo>          <HeaderTitle>            {getCategoryIcon(selectedCategory)}            {categoryTitles[selectedCategory]}          </HeaderTitle>          <HeaderSubtitle>            {categoryDescriptions[selectedCategory]}          </HeaderSubtitle>        </HeaderInfo>                {selectedCategory !== 'overview' && categoryData.items && (<HeaderStats>            <StatCard>              <StatValue>{categoryData.items.length}</StatValue>              <StatLabel>Items Found</StatLabel>            </StatCard>            <StatCard>              <StatValue color="#e53e3e">{formatSize(categoryData.totalSize || 0)}</StatValue>              <StatLabel>Total Size</StatLabel>            </StatCard>          </HeaderStats>)}      </Header>      <Content>        <AnimatePresence mode="wait">          {renderContent()}        </AnimatePresence>      </Content>
        {selectedCategory !== 'overview' && selectedCategory !== 'settings' && selectedItems.length > 0 && (
            <ActionBar>
                <SelectedInfo>
                    <FaExclamationTriangle />
                    {selectedItems.length} item(s) selected ({formatSize(totalSelectedSize)})
                </SelectedInfo>

                <ActionButtons>
                    <Button
                        onClick={() => setSelectedItems([])}
                        disabled={selectedItems.length === 0}
                    >
                        Clear Selection
                    </Button>

                    <ActionButton
                        onClick={() => {
                            selectedItems.forEach(item => {
                                if (window.electronAPI) {
                                    window.electronAPI.openInFinder(item.path);
                                }
                            });
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaEye />
                        View in Finder
                    </ActionButton>

                    <ActionButton
                        danger
                        onClick={handleCleanup}
                        disabled={isDeleting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaTrash />
                        {isDeleting ? 'Cleaning...' : 'Clean Selected'}
                    </ActionButton>
                </ActionButtons>
            </ActionBar>
        )}      <CleanupModal isOpen={showCleanupModal} items={selectedItems} onConfirm={confirmCleanup} onCancel={() => setShowCleanupModal(false)} isDeleting={isDeleting} />    </MainContainer>);
}; export default MainContent;