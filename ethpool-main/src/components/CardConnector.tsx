import type React from 'react'

interface CardConnectorProps {
  className?: string
}

export const CardConnector: React.FC<CardConnectorProps> = ({ className = '' }) => {
  return (
    <div className={`${className}`} style={{ 
      marginTop: '-16px',
      marginBottom: '0px'
    }}>
      {/* 中间连接线 */}
      <div className="flex w-full h-8">
        <div 
          className="w-[14px]" 
          style={{ 
            backgroundImage: 'url("/fragments/frame-middle-left-mobile.svg")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain'
          }}
        />
        <div 
          className="flex-1 bg-no-repeat bg-cover bg-center" 
          style={{ 
            backgroundImage: 'url("/fragments/frame-middle-center-mobile.svg")',
            backgroundColor: '#000000'
          }}
        />
        <div 
          className="w-[14px]" 
          style={{ 
            backgroundImage: 'url("/fragments/frame-middle-right-mobile.svg")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain'
          }}
        />
      </div>
    </div>
  )
} 