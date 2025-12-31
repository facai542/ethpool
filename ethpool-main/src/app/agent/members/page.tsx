'use client'

import { useState, useEffect } from 'react'

interface TeamMember {
  id: number
  address: string
  auth_address: string
  cash: number
  usdt: number
  status: number
  level: number
  parent_id: number
  create_time: string
  total_staked: number
  total_earnings: number
  referral_count: number
  // 在线状态和IP国家信息
  is_online?: boolean
  online_status?: string
  registration_ip?: string | null
  registration_country?: string | null
  last_login_ip?: string | null
  last_login_country?: string | null
  last_active_at?: string | null
}

export default function AgentMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date())

  useEffect(() => {
    fetchMembers()
  }, [currentPage, filterLevel])

  // 自动刷新功能（可选开启）
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log('🔄 自动刷新成员列表...')
      fetchMembers()
    }, 30000) // 30秒自动刷新

    return () => clearInterval(interval)
  }, [autoRefresh, currentPage, filterLevel])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        level: filterLevel === 'all' ? '' : filterLevel
      })

      const response = await fetch(`/api/agent/members?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setMembers(data.data.members)
        setTotalPages(data.data.totalPages)
        setLastRefreshTime(new Date())
      }
    } catch (error) {
      console.error('获取成员列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member =>
    member.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.auth_address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return { text: '正常', color: 'text-green-400' }
      case 0: return { text: '待激活', color: 'text-yellow-400' }
      default: return { text: '异常', color: 'text-red-400' }
    }
  }

  const getLevelBadge = (level: number) => {
    const colors = ['bg-gray-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500']
    return colors[level] || 'bg-gray-500'
  }

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
  const getIPCountryDisplay = (member: TeamMember) => {
    const ip = member.last_login_ip || member.registration_ip
    const country = member.last_login_country || member.registration_country
    
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
  
  // 获取国家名中文
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

  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">团队成员管理</h1>
          <p className="text-gray-400 mt-1">管理您的代理团队成员</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
            <span className="text-sm text-gray-400">总成员：</span>
            <span className="text-white font-semibold">{members.length}</span>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
            <span className="text-sm text-gray-400">活跃成员：</span>
            <span className="text-green-400 font-semibold">
              {members.filter(m => m.status === 1).length}
            </span>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索钱包地址..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有层级</option>
              <option value="1">一级成员</option>
              <option value="2">二级成员</option>
              <option value="3">三级成员</option>
            </select>
            
            <button
              onClick={fetchMembers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  刷新中...
                </>
              ) : (
                '刷新余额'
              )}
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {autoRefresh ? '已开启自动刷新' : '开启自动刷新'}
            </button>

            {autoRefresh && (
              <div className="text-xs text-gray-400">
                上次刷新: {lastRefreshTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 成员列表 */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      成员信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      在线状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      访问IP国家
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      层级
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      余额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      质押
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      下级
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      加入时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredMembers.map((member) => {
                    const status = getStatusText(member.status)
                    
                    return (
                      <tr key={member.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {member.address ? 
                                `${member.address.slice(0, 6)}...${member.address.slice(-4)}` :
                                '未设置'
                              }
                            </div>
                            {member.auth_address && member.auth_address !== member.address && (
                              <div className="text-xs text-gray-400">
                                verify: {member.auth_address.slice(0, 6)}...{member.auth_address.slice(-4)}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getOnlineStatusBadge(member.is_online || false, member.online_status || '离线')}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getIPCountryDisplay(member)}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getLevelBadge(member.level)}`}>
                            L{member.level}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            ¥{member.cash?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {member.usdt?.toFixed(2) || '0.00'} USDT
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {member.referral_count || 0}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {member.create_time ? 
                              new Date(member.create_time).toLocaleDateString('zh-CN') :
                              '未知'
                            }
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400">
                  {searchTerm ? '未找到匹配的成员' : '暂无团队成员'}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-800 px-6 py-3 rounded-lg border border-gray-700">
          <div className="flex items-center">
            <span className="text-sm text-gray-400">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
 
 