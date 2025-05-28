import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    FaCode,
    FaDatabase,
    FaImage,
    FaCubes,
    FaEllipsisH,
    FaTrash,
    FaChartPie,
    FaSync,
    FaShieldAlt,
    FaCog
} from 'react-icons/fa';

const SidebarContainer = styled.div`
  width: 280px;
  background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const AppTitle = styled.h1`
  color: white;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const AppSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 400;
`;

const ScanButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const CategoryList = styled.div`
  flex: 1;
`;

const CategoryItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 2px solid ${props => props.active ? 'rgba(255, 255, 255, 0.3)' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const CategoryIcon = styled.div`
  font-size: 18px;
  color: white;
  margin-right: 12px;
  opacity: ${props => props.active ? 1 : 0.8};
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div`
  color: white;
  font-weight: 600;
  font-size: 14px;
  opacity: ${props => props.active ? 1 : 0.9};
`;

const CategorySize = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-top: 2px;
`;

const Footer = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
`;

const categories = [
    {
        id: 'overview',
        name: 'Overview',
        icon: FaChartPie
    },
    {
        id: 'developer',
        name: 'Developer Files',
        icon: FaCode
    },
    {
        id: 'cache',
        name: 'Cache & Temp',
        icon: FaDatabase
    },
    {
        id: 'media',
        name: 'Media & Downloads',
        icon: FaImage
    },
    {
        id: 'apps',
        name: 'App Data',
        icon: FaCubes
    },
    {
        id: 'misc',
        name: 'Miscellaneous',
        icon: FaEllipsisH
    },
    {
        id: 'trash',
        name: 'Trash',
        icon: FaTrash
    },
    {
        id: 'settings',
        name: 'Settings',
        icon: FaCog
    }
];

const Sidebar = ({ selectedCategory, onCategorySelect, cleanupData, onScan }) => {
    const getTotalSize = (categoryData) => {
        if (!categoryData || !categoryData.items) return 0;
        return categoryData.items.reduce((total, item) => total + item.size, 0);
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getTotalSystemSize = () => {
        if (!cleanupData) return 0;
        return Object.values(cleanupData).reduce((total, category) => {
            return total + getTotalSize(category);
        }, 0);
    };

    return (
        <SidebarContainer>
            <Header>
                <AppTitle>🧹 Mac Cleanup Wizard</AppTitle>
                <AppSubtitle>Fast & Secure Cleanup</AppSubtitle>
            </Header>

            <ScanButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onScan}
            >
                <FaSync />
                Scan System
            </ScanButton>

            <CategoryList>
                {categories.map((category) => {
                    const isSettings = category.id === 'settings';
                    const categoryData = !isSettings ? cleanupData?.[category.id] : null;
                    const totalSize = category.id === 'overview' ? getTotalSystemSize() : getTotalSize(categoryData);
                    const itemCount = categoryData?.items?.length || 0;

                    return (
                        <CategoryItem
                            key={category.id}
                            active={selectedCategory === category.id}
                            onClick={() => onCategorySelect(category.id)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <CategoryIcon active={selectedCategory === category.id}>
                                <category.icon />
                            </CategoryIcon>
                            <CategoryInfo>
                                <CategoryName active={selectedCategory === category.id}>
                                    {category.name}
                                </CategoryName>
                                <CategorySize>
                                    {isSettings
                                        ? "App preferences"
                                        : category.id === 'overview'
                                            ? `${formatSize(totalSize)} total`
                                            : `${itemCount} items • ${formatSize(totalSize)}`
                                    }
                                </CategorySize>
                            </CategoryInfo>
                        </CategoryItem>
                    );
                })}
            </CategoryList>

            <Footer>
                <SecurityBadge>
                    <FaShieldAlt />
                    Safe & Secure
                </SecurityBadge>
            </Footer>
        </SidebarContainer>
    );
};

export default Sidebar;
