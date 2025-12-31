import type React from 'react'

interface FramedCardNoTopProps {
  children: React.ReactNode
  className?: string
  minHeight?: string
  backgroundGradient?: string
  style?: React.CSSProperties
}

export const FramedCardNoTop: React.FC<FramedCardNoTopProps> = ({
  children,
  className = '',
  minHeight = '400px',
  backgroundGradient = 'bg-gradient-to-b from-[#F0B90B]/10 to-[#FCD535]/10',
  style
}) => {
  return (
    <div className={`relative ${backgroundGradient} p-4 rounded-lg ${className}`} style={style}>
      {/* 边框装饰 */}
      <div className="binance-frame flex" style={{ minHeight }}>
        {/* 左侧边框 */}
        <div className="flex flex-col w-[14px]">
          <div 
            className="flex flex-1 bg-[#1E1E1E] items-center" 
            style={{ borderLeft: '1px solid rgb(252, 234, 156)' }}
          >
            <img 
              className="w-full h-full object-cover" 
              src="/fragments/left-gradient.svg" 
              alt="Left gradient"
            />
          </div>
          <div 
            className="h-4 rotate-180" 
            style={{ 
              backgroundImage: "url('/fragments/frame-right-corner-mobile.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat' 
            }}
          ></div>
        </div>

        {/* 中间内容区域 */}
        <div className="flex flex-col flex-1">
          {/* 顶部边框 - 移除 */}

          {/* 卡片内容 */}
          <div className="flex-1 bg-gradient-to-br from-black/80 to-gray-900/90 backdrop-blur-sm border-l border-r border-yellow-500/20 p-4 md:p-6">
            {children}
          </div>

          {/* 底部边框 */}
          <div className="flex w-full">
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-bottom-left-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
            <div 
              className="w-[150px] bg-no-repeat bg-cover h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-bottom-center-mobile.svg')" 
              }}
            ></div>
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-bottom-right-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
          </div>
        </div>

        {/* 右侧边框 */}
        <div className="flex flex-col w-[14px]">
          <div 
            className="flex flex-1 bg-[#1E1E1E] items-center" 
            style={{ borderRight: '1px solid rgb(252, 234, 156)' }}
          >
            <img 
              className="w-full h-full object-cover" 
              src="/fragments/right-gradient.svg" 
              alt="Right gradient"
            />
          </div>
          <div 
            className="h-4 rotate-180" 
            style={{ 
              backgroundImage: "url('/fragments/frame-left-corner-mobile.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat' 
            }}
          ></div>
        </div>
      </div>
    </div>
  )
} 