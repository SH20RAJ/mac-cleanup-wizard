import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const scanAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: ${scanAnimation} 1s linear infinite;
  margin-bottom: 24px;
`;

const LoadingText = styled(motion.h2)`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const LoadingSubtext = styled(motion.p)`
  font-size: 16px;
  opacity: 0.8;
  text-align: center;
  max-width: 400px;
`;

const LoadingScreen = ({ message = "Loading...", subtext = "Please wait while we analyze your system" }) => {
  return (
    <LoadingContainer>
      <LoadingSpinner />
      <LoadingText
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {message}
      </LoadingText>
      <LoadingSubtext
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {subtext}
      </LoadingSubtext>
    </LoadingContainer>
  );
};

export default LoadingScreen;
