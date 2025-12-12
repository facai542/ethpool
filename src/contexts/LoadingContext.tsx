'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  showLoader: (message?: string) => void
  hideLoader: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')
  const router = useRouter()

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const showLoader = (message = 'Loading...') => {
    setLoadingMessage(message)
    setIsLoading(true)
  }

  const hideLoader = () => {
    setIsLoading(false)
  }

  // 监听路由变化
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    // 监听点击事件来检测导航
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link) {
        const href = link.getAttribute('href')
        // 检查是否是内部链接且不是当前页面
        if (href && href.startsWith('/') && href !== window.location.pathname) {
          setLoading(true)
          
          // 设置最长等待时间，防止加载动画一直显示
          timeoutId = setTimeout(() => {
            setLoading(false)
          }, 3000)
        }
      }
    }

    // 监听页面加载完成
    const handleLoad = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      // 延迟隐藏加载动画，确保页面完全加载
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }

    // 页面可见性变化时隐藏加载动画
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          setLoading(false)
        }, 200)
      }
    }

    // 安全地添加事件监听器
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClick)
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      // 安全地移除事件监听器
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', handleClick)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', handleLoad)
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
} 