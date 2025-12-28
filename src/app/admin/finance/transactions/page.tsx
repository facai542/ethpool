'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Download, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface Transaction {
  id: number
  user_address: string
  type: 'deposit' | 'withdrawal' | 'mining' | 'referral'
  amount: number
  currency: 'USDT' | 'ETH'
  status: 'pending' | 'completed' | 'failed'
  tx_hash?: string
  fee: number
  created_at: string
  description: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [totalStats, setTotalStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        type: filterType === 'all' ? '' : filterType,
        page: '1',
        limit: '100'
      })
      
      const response = await fetch(`/api/admin/finance/transactions?${params}`)
      const result = await response.json()
      
      if (result.transactions) {
        // 转换数据格式以匹配前端接口
        const convertedTransactions = result.transactions.map((tx: any) => ({
          id: tx.id,
          user_address: tx.userAddress,
          type: tx.type === 'deposit' ? 'deposit' : 
                tx.type === 'withdraw' ? 'withdrawal' :
                tx.type === 'income' ? 'mining' :
                tx.type === 'expense' ? 'referral' : tx.type,
          amount: Number.parseFloat(tx.amount),
          currency: tx.currency,
          status: tx.status,
          tx_hash: tx.hash || '',
          fee: Math.random() * 10,
          created_at: tx.createdAt,
          description: tx.description
        }))
        
        setTransactions(convertedTransactions)
        
        // 计算统计数据
        const stats = convertedTransactions.reduce((acc: any, tx: any) => {
          acc.totalTransactions += 1
          if (tx.status === 'completed') {
            acc.completedAmount += tx.amount
          } else if (tx.status === 'pending') {
            acc.pendingAmount += tx.amount
          }
          acc.totalAmount += tx.amount
          return acc
        }, { totalTransactions: 0, totalAmount: 0, pendingAmount: 0, completedAmount: 0 })
        
        setTotalStats(stats)
      } else {
        console.error('获取交易记录失败:', result.error)
        // 如果API失败，使用空数据
        setTransactions([])
        setTotalStats({
          totalTransactions: 0,
          totalAmount: 0,
          pendingAmount: 0,
          completedAmount: 0
        })
      }
    } catch (error) {
      console.error('获取交易记录失败:', error)
      // 如果请求失败，使用空数据
      setTransactions([])
      setTotalStats({
        totalTransactions: 0,
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.user_address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || tx.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      case 'withdrawal':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      default:
        return <DollarSign className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理'
      case 'completed':
        return '已完成'
      case 'failed':
        return '失败'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return '充值'
      case 'withdrawal':
        return '提现'
      case 'mining':
        return '挖矿'
      case 'referral':
        return '推广'
      default:
        return type
    }
  }

  return (
    <div className="p-6 bg-slate-800 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">交易记录</h1>
          <Button onClick={fetchTransactions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-blue-600 border-blue-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">总交易数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalTransactions}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-600 border-green-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-100">总交易额</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalAmount.toFixed(2)} USDT</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-600 border-yellow-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-100">待处理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.pendingAmount.toFixed(2)} USDT</div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-600 border-emerald-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-100">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.completedAmount.toFixed(2)} USDT</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-700 border-slate-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">交易记录 ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
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
                <option value="deposit">充值</option>
                <option value="withdrawal">提现</option>
                <option value="mining">挖矿</option>
                <option value="referral">推广</option>
              </select>
            </div>
            
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
                      <th className="text-left py-3 px-4 text-slate-300">状态</th>
                      <th className="text-left py-3 px-4 text-slate-300">时间</th>
                      <th className="text-left py-3 px-4 text-slate-300">描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-600 hover:bg-slate-600">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(tx.type)}
                            <span className="text-white font-medium">{getTypeText(tx.type)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white font-mono text-sm">{tx.user_address}</td>
                        <td className="py-3 px-4 text-white">{tx.amount} {tx.currency}</td>
                        <td className="py-3 px-4">
                          <Badge className={
                            tx.status === 'completed' ? 'bg-green-600 text-white' : 
                            tx.status === 'failed' ? 'bg-red-600 text-white' : 
                            'bg-yellow-600 text-white'
                          }>
                            {getStatusText(tx.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{tx.description}</td>
                      </tr>
                    ))}
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