'use client'

import { useEffect, useState } from 'react'

interface CounterAnimationProps {
  end: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function CounterAnimation({
  end,
  duration = 2000,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = ''
}: CounterAnimationProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(`counter-${end}`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [end, isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - (1 - progress) ** 4
      const current = end * easeOutQuart

      setCount(current)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration, isVisible])

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals)
    }
    return Math.floor(num).toLocaleString()
  }

  return (
    <span id={`counter-${end}`} className={`counter-text ${className}`}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}
