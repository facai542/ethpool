"use client";

import type React from "react";
import { type ReactNode, useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils";

interface CardCanvasProps {
  children: ReactNode;
  className?: string;
}

export const CardCanvas = ({ children, className }: CardCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div 
      className={cn("relative group", className)}
      onMouseMove={handleMouseMove}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 0, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn(
      "rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-900/80 backdrop-blur-sm",
      "shadow-xl shadow-black/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20",
      className
    )}>
      {children}
    </div>
  );
};
