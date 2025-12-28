'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedLoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  onComplete?: () => void;
}

export const AnimatedLoadingScreen: React.FC<AnimatedLoadingScreenProps> = ({
  message = '正在加载...',
  showProgress = false,
  progress = 0,
  onComplete
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // 渐进式文字显示效果
  useEffect(() => {
    const words = message.split(' ');
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setCurrentMessage(prev => prev + (prev ? ' ' : '') + words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setShowMessage(true);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [message]);

  // 检查是否完成加载
  useEffect(() => {
    if (showProgress && progress >= 100 && !isComplete) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    }
  }, [progress, isComplete, onComplete, showProgress]);

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 浮动粒子效果 */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        
        {/* 渐变光晕 */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 text-center">
        {/* 以太坊图标加载动画 */}
        <motion.div 
          className="mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 1
          }}
        >
          <div className="relative w-24 h-24 mx-auto">
            {/* 外圈旋转 */}
            <motion.div 
              className="absolute inset-0 border-4 border-white/20 border-t-white/60 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear"
              }}
            />
            
            {/* 内圈反向旋转 */}
            <motion.div 
              className="absolute inset-2 border-4 border-transparent border-b-blue-400 rounded-full"
              animate={{ rotate: -360 }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear"
              }}
            />
            
            {/* 以太坊图标 */}
            <motion.div 
              className="absolute inset-4 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
              }}
            >
              <span className="text-white text-2xl font-bold">⟠</span>
            </motion.div>

            {/* 发光效果 */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-xl opacity-30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        {/* 渐进式文字显示 */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            <motion.h2 
              key={currentMessage}
              className="text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.3 }}
            >
              {currentMessage}
            </motion.h2>
          </AnimatePresence>
          
          {/* 加载点动画 */}
          <motion.div 
            className="flex items-center justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: showMessage ? 1 : 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white/60 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* 进度条 */}
        <AnimatePresence>
          {showProgress && (
            <motion.div 
              className="w-64 mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>加载进度</span>
                <motion.span
                  key={Math.round(progress)}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部提示 */}
        <motion.div 
          className="mt-8 text-white/50 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <motion.p
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
          >
            正在检测Web3钱包...
          </motion.p>
        </motion.div>

        {/* 完成动画 */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="bg-green-500 text-white px-6 py-3 rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2
                }}
              >
                ✓ 检测完成
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 玻璃态效果 */}
      <motion.div 
        className="absolute inset-0 bg-white/5 backdrop-blur-sm pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      />
    </motion.div>
  );
};

