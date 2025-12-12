"use client" 

import * as React from "react"
import { useEffect, useRef, useState } from "react";
 
export interface AnimatedTabsProps {
  tabs: { label: string; value: string }[];
  activeTab: string;
  onTabChange: (value: string) => void;
}
 
export function AnimatedTabs({ tabs, activeTab, onTabChange }: AnimatedTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    const container = containerRef.current;
 
    if (container && activeTab) {
      const activeTabElement = activeTabRef.current;
 
      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;
 
        const clipLeft = offsetLeft + 2;
        const clipRight = offsetLeft + offsetWidth + 2;
 
        container.style.clipPath = `inset(0 ${Number(
          100 - (clipRight / container.offsetWidth) * 100,
        ).toFixed()}% 0 ${Number(
          (clipLeft / container.offsetWidth) * 100,
        ).toFixed()}% round 16px)`;
      }
    }
  }, [activeTab]);
 
  return (
    <div className="animated-tabs-container relative bg-black border border-gray-600 mx-auto flex w-full flex-col items-center rounded-2xl py-1 px-1">
      <div
        ref={containerRef}
        className="absolute z-10 w-full overflow-hidden [clip-path:inset(0px_75%_0px_0%_round_16px)] [transition:clip-path_0.25s_ease]"
      >
        <div className="relative flex w-full justify-center">
          {tabs.map((tab, index) => (
            <div
              key={index}
              onClick={() => onTabChange(tab.value)}
              className="flex-1 h-10 items-center rounded-xl py-2 text-sm font-medium flex justify-center cursor-pointer select-none"
              style={{
                backgroundColor: '#facc15',
                color: '#000000'
              }}
              tabIndex={-1}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>
 
      <div className="relative flex w-full justify-center">
        {tabs.map(({ label, value }, index) => {
          const isActive = activeTab === value;
 
          return (
            <div
              key={index}
              ref={isActive ? activeTabRef : null}
              onClick={() => onTabChange(value)}
              className="flex-1 h-10 items-center cursor-pointer rounded-xl py-2 text-sm font-medium transition-colors flex justify-center select-none"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLDivElement).style.color = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLDivElement).style.color = '#ffffff';
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
