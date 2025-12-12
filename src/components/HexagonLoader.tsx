'use client'

import React from 'react'

interface HexagonLoaderProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function HexagonLoader({ size = 'medium', className = '' }: HexagonLoaderProps) {
  return (
    <div className={`hex-loader-container ${className}`}>
      <div className={`hex-socket ${size}`}>
        {/* 中心六边形 */}
        <div className="hex-gel center-gel">
          <div className="hex-brick h1"></div>
          <div className="hex-brick h2"></div>
          <div className="hex-brick h3"></div>
        </div>
        
        {/* 第一环 */}
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={`r1-${i}`} className={`hex-gel c${i} r1`}>
            <div className="hex-brick h1"></div>
            <div className="hex-brick h2"></div>
            <div className="hex-brick h3"></div>
          </div>
        ))}
        
        {/* 第二环 */}
        {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(i => (
          <div key={`r2-${i}`} className={`hex-gel c${i} r2`}>
            <div className="hex-brick h1"></div>
            <div className="hex-brick h2"></div>
            <div className="hex-brick h3"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 创建一个简化版本，只显示中心和第一环
export function HexagonLoaderSimple({ size = 'small', className = '' }: HexagonLoaderProps) {
  return (
    <div className={`hex-loader-container ${className}`}>
      <div className={`hex-socket ${size}`}>
        {/* 中心六边形 */}
        <div className="hex-gel center-gel">
          <div className="hex-brick h1"></div>
          <div className="hex-brick h2"></div>
          <div className="hex-brick h3"></div>
        </div>
        
        {/* 第一环 */}
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={`r1-${i}`} className={`hex-gel c${i} r1`}>
            <div className="hex-brick h1"></div>
            <div className="hex-brick h2"></div>
            <div className="hex-brick h3"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 创建一个内联版本，用于按钮内部等小空间
export function HexagonLoaderInline({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="hex-loader-container">
        <div className="hex-socket small">
          <div className="hex-gel center-gel">
            <div className="hex-brick h1"></div>
            <div className="hex-brick h2"></div>
            <div className="hex-brick h3"></div>
          </div>
          
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={`inline-${i}`} className={`hex-gel c${i} r1`}>
              <div className="hex-brick h1"></div>
              <div className="hex-brick h2"></div>
              <div className="hex-brick h3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 