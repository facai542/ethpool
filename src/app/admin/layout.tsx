'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/ui/admin-sidebar'
import { getAdminSession, clearAdminSession } from '@/lib/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminSession, setAdminSession] = useState<any>(null)

  useEffect(() => {
    const checkSession = () => {
      const session = getAdminSession()
      console.log('🔍 Layout检查会话:', session)
      if (session) {
        setAdminSession(session)
        console.log('✅ 会话设置成功')
      } else {
        console.log('❌ 没有找到会话')
      }
    }
    
    checkSession()
  }, [])

  const handleLogout = () => {
    clearAdminSession()
    setAdminSession(null)
    router.push('/admin/login')
  }

  // 如果是登录页面，不显示布局
  if (pathname && pathname.includes('/admin/login')) {
    return children
  }

  // 如果没有会话且不是登录页面，重定向到登录
  if (!adminSession && pathname && !pathname.includes('/admin/login')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-800">
        <div className="text-center">
          <div className="text-white text-lg mb-4">请先登录</div>
          <a href="/admin/login" className="text-blue-400 hover:text-blue-300">
            点击这里登录
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-800 flex">
      {/* 新的现代化侧边栏 */}
      <AdminSidebar 
        defaultSection="dashboard"
        adminSession={adminSession}
        onLogout={handleLogout}
      />

      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto bg-slate-800 p-6">
        {children}
      </main>
    </div>
  )
}
