"use client";

import React from 'react';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const GlowButton = ({ children, onClick, disabled = false, className = "" }: GlowButtonProps) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`relative cursor-pointer py-3 px-6 text-center font-medium flex flex-col justify-center items-center gap-2 text-sm text-white rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-4 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed w-full ${className}`}
    >
      <span className="relative z-20 flex flex-col items-center justify-center gap-1">{children}</span>
      <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-white/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
      <span className="w-1/2 drop-shadow-[0_0_10px_rgba(212,237,249,0.5)] transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
      <span className="w-1/2 drop-shadow-[0_0_10px_rgba(212,237,249,0.5)] transition-all duration-300 block border-[#D4EDF9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
      <span className="w-1/2 drop-shadow-[0_0_10px_rgba(212,237,249,0.5)] transition-all duration-300 block border-[#D4EDF9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
      <span className="w-1/2 drop-shadow-[0_0_10px_rgba(212,237,249,0.5)] transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
    </button>
  );
};

export default GlowButton;

