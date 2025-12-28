'use client'

import { useState, useEffect } from 'react'
import { Users, DollarSign, UserCheck, TrendingUp, Copy, Check, ExternalLink } from 'lucide-react'

interface AgentStats {
  agent_name: string
  agent_code: string
  referral_code: string
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
  wallet_address: string
  auth_wallet_address: string
  created_at: string
  status: string
  usdt: number
  withdrawable_usdt: number
  is_effective: boolean
}

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [users, setUsers] = useState<InvitedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/agent/dashboard')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setUsers(data.invited_users || [])
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (stats) {
      navigator.clipboard.writeText(stats.invite_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-lg">加载中...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-lg">暂无数据</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">数据概览</h1>
        <p className="text-slate-400">欢迎回来，{stats.agent_name}</p>
      </div>

      {/* 邀请链接 */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <ExternalLink className="h-5 w-5 mr-2 text-blue-400" />
          我的邀请链接
        </h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={stats.invite_link}
            readOnly
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
          />
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                复制
              </>
            )}
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">总邀请人数</p>
              <p className="text-2xl font-bold text-white">{stats.total_invites}</p>
            </div>
            <Users className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">有效用户</p>
              <p className="text-2xl font-bold text-white">{stats.valid_invites}</p>
            </div>
            <UserCheck className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">总佣金</p>
              <p className="text-2xl font-bold text-white">{stats.total_commission.toFixed(2)} USDT</p>
            </div>
            <DollarSign className="h-10 w-10 text-yellow-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">佣金比例</p>
              <p className="text-2xl font-bold text-white">{(stats.commission_rate * 100).toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-400" />
          </div>
        </div>
      </div>

      {/* 最近邀请用户 */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">最近邀请用户</h3>
        {users.length === 0 ? (
          <div className="text-center text-slate-400 py-8">暂无邀请用户</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">用户地址</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">授权地址</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">余额</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">可提现</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">状态</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">注册时间</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map((user) => (
                  <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-2 text-white font-mono text-sm">
                      {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
                    </td>
                    <td className="py-3 px-2 text-white font-mono text-sm">
                      {user.auth_wallet_address ? 
                        `${user.auth_wallet_address.slice(0, 6)}...${user.auth_wallet_address.slice(-4)}` : 
                        '-'
                      }
                    </td>
                    <td className="py-3 px-2 text-white">
                      {Number.parseFloat(user.usdt || '0').toFixed(2)} USDT
                    </td>
                    <td className="py-3 px-2 text-white">
                      {Number.parseFloat(user.withdrawable_usdt || '0').toFixed(2)} USDT
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.is_effective 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-slate-600 text-slate-300'
                      }`}>
                        {user.is_effective ? '有效' : '待激活'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
