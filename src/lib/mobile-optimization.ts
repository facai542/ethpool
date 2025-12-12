/**
 * 移动端优化工具
 * 处理移动端特有的问题和优化
 */

// 移动端检测
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  
  // 检测移动设备
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
}

// 是否为iOS设备
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// 是否为Android设备
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return /Android/.test(navigator.userAgent)
}

// 防止iOS自动缩放
export const preventIOSZoom = (): void => {
  if (!isIOS()) return
  
  // 防止双击缩放
  let lastTouchEnd = 0
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)
  
  // 防止多点触控缩放
  document.addEventListener('gesturestart', (event) => {
    event.preventDefault()
  })
}

// 优化移动端输入体验
export const optimizeMobileInput = (): void => {
  if (!isMobile()) return
  
  // 为所有数字输入框添加移动端优化
  const numberInputs = document.querySelectorAll('input[type="number"]')
  numberInputs.forEach((input) => {
    const element = input as HTMLInputElement
    
    // 添加移动端样式类
    element.classList.add('mobile-input')
    
    // 防止iOS的输入框缩放
    if (isIOS()) {
      element.style.fontSize = '16px'
    }
    
    // 优化Android输入体验
    if (isAndroid()) {
      element.setAttribute('inputmode', 'decimal')
    }
  })
}

// 移动端错误抑制
export const setupMobileErrorSuppression = (): void => {
  if (typeof window === 'undefined') return
  
  // 保存原始的console方法
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  
  // 移动端特有的错误模式
  const mobileErrorPatterns = [
    'ResizeObserver loop limit exceeded',
    'Non-passive event listener',
    'passive event listener',
    'touch-action',
    'viewport-fit',
    'safe-area-inset',
    'WebKit appearance',
    'iOS Safari',
    'Mobile Safari',
    'Chrome Mobile'
  ]
  
  console.error = (...args) => {
    const message = args.join(' ')
    
    const isMobileError = mobileErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    )
    
    if (isMobileError) {
      return // 抑制移动端特有错误
    }
    
    originalConsoleError.apply(console, args)
  }
  
  console.warn = (...args) => {
    const message = args.join(' ')
    
    const isMobileWarning = mobileErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    )
    
    if (isMobileWarning) {
      return // 抑制移动端特有警告
    }
    
    originalConsoleWarn.apply(console, args)
  }
}

// 移动端性能优化
export const optimizeMobilePerformance = (): void => {
  if (!isMobile()) return
  
  // 减少动画和过渡效果在低性能设备上的使用
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  
  if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms')
    document.documentElement.style.setProperty('--transition-duration', '0.01ms')
  }
  
  // 优化滚动性能
  document.addEventListener('touchstart', () => {}, {passive: true})
  document.addEventListener('touchmove', () => {}, {passive: true})
}

// 移动端视口优化
export const optimizeMobileViewport = (): void => {
  if (typeof document === 'undefined') return
  
  // 确保视口设置正确
  let viewport = document.querySelector('meta[name="viewport"]')
  
  if (!viewport) {
    viewport = document.createElement('meta')
    viewport.setAttribute('name', 'viewport')
    document.head.appendChild(viewport)
  }
  
  // 设置移动端友好的视口
  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
  
  // iOS状态栏优化
  if (isIOS()) {
    let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    
    if (!statusBarMeta) {
      statusBarMeta = document.createElement('meta')
      statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
      statusBarMeta.setAttribute('content', 'black-translucent')
      document.head.appendChild(statusBarMeta)
    }
  }
}

// 统一的移动端初始化函数
export const initializeMobileOptimizations = (): void => {
  if (typeof window === 'undefined') return
  
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupMobileOptimizations()
    })
  } else {
    setupMobileOptimizations()
  }
}

const setupMobileOptimizations = (): void => {
  optimizeMobileViewport()
  preventIOSZoom()
  optimizeMobileInput()
  setupMobileErrorSuppression()
  optimizeMobilePerformance()
  
  console.log('📱 移动端优化已启用')
}

export default {
  isMobile,
  isIOS,
  isAndroid,
  preventIOSZoom,
  optimizeMobileInput,
  setupMobileErrorSuppression,
  optimizeMobilePerformance,
  optimizeMobileViewport,
  initializeMobileOptimizations
}
