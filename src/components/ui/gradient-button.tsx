'use client';

import React from 'react';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const GradientButton: React.FC<GradientButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false,
  className = '',
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative inline-flex overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-3 text-sm font-medium backdrop-blur-3xl transition-all duration-300 group-hover:bg-slate-950/90">
        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="mr-2 h-5 w-5 text-pink-500 transition-transform duration-300 group-hover:-translate-x-1">
          <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <span className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent font-semibold">
          {children}
        </span>
        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="ml-2 h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:translate-x-1">
          <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </span>
    </button>
  );
};

export default GradientButton;


