import type React from 'react'

interface FramedCardProps {
  children: React.ReactNode
  className?: string
  minHeight?: string
  backgroundGradient?: string
  style?: React.CSSProperties
  hideTopBorder?: boolean
}

export const FramedCard: React.FC<FramedCardProps> = ({
  children,
  className = '',
  minHeight = '400px',
  backgroundGradient = 'bg-gradient-to-b from-[#F0B90B]/10 to-[#FCD535]/10',
  style,
  hideTopBorder = false
}) => {
  return (
    <div 
      className={`relative ${backgroundGradient} rounded-2xl border border-yellow-500/30 ${className}`} 
      style={{ minHeight, ...style }}
    >
      {/* 简洁的卡片内容区域 */}
      <div className="bg-gradient-to-br from-black/90 to-gray-900/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 h-full">
        {children}
      </div>
    </div>
  )
} 
 