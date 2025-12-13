'use client';

import { motion } from 'framer-motion';

export function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* lizi233 装饰粒子 */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 40 + 30; // 30-70px
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 5;
        
        return (
          <motion.div
            key={`lizi-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            animate={{
              x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100],
              y: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100],
              opacity: [0.15, 0.4, 0.15],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 360],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut"
            }}
          >
            <img
              src="https://cy-747263170.imgix.net/lizi233.png"
              alt="particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}


