'use client';

import type React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from './splash/ParticleBackground';
import { MeteorRain } from './splash/MeteorRain';
import { LoaderBar } from './splash/LoaderBar';
import { LoadingText } from './splash/LoadingText';
import { BlurText } from './splash/BlurText';

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
  const [lightningIndex, setLightningIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleLoadingComplete = useCallback(() => {
    if (onLoadingComplete) {
      onLoadingComplete();
    }
  }, [onLoadingComplete]);

  // 使用 useMemo 缓存图片数组
  const lightningImages = useMemo(() => [
    "https://cy-747263170.imgix.net/lightning-back.png",
    "https://cy-747263170.imgix.net/lightning-middle.png",
    "https://cy-747263170.imgix.net/lightning-font.png",
  ], []);

  // 预加载所有关键图片
  useEffect(() => {
    const imagesToPreload = [
      "https://cy-747263170.imgix.net/8891.jpg",
      "https://cy-747263170.imgix.net/usdt@2x.png",
      "https://cy-747263170.imgix.net/trx@2x.png",
      ...lightningImages,
    ];

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });
  }, [lightningImages]);

  // 闪电动画切换
  useEffect(() => {
    const interval = setInterval(() => {
      setLightningIndex(
        (prev) => (prev + 1) % lightningImages.length,
      );
    }, 200);

    return () => clearInterval(interval);
  }, [lightningImages.length]);

  // 加载完成计时器
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLoadingComplete();
    }, 6500); // 6.5秒后自动完成

    return () => clearTimeout(timer);
  }, [handleLoadingComplete]);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0">
        <img
          src="https://cy-747263170.imgix.net/8891.jpg"
          alt="Background"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          style={{ willChange: 'auto' }}
        />
        {/* 深色遮罩层 */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* 动态粒子背景 */}
      <ParticleBackground />

      {/* 流星雨 */}
      <MeteorRain />

      {/* 顶部 ETH 挖矿标题 */}
      <div className="absolute top-16 left-0 right-0 z-20 flex justify-center px-6">
        <BlurText
          text="Eth Mining"
          delay={80}
          animateBy="words"
          direction="top"
          className="text-center text-[#C0C0C0] drop-shadow-[0_0_10px_rgba(192,192,192,0.5)] max-w-4xl"
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* 中心内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* 主图标容器 */}
        <motion.div
          className="relative w-[450px] h-[450px] mb-8 mt-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ willChange: 'transform' }}
        >
          {/* USDT图片 - 左上方悬浮 */}
          <motion.img
            src="https://cy-747263170.imgix.net/usdt@2x.png"
            alt="USDT"
            className="absolute left-8 top-[25%] w-16 h-auto"
            loading="eager"
            decoding="async"
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: 1,
              y: [0, -15, 0],
            }}
            transition={{
              opacity: { delay: 1.2, duration: 0.6 },
              y: {
                delay: 1.8,
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{ willChange: 'transform, opacity' }}
          />

          {/* TRX图片 - 右侧悬浮 */}
          <motion.img
            src="https://cy-747263170.imgix.net/trx@2x.png"
            alt="TRX"
            className="absolute right-8 top-[25%] w-16 h-auto"
            loading="eager"
            decoding="async"
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: 1,
              y: [0, 15, 0],
            }}
            transition={{
              opacity: { delay: 1.4, duration: 0.6 },
              y: {
                delay: 1.8,
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{ willChange: 'transform, opacity' }}
          />

          {/* 中心闪电图标 */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ willChange: 'transform' }}
          >
            <motion.img
              src={lightningImages[lightningIndex]}
              alt="lightning"
              className="w-full h-full object-contain"
              loading="eager"
              decoding="async"
              animate={{ y: [-10, 10, -10] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ willChange: 'transform' }}
            />
          </motion.div>
        </motion.div>

        {/* 应用标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-white mb-2 text-2xl font-bold">ETH Mining Dashboard</h1>
          <p className="text-purple-200">
            Start your Ethereum mining journey
          </p>
        </motion.div>

        {/* 加载进度条 */}
        <LoaderBar />
        <LoadingText />
      </div>
    </div>
  );
};

export default LoadingScreen;
