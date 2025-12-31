'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useMemo, useCallback } from 'react'
import { useLoading } from '@/contexts/LoadingContext'

interface NavigationItem {
  normalIcon: string
  activeIcon: string
  alt: string
  label: string
  href: string
  active?: boolean
}

interface BottomNavigationProps {
  className?: string
}

// 优化的单个导航项组件
const NavigationItem = memo(({ item }: { item: NavigationItem & { active: boolean } }) => {
  const { setLoading } = useLoading()
  
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    const iconPath = item.active ? item.activeIcon : item.normalIcon
    console.error(`❌ 图标加载失败: ${iconPath} for ${item.label}`)
    
    // 尝试备用路径
    if (iconPath.includes('/foot/')) {
      target.src = iconPath.replace('/foot/', '/')
    } else if (!iconPath.includes('/foot/')) {
      target.src = iconPath.replace('/icons/', '/icons/foot/')
    }
  }, [item.active, item.activeIcon, item.normalIcon, item.label])

  const handleClick = useCallback(() => {
    // 如果点击的不是当前页面，显示加载动画
    if (!item.active) {
      setLoading(true)
    }
  }, [item.active, setLoading])

  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center py-2 px-4 transition-transform duration-200 transform hover:scale-105 active:scale-95 ${
        item.active ? 'scale-110' : ''
      }`}
      style={{ textDecoration: 'none' }}
      prefetch={true} // 预加载页面提升性能
      onClick={handleClick}
    >
      <div className={`relative transition-all duration-200 ${item.active ? 'filter brightness-125' : ''}`}>
        <img
          src={item.active ? item.activeIcon : item.normalIcon}
          alt={item.alt}
          className={`w-6 h-6 mb-1 transition-all duration-200 ${
            item.active ? 'filter drop-shadow-lg' : ''
          }`}
          onError={handleImageError}
          loading="eager" // 立即加载重要图标
        />
        {/* 激活状态指示器 */}
        {item.active && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        )}
      </div>
      <span className={`text-xs transition-colors duration-200 ${
        item.active ? 'text-yellow-500 font-bold' : 'text-white'
      }`}>
        {item.label}
      </span>
    </Link>
  )
})

// 将导航项移到组件外部，避免重复创建
const navigationItems: NavigationItem[] = [
  { 
    normalIcon: "/icons/foot/home.png",
    activeIcon: "/icons/foot/home1.png", 
    alt: "Home", 
    label: "Home", 
    href: "/" 
  },
  { 
    normalIcon: "/icons/foot/pool.png",
    activeIcon: "/icons/foot/pool1.png", 
    alt: "USER", 
    label: "USER", 
    href: "/mining" 
  },
]

function BottomNavigation({ className = '' }: BottomNavigationProps) {
  const pathname = usePathname()

  // 使用 useCallback 优化 isActive 函数
  const isActive = useCallback((href: string) => {
    if (!pathname) return false
    
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }, [pathname])

  // 使用 useMemo 缓存计算结果
  const navigationItemsWithActiveState = useMemo(() => {
    return navigationItems.map(item => ({
      ...item,
      active: isActive(item.href)
    }))
  }, [isActive])

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-border z-20 ${className}`}>
      <div className="flex justify-around items-center py-2">
        {navigationItemsWithActiveState.map((item) => (
          <NavigationItem key={item.label} item={item} />
        ))}
      </div>
    </nav>
  )
}

// 使用memo包装主组件以避免不必要的重渲染
export default memo(BottomNavigation)

// 用于添加底部间距的组件
export const BottomSpacer = memo(() => {
  return <div className="h-24 md:h-20" />
}) 