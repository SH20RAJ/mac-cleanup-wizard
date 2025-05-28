import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    FaCode,
    FaDatabase,
    FaImage,
    FaCubes,
    FaEllipsisH,
    FaTrash,
    FaHdd,
    FaExclamationTriangle,
    FaCheckCircle,
    FaChartPie
} from 'react-icons/fa';

const OverviewContainer = styled(motion.div)`
  padding: 20px 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.gradient});
  border-radius: 16px;
  padding: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30px, -30px);
  }
`;

const StatIcon = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
  opacity: 0.9;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
`;

const CategorySection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const CategoryCard = styled(motion.div)`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const CategoryIcon = styled.div`
  font-size: 20px;
  color: #667eea;
  margin-right: 12px;
`;

const CategoryName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  flex: 1;
`;

const CategorySize = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
`;

const CategoryStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
`;

const ItemCount = styled.div`
  font-size: 12px;
  color: #718096;
`;

const CleanupPotential = styled.div`
  font-size: 12px;
  color: ${props => props.high ? '#e53e3e' : props.medium ? '#d69e2e' : '#38a169'};
  font-weight: 600;
`;

const RecommendationCard = styled(motion.div)`
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  color: #2d3748;
`;

const RecommendationTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RecommendationText = styled.p`
  font-size: 14px;
  line-height: 1.5;
`;

const categories = [
    {
        id: 'developer',
        name: 'Developer Files',
        icon: FaCode,
        description: 'node_modules, build caches, tools'
    },
    {
        id: 'cache',
        name: 'Cache & Temp',
        icon: FaDatabase,
        description: 'App caches, browser data'
    },
    {
        id: 'media',
        name: 'Media & Downloads',
        icon: FaImage,
        description: 'Large files, screenshots'
    },
    {
        id: 'apps',
        name: 'App Data',
        icon: FaCubes,
        description: 'Application support files'
    },
    {
        id: 'misc',
        name: 'Miscellaneous',
        icon: FaEllipsisH,
        description: 'Logs, system files'
    },
    {
        id: 'trash',
        name: 'Trash',
        icon: FaTrash,
        description: 'Deleted files to purge'
    }
];

const OverviewPanel = ({ cleanupData, onCategorySelect }) => {
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getTotalSize = (categoryData) => {
        if (!categoryData || !categoryData.items) return 0;
        return categoryData.items.reduce((total, item) => total + item.size, 0);
    };

    const getTotalSystemSize = () => {
        if (!cleanupData) return 0;
        return Object.values(cleanupData).reduce((total, category) => {
            return total + getTotalSize(category);
        }, 0);
    };

    const getTotalItems = () => {
        if (!cleanupData) return 0;
        return Object.values(cleanupData).reduce((total, category) => {
            return total + (category.items?.length || 0);
        }, 0);
    };

    const getLargestCategory = () => {
        if (!cleanupData) return null;
        let largest = null;
        let maxSize = 0;

        Object.entries(cleanupData).forEach(([key, category]) => {
            const size = getTotalSize(category);
            if (size > maxSize) {
                maxSize = size;
                largest = { key, category, size };
            }
        });

        return largest;
    };

    const getCleanupPotential = (categoryData) => {
        const size = getTotalSize(categoryData);
        if (size > 1024 * 1024 * 1024) return 'high'; // > 1GB
        if (size > 100 * 1024 * 1024) return 'medium'; // > 100MB
        return 'low';
    };

    const totalSize = getTotalSystemSize();
    const totalItems = getTotalItems();
    const largestCategory = getLargestCategory();

    return (
        <OverviewContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <StatsGrid>
                <StatCard
                    gradient="#667eea 0%, #764ba2 100%"
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <StatIcon><FaHdd /></StatIcon>
                    <StatValue>{formatSize(totalSize)}</StatValue>
                    <StatLabel>Total Cleanable Space</StatLabel>
                </StatCard>

                <StatCard
                    gradient="#ff9a9e 0%, #fecfef 100%"
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <StatIcon><FaCubes /></StatIcon>
                    <StatValue>{totalItems}</StatValue>
                    <StatLabel>Items Found</StatLabel>
                </StatCard>

                <StatCard
                    gradient="#a8edea 0%, #fed6e3 100%"
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <StatIcon><FaExclamationTriangle /></StatIcon>
                    <StatValue>
                        {largestCategory ? formatSize(largestCategory.size) : '0 B'}
                    </StatValue>
                    <StatLabel>Largest Category</StatLabel>
                </StatCard>
            </StatsGrid>

            {totalSize > 1024 * 1024 * 1024 && (
                <RecommendationCard
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <RecommendationTitle>
                        <FaExclamationTriangle />
                        High Storage Usage Detected
                    </RecommendationTitle>
                    <RecommendationText>
                        We found over 1GB of cleanable files on your system. Consider cleaning up
                        {largestCategory && ` ${largestCategory.category.name.toLowerCase()}`} files
                        to free up significant disk space.
                    </RecommendationText>
                </RecommendationCard>
            )}

            <CategorySection>
                <SectionTitle>
                    <FaCubes />
                    Cleanup Categories
                </SectionTitle>

                <CategoryGrid>
                    {categories.map((category) => {
                        const categoryData = cleanupData?.[category.id];
                        const totalSize = getTotalSize(categoryData);
                        const itemCount = categoryData?.items?.length || 0;
                        const potential = getCleanupPotential(categoryData);

                        return (
                            <CategoryCard
                                key={category.id}
                                onClick={() => onCategorySelect(category.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <CategoryHeader>
                                    <CategoryIcon>
                                        <category.icon />
                                    </CategoryIcon>
                                    <CategoryName>{category.name}</CategoryName>
                                    <CategorySize>{formatSize(totalSize)}</CategorySize>
                                </CategoryHeader>

                                <CategoryStats>
                                    <ItemCount>{itemCount} items</ItemCount>
                                    <CleanupPotential
                                        high={potential === 'high'}
                                        medium={potential === 'medium'}
                                    >
                                        {potential === 'high' ? 'High Priority' :
                                            potential === 'medium' ? 'Medium Priority' : 'Low Priority'}
                                    </CleanupPotential>
                                </CategoryStats>
                            </CategoryCard>
                        );
                    })}
                </CategoryGrid>
            </CategorySection>
        </OverviewContainer>
    );
};

export default OverviewPanel;
