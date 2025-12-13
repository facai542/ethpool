"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface LightButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

export function LightButton({ children, onClick, href }: LightButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <div className="light-button-wrapper">
      <div className="light-button-cont">
        <button className="light-button" onClick={handleClick}>
          {children}
        </button>
      </div>
    </div>
  );
}

