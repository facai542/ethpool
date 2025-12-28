import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface LoaderProps {
  onComplete?: () => void;
  duration?: number; // 加载时长（毫秒）
}

const Loader = ({ onComplete, duration = 3000 }: LoaderProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let animationId: number;

    const updateProgress = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress >= 100) {
        // 确保进度条完全填满后再调用完成回调
        setTimeout(() => {
          onComplete?.();
        }, 500);
      } else {
        animationId = requestAnimationFrame(updateProgress);
      }
    };

    animationId = requestAnimationFrame(updateProgress);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [duration, onComplete]);
  return (
    <StyledWrapper>
      <div className="loader">
        <div className="loading-text">
          Loading<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
        </div>
        <div className="loading-bar-background">
          <div className="loading-bar" style={{ width: `${progress}%` }}>
            <div className="white-bars-container">
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
            </div>
          </div>
        </div>
        <div className="progress-text">
          {Math.round(progress)}%
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 5px;
  }

  .loading-text {
    color: white;
    font-size: 14pt;
    font-weight: 600;
    margin-left: 10px;
  }

  .dot {
    margin-left: 3px;
    animation: blink 1.5s infinite;
  }
  .dot:nth-child(2) {
    animation-delay: 0.3s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.6s;
  }

  .loading-bar-background {
    --height: 30px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 5px;
    width: 200px;
    height: var(--height);
    background-color: #212121 /*change this*/;
    box-shadow: #0c0c0c -2px 2px 4px 0px inset;
    border-radius: calc(var(--height) / 2);
  }

  .loading-bar {
    position: relative;
    display: flex;
    justify-content: center;
    flex-direction: column;
    --height: 20px;
    height: var(--height);
    overflow: hidden;
    background: rgb(222, 74, 15);
    background: linear-gradient(
      0deg,
      rgba(222, 74, 15, 1) 0%,
      rgba(249, 199, 79, 1) 100%
    );
    border-radius: calc(var(--height) / 2);
    transition: width 0.1s ease-out;
  }

  .progress-text {
    color: white;
    font-size: 12pt;
    font-weight: 600;
    margin-top: 8px;
    text-align: center;
  }

  .white-bars-container {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .white-bar {
    background: rgb(255, 255, 255);
    background: linear-gradient(
      -45deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0) 70%
    );
    width: 10px;
    height: 45px;
    opacity: 0.3;
    rotate: 45deg;
  }


  @keyframes blink {
    0%,
    100% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }
`;

export default Loader;

