'use client';

import { useEffect, useRef } from 'react';

interface Meteor {
  x: number;
  y: number;
  length: number;
  angle: number;
  width: number;
  height: number;
  speed: number;
  offset_x: number;
  offset_y: number;
  alpha: number;
  image: HTMLImageElement;
  size: number;
}

export function MeteorRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameRef = useRef<number>();
  const waveCounterRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const meteorImageUrls = [
      'https://cy-747263170.imgix.net/eth53112.png',
      'https://cy-747263170.imgix.net/eth651.png',
      'https://cy-747263170.imgix.net/ethsd.png',
      'https://cy-747263170.imgix.net/eth66914.png',
      'https://cy-747263170.imgix.net/eth6679.png',
      'https://cy-747263170.imgix.net/eth8894.png',
      'https://cy-747263170.imgix.net/eth77411.png',
    ];

    let loadedImages = 0;
    meteorImageUrls.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImages++;
        if (loadedImages === meteorImageUrls.length) {
          initMeteors();
          animate();
        }
      };
      img.src = url;
      imagesRef.current[index] = img;
    });

    const getMeteorCount = (wave: number): number => {
      const counts = [1, 2, 1, 3, 2, 1, 3, 2, 4, 3, 2, 5, 4, 3, 6, 5];
      return counts[wave % counts.length];
    };

    const createMeteor = (): Meteor => {
      const angle = 30;
      const speed = Math.random() * 3 + 2;
      const size = Math.random() * 80 + 100;
      
      const cos = Math.cos((angle * Math.PI) / 180);
      const sin = Math.sin((angle * Math.PI) / 180);
      
      const length = Math.random() * 80 + 150;
      const width = length * cos;
      const height = length * sin;
      const offset_x = speed * cos;
      const offset_y = speed * sin;

      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;

      const randomIndex = Math.floor(Math.random() * imagesRef.current.length);
      const image = imagesRef.current[randomIndex];

      return {
        x,
        y,
        length,
        angle,
        width,
        height,
        speed,
        offset_x,
        offset_y,
        alpha: 1,
        image,
        size,
      };
    };

    const initMeteors = () => {
      meteorsRef.current = [];
      const count = getMeteorCount(waveCounterRef.current);
      for (let i = 0; i < count; i++) {
        meteorsRef.current.push(createMeteor());
      }
      waveCounterRef.current++;
    };

    const drawMeteor = (meteor: Meteor) => {
      if (!ctx) return;

      ctx.save();
      ctx.globalAlpha = meteor.alpha;

      ctx.drawImage(
        meteor.image,
        meteor.x - meteor.size / 2,
        meteor.y - meteor.size / 2,
        meteor.size,
        meteor.size
      );

      ctx.restore();
    };

    const moveMeteor = (meteor: Meteor) => {
      meteor.x = meteor.x + meteor.offset_x;
      meteor.y = meteor.y + meteor.offset_y;
      meteor.alpha -= 0.003;
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let allGone = true;
      for (let i = 0; i < meteorsRef.current.length; i++) {
        const meteor = meteorsRef.current[i];
        
        moveMeteor(meteor);
        drawMeteor(meteor);

        if (!(meteor.y > canvas.height || meteor.x > canvas.width || meteor.alpha <= 0)) {
          allGone = false;
        }
      }

      if (allGone && meteorsRef.current.length > 0) {
        const count = getMeteorCount(waveCounterRef.current);
        meteorsRef.current = [];
        for (let i = 0; i < count; i++) {
          meteorsRef.current.push(createMeteor());
        }
        waveCounterRef.current++;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}


