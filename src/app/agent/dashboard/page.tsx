'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Link2,
  Copy,
  Check,
  UserCheck,
  Activity
} from 'lucide-react'

interface AgentStats {
  agent_name: string
  agent_code: string
  invite_code: string
  invite_link: string
  total_invites: number
  valid_invites: number
  total_commission: number
  commission_rate: number
  status: string
  level: number
}

interface InvitedUser {
  id: number
  user_address: string
  register_time: string
  status: string
  total_deposit: number
  current_balance: number
  is_authorized: boolean
  earnings?: number
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)

  // 加载代理统计数据
  const loadAgentStats = async () => {
    try {
      const response = await fetch('/api/agent/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setInvitedUsers(data.invitedUsers || [])
      }
    } catch (error) {
      console.error('加载代理统计失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 复制邀请链接
  const copyInviteLink = async () => {
    if (!stats?.invite_link) return
    
    try {
      await navigator.clipboard.writeText(stats.invite_link)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  useEffect(() => {
    loadAgentStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 text-lg">无法加载代理数据</p>
          <Button onClick={loadAgentStats} className="mt-4">
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* 欢迎标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">代理后台</h1>
          <p className="text-gray-400">欢迎回来，{stats.agent_name}！</p>
        </div>
        <Badge 
          variant={stats.status === 'active' ? 'default' : 'secondary'}
          className={stats.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}
        >
          {stats.status === 'active' ? '活跃状态' : '已禁用'}
        </Badge>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="text-blue-400 mr-3" size={24} />
              <div>
                <p className="text-gray-400 text-sm">总邀请数</p>
                <p className="text-white text-xl font-bold">{stats.total_invites}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="text-green-400 mr-3" size={24} />
              <div>
                <p className="text-gray-400 text-sm">有效用户</p>
                <p className="text-white text-xl font-bold">{stats.valid_invites}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="text-yellow-400 mr-3" size={24} />
              <div>
                <p className="text-gray-400 text-sm">总佣金</p>
                <p className="text-white text-xl font-bold">${stats.total_commission.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="text-purple-400 mr-3" size={24} />
              <div>
                <p className="text-gray-400 text-sm">佣金比例</p>
                <p className="text-white text-xl font-bold">{(stats.commission_rate * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 邀请链接卡片 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Link2 className="mr-2" size={20} />
            我的邀请链接
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">邀请码:</p>
              <code className="bg-gray-700 text-white px-3 py-2 rounded text-lg font-mono">
                {stats.invite_code}
              </code>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-2">邀请链接:</p>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-700 text-white px-3 py-2 rounded flex-1 text-sm font-mono">
                  {stats.invite_link}
                </code>
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              <p>分享这个链接给其他用户，当他们注册并开始质押时，您将获得佣金收益。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 邀请用户列表 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="mr-2" size={20} />
            我的邀请用户
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-500" />
              <p className="text-gray-400 mt-2">暂无邀请用户</p>
              <p className="text-gray-500 text-sm mt-1">
                分享您的邀请链接开始赚取佣金
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-300">用户地址</th>
                    <th className="text-left py-3 text-gray-300">注册时间</th>
                    <th className="text-left py-3 text-gray-300">verify状态</th>
                    <th className="text-left py-3 text-gray-300">质押金额</th>
                    <th className="text-left py-3 text-gray-300">收益金额</th>
                    <th className="text-left py-3 text-gray-300">当前余额</th>
                    <th className="text-left py-3 text-gray-300">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {invitedUsers.map(user => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="py-3">
                        <code className="text-white font-mono text-sm">
                          {user.user_address.slice(0, 6)}...{user.user_address.slice(-4)}
                        </code>
                      </td>
                      <td className="py-3 text-gray-300 text-sm">
                        {new Date(user.register_time).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <Badge 
                          variant={user.is_authorized ? 'default' : 'secondary'}
                          className={user.is_authorized ? 'bg-green-600' : 'bg-yellow-600'}
                        >
                          {user.is_authorized ? '已授权' : '未授权'}
                        </Badge>
                      </td>
                      <td className="py-3 text-blue-400 font-medium">
                        ${user.total_deposit.toFixed(2)}
                      </td>
                      <td className="py-3 text-green-400 font-medium">
                        ${(user.earnings || 0).toFixed(2)}
                      </td>
                      <td className="py-3 text-white font-medium">
                        ${user.current_balance.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className={user.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}
                        >
                          {user.status === 'active' ? '活跃' : '非活跃'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
 