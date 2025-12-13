'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

// 伪随机数生成器，基于种子生成确定性的随机值
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 基于索引生成确定性的随机值
function getDeterministicRandom(index: number, offset: number = 0) {
  return seededRandom((index + 1) * 1000 + offset);
}

export function ParticleBackground() {
  // 使用 useMemo 确保粒子数据在服务器端和客户端保持一致
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const x = getDeterministicRandom(i, 1) * 100;
      const y = getDeterministicRandom(i, 2) * 100;
      const size = getDeterministicRandom(i, 3) * 40 + 30; // 30-70px
      const duration = getDeterministicRandom(i, 4) * 20 + 15;
      const delay = getDeterministicRandom(i, 5) * 5;
      
      // 动画偏移量也使用确定性值
      const animX1 = (getDeterministicRandom(i, 6) - 0.5) * 100;
      const animX2 = (getDeterministicRandom(i, 7) - 0.5) * 100;
      const animY1 = (getDeterministicRandom(i, 8) - 0.5) * 100;
      const animY2 = (getDeterministicRandom(i, 9) - 0.5) * 100;
      
      return {
        x,
        y,
        size,
        duration,
        delay,
        animX1,
        animX2,
        animY1,
        animY2,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* lizi233 装饰粒子 */}
      {particles.map((particle, i) => (
        <motion.div
          key={`lizi-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [particle.animX1, particle.animX2],
            y: [particle.animY1, particle.animY2],
            opacity: [0.15, 0.4, 0.15],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 360],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        >
          <img
            src="https://cy-747263170.imgix.net/lizi233.png"
            alt="particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}


