"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const toggleVisibility = () => {
      // 当页面滚动超过300px时显示按钮
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="back-to-top-wrapper">
      <button 
        className="back-to-top-btn"
        onClick={scrollToTop}
        aria-label="返回顶部"
      >
        <ChevronDown className="back-to-top-arrow" size={19} />
        <p className="back-to-top-text">Back to Top</p>
      </button>
    </div>
  );
}


