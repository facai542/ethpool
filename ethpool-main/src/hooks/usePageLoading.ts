'use client'

import { useEffect } from 'react'
import { useLoading } from '@/contexts/LoadingContext'

export function usePageLoading() {
  const { setLoading } = useLoading()

  useEffect(() => {
    // 页面加载完成后隐藏加载动画
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    // 监听页面状态变化
    const handleLoad = () => {
      setLoading(false)
    }

    const handleDOMContentLoaded = () => {
      setLoading(false)
    }

    // 如果页面已经加载完成
    if (document.readyState === 'complete') {
      setLoading(false)
    } else {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded)
      window.addEventListener('load', handleLoad)
    }

    return () => {
      clearTimeout(timer)
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded)
      window.removeEventListener('load', handleLoad)
    }
  }, [setLoading])

  return { setLoading }
} 