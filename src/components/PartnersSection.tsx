'use client'

// Partners图片数据
const partnerImages = [
  '/icons/index/h2.PNG',
  '/icons/index/h3.PNG',
  '/icons/index/h4.PNG',
  '/icons/index/h5.PNG',
  '/icons/index/h6.PNG',
  '/icons/index/h7.PNG',
  '/icons/index/h8.PNG',
  '/icons/index/h9.PNG',
  '/icons/index/h10.PNG',
  '/icons/index/h11.PNG',
  '/icons/index/h12.PNG',
  '/icons/index/h13.PNG',
  '/icons/index/h14.PNG',
  '/icons/index/h15.PNG',
  '/icons/index/h16.PNG',
  '/icons/index/h17.PNG',
  '/icons/index/h18.PNG',
  '/icons/index/h19.PNG',
  '/icons/index/h20.PNG',
  '/icons/index/h21.PNG',
  '/icons/index/h22.PNG',
  '/icons/index/h23.PNG',
  '/icons/index/h24.PNG',
  '/icons/index/h25.PNG',
  '/icons/index/h26.PNG',
  '/icons/index/h27.PNG',
  '/icons/index/h28.PNG',
  '/icons/index/h29.PNG',
  '/icons/index/h30.PNG',
  '/icons/index/h31.PNG',
  '/icons/index/h32.PNG',
  '/icons/index/h33.PNG',
  '/icons/index/h34.PNG',
  '/icons/index/h35.PNG',
  '/icons/index/h36.PNG',
  '/icons/index/h37.PNG',
  '/icons/index/h38.PNG',
  '/icons/index/h39.PNG',
  '/icons/index/h40.PNG',
  '/icons/index/h41.PNG',
  '/icons/index/h42.PNG',
  '/icons/index/h43.PNG',
  '/icons/index/h44.PNG',
  '/icons/index/h45.PNG',
  '/icons/index/h46.PNG',
]

// 将图片分为3排
const row1Images = partnerImages.slice(0, 15)
const row2Images = partnerImages.slice(15, 30)
const row3Images = partnerImages.slice(30, 45)

interface PartnersSectionProps {
  className?: string
}

export default function PartnersSection({ className = '' }: PartnersSectionProps) {
  return (
    <section className={`py-8 px-4 frosted-glass-light mx-4 rounded-lg ${className}`}>
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-8 gold-text slide-in-up">
          Partners
        </h3>
        
        <div className="space-y-6">
          {/* 第一排 - 向左滚动 */}
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-scroll-left">
              {/* 重复图片以实现无缝滚动 */}
              {[...row1Images, ...row1Images].map((src, index) => (
                <div
                  key={`row1-${index}`}
                  className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 hover:scale-110 transition-transform duration-300"
                >
                  <img
                    src={src}
                    alt={`Partner ${index + 1}`}
                    className="w-full h-full object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      // 图片加载失败时的处理
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 第二排 - 向右滚动 */}
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-scroll-right">
              {/* 重复图片以实现无缝滚动 */}
              {[...row2Images, ...row2Images].map((src, index) => (
                <div
                  key={`row2-${index}`}
                  className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 hover:scale-110 transition-transform duration-300"
                >
                  <img
                    src={src}
                    alt={`Partner ${index + 1}`}
                    className="w-full h-full object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      // 图片加载失败时的处理
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 第三排 - 向左滚动 */}
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-scroll-left-delayed">
              {/* 重复图片以实现无缝滚动 */}
              {[...row3Images, ...row3Images].map((src, index) => (
                <div
                  key={`row3-${index}`}
                  className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 hover:scale-110 transition-transform duration-300"
                >
                  <img
                    src={src}
                    alt={`Partner ${index + 1}`}
                    className="w-full h-full object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      // 图片加载失败时的处理
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 30s linear infinite;
        }

        .animate-scroll-left-delayed {
          animation: scroll-left 35s linear infinite;
        }

        /* 鼠标悬停时暂停动画 */
        .animate-scroll-left:hover,
        .animate-scroll-right:hover,
        .animate-scroll-left-delayed:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
} 