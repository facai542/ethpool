'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PromotionPage() {
  const router = useRouter()

  useEffect(() => {
    // 重定向到代理管理页面
    router.push('/admin/agents')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-white">正在跳转到代理管理...</div>
    </div>
  )
} 