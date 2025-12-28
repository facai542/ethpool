'use client'

import { useEffect, useRef } from 'react'

interface StarryAnimationProps {
  className?: string
}

export default function StarryAnimation({ className = '' }: StarryAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 创建星星
    const createStars = () => {
      const container = containerRef.current
      if (!container) return

      // 清除现有星星
      container.innerHTML = ''

      // 创建背景星星
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div')
        star.className = 'star'
        star.style.left = Math.random() * 100 + '%'
        star.style.top = Math.random() * 100 + '%'
        star.style.animationDelay = Math.random() * 2 + 's'
        container.appendChild(star)
      }

      // 创建流星
      for (let i = 0; i < 5; i++) {
        const meteor = document.createElement('div')
        meteor.className = 'meteor'
        meteor.style.left = Math.random() * 100 + '%'
        meteor.style.top = Math.random() * 100 + '%'
        meteor.style.animationDelay = Math.random() * 5 + 's'
        container.appendChild(meteor)
      }

      // 创建粒子
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.left = Math.random() * 100 + '%'
        particle.style.top = Math.random() * 100 + '%'
        particle.style.animationDelay = Math.random() * 3 + 's'
        container.appendChild(particle)
      }
    }

    createStars()

    // 定期重新创建动画元素以保持动感
    const interval = setInterval(createStars, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`starry-animation ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 50%, #16213e 100%)',
        overflow: 'hidden',
        borderRadius: '12px'
      }}
    >
      <style jsx>{`
        .starry-animation {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .star {
          position: absolute;
          background: #fff;
          border-radius: 50%;
          width: 2px;
          height: 2px;
          animation: twinkle 2s infinite alternate;
          box-shadow: 
            0 0 6px #fff,
            0 0 12px #fff,
            0 0 18px #4fc3f7,
            0 0 24px #4fc3f7;
        }

        .star:nth-child(2n) {
          background: #4fc3f7;
          animation-duration: 1.5s;
        }

        .star:nth-child(3n) {
          background: #ffd700;
          animation-duration: 2.5s;
        }

        .star:nth-child(4n) {
          width: 1px;
          height: 1px;
        }

        .star:nth-child(5n) {
          width: 3px;
          height: 3px;
        }

        .meteor {
          position: absolute;
          width: 2px;
          height: 80px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            #fff 30%,
            #4fc3f7 60%,
            transparent 100%
          );
          border-radius: 50%;
          animation: meteorFall 3s linear infinite;
          transform: rotate(45deg);
          box-shadow: 
            0 0 10px #4fc3f7,
            0 0 20px #4fc3f7,
            0 0 30px #4fc3f7;
        }

        .meteor:nth-child(odd) {
          animation-duration: 2.5s;
          background: linear-gradient(
            180deg,
            transparent 0%,
            #fff 30%,
            #ffd700 60%,
            transparent 100%
          );
          box-shadow: 
            0 0 10px #ffd700,
            0 0 20px #ffd700,
            0 0 30px #ffd700;
        }

        .particle {
          position: absolute;
          width: 1px;
          height: 1px;
          background: #fff;
          border-radius: 50%;
          animation: float 3s ease-in-out infinite;
          box-shadow: 
            0 0 4px #fff,
            0 0 8px #4fc3f7;
        }

        .particle:nth-child(2n) {
          background: #4fc3f7;
          animation-duration: 2s;
        }

        .particle:nth-child(3n) {
          background: #ffd700;
          animation-duration: 4s;
        }

        @keyframes twinkle {
          0% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
        }

        @keyframes meteorFall {
          0% {
            opacity: 0;
            transform: translateY(-100vh) translateX(-100px) rotate(45deg);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) translateX(100px) rotate(45deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.7;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
          50% {
            transform: translateY(-10px) translateX(-15px);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-30px) translateX(5px);
            opacity: 0.9;
          }
        }

        /* 添加光晕效果 */
        .starry-animation::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(79, 195, 247, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
          pointer-events: none;
          animation: auroraGlow 8s ease-in-out infinite alternate;
        }

        @keyframes auroraGlow {
          0% {
            opacity: 0.3;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1) rotate(1deg);
          }
          100% {
            opacity: 0.4;
            transform: scale(1) rotate(-1deg);
          }
        }

        /* 中央发光文字 */
        .starry-animation::after {
          content: 'No Mining Data';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: rgba(255, 255, 255, 0.8);
          font-size: 18px;
          font-weight: bold;
          text-shadow: 
            0 0 10px rgba(79, 195, 247, 0.8),
            0 0 20px rgba(79, 195, 247, 0.6),
            0 0 30px rgba(79, 195, 247, 0.4);
          animation: textGlow 3s ease-in-out infinite alternate;
          z-index: 10;
          pointer-events: none;
        }

        @keyframes textGlow {
          0% {
            text-shadow: 
              0 0 10px rgba(79, 195, 247, 0.8),
              0 0 20px rgba(79, 195, 247, 0.6),
              0 0 30px rgba(79, 195, 247, 0.4);
          }
          100% {
            text-shadow: 
              0 0 15px rgba(255, 215, 0, 0.8),
              0 0 25px rgba(255, 215, 0, 0.6),
              0 0 35px rgba(255, 215, 0, 0.4);
          }
        }
      `}</style>
    </div>
  )
} 