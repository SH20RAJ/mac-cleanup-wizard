import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaHdd, FaApple, FaFolder, FaCloud, FaExclamationTriangle } from 'react-icons/fa';

const StorageContainer = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  margin: 20px 0;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
`;

const StorageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const HeaderIcon = styled.div`
  font-size: 28px;
  margin-right: 15px;
  color: #fff;
`;

const HeaderText = styled.div`
  h2 {
    margin: 0 0 5px 0;
    font-size: 24px;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    opacity: 0.8;
    font-size: 14px;
  }
`;

const StorageBar = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  height: 20px;
  overflow: hidden;
  position: relative;
  margin: 20px 0;
`;

const StorageSegment = styled(motion.div)`
  height: 100%;
  display: inline-block;
  position: relative;
  
  &:first-child {
    border-radius: 15px 0 0 15px;
  }
  
  &:last-child {
    border-radius: 0 15px 15px 0;
  }
`;

const StorageStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 25px;
`;

const StatItem = styled.div`
  text-align: center;
  
  .value {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 5px;
    background: linear-gradient(45deg, #fff, #f0f8ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .label {
    font-size: 14px;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const CategoryList = styled.div`
  margin-top: 30px;
`;

const CategoryItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(5px);
  }
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  
  .icon {
    font-size: 20px;
    margin-right: 15px;
    opacity: 0.9;
  }
  
  .details {
    .name {
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .count {
      font-size: 12px;
      opacity: 0.7;
    }
  }
`;

const CategorySize = styled.div`
  text-align: right;
  
  .size {
    font-weight: 700;
    font-size: 16px;
  }
  
  .percentage {
    font-size: 12px;
    opacity: 0.7;
  }
`;

const WarningCard = styled(motion.div)`
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  
  .icon {
    font-size: 24px;
    margin-right: 15px;
    color: #d63384;
  }
  
  .content {
    .title {
      font-weight: 700;
      color: #d63384;
      margin-bottom: 5px;
    }
    
    .message {
      color: #6f2c91;
      font-size: 14px;
    }
  }
`;

const StorageViewer = ({ cleanupData }) => {
  const [diskUsage, setDiskUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiskUsage = async () => {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getDiskUsage();
          if (result.success) {
            setDiskUsage(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to load disk usage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDiskUsage();
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const parseSize = (sizeStr) => {
    if (!sizeStr) return 0;
    const units = { 'B': 1, 'K': 1024, 'M': 1024*1024, 'G': 1024*1024*1024, 'T': 1024*1024*1024*1024 };
    const match = sizeStr.match(/^([\d.]+)([BKMGT])/);
    if (match) {
      return parseFloat(match[1]) * (units[match[2]] || 1);
    }
    return 0;
  };

  const getTotalCleanableSize = () => {
    if (!cleanupData) return 0;
    return Object.values(cleanupData).reduce((total, category) => {
      return total + (category.totalSize || 0);
    }, 0);
  };

  const getCategoryData = () => {
    if (!cleanupData) return [];
    
    const categories = [
      { id: 'developer', name: 'Developer Files', icon: '💻', color: '#667eea' },
      { id: 'cache', name: 'Cache & Temp', icon: '🗄️', color: '#f093fb' },
      { id: 'media', name: 'Media & Downloads', icon: '🎬', color: '#4facfe' },
      { id: 'apps', name: 'App Data', icon: '📱', color: '#43e97b' },
      { id: 'misc', name: 'Miscellaneous', icon: '📁', color: '#fa709a' },
      { id: 'trash', name: 'Trash', icon: '🗑️', color: '#ff9a9e' }
    ];

    return categories.map(cat => ({
      ...cat,
      data: cleanupData[cat.id] || { items: [], totalSize: 0 },
      size: cleanupData[cat.id]?.totalSize || 0,
      count: cleanupData[cat.id]?.items?.length || 0
    })).filter(cat => cat.size > 0);
  };

  const getStorageSegments = () => {
    if (!diskUsage) return [];
    
    const totalBytes = parseSize(diskUsage.total);
    const usedBytes = parseSize(diskUsage.used);
    const cleanableBytes = getTotalCleanableSize();
    const systemBytes = usedBytes - cleanableBytes;
    const freeBytes = totalBytes - usedBytes;

    return [
      { 
        name: 'System & Apps', 
        size: systemBytes, 
        percentage: (systemBytes / totalBytes) * 100,
        color: '#4facfe'
      },
      { 
        name: 'Cleanable Files', 
        size: cleanableBytes, 
        percentage: (cleanableBytes / totalBytes) * 100,
        color: '#ff9a9e'
      },
      { 
        name: 'Free Space', 
        size: freeBytes, 
        percentage: (freeBytes / totalBytes) * 100,
        color: '#43e97b'
      }
    ];
  };

  if (loading) {
    return (
      <StorageContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StorageHeader>
          <HeaderIcon><FaHdd /></HeaderIcon>
          <HeaderText>
            <h2>Loading Storage Information...</h2>
            <p>Analyzing your MacBook storage</p>
          </HeaderText>
        </StorageHeader>
      </StorageContainer>
    );
  }

  const segments = getStorageSegments();
  const totalCleanable = getTotalCleanableSize();
  const categoryData = getCategoryData();
  const isStorageLow = diskUsage && parseSize(diskUsage.available) < (50 * 1024 * 1024 * 1024); // Less than 50GB

  return (
    <StorageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StorageHeader>
        <HeaderIcon><FaApple /></HeaderIcon>
        <HeaderText>
          <h2>MacBook Storage Overview</h2>
          <p>Complete breakdown of your disk usage</p>
        </HeaderText>
      </StorageHeader>

      {/* Storage Bar */}
      <StorageBar>
        {segments.map((segment, index) => (
          <StorageSegment
            key={segment.name}
            style={{ 
              width: `${segment.percentage}%`,
              background: segment.color
            }}
            initial={{ width: 0 }}
            animate={{ width: `${segment.percentage}%` }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
          />
        ))}
      </StorageBar>

      {/* Storage Stats */}
      <StorageStats>
        <StatItem>
          <div className="value">{diskUsage?.total || '---'}</div>
          <div className="label">Total Capacity</div>
        </StatItem>
        <StatItem>
          <div className="value">{diskUsage?.available || '---'}</div>
          <div className="label">Available</div>
        </StatItem>
      </StorageStats>

      {/* Low Storage Warning */}
      {isStorageLow && (
        <WarningCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <FaExclamationTriangle className="icon" />
          <div className="content">
            <div className="title">Low Storage Warning</div>
            <div className="message">
              Your disk is running low on space. Consider cleaning up {formatSize(totalCleanable)} of files.
            </div>
          </div>
        </WarningCard>
      )}

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <CategoryList>
          <h3 style={{ marginBottom: '20px', opacity: '0.9' }}>Cleanable Categories</h3>
          {categoryData.map((category, index) => (
            <CategoryItem
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <CategoryInfo>
                <span className="icon">{category.icon}</span>
                <div className="details">
                  <div className="name">{category.name}</div>
                  <div className="count">{category.count} items</div>
                </div>
              </CategoryInfo>
              <CategorySize>
                <div className="size">{formatSize(category.size)}</div>
                <div className="percentage">
                  {diskUsage ? ((category.size / parseSize(diskUsage.total)) * 100).toFixed(1) : 0}%
                </div>
              </CategorySize>
            </CategoryItem>
          ))}
        </CategoryList>
      )}
    </StorageContainer>
  );
};

export default StorageViewer;
