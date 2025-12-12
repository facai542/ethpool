'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Download, RefreshCw, Pickaxe, Users, TrendingUp, Calendar } from 'lucide-react'

interface UserEarning {
  id: number
  user_id: number
  user_address: string
  earning_type: 'mining' | 'referral' | 'bonus'
  amount: number
  currency: 'USDT' | 'ETH'
  date: string
  status: 'pending' | 'completed'
  description: string
  referral_level?: number
  mining_power?: number
}

export default function UserEarningsPage() {
  const [earnings, setEarnings] = useState<UserEarning[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [totalStats, setTotalStats] = useState({
    totalMiningEarnings: 0,
    totalReferralEarnings: 0,
    totalBonusEarnings: 0,
    activeMiners: 0
  })

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        type: filterType === 'all' ? '' : filterType,
        page: '1',
        limit: '100'
      })
      
      const response = await fetch(`/api/admin/users/earnings?${params}`)
      const result = await response.json()
      
      if (result.success) {
        // 转换数据格式以匹配前端接口
        const convertedEarnings = result.data.earnings.map((earning: any) => ({
          id: earning.id,
          user_id: earning.user_id,
          user_address: earning.user_profiles?.wallet_address || 'N/A',
          earning_type: earning.earning_type,
          amount: Number.parseFloat(earning.amount),
          currency: 'USDT',
          date: earning.created_at,
          status: 'completed',
          description: earning.description || '收益',
          referral_level: earning.earning_type === 'referral' ? 1 : undefined,
          mining_power: earning.earning_type === 'mining' ? 1000 : undefined
        }))
        
        setEarnings(convertedEarnings)
        
        // 使用API返回的统计数据
        const stats = {
          totalMiningEarnings: result.data.stats.miningAmount || 0,
          totalReferralEarnings: result.data.stats.referralAmount || 0,
          totalBonusEarnings: result.data.stats.totalAmount - result.data.stats.miningAmount - result.data.stats.referralAmount - result.data.stats.stakingAmount || 0,
          activeMiners: result.data.stats.totalUsers || 0
        }
        
        setTotalStats(stats)
      } else {
        console.error('获取收益记录失败:', result.error)
        // 如果API失败，使用空数据
        setEarnings([])
        setTotalStats({
          totalMiningEarnings: 0,
          totalReferralEarnings: 0,
          totalBonusEarnings: 0,
          activeMiners: 0
        })
      }
    } catch (error) {
      console.error('获取收益记录失败:', error)
      // 如果请求失败，使用空数据
      setEarnings([])
      setTotalStats({
        totalMiningEarnings: 0,
        totalReferralEarnings: 0,
        totalBonusEarnings: 0,
        activeMiners: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredEarnings = earnings.filter(earning => {
    const matchesSearch = earning.user_address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || earning.earning_type === filterType
    
    let matchesDate = true
    if (dateRange !== 'all') {
      const earningDate = new Date(earning.date)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - earningDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (dateRange) {
        case 'today':
          matchesDate = daysDiff === 0
          break
        case 'week':
          matchesDate = daysDiff <= 7
          break
        case 'month':
          matchesDate = daysDiff <= 30
          break
      }
    }
    
    return matchesSearch && matchesType && matchesDate
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mining':
        return <Pickaxe className="h-4 w-4 text-yellow-500" />
      case 'referral':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'bonus':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      mining: '挖矿收益',
      referral: '推广收益',
      bonus: '奖励收益'
    }
    return labels[type as keyof typeof labels] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="p-6 bg-slate-800 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">用户收益</h1>
          <div className="flex space-x-2">
            <Button onClick={fetchEarnings} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-yellow-600 border-yellow-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-100">挖矿总收益</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalMiningEarnings.toFixed(2)} USDT</div>
              <p className="text-xs text-yellow-200 mt-1">活跃矿工: {totalStats.activeMiners}</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 border-blue-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">推广总收益</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalReferralEarnings.toFixed(2)} USDT</div>
            </CardContent>
          </Card>

          <Card className="bg-green-600 border-green-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-100">奖励总收益</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalBonusEarnings.toFixed(2)} USDT</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-600 border-purple-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-100">总收益</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(totalStats.totalMiningEarnings + totalStats.totalReferralEarnings + totalStats.totalBonusEarnings).toFixed(2)} USDT
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <Card className="bg-slate-700 border-slate-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">搜索和筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索用户地址..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-600 border-slate-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-white"
              >
                <option value="all">所有类型</option>
                <option value="mining">挖矿收益</option>
                <option value="referral">推广收益</option>
                <option value="bonus">奖励收益</option>
              </select>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-white"
              >
                <option value="all">所有时间</option>
                <option value="today">今天</option>
                <option value="week">最近7天</option>
                <option value="month">最近30天</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 收益记录表格 */}
        <Card className="bg-slate-700 border-slate-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">收益记录 ({filteredEarnings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300">类型</th>
                      <th className="text-left py-3 px-4 text-slate-300">用户地址</th>
                      <th className="text-left py-3 px-4 text-slate-300">收益金额(ETH)</th>
                      <th className="text-left py-3 px-4 text-slate-300">状态</th>
                      <th className="text-left py-3 px-4 text-slate-300">时间</th>
                      <th className="text-left py-3 px-4 text-slate-300">详情</th>
                      <th className="text-left py-3 px-4 text-slate-300">描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEarnings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          暂无收益记录
                        </td>
                      </tr>
                    ) : (
                      filteredEarnings.map((earning) => (
                        <tr key={earning.id} className="border-b border-slate-600 hover:bg-slate-600">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(earning.earning_type)}
                              <span className="text-white font-medium">{getTypeLabel(earning.earning_type)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-white font-mono text-sm">{earning.user_address}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-green-400">
                              +{earning.amount.toFixed(2)} {earning.currency}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={earning.status === 'completed' ? 'default' : 'secondary'}
                              className={earning.status === 'completed' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}
                            >
                              {earning.status === 'completed' ? '已发放' : '待发放'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-sm">{formatDate(earning.date)}</td>
                          <td className="py-3 px-4">
                            {earning.earning_type === 'mining' && earning.mining_power && (
                              <span className="text-slate-300 text-sm">算力: {earning.mining_power}</span>
                            )}
                            {earning.earning_type === 'referral' && earning.referral_level && (
                              <span className="text-slate-300 text-sm">{earning.referral_level}级推广</span>
                            )}
                            {earning.earning_type === 'bonus' && (
                              <span className="text-slate-300 text-sm">奖励类型</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-sm">{earning.description}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 