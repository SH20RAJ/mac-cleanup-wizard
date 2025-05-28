import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExclamationTriangle, 
  FaTimes, 
  FaTrash, 
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaCog
} from 'react-icons/fa';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WarningIcon = styled.div`
  font-size: 24px;
  color: #e53e3e;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #742a2a;
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #c53030;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #742a2a;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(116, 42, 42, 0.1);
  }
`;

const Content = styled.div`
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
`;

const InfoText = styled.p`
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const ItemsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const Item = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f7fafc;
  display: flex;
  justify-content: between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.div`
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
  flex: 1;
`;

const ItemSize = styled.div`
  font-size: 12px;
  color: #718096;
  margin-left: 12px;
`;

const Summary = styled.div`
  background: #f7fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const SummaryTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
`;

const SummaryStats = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
`;

const Actions = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8f9fa;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled(motion.button)`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
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
  `}
`;

const SpinnerIcon = styled(motion.div)`
  display: inline-block;
`;

const CleanupModal = ({ isOpen, items, onConfirm, onCancel, isDeleting }) => {
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalSize = items.reduce((sum, item) => sum + item.size, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <Modal
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <HeaderContent>
                <WarningIcon>
                  <FaExclamationTriangle />
                </WarningIcon>
                <HeaderText>
                  <Title>Confirm Cleanup</Title>
                  <Subtitle>
                    {isDeleting ? 'Deleting files...' : 'This action cannot be undone'}
                  </Subtitle>
                </HeaderText>
                {!isDeleting && (
                  <CloseButton onClick={onCancel}>
                    <FaTimes />
                  </CloseButton>
                )}
              </HeaderContent>
            </Header>

            <Content>
              {!isDeleting && (
                <>
                  <InfoText>
                    You are about to permanently delete the selected files and folders. 
                    This action cannot be undone. Please review the items below carefully 
                    before proceeding.
                  </InfoText>

                  <Summary>
                    <SummaryTitle>Cleanup Summary</SummaryTitle>
                    <SummaryStats>
                      <Stat>
                        <StatValue>{items.length}</StatValue>
                        <StatLabel>Items</StatLabel>
                      </Stat>
                      <Stat>
                        <StatValue>{formatSize(totalSize)}</StatValue>
                        <StatLabel>Total Size</StatLabel>
                      </Stat>
                    </SummaryStats>
                  </Summary>

                  <ItemsList>
                    {items.slice(0, 10).map((item) => (
                      <Item key={item.path}>
                        <ItemName>{item.name}</ItemName>
                        <ItemSize>{item.sizeFormatted}</ItemSize>
                      </Item>
                    ))}
                    {items.length > 10 && (
                      <Item>
                        <ItemName style={{ fontStyle: 'italic', color: '#718096' }}>
                          ... and {items.length - 10} more items
                        </ItemName>
                      </Item>
                    )}
                  </ItemsList>
                </>
              )}

              {isDeleting && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <SpinnerIcon
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <FaSpinner style={{ fontSize: '32px', color: '#667eea', marginBottom: '16px' }} />
                  </SpinnerIcon>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
                    Deleting files...
                  </div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>
                    Please wait while we clean up your selected files.
                  </div>
                </div>
              )}
            </Content>

            {!isDeleting && (
              <Actions>
                <Button onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  primary 
                  onClick={onConfirm}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTrash />
                  Delete {items.length} Items
                </Button>
              </Actions>
            )}
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default CleanupModal;
