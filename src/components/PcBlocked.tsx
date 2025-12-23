'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Smartphone, Monitor } from 'lucide-react'

export default function PcBlocked({ children }: { children: React.ReactNode }) {
  const [isPc, setIsPc] = useState<boolean | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // 排除管理后台和API路由
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) {
      setIsPc(false)
      return
    }

    // 检测是否为PC端
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      
      // 移动设备检测
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      const isMobile = mobileRegex.test(userAgent.toLowerCase())
      
      // 屏幕宽度检测（小于768px认为是移动设备）
      const isSmallScreen = window.innerWidth < 768
      
      // 触摸设备检测
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // 如果既不是移动设备，也不是小屏幕，也不是触摸设备，则认为是PC
      const isDesktop = !isMobile && !isSmallScreen && !isTouchDevice
      
      setIsPc(isDesktop)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [pathname])

  // 排除管理后台和API路由
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) {
    return <>{children}</>
  }

  // 等待检测完成
  if (isPc === null) {
    return null
  }

  // 如果是PC端，只显示提示页面
  if (isPc) {
    return (
      <div className="fixed inset-0 bg-black z-[99999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="max-w-md w-full text-center">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <Monitor className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              仅支持移动端访问
            </h1>
            <p className="text-gray-400 text-sm">
              请使用手机或平板设备访问本网站
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex flex-col items-center">
              <Smartphone className="w-12 h-12 text-green-400 mb-2" />
              <span className="text-xs text-gray-400">移动设备</span>
            </div>
            <div className="text-gray-600">→</div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-2">
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <span className="text-xs text-gray-400">正常访问</span>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300 leading-relaxed">
              为了获得最佳体验，请使用以下设备访问：
            </p>
            <ul className="text-left text-sm text-gray-400 mt-3 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span>iPhone / iPad</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span>Android 手机 / 平板</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                <span className="text-gray-500">Windows / Mac 电脑</span>
              </li>
            </ul>
          </div>

          <div className="text-xs text-gray-500">
            如果您使用的是移动设备但仍看到此提示，请尝试刷新页面
          </div>
        </div>
      </div>
    </div>
    )
  }

  // 如果不是PC端，正常显示内容
  return <>{children}</>
}

