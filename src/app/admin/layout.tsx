'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession, clearAdminSession } from '@/lib/auth'
import ShaderBackground from '@/components/ui/shader-background'
import { ParticleTextEffect } from '@/components/ui/particle-text-effect'
// MenuIcon 组件
const MenuIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
)
import './admin.css'

// 简化的图标组件
const DashboardIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
)

const PeopleIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const SettingsIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0L5.636 17.364m12.728 0l-4.243-4.243m-4.242 0L5.636 6.636"></path>
  </svg>
)

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  dashboard: DashboardIcon,
  people: PeopleIcon,
  settings: SettingsIcon,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminSession, setAdminSession] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState('dashboard')

  // 菜单项定义
  const menuItems = [
    { id: 'dashboard', name: '仪表盘', icon: 'dashboard', href: '/admin' },
    { id: 'users', name: '用户管理', icon: 'people', href: '/admin/users' },
    { id: 'users-deposits', name: '充值订单', icon: 'people', href: '/admin/users/deposits' },
    { id: 'system-config', name: '系统配置', icon: 'settings', href: '/admin/system/config' },
    { id: 'system-settings', name: '网站设置', icon: 'settings', href: '/admin/system/settings' },
    { id: 'auth-config', name: '授权配置', icon: 'settings', href: '/admin/system/auth-config' },
    { id: 'telegram-bot-config', name: 'Telegram Bot配置', icon: 'settings', href: '/admin/system/telegram-bot-config' },
  ]

  useEffect(() => {
    const checkSession = () => {
      const session = getAdminSession()
      if (session) {
        setAdminSession(session)
      }
    }
    
    checkSession()
  }, [])

  // 根据路径确定当前激活的菜单
  useEffect(() => {
    if (pathname) {
      const exactMatch = menuItems.find(item => item.href === pathname)
      if (exactMatch) {
        setActiveMenu(exactMatch.id)
      } else {
        const prefixMatch = menuItems.find(item => {
          if (item.href === '/admin') return false
          return pathname.startsWith(item.href + '/') || pathname === item.href
        })
        if (prefixMatch) {
          setActiveMenu(prefixMatch.id)
        } else if (pathname === '/admin') {
          setActiveMenu('dashboard')
        }
      }
    }
  }, [pathname])

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
      <div className="min-h-screen flex items-center justify-center bg-black">
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
    <div className="admin-layout">
      {/* Shader 背景 */}
      <ShaderBackground className="fixed inset-0 w-full h-full" />
      
      {/* 侧边栏 */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="particle-text-wrapper">
            <ParticleTextEffect
              words={['管理后台']}
              className="particle-text-canvas"
              displayTimePerWord={999999}
            />
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item) => {
              const IconComponent = iconMap[item.icon] || DashboardIcon
              return (
                <li key={item.id} className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}>
                  <Link 
                    href={item.href}
                    className="nav-link"
                    onClick={() => {
                      setActiveMenu(item.id)
                      setSidebarOpen(false)
                    }}
                  >
                    <IconComponent className="nav-icon" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* 主内容区域 */}
      <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* 头部 */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              title="打开侧边栏"
              aria-label="打开侧边栏"
            >
              <MenuIcon className="nav-icon" />
            </button>
            <h1 className="header-title">管理后台</h1>
          </div>
          
          <div className="header-right">
            <div className="admin-info">
              <div className="admin-avatar">
                <span>{adminSession?.name?.charAt(0) || adminSession?.username?.charAt(0) || 'A'}</span>
              </div>
              <span>{adminSession?.name || adminSession?.username || '管理员'}</span>
            </div>
            
            <div className="header-actions">
              <Link href="/admin/system/settings" className="settings-link">
                设置
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                退出登录
              </button>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="admin-content">
          {children}
        </div>
      </main>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
