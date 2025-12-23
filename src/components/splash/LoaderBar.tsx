'use client';

import { motion } from 'framer-motion';

export function LoaderBar() {
  return (
    <motion.div
      className="relative w-64 h-2 bg-gray-800/50 rounded-full overflow-hidden mb-4 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      {/* 背景斜纹效果 */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
        }} />
      </div>
      
      {/* 蓝色渐变进度条 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #B8860B 0%, #FFD700 50%, #FFA500 100%)',
          backgroundSize: '200% 100%',
        }}
        initial={{ width: 0 }}
        animate={{ 
          width: ['0%', '30%', '60%', '85%', '100%'],
          backgroundPosition: ['0% 0%', '100% 0%', '0% 0%', '100% 0%', '0% 0%']
        }}
        transition={{
          width: {
            duration: 6,
            times: [0, 0.2, 0.5, 0.8, 1],
            ease: 'easeInOut'
          },
          backgroundPosition: {
            duration: 6,
            repeat: Infinity,
            ease: 'linear'
          }
        }}
      >
        {/* 斜纹覆盖层 */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 16px)'
        }} />
        
        {/* 高光效果 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-1/2" />
      </motion.div>
    </motion.div>
  );
}



