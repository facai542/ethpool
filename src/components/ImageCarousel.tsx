'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselImage {
  id: number
  src: string
  alt: string
  title?: string
  description?: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  autoPlay?: boolean
  interval?: number
  showDots?: boolean
  showArrows?: boolean
  className?: string
}

export default function ImageCarousel({
  images,
  autoPlay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className = ''
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // 自动播放逻辑
  useEffect(() => {
    if (!autoPlay || isHovered || images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, isHovered, images.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (images.length === 0) {
    return (
      <div className={`relative w-full h-64 bg-gray-200 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No images to display</p>
      </div>
    )
  }

  return (
    <div 
      className={`relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-lg ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图片容器 */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="w-full h-full flex-shrink-0 relative"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* 文字覆盖层 */}
            {(image.title || image.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                {image.title && (
                  <h3 className="text-white text-lg font-bold mb-2">{image.title}</h3>
                )}
                {image.description && (
                  <p className="text-white/90 text-sm">{image.description}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 左右箭头 */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* 点指示器 */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* 进度条 */}
      {autoPlay && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ 
              width: `${((Date.now() % interval) / interval) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  )
} 