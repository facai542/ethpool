import type React from 'react'
import { cn } from '@/lib/utils'
import HexagonLoader, { HexagonLoaderSimple, HexagonLoaderInline } from '@/components/HexagonLoader'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'hexagon'
  animation?: 'pulse' | 'shimmer' | 'wave' | 'hex'
  lines?: number
  size?: 'small' | 'medium' | 'large'
  style?: React.CSSProperties
}

export function LoadingSkeleton({
  className,
  variant = 'hexagon',
  animation = 'hex',
  lines = 1,
  size = 'medium',
  style
}: LoadingSkeletonProps) {
  // 如果是六边形加载动画
  if (variant === 'hexagon' || animation === 'hex') {
    const loaderSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'
    
    if (variant === 'text' || variant === 'rectangular') {
      return (
        <div className={cn('flex items-center justify-center py-4', className)} style={style}>
          <HexagonLoaderSimple size={loaderSize} />
        </div>
      )
    }
    
    if (variant === 'circular') {
      return (
        <div className={cn('flex items-center justify-center', className)} style={style}>
          <HexagonLoaderInline />
        </div>
      )
    }
    
    if (variant === 'card') {
      return (
        <div className={cn('flex items-center justify-center py-8', className)} style={style}>
          <HexagonLoader size={loaderSize} />
        </div>
      )
    }
    
    // 默认六边形加载
    return (
      <div className={cn('flex items-center justify-center py-6', className)} style={style}>
        <HexagonLoaderSimple size={loaderSize} />
      </div>
    )
  }

  // 保留原始骨架屏动画作为备选
  const baseClasses = cn(
    'bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20',
    {
      'animate-pulse': animation === 'pulse',
      'shimmer': animation === 'shimmer',
      'animate-pulse bg-gradient-to-r from-muted/20 via-muted/50 to-muted/20': animation === 'wave',
    }
  )

  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'h-4 rounded',
    circular: 'rounded-full aspect-square',
    card: 'h-32 rounded-lg',
    hexagon: 'h-4 rounded' // fallback
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => ({
          id: `skeleton-${Math.random().toString(36).substr(2, 9)}-${index}`,
          index
        })).map(({ id, index }) => (
          <div
            key={id}
            className={cn(
              baseClasses,
              variantClasses[variant],
              index === lines - 1 && 'w-3/4', // Last line shorter
              className
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    />
  )
}

// 便捷组件
export function HexLoadingCard({ className }: { className?: string }) {
  return <LoadingSkeleton variant="card" animation="hex" className={className} />
}

export function HexLoadingText({ className, lines = 1 }: { className?: string, lines?: number }) {
  return <LoadingSkeleton variant="text" animation="hex" lines={lines} className={className} />
}

export function HexLoadingButton({ className }: { className?: string }) {
  return <LoadingSkeleton variant="rectangular" animation="hex" className={className} />
}
