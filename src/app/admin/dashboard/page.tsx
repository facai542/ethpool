'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  RefreshCw,
  Calendar,
  Eye,
  UserCheck,
  AlertCircle,
  Link,
  QrCode,
  Copy,
  Share2
} from 'lucide-react'
import { getAdminSession } from '@/lib/auth'
import { generateInviteLink } from '@/lib/config'

interface DashboardStats {
  // 总体概况
  totalUsers: number
  authorizedUsers: number
  unauthorizedUsers: number
  stakingUsers: number
  profitUsers: number
  
  // 挖矿收益
  mineIncomeETH: string
  mineIncomeTRX: string
  
  // 钱包余额
  usdtBalance: string
  ethBalance: string
  linkUsdtBalance: string
  withdrawingUsdt: string
  
  // 今日数据
  todayRegister: number
  todayAuthorized: number
  
  // 本月数据
  monthRegister: number
  monthAuthorized: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    authorizedUsers: 0,
    unauthorizedUsers: 0,
    stakingUsers: 0,
    profitUsers: 0,
    mineIncomeETH: '0.00000000',
    mineIncomeTRX: '0.00000000',
    usdtBalance: '0.00000000',
    ethBalance: '0.000000000000000',
    linkUsdtBalance: '0.000000',
    withdrawingUsdt: '0.00000000',
    todayRegister: 0,
    todayAuthorized: 0,
    monthRegister: 0,
    monthAuthorized: 0
  })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [adminSession, setAdminSession] = useState<any>(null)
  const [agentData, setAgentData] = useState({
    inviteLink: '',
    inviteCode: '',
    totalInvites: 0,
    validInvites: 0,
    commission: '0.00'
  })

  // 检查是否为代理用户
  const isAgentUser = () => {
    if (!adminSession) return false
    return adminSession.role === 'agent' || adminSession.role_id === 2 || adminSession.p_agentid
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setStats(result.data)
        } else {
          console.error('API返回数据格式错误:', result)
        }
        if (mounted) {
          setLastUpdated(new Date().toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }))
        }
      } else {
        console.error('获取统计数据失败:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    // 获取管理员session
    const session = getAdminSession()
    setAdminSession(session)
    
    // 如果是代理用户，生成邀请链接数据
    if (session?.role_id === 2) {
      const agentName = session.admin_name || session.name
      
      setAgentData({
        inviteLink: generateInviteLink(agentName),
        inviteCode: session.promo_code || agentName,
        totalInvites: 0,
        validInvites: 0,
        commission: '0.00'
      })
    }
    
    fetchStats()
    // 每30秒刷新一次数据
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // 在组件挂载前不渲染时间相关内容
  if (!mounted) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>正在加载数据...</p>
      </div>
    )
  }

  // 代理用户的专用界面
  if (isAgentUser()) {
    return (
      <div className="space-y-4 lg:space-y-6">
        {/* 代理页面标题 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-blue-600">代理后台主页</h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">邀请链接、二维码和邀请数据</p>
          </div>
          <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs lg:text-sm w-fit">
            代理账号: {adminSession?.admin_name}
          </Badge>
        </div>

        {/* 邀请链接 */}
        <div className="grid grid-cols-1 gap-6">
          {/* 邀请链接 */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <Link className="h-5 w-5 mr-2" />
                专属邀请链接
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <code className="text-sm break-all text-black">{agentData.inviteLink}</code>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(agentData.inviteLink)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制链接
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: '邀请加入',
                        url: agentData.inviteLink
                      })
                    }
                  }}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  分享
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* 邀请数据统计 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">总邀请人数</CardTitle>
              <Users className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{agentData.totalInvites}</div>
              <p className="text-xs text-blue-100">累计邀请用户数</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">有效邀请</CardTitle>
              <UserCheck className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{agentData.validInvites}</div>
              <p className="text-xs text-green-100">已授权用户数</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">累计佣金</CardTitle>
              <DollarSign className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{agentData.commission} USDT</div>
              <p className="text-xs text-yellow-100">邀请佣金收益</p>
            </CardContent>
          </Card>
        </div>

        {/* 快捷操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">快捷操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <Button 
                className="h-16 flex flex-col gap-2" 
                variant="outline"
                onClick={() => window.location.href = '/admin/users'}
              >
                <Users className="h-6 w-6" />
                <span>查看我的用户</span>
              </Button>
              <Button className="h-16 flex flex-col gap-2" variant="outline">
                <QrCode className="h-6 w-6" />
                <span>下载二维码</span>
              </Button>
              <Button className="h-16 flex flex-col gap-2" variant="outline">
                <DollarSign className="h-6 w-6" />
                <span>佣金明细</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 管理员的原有界面
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1>管理后台首页</h1>
          <p>系统概览和数据统计</p>
        </div>
        <button 
          onClick={fetchStats} 
          disabled={loading}
          className="px-4 py-2 bg-[rgba(102,126,234,0.8)] text-white rounded-lg hover:bg-[rgba(102,126,234,1)] disabled:bg-[rgba(108,117,125,0.6)] disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw className={`inline-block w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">刷新数据</span>
          <span className="sm:hidden">刷新</span>
        </button>
      </div>

      {/* 主要统计数据 */}
      <div className="dashboard-stats">
        <div className="stat-card users">
          <div className="stat-header">
            <div className="stat-title">总用户数</div>
            <div className="stat-icon users">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            注册用户总数
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-header">
            <div className="stat-title">已授权</div>
            <div className="stat-icon products">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.authorizedUsers.toLocaleString()}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            已完成授权用户
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-header">
            <div className="stat-title">未授权</div>
            <div className="stat-icon orders">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.unauthorizedUsers.toLocaleString()}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            待授权用户
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-header">
            <div className="stat-title">质押中</div>
            <div className="stat-icon revenue">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.stakingUsers.toLocaleString()}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            正在质押用户
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-header">
            <div className="stat-title">有收益</div>
            <div className="stat-icon users">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.profitUsers.toLocaleString()}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            有收益用户
          </div>
        </div>
      </div>

      {/* 财务数据 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* 挖矿收益 */}
        <div className="content-card">
          <h3 className="flex items-center text-base lg:text-lg mb-4">
              <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              挖矿收益统计
            </h3>
          <div className="space-y-3 lg:space-y-4">
            <div className="flex justify-between items-center p-3 lg:p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <div>
                <p className="text-xs lg:text-sm text-white">ETH 总收益</p>
                <p className="text-base lg:text-xl font-bold text-white break-all">{stats.mineIncomeETH}</p>
              </div>
              <Badge variant="secondary" className="bg-white text-green-600 text-xs">ETH</Badge>
            </div>
            <div className="flex justify-between items-center p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <div>
                <p className="text-xs lg:text-sm text-white">TRX 总收益</p>
                <p className="text-base lg:text-xl font-bold text-white break-all">{stats.mineIncomeTRX}</p>
              </div>
              <Badge variant="secondary" className="bg-white text-blue-600 text-xs">TRX</Badge>
            </div>
          </div>
        </div>

        {/* 钱包余额 */}
        <div className="content-card">
          <h3 className="flex items-center text-base lg:text-lg mb-4">
              <Wallet className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              钱包余额统计
            </h3>
          <div className="space-y-3 lg:space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <p className="text-xs text-white">USDT余额</p>
                <p className="text-sm lg:text-lg font-bold text-white break-all">{stats.usdtBalance}</p>
              </div>
              <div className="p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <p className="text-xs text-white">ETH余额</p>
                <p className="text-sm lg:text-lg font-bold text-white break-all">{stats.ethBalance}</p>
              </div>
              <div className="p-2 lg:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <p className="text-xs text-white">链上USDT</p>
                <p className="text-sm lg:text-lg font-bold text-white break-all">{stats.linkUsdtBalance}</p>
              </div>
              <div className="p-2 lg:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <p className="text-xs text-white">提现中</p>
                <p className="text-sm lg:text-lg font-bold text-white break-all">{stats.withdrawingUsdt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 时间统计 */}
      <div className="content-card">
        <h3 className="flex items-center text-base lg:text-lg mb-4">
            <Calendar className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            时间段统计
          </h3>
        <div>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-10 bg-transparent gap-2 p-0">
              <TabsTrigger 
                value="today" 
                className="bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 data-[state=active]:bg-cyan-950 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-400 data-[state=active]:border-b-4 rounded-lg transition-all duration-300"
              >
                今日概况
              </TabsTrigger>
              <TabsTrigger 
                value="month" 
                className="bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 data-[state=active]:bg-cyan-950 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-400 data-[state=active]:border-b-4 rounded-lg transition-all duration-300"
              >
                本月概况
              </TabsTrigger>
              <TabsTrigger 
                value="total" 
                className="bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 data-[state=active]:bg-cyan-950 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-400 data-[state=active]:border-b-4 rounded-lg transition-all duration-300"
              >
                整体概况
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">今日注册用户</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.todayRegister}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">今日有效注册</p>
                      <p className="text-2xl font-bold text-green-600">{stats.todayAuthorized}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="month" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">本月注册用户</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.monthRegister}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">本月有效注册</p>
                      <p className="text-2xl font-bold text-green-600">{stats.monthAuthorized}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="total" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">总注册用户</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">总有效用户</p>
                      <p className="text-2xl font-bold text-green-600">{stats.authorizedUsers}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">有收益用户</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.profitUsers}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 系统信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="content-card">
          <h3>系统信息</h3>
          <div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">系统版本:</span>
                <span>Next.js 15.3.4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">数据库:</span>
                <span>Supabase</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最后更新:</span>
                <span>{lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h3>快速操作</h3>
          <div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12" asChild>
                <a href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  用户管理
                </a>
              </Button>
              <Button variant="outline" className="h-12" asChild>
                <a href="/admin/finance">
                  <DollarSign className="h-4 w-4 mr-2" />
                  财务管理
                </a>
              </Button>
              <Button variant="outline" className="h-12" asChild>
                <a href="/admin/announcements">
                  <Eye className="h-4 w-4 mr-2" />
                  公告管理
                </a>
              </Button>
              <Button variant="outline" className="h-12" asChild>
                <a href="/admin/transfers">
                  <CreditCard className="h-4 w-4 mr-2" />
                  提现审核
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 