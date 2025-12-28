import React from 'react'

const PartnersCarousel = () => {
  // 第一行合作伙伴 logo
  const topRowLogos = [
    'logo-ong.svg',
    'logo-neo.png', 
    'logo-babydoge.svg',
    'logo-adex.svg',
    'logo-lista.svg'
  ]

  // 第二行合作伙伴 logo
  const bottomRowLogos = [
    'logo-initia.svg',
    'logo-ace.svg',
    'logo-celo.svg',
    'logo-vaulta.svg'
  ]

  return (
    <div className="bn-flex relative flex-col my-8">
      {/* 第一行轮播 */}
      <div className="relative overflow-hidden">
        <div className="flex animate-scroll-right">
          {/* 重复logo数组多次以确保无缝滚动 */}
          {Array.from({ length: 10 }, (_, groupIndex) => 
            topRowLogos.map((logo, index) => (
              <div key={`top-${groupIndex}-${index}`} className="flex-shrink-0 px-4 py-2 flex items-center justify-center select-none">
                <img 
                  role="img" 
                  aria-label="partner logo" 
                  alt="partner logo" 
                  className="w-[100px] lg:w-[160px] h-[50px] lg:h-[80px] object-contain" 
                  src={`/sponsors/${logo}`}
                />
              </div>
            ))
          )}
        </div>
        
        {/* 左右渐变遮罩 */}
        <div className="absolute left-0 top-0 bottom-0 w-[100px]" style={{background: 'linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)'}}></div>
        <div className="absolute right-0 top-0 bottom-0 w-[100px]" style={{background: 'linear-gradient(270deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)'}}></div>
      </div>

      {/* 第二行轮播 */}
      <div className="relative overflow-hidden">
        <div className="flex animate-scroll-left">
          {/* 重复logo数组多次以确保无缝滚动 */}
          {Array.from({ length: 10 }, (_, groupIndex) => 
            bottomRowLogos.map((logo, index) => (
              <div key={`bottom-${groupIndex}-${index}`} className="flex-shrink-0 px-4 py-2 flex items-center justify-center select-none">
                <img 
                  role="img" 
                  aria-label="partner logo" 
                  alt="partner logo" 
                  className="w-[100px] lg:w-[160px] h-[50px] lg:h-[80px] object-contain" 
                  src={`/sponsors/${logo}`}
                />
              </div>
            ))
          )}
        </div>
        
        {/* 左右渐变遮罩 */}
        <div className="absolute left-0 top-0 bottom-0 w-[100px]" style={{background: 'linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)'}}></div>
        <div className="absolute right-0 top-0 bottom-0 w-[100px]" style={{background: 'linear-gradient(270deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)'}}></div>
      </div>
    </div>
  )
}

export default PartnersCarousel 