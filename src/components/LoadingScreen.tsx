'use client';

import type React from 'react';
import { useEffect, useState, useCallback } from 'react';
import BlackHoleLoader from './ui/blackhole-loader';
import SimpleEthAnimation from './SimpleEthAnimation';
import { GradientText } from './ui/gradient-text';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  onLoadingComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = '',
  showProgress = false,
  progress = 0,
  onLoadingComplete
}) => {
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  const handleLoadingComplete = useCallback(() => {
    if (onLoadingComplete) {
      onLoadingComplete();
    }
  }, [onLoadingComplete]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 加载信息更新
  useEffect(() => {
    if (!isClient) return;

    const messages = [
      'Connecting to Ethereum network...',
      'Verifying mining hardware...',
      'Loading smart contracts...',
      'Synchronizing blockchain data...',
      'Loading complete!'
    ];

    const statusMessages = [
      'System Status: Connecting...',
      'System Status: Hardware Check...',
      'System Status: Contract Loading...',
      'System Status: Blockchain Sync...',
      'System Status: Ready!'
    ];

    let currentStepIndex = 0;
    const totalSteps = messages.length;

    const updateInterval = setInterval(() => {
      const progress = Math.round((currentStepIndex / (totalSteps - 1)) * 100);
      
      setCurrentStep(currentStepIndex);
      setProgressValue(progress);

      currentStepIndex++;

      if (currentStepIndex >= totalSteps) {
        setTimeout(() => {
          handleLoadingComplete();
        }, 500);
        clearInterval(updateInterval);
      }
    }, 800);

    return () => clearInterval(updateInterval);
  }, [isClient, handleLoadingComplete]);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* ETH水晶动画背景 */}
      <SimpleEthAnimation />
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .loading-screen {
          min-height: 100vh;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Arial', sans-serif;
          overflow: hidden;
          position: relative;
          z-index: 10;
        }

        /* 粒子效果 */
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #00ff00;
          border-radius: 50%;
          opacity: 0.8;
          animation: particleFloat linear infinite;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0;
          }
        }

        /* 主加载容器 */
        .loader-container {
          text-align: center;
          z-index: 2;
          position: relative;
          margin-top: 25vh; /* 向下移动25vh */
        }

        /* 黑洞行星动画容器 */
        .blackhole-animation-container {
          position: relative;
          margin-bottom: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 220px;
        }

        /* 加载文字 */
        .loading-text {
          color: #F0B90B;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 15px;
          animation: textGlow 2s ease-in-out infinite alternate;
          letter-spacing: 2px;
        }

        .loading-subtitle {
          color: #888888;
          font-size: 16px;
          margin-bottom: 40px;
          animation: typewriter 3s steps(30) infinite;
        }

        @keyframes textGlow {
          0% { text-shadow: 0 0 20px rgba(240, 185, 11, 0.8); }
          100% { text-shadow: 0 0 40px rgba(240, 185, 11, 1), 0 0 60px rgba(252, 213, 53, 0.6); }
        }

        @keyframes typewriter {
          0%, 10% { opacity: 0; }
          20%, 90% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* 挖矿指示器 */
        .mining-indicators {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .mining-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .indicator-icon {
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: indicatorPulse 2s ease-in-out infinite;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }

        .indicator-icon::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid #00ff00;
          border-radius: 50%;
          opacity: 0.6;
          animation: ripple 2s ease-out infinite;
        }

        .indicator-1 { animation-delay: 0s; }
        .indicator-2 { animation-delay: 0.5s; }
        .indicator-3 { animation-delay: 1s; }

        @keyframes indicatorPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .indicator-label {
          color: #888888;
          font-size: 12px;
          text-transform: uppercase;
        }

        /* 挖矿进度动画 */
        .mining-animation {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin: 30px 0;
        }

        .mining-block {
          width: 20px;
          height: 20px;
          background: #333333;
          border: 2px solid #00ff00;
          border-radius: 3px;
          animation: blockMining 2s ease-in-out infinite;
        }

        .mining-block:nth-child(1) { animation-delay: 0s; }
        .mining-block:nth-child(2) { animation-delay: 0.3s; }
        .mining-block:nth-child(3) { animation-delay: 0.6s; }
        .mining-block:nth-child(4) { animation-delay: 0.9s; }
        .mining-block:nth-child(5) { animation-delay: 1.2s; }

        @keyframes blockMining {
          0%, 100% { 
            background: #333333;
            box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
          }
          50% { 
            background: #00ff00;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
            transform: scale(1.1);
          }
        }

        /* 进度条 */
        .progress-container {
          width: 400px;
          margin: 0 auto 30px;
          position: relative;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #333333;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #DE4A0F, #F9C74F, #FCD535);
          background-size: 300% 100%;
          border-radius: 4px;
          transition: width 0.5s ease-in-out;
          animation: progressShine 2s linear infinite;
        }

        @keyframes progressShine {
          0% { background-position: -300% 0; }
          100% { background-position: 300% 0; }
        }

        .progress-text {
          text-align: center;
          color: #FCD535;
          font-size: 14px;
          margin-top: 10px;
          font-family: 'Courier New', monospace;
        }

        /* 状态信息 */
        .status-info {
          color: #FCD535;
          font-size: 14px;
          font-family: 'Courier New', monospace;
          margin-top: 20px;
        }

        /* 响应式 */
        @media (max-width: 768px) {
          .loader-container { 
            margin-top: 15vh; /* 优化移动设备偏移 */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .blackhole-animation-container { 
            height: 160px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .progress-container { 
            width: 90vw;
            max-width: 300px;
          }
          .loading-text { 
            font-size: 20px;
            text-align: center;
          }
          .mining-indicators { 
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .indicator-icon { 
            width: 35px; 
            height: 35px; 
            font-size: 14px; 
          }
          .status-info {
            text-align: center;
            padding: 0 20px;
          }
        }
      `}</style>

      <div className="loading-screen">
        {/* 粒子背景 */}
        <div className="particles" id="particles"></div>

        {/* 主加载容器 */}
        <div className="loader-container">
        {/* 黑洞行星动画区域 */}
        <div className="blackhole-animation-container">
          <BlackHoleLoader />
        </div>

          {/* 加载文字 */}
          <GradientText
            colors={["#00ff00", "#40ff40", "#00ff88"]}
            animationSpeed={3}
            className="text-4xl font-bold mb-4"
          >
            ETH MINING PLATFORM
          </GradientText>
          <div className="loading-subtitle">
            {currentStep === 0 && 'Connecting to Ethereum network...'}
            {currentStep === 1 && 'Verifying mining hardware...'}
            {currentStep === 2 && 'Loading smart contracts...'}
            {currentStep === 3 && 'Synchronizing blockchain data...'}
            {currentStep === 4 && 'Loading complete!'}
          </div>

          {/* 挖矿指示器 */}
          <div className="mining-indicators">
            <div className="mining-indicator">
              <div 
                className="indicator-icon indicator-1"
                style={{ backgroundImage: "url('/login/gpu.png')" }}
              ></div>
              <div className="indicator-label">GPU Mining</div>
            </div>
            <div className="mining-indicator">
              <div 
                className="indicator-icon indicator-2"
                style={{ backgroundImage: "url('/login/network.png')" }}
              ></div>
              <div className="indicator-label">Network Sync</div>
            </div>
            <div className="mining-indicator">
              <div 
                className="indicator-icon indicator-3"
                style={{ backgroundImage: "url('/login/pool.png')" }}
              ></div>
              <div className="indicator-label">Pool Connect</div>
            </div>
          </div>

          {/* 挖矿进度动画 */}
          <div className="mining-animation">
            <div className="mining-block"></div>
            <div className="mining-block"></div>
            <div className="mining-block"></div>
            <div className="mining-block"></div>
            <div className="mining-block"></div>
          </div>

          {/* 进度条 */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {progressValue === 100 ? 'Loading Complete!' : `Loading... ${progressValue}%`}
            </div>
          </div>

          {/* 状态信息 */}
          <div className="status-info">
            {currentStep === 0 && 'System Status: Connecting...'}
            {currentStep === 1 && 'System Status: Hardware Check...'}
            {currentStep === 2 && 'System Status: Contract Loading...'}
            {currentStep === 3 && 'System Status: Blockchain Sync...'}
            {currentStep === 4 && 'System Status: Ready!'}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;