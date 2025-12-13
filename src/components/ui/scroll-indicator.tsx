'use client';

import React from 'react';

const ScrollIndicator = () => {
  const scrollDown = () => {
    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  };

  return (
    <div className="scroll-indicator-wrapper">
      <div className="scroll-indicator-scrolldown" onClick={scrollDown}>
        <div className="scroll-indicator-chevrons">
          <div className="scroll-indicator-chevrondown" />
          <div className="scroll-indicator-chevrondown" />
        </div>
      </div>
    </div>
  );
}

export default ScrollIndicator;


