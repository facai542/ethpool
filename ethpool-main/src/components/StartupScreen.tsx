'use client';

import React, { useEffect, useState } from 'react';
import SimpleEthAnimation from './SimpleEthAnimation';
import { GradientText } from './ui/gradient-text';

interface StartupScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const StartupScreen: React.FC<StartupScreenProps> = ({ 
  onComplete, 
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 进度条动画
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    // 完成回调
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* ETH水晶动画背景 */}
      <SimpleEthAnimation />
      
          {/* 启动内容 */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <style jsx>{`
              /* 移动端优化 */
              @media (max-width: 768px) {
                .startup-content {
                  padding: 20px;
                }
                .startup-title {
                  font-size: 2rem;
                  margin-bottom: 1rem;
                }
                .startup-subtitle {
                  font-size: 1rem;
                }
                .startup-progress {
                  width: 90vw;
                  max-width: 300px;
                }
                .startup-logo {
                  width: 80px;
                  height: 80px;
                }
              }
            `}</style>
        {/* Logo区域 */}
        <div className="mb-12 startup-content">
          <div className="w-24 h-24 mx-auto mb-6 relative startup-logo">
            {/* ETH图标 */}
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">E</span>
                </div>
              </div>
            </div>
            {/* 发光效果 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          </div>
          
              {/* 应用标题 */}
              <GradientText
                colors={["#00ff00", "#40ff40", "#00ff88"]}
                animationSpeed={3}
                className="text-4xl font-bold mb-2 startup-title"
              >
                ETH MAX
              </GradientText>
              <p className="text-green-300 text-lg font-medium drop-shadow-lg startup-subtitle">
                智能质押挖矿平台
              </p>
        </div>

        {/* 进度条 */}
        <div className="w-80 max-w-full mb-8 startup-progress">
          <div className="bg-black/30 rounded-full h-2 overflow-hidden backdrop-blur-sm border border-green-400/30">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-green-300 text-sm mt-2 font-mono">
            {progress}%
          </div>
        </div>

        {/* 加载信息 */}
        <div className="text-white/70 text-sm space-y-1">
          <p>正在初始化区块链连接...</p>
          <p>加载智能合约...</p>
          <p>准备就绪</p>
        </div>
      </div>
    </div>
  );
};

export default StartupScreen;
