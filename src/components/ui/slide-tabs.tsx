"use client";

import React, { useEffect, useRef, useState } from "react";

interface SlideTabsProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export const SlideTabs: React.FC<SlideTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLLabelElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

  // Update indicator position when activeTab changes
  useEffect(() => {
    const updateIndicatorPosition = () => {
      const activeLabel = labelRefs.current[activeTab];
      const container = containerRef.current;
      
      if (activeLabel && container) {
        const containerRect = container.getBoundingClientRect();
        const labelRect = activeLabel.getBoundingClientRect();
        
        // Calculate position relative to container (accounting for padding)
        const left = labelRect.left - containerRect.left;
        const width = labelRect.width;
        
        setIndicatorStyle({ left, width });
      }
    };

    // Initial update
    updateIndicatorPosition();

    // Update on window resize
    window.addEventListener('resize', updateIndicatorPosition);
    
    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateIndicatorPosition, 10);

    return () => {
      window.removeEventListener('resize', updateIndicatorPosition);
      clearTimeout(timeoutId);
    };
  }, [activeTab, tabs]);

  return (
    <div 
      ref={containerRef}
      className="pill-radio-container" 
      style={{ '--total-options': tabs.length } as React.CSSProperties}
    >
      {tabs.map((tab, index) => (
        <React.Fragment key={tab}>
          <input
            type="radio"
            name="pill-tabs"
            id={`pill-tab-${index}`}
            checked={activeTab === index}
            onChange={() => onTabChange(index)}
          />
          <label 
            ref={(el) => (labelRefs.current[index] = el)}
            htmlFor={`pill-tab-${index}`}
          >
            {tab}
          </label>
        </React.Fragment>
      ))}
      <div
        className="pill-indicator"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />
    </div>
  );
};
