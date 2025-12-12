'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard,
  Users, 
  Settings,
  LogOut,
  Menu,
  Shield,
  ChevronDown,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react'

interface AgentSession {
  id: number
  name: string
  code: string
  user_address: string
  referral_code: string
  level: number
  role: 'agent'
}

interface MenuItem {
  id: string
  label: string
  icon: any
  path?: string
  children?: MenuItem[]
}

const agentMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '首页',
    icon: LayoutDashboard,
    path: '/agent'
  },
  {
    id: 'users',
    label: '用户管理',
    icon: Users,
    path: '/agent/users'
  },
  {
    id: 'settings',
    label: '活动设置',
    icon: Settings,
    path: '/agent/settings'
  }
]

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [agentSession, setAgentSession] = useState<AgentSession | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 检查代理会话
    const checkSession = async () => {
      try {
        const response = await fetch('/api/agent/session')
        const data = await response.json()
        
        if (data.success && data.session) {
          setAgentSession(data.session)
        } else {
          // 未登录，重定向到登录页
          if (pathname !== '/agent/login') {
            router.push('/agent/login')
          }
        }
      } catch (error) {
        console.error('检查会话失败:', error)
        if (pathname !== '/agent/login') {
          router.push('/agent/login')
        }
      }
    }
    
    checkSession()
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      await fetch('/api/agent/logout', { method: 'POST' })
      setAgentSession(null)
      router.push('/agent/login')
    } catch (error) {
      console.error('退出失败:', error)
    }
  }

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const isMenuActive = (menu: MenuItem): boolean => {
    if (menu.path) {
      return isActive(menu.path)
    }
    if (menu.children) {
      return menu.children.some(child => child.path && isActive(child.path))
    }
    return false
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${agentSession?.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 如果是登录页面，不显示布局
  if (pathname === '/agent/login') {
    return children
  }

  // 如果没有会话，显示加载中
  if (!agentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col fixed lg:relative h-full z-50`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-400" />
            {sidebarOpen && (
              <span className="ml-3 text-white font-semibold text-lg">代理后台</span>
            )}
          </div>
        </div>

        {/* Agent Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-slate-700 bg-slate-700/50">
            <div className="text-white font-medium mb-1">{agentSession.name}</div>
            <div className="text-xs text-slate-400 mb-2">代理编号: {agentSession.code}</div>
            <div className="text-xs text-slate-400 mb-2">邀请码: {agentSession.referral_code}</div>
            <button
              onClick={copyReferralLink}
              className="flex items-center justify-center w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  复制邀请链接
                </>
              )}
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {agentMenuItems.map((item) => (
            <div key={item.id}>
              {item.path ? (
                <Link href={item.path}>
                  <div className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}>
                    <item.icon className="h-5 w-5" />
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                  </div>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      isMenuActive(item)
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                    } ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}
                  >
                    <div className={`flex items-center ${!sidebarOpen ? 'justify-center' : ''}`}>
                      <item.icon className="h-5 w-5" />
                      {sidebarOpen && <span className="ml-3">{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      expandedMenus.includes(item.id) ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {sidebarOpen && expandedMenus.includes(item.id) && item.children && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link key={child.id} href={child.path || '#'}>
                          <div className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                            child.path && isActive(child.path)
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-slate-300 hover:bg-slate-600 hover:text-white'
                          }`}>
                            <child.icon className="h-4 w-4" />
                            <span className="ml-3">{child.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">退出登录</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <header className="bg-slate-800 shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2 lg:mr-4 p-2 hover:bg-slate-700 rounded transition-colors"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
            <span className="text-white font-medium">代理后台管理系统</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-blue-400 font-medium text-sm hidden sm:inline">
              {agentSession.name}
            </span>
            <div className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
              代理
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-900 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
