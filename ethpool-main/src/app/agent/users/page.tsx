'use client'

import { useState, useEffect } from 'react'
import { Search, Edit, Check, X, Copy, RefreshCw } from 'lucide-react'

interface User {
  id: number
  wallet_address: string
  auth_wallet_address: string
  user_remark: string
  usdt: number
  withdrawable_usdt: number
  gj_withdrawable_usdt: number
  withdrawal_usdt: number
  is_effective: boolean
  status: number
  created_at: string
  telegram_user_id: string
  approved: boolean | number  // 支持boolean和number类型
  chain_usdt_balance?: number  // 链上USDT余额
  // 在线状态和IP国家信息
  is_online?: boolean
  online_status?: string
  registration_ip?: string | null
  registration_country?: string | null
  last_login_ip?: string | null
  last_login_country?: string | null
  last_active_at?: string | null
}

export default function AgentUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<number | null>(null)
  const [editData, setEditData] = useState({
    auth_wallet_address: '',
    user_remark: ''
  })
  const [copiedField, setCopiedField] = useState('')
  // 链上余额查询状态
  const [chainBalances, setChainBalances] = useState<Record<number, { balance: string, loading: boolean }>>({})
  const [autoRefreshBalances, setAutoRefreshBalances] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  // 自动查询链上余额
  useEffect(() => {
    if (users.length > 0 && autoRefreshBalances) {
      users.forEach(user => {
        if (user.auth_wallet_address || user.wallet_address) {
          queryChainBalance(user.id, user.auth_wallet_address || user.wallet_address)
        }
      })
    }
  }, [users, autoRefreshBalances])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/agent/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user.id)
    setEditData({
      auth_wallet_address: user.auth_wallet_address || '',
      user_remark: user.user_remark || ''
    })
  }

  const handleSave = async (userId: number) => {
    try {
      const response = await fetch('/api/agent/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          auth_wallet_address: editData.auth_wallet_address,
          user_remark: editData.user_remark
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // 更新本地数据
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, ...editData }
            : u
        ))
        setEditingUser(null)
      } else {
        alert('更新失败: ' + data.error)
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      alert('更新失败，请重试')
    }
  }

  const handleCancel = () => {
    setEditingUser(null)
    setEditData({ auth_wallet_address: '', user_remark: '' })
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  // 查询用户链上USDT余额
  const queryChainBalance = async (userId: number, address: string) => {
    if (!address) return
    
    setChainBalances(prev => ({
      ...prev,
      [userId]: { balance: prev[userId]?.balance || '0.00', loading: true }
    }))
    
    try {
      const response = await fetch(`/api/user/chain-balance?address=${address}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setChainBalances(prev => ({
          ...prev,
          [userId]: { balance: result.data.usdtBalance, loading: false }
        }))
      } else {
        setChainBalances(prev => ({
          ...prev,
          [userId]: { balance: '查询失败', loading: false }
        }))
      }
    } catch (error) {
      console.error('查询链上余额失败:', error)
      setChainBalances(prev => ({
        ...prev,
        [userId]: { balance: '查询失败', loading: false }
      }))
    }
  }

  // 批量查询所有用户链上余额
  const refreshAllBalances = async () => {
    setAutoRefreshBalances(true)
  }

  const filteredUsers = users.filter(user => 
    user.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.auth_wallet_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_remark?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 获取在线状态显示
  const getOnlineStatusBadge = (isOnline: boolean, statusText: string) => {
    return isOnline ? (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-400 text-sm">在线</span>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gray-500" />
        <span className="text-gray-400 text-sm">{statusText || '离线'}</span>
      </div>
    )
  }

  // 获取IP和国家信息显示（使用中文国家名）
  const getIPCountryDisplay = (user: User) => {
    const ip = user.last_login_ip || user.registration_ip
    const country = user.last_login_country || user.registration_country
    
    if (!ip && !country) {
      return <span className="text-gray-500 text-xs">未记录</span>
    }
    
    // 转换为中文国家名
    const countryCN = country ? getCountryNameCN(country) : null
    
    return (
      <div className="flex flex-col gap-1">
        {countryCN && (
          <div className="flex items-center gap-1">
            <span className="text-blue-400 text-sm">{countryCN}</span>
          </div>
        )}
        {ip && (
          <div className="text-gray-400 text-xs font-mono" title={ip}>
            {ip}
          </div>
        )}
      </div>
    )
  }
  
  // 获取国家名中文（需要导入）
  const getCountryNameCN = (country: string): string => {
    if (!country) return '未知'
    
    const countryMap: Record<string, string> = {
      'China': '中国',
      'United States': '美国',
      'Japan': '日本',
      'South Korea': '韩国',
      'United Kingdom': '英国',
      'France': '法国',
      'Germany': '德国',
      'Singapore': '新加坡',
      'Hong Kong': '香港',
      'Taiwan': '台湾',
      'Russia': '俄罗斯',
      'Canada': '加拿大',
      'Australia': '澳大利亚',
      'India': '印度',
      'Brazil': '巴西',
      'Thailand': '泰国',
      'Vietnam': '越南',
      'Malaysia': '马来西亚',
      'Indonesia': '印度尼西亚',
      'Philippines': '菲律宾'
    }
    
    return countryMap[country] || country
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">用户管理</h1>
        <p className="text-slate-400">管理您邀请的授权用户</p>
      </div>

      {/* 搜索和统计 */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索地址或备注..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-slate-300">
              总用户: <span className="text-white font-semibold">{users.length}</span>
            </div>
            <div className="text-slate-300">
              有效用户: <span className="text-white font-semibold">{users.filter(u => u.approved || u.is_effective).length}</span>
            </div>
            <button
              onClick={refreshAllBalances}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              title="刷新所有用户链上余额"
            >
              刷新链上余额
            </button>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">用户地址</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">在线状态</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">访问IP国家</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">授权地址</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">用户备注</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">总余额</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">可提现</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">状态</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">注册时间</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-sm">
                        {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(user.wallet_address, `wallet-${user.id}`)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedField === `wallet-${user.id}` ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getOnlineStatusBadge(user.is_online || false, user.online_status || '离线')}
                  </td>
                  <td className="py-3 px-4">
                    {getIPCountryDisplay(user)}
                  </td>
                  <td className="py-3 px-4">
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        value={editData.auth_wallet_address}
                        onChange={(e) => setEditData({ ...editData, auth_wallet_address: e.target.value })}
                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm w-full font-mono"
                        placeholder="输入授权地址"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        {user.auth_wallet_address ? (
                          <>
                            <span className="text-white font-mono text-sm">
                              {user.auth_wallet_address.slice(0, 6)}...{user.auth_wallet_address.slice(-4)}
                            </span>
                            <button
                              onClick={() => copyToClipboard(user.auth_wallet_address, `auth-${user.id}`)}
                              className="text-slate-400 hover:text-white transition-colors"
                            >
                              {copiedField === `auth-${user.id}` ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500">未设置</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        value={editData.user_remark}
                        onChange={(e) => setEditData({ ...editData, user_remark: e.target.value })}
                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm w-full"
                        placeholder="输入备注"
                      />
                    ) : (
                      <span className="text-white text-sm">
                        {user.user_remark || '-'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {chainBalances[user.id]?.loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      ) : chainBalances[user.id]?.balance ? (
                        <span className="text-white">{parseFloat(chainBalances[user.id].balance).toFixed(2)} USDT</span>
                      ) : (
                        <button
                          onClick={() => queryChainBalance(user.id, user.auth_wallet_address || user.wallet_address)}
                          className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                          查询余额
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">
                    {user.withdrawable_usdt.toFixed(2)} USDT
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.approved || user.is_effective 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-600 text-slate-300'
                    }`}>
                      {user.approved || user.is_effective ? '已授权' : '未授权'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {editingUser === user.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSave(user.id)}
                          className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          title="保存"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                          title="取消"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              {searchTerm ? '未找到匹配的用户' : '暂无用户数据'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

