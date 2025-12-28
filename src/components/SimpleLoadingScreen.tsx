'use client';

import type React from 'react';
import { useEffect } from 'react';
import SimpleEthAnimation from './SimpleEthAnimation';
import { GradientText } from './ui/gradient-text';

interface SimpleLoadingScreenProps {
  message?: string;
  onLoadingComplete?: () => void;
}

const SimpleLoadingScreen: React.FC<SimpleLoadingScreenProps> = ({
  message = '正在加载...',
  onLoadingComplete
}) => {
  useEffect(() => {
    // 简单的加载完成逻辑
    const timer = setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* ETH水晶动画背景 */}
      <SimpleEthAnimation />
      
      {/* 主要内容 */}
      <div className="relative z-10 text-center">
        {/* 简单的加载动画 */}
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-green-400/20 border-t-green-400/80 rounded-full animate-spin mx-auto" />
        </div>

            {/* 加载文本 */}
            <div className="mb-8">
              <GradientText
                colors={["#00ff00", "#40ff40", "#00ff88"]}
                animationSpeed={3}
                className="text-2xl font-bold mb-2"
              >
                {message}
              </GradientText>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-400/80 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-green-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-green-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-green-300/70 text-sm drop-shadow-lg">
          <p>正在初始化应用...</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoadingScreen;

