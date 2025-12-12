'use client'

import { useState, useCallback } from 'react'

interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface Toast extends ToastProps {
  id: string
  timestamp: number
}

let toastCount = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: ToastProps) => {
    const id = (++toastCount).toString()
    const newToast: Toast = {
      id,
      title,
      description,
      variant,
      duration,
      timestamp: Date.now()
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // 在浏览器中显示简单的通知
    if (typeof window !== 'undefined') {
      const message = description ? `${title}: ${description}` : title
      
      if (variant === 'destructive') {
        console.error('❌ ' + message)
        // 可以在这里添加更复杂的错误通知UI
        alert('Error: ' + message)
      } else {
        console.log('✅ ' + message)
        // 可以在这里添加更复杂的成功通知UI
        alert('Success: ' + message)
      }
    }

    // 自动移除toast
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter(t => t.id !== id))
    }, duration)
  }, [])

  const dismiss = useCallback((toastId: string) => {
    setToasts((prevToasts) => prevToasts.filter(t => t.id !== toastId))
  }, [])

  return {
    toast,
    dismiss,
    toasts
  }
}

// 导出一个简单的toast函数供直接使用
export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  const message = description ? `${title}: ${description}` : title
  
  if (typeof window !== 'undefined') {
    if (variant === 'destructive') {
      console.error('❌ ' + message)
      alert('Error: ' + message)
    } else {
      console.log('✅ ' + message)
      alert('Success: ' + message)
    }
  }
} 