import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFolder, 
  FaFile, 
  FaCheck, 
  FaEye, 
  FaExternalLinkAlt,
  FaSort,
  FaSearch,
  FaFilter,
  FaList,
  FaTh,
  FaCalendarAlt,
  FaWeight
} from 'react-icons/fa';

const CategoryContainer = styled(motion.div)`
  padding: 20px 0;
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4a5568;
  transition: all 0.3s ease;

  &:hover {
    border-color: #cbd5e0;
    background: #f7fafc;
  }
`;

const SelectAllButton = styled(motion.button)`
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ItemCard = styled(motion.div)`
  background: white;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.selected ? '#4c51bf' : '#cbd5e0'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const ItemIcon = styled.div`
  font-size: 20px;
  color: #667eea;
  margin-right: 12px;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
`;

const ItemPath = styled.p`
  font-size: 12px;
  color: #718096;
  font-family: 'Monaco', 'Menlo', monospace;
  word-break: break-all;
`;

const ItemStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemSize = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
`;

const ItemType = styled.div`
  font-size: 12px;
  color: #718096;
  background: #f7fafc;
  padding: 4px 8px;
  border-radius: 4px;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 16px;
`;

const ActionButton = styled.button`
  padding: 6px 8px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  color: #718096;
  transition: all 0.3s ease;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }
`;

const CheckboxWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const Checkbox = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.checked ? '#667eea' : '#e2e8f0'};
  background: ${props => props.checked ? '#667eea' : 'white'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
  }
`;

const CheckIcon = styled(FaCheck)`
  color: white;
  font-size: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4a5568;
`;

const EmptyText = styled.p`
  font-size: 14px;
  line-height: 1.5;
`;

const CategoryPanel = ({ category, data, selectedItems, onItemSelect, onSelectAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('size'); // 'size', 'name', 'type'

  if (!data || !data.items || data.items.length === 0) {
    return (
      <CategoryContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <EmptyState>
          <EmptyIcon>
            <FaFolder />
          </EmptyIcon>
          <EmptyTitle>No items found</EmptyTitle>
          <EmptyText>
            Great! This category doesn't have any items that need cleanup.
            <br />
            Try scanning again or check other categories.
          </EmptyText>
        </EmptyState>
      </CategoryContainer>
    );
  }

  const filteredItems = data.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'size':
        return b.size - a.size;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const handleItemClick = (item) => {
    const isSelected = selectedItems.some(selected => selected.path === item.path);
    onItemSelect(item, !isSelected);
  };

  const handleSelectAll = () => {
    onSelectAll(category);
  };

  const handleOpenInFinder = (item) => {
    if (window.electronAPI) {
      window.electronAPI.openInFinder(item.path);
    }
  };

  const allSelected = sortedItems.length > 0 && sortedItems.every(item =>
    selectedItems.some(selected => selected.path === item.path)
  );

  return (
    <CategoryContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <ControlsBar>
        <SearchBox>
          <SearchInput
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </SearchBox>

        <Controls>
          <SortButton onClick={() => setSortBy(sortBy === 'size' ? 'name' : 'size')}>
            <FaSort />
            Sort by {sortBy === 'size' ? 'Name' : 'Size'}
          </SortButton>

          <SelectAllButton
            onClick={handleSelectAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </SelectAllButton>
        </Controls>
      </ControlsBar>

      <ItemsList>
        {sortedItems.map((item, index) => {
          const isSelected = selectedItems.some(selected => selected.path === item.path);
          
          return (
            <ItemCard
              key={item.path}
              selected={isSelected}
              onClick={() => handleItemClick(item)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <CheckboxWrapper>
                <Checkbox checked={isSelected}>
                  {isSelected && <CheckIcon />}
                </Checkbox>
              </CheckboxWrapper>

              <ItemHeader>
                <ItemIcon>
                  <FaFolder />
                </ItemIcon>
                <ItemInfo>
                  <ItemName>{item.name}</ItemName>
                  <ItemPath>{item.path}</ItemPath>
                </ItemInfo>
                <ItemActions onClick={(e) => e.stopPropagation()}>
                  <ActionButton
                    onClick={() => handleOpenInFinder(item)}
                    title="Open in Finder"
                  >
                    <FaExternalLinkAlt />
                  </ActionButton>
                </ItemActions>
              </ItemHeader>

              <ItemStats>
                <ItemSize>{item.sizeFormatted}</ItemSize>
                <ItemType>{item.type}</ItemType>
              </ItemStats>
            </ItemCard>
          );
        })}
      </ItemsList>
    </CategoryContainer>
  );
};

export default CategoryPanel;
