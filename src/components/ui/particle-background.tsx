'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = particlesRef.current;
    const particleCount = 50;

    // 清空现有粒子
    particles.innerHTML = '';

    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      particle.style.animationDelay = Math.random() * 2 + 's';
      particles.appendChild(particle);
    }

    return () => {
      // 清理粒子
      if (particles) {
        particles.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={particlesRef}
      className="particles"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
};
