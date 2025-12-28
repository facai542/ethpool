'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

const TRXHeroAnimation = () => {
  const matrixRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const lightningRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 创建背景矩阵
  const createMatrix = () => {
    if (!matrixRef.current) return;
    
    const matrix = matrixRef.current;
    matrix.innerHTML = '';
    const columnCount = Math.floor(window.innerWidth / 20);
    
    for (let i = 0; i < columnCount; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = `${i * 20}px`;
      column.style.animationDuration = `${Math.random() * 3 + 2}s`;
      column.style.animationDelay = `${Math.random() * 2}s`;
      matrix.appendChild(column);
    }
  };

  // 创建粒子效果
  const createParticles = () => {
    if (!particlesRef.current) return;
    
    const particles = particlesRef.current;
    particles.innerHTML = '';
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${Math.random() * 4 + 3}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particles.appendChild(particle);
    }
  };

  // 创建闪电效果
  const createLightning = () => {
    if (!lightningRef.current) return;
    
    const lightning = lightningRef.current;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const bolt = document.createElement('div');
        bolt.className = 'lightning-bolt';
        bolt.style.left = `${Math.random() * 100}%`;
        bolt.style.top = `${Math.random() * 50}%`;
        lightning.appendChild(bolt);
        
        setTimeout(() => {
          if (bolt.parentNode) bolt.remove();
        }, 4000);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  // 鼠标移动处理
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePosition({ x, y });
  };

  // 点击特效
  const handleClick = (e: React.MouseEvent) => {
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.background = 'radial-gradient(circle, #00ffff, transparent)';
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple 1s ease-out';
    ripple.style.zIndex = '999';
    ripple.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) ripple.remove();
    }, 1000);
  };

  useEffect(() => {
    createMatrix();
    createParticles();
    const cleanupLightning = createLightning();

    const handleResize = () => {
      createMatrix();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (cleanupLightning) cleanupLightning();
    };
  }, []);

  return (
    <div 
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #162447 50%, #1e3a5f 100%)'
      }}
    >
      {/* CSS Styles */}
      <style jsx>{`
        .matrix-column {
          position: absolute;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, #00ffff, transparent);
          animation: matrixFall linear infinite;
        }

        @keyframes matrixFall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #00ffff;
          border-radius: 50%;
          opacity: 0.6;
          animation: particleFloat linear infinite;
          box-shadow: 0 0 10px #00ffff;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        .lightning-bolt {
          position: absolute;
          width: 2px;
          height: 100px;
          background: linear-gradient(to bottom, #fff, #00ffff, transparent);
          opacity: 0;
          animation: lightning 4s ease-in-out infinite;
          box-shadow: 0 0 10px #00ffff;
        }

        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          5%, 10% { opacity: 1; }
        }

        @keyframes ripple {
          0% {
            width: 10px;
            height: 10px;
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes rotate {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        @keyframes pulse {
          0%, 100% { 
            box-shadow: 
              0 0 60px rgba(0, 255, 255, 0.5),
              0 0 100px rgba(0, 255, 255, 0.3);
          }
          50% { 
            box-shadow: 
              0 0 80px rgba(0, 255, 255, 0.8),
              0 0 120px rgba(0, 255, 255, 0.5);
          }
        }

        @keyframes orbitRotate {
          0% { transform: rotateZ(0deg); }
          100% { transform: rotateZ(360deg); }
        }

        @keyframes tokenOrbit {
          0% { transform: rotateZ(0deg); }
          100% { transform: rotateZ(360deg); }
        }

        @keyframes tokenFloat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      {/* 背景矩阵 */}
      <div 
        ref={matrixRef}
        className="absolute top-0 left-0 w-full h-full opacity-10 z-0"
      />

      {/* 粒子效果 */}
      <div 
        ref={particlesRef}
        className="absolute w-full h-full overflow-hidden z-0"
      />

      {/* 主场景 */}
      <div className="relative w-full h-screen flex justify-center items-center z-10" style={{ perspective: '1000px' }}>
        {/* 中央平台 */}
        <div 
          className="absolute bottom-12 w-96 h-10 rounded-full shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #1a2456, #2d4070)',
            boxShadow: '0 0 50px rgba(0, 255, 255, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.1)',
            transform: 'rotateX(75deg)'
          }}
        />

        {/* Logo容器 */}
        <div 
          ref={logoRef}
          className="relative w-48 h-48"
          style={{
            transformStyle: 'preserve-3d',
            animation: 'float 3s ease-in-out infinite, rotate 20s linear infinite',
            transform: `rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`
          }}
        >
          {/* 环绕光环 */}
          <div 
            className="absolute border-4 border-transparent rounded-full"
            style={{
              width: '250px',
              height: '250px',
              top: '-50px',
              left: '-50px',
              background: 'linear-gradient(45deg, transparent, #00ffff, transparent)',
              backgroundClip: 'padding-box',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)',
              animation: 'orbitRotate 8s linear infinite'
            }}
          />
          <div 
            className="absolute border-4 border-transparent rounded-full"
            style={{
              width: '300px',
              height: '300px',
              top: '-75px',
              left: '-75px',
              background: 'linear-gradient(45deg, transparent, #00ffff, transparent)',
              backgroundClip: 'padding-box',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)',
              animation: 'orbitRotate 12s linear infinite reverse'
            }}
          />
          
          {/* 主Logo */}
          <div 
            className="absolute w-36 h-36 rounded-3xl flex items-center justify-center text-6xl font-bold text-slate-800"
            style={{
              background: 'linear-gradient(45deg, #00ffff, #00cc99)',
              boxShadow: '0 0 60px rgba(0, 255, 255, 0.5), 0 0 100px rgba(0, 255, 255, 0.3)',
              transform: 'translateZ(50px)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          >
            S
          </div>
          
          {/* 代币轨道 */}
          <div 
            className="absolute"
            style={{
              width: '350px',
              height: '350px',
              top: '-100px',
              left: '-100px',
              animation: 'tokenOrbit 15s linear infinite'
            }}
          >
            {/* 代币 */}
            <div 
              className="absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg"
              style={{
                background: 'linear-gradient(45deg, #ff6b35, #ff8e53)',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                animation: 'tokenFloat 3s ease-in-out infinite',
                animationDelay: '0s'
              }}
            >
              T
            </div>
            <div 
              className="absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg"
              style={{
                background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                top: '50%',
                right: 0,
                transform: 'translateY(-50%)',
                animation: 'tokenFloat 3s ease-in-out infinite',
                animationDelay: '0.5s'
              }}
            >
              R
            </div>
            <div 
              className="absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg"
              style={{
                background: 'linear-gradient(45deg, #059669, #10b981)',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                animation: 'tokenFloat 3s ease-in-out infinite',
                animationDelay: '1s'
              }}
            >
              X
            </div>
            <div 
              className="absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg"
              style={{
                background: 'linear-gradient(45deg, #7c3aed, #a855f7)',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)',
                animation: 'tokenFloat 3s ease-in-out infinite',
                animationDelay: '1.5s'
              }}
            >
              $
            </div>
          </div>
        </div>
      </div>

      {/* 闪电效果 */}
      <div 
        ref={lightningRef}
        className="absolute w-full h-full pointer-events-none z-20"
      />
    </div>
  );
};

export default TRXHeroAnimation;

