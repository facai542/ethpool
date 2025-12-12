'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Download, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface FundRecord {
  id: number
  user_id: number
  user_address: string
  type: 'deposit' | 'withdrawal' | 'reward' | 'transfer' | 'fee'
  amount: number
  currency: 'USDT' | 'ETH'
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  tx_hash?: string
  description: string
  before_balance: number
  after_balance: number
}

export default function UserFundsPage() {
  const [records, setRecords] = useState<FundRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCurrency, setFilterCurrency] = useState<string>('all')
  const [totalStats, setTotalStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalRewards: 0,
    pendingAmount: 0
  })

  useEffect(() => {
    fetchFundRecords()
  }, [])

  const fetchFundRecords = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        type: filterType === 'all' ? '' : filterType,
        page: '1',
        limit: '100'
      })
      
      const response = await fetch(`/api/admin/users/funds?${params}`)
      const result = await response.json()
      
      if (result.success) {
        // 转换数据格式以匹配前端接口
        const convertedRecords = result.data.transactions.map((transaction: any) => ({
          id: transaction.id,
          user_id: transaction.user_id,
          user_address: transaction.user_profiles?.wallet_address || 'N/A',
          type: transaction.transaction_type,
          amount: Number.parseFloat(transaction.amount),
          currency: 'USDT',
          status: transaction.status,
          created_at: transaction.created_at,
          tx_hash: transaction.tx_hash || '',
          description: transaction.description || '资金记录',
          before_balance: Number.parseFloat(transaction.before_balance || '0'),
          after_balance: Number.parseFloat(transaction.after_balance || '0')
        }))
        
        setRecords(convertedRecords)
        
        // 使用API返回的统计数据
        const stats = {
          totalDeposits: result.data.stats.totalDeposits || 0,
          totalWithdrawals: result.data.stats.totalWithdrawals || 0,
          totalRewards: result.data.stats.totalFees || 0,
          pendingAmount: result.data.stats.totalProcessingAmount || 0
        }
        
        setTotalStats(stats)
      } else {
        console.error('获取资金记录失败:', result.error)
        // 如果API失败，使用空数据
        setRecords([])
        setTotalStats({
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalRewards: 0,
          pendingAmount: 0
        })
      }
    } catch (error) {
      console.error('获取资金记录失败:', error)
      // 如果请求失败，使用空数据
      setRecords([])
      setTotalStats({
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalRewards: 0,
        pendingAmount: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.user_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || record.type === filterType
    const matchesCurrency = filterCurrency === 'all' || record.currency === filterCurrency
    return matchesSearch && matchesType && matchesCurrency
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'withdrawal':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'reward':
        return <DollarSign className="h-4 w-4 text-yellow-500" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      deposit: '充值',
      withdrawal: '提现',
      reward: '奖励',
      transfer: '转账',
      fee: '手续费'
    }
    return labels[type as keyof typeof labels] || type
  }

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="p-6 bg-slate-800 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">资金记录</h1>
          <div className="flex space-x-2">
            <Button onClick={fetchFundRecords} variant="outline" size="sm">
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
          <Card className="bg-emerald-700 border-emerald-600 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-100">总充值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalDeposits.toLocaleString()} USDT</div>
            </CardContent>
          </Card>

          <Card className="bg-red-600 border-red-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-100">总提现</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalWithdrawals.toLocaleString()} USDT</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-600 border-yellow-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-100">总奖励</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalRewards.toLocaleString()} USDT</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-600 border-orange-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-100">待处理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.pendingAmount.toLocaleString()} USDT</div>
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
                    placeholder="搜索用户地址或描述..."
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
                <option value="deposit">充值</option>
                <option value="withdrawal">提现</option>
                <option value="reward">奖励</option>
                <option value="transfer">转账</option>
                <option value="fee">手续费</option>
              </select>
              <select 
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-white"
              >
                <option value="all">所有币种</option>
                <option value="USDT">USDT</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 资金记录表格 */}
        <Card className="bg-slate-700 border-slate-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">资金记录 ({filteredRecords.length})</CardTitle>
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
                      <th className="text-left py-3 px-4 text-slate-300">金额</th>
                      <th className="text-left py-3 px-4 text-slate-300">余额变化</th>
                      <th className="text-left py-3 px-4 text-slate-300">状态</th>
                      <th className="text-left py-3 px-4 text-slate-300">时间</th>
                      <th className="text-left py-3 px-4 text-slate-300">交易哈希</th>
                      <th className="text-left py-3 px-4 text-slate-300">描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          暂无资金记录
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record) => (
                        <tr key={record.id} className="border-b border-slate-600 hover:bg-slate-600">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(record.type)}
                              <span className="text-white font-medium">{getTypeLabel(record.type)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-white font-mono text-sm">{record.user_address}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              record.type === 'deposit' || record.type === 'reward' 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              {record.type === 'deposit' || record.type === 'reward' ? '+' : '-'}
                              {formatAmount(record.amount, record.currency)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-sm">
                            {record.before_balance.toLocaleString()} → {record.after_balance.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                record.status === 'completed' ? 'default' : 
                                record.status === 'pending' ? 'secondary' : 'destructive'
                              }
                              className={
                                record.status === 'completed' ? 'bg-green-600 text-white' :
                                record.status === 'pending' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                              }
                            >
                              {record.status === 'completed' ? '已完成' : 
                               record.status === 'pending' ? '待处理' : '失败'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-sm">{formatDate(record.created_at)}</td>
                          <td className="py-3 px-4">
                            {record.tx_hash ? (
                              <span className="text-blue-400 font-mono text-sm">
                                {record.tx_hash.slice(0, 10)}...
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-sm">{record.description}</td>
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