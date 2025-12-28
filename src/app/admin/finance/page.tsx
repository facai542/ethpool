'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  RefreshCw,
  Search,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FinanceStats {
  // 总体财务数据
  totalBalance: string
  totalIncome: string
  totalExpense: string
  todayIncome: string
  todayExpense: string
  monthIncome: string
  monthExpense: string
  
  // 用户资金数据
  userTotalBalance: string
  userTotalStaking: string
  userTotalProfit: string
  userTotalWithdrawn: string
  
  // 系统资金
  systemBalance: string
  systemReserve: string
  pendingWithdrawals: string
}

interface TransactionRecord {
  id: number
  userId: number
  userAddress: string
  type: 'income' | 'expense' | 'withdraw' | 'deposit'
  amount: string
  currency: 'USDT' | 'ETH' | 'TRX'
  status: 'pending' | 'completed' | 'failed'
  hash?: string
  createdAt: string
  description: string
}

export default function FinancePage() {
  const [stats, setStats] = useState<FinanceStats>({
    totalBalance: '0.00000000',
    totalIncome: '0.00000000',
    totalExpense: '0.00000000',
    todayIncome: '0.00000000',
    todayExpense: '0.00000000',
    monthIncome: '0.00000000',
    monthExpense: '0.00000000',
    userTotalBalance: '0.00000000',
    userTotalStaking: '0.00000000',
    userTotalProfit: '0.00000000',
    userTotalWithdrawn: '0.00000000',
    systemBalance: '0.00000000',
    systemReserve: '0.00000000',
    pendingWithdrawals: '0.00000000'
  })

  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 获取财务统计数据
  const fetchFinanceStats = async () => {
    try {
      const response = await fetch('/api/admin/finance/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('获取财务统计失败:', error)
    }
  }

  // 获取交易记录
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        type: typeFilter,
        status: statusFilter
      })
      
      const response = await fetch(`/api/admin/finance/transactions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
        setTotalPages(Math.ceil(data.total / 20))
      }
    } catch (error) {
      console.error('获取交易记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFinanceStats()
    fetchTransactions()
  }, [currentPage, searchTerm, typeFilter, statusFilter])

  // 导出数据
  const handleExport = () => {
    // 实现导出功能
    console.log('导出财务数据')
  }

  // 获取状态样式
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">已完成</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">处理中</Badge>
      case 'failed':
        return <Badge variant="destructive">失败</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  // 获取类型图标和文字
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'income':
        return { icon: <ArrowUpRight className="h-4 w-4 text-green-500" />, text: '收入', color: 'text-green-600' }
      case 'expense':
        return { icon: <ArrowDownRight className="h-4 w-4 text-red-500" />, text: '支出', color: 'text-red-600' }
      case 'withdraw':
        return { icon: <CreditCard className="h-4 w-4 text-orange-500" />, text: '提现', color: 'text-orange-600' }
      case 'deposit':
        return { icon: <Wallet className="h-4 w-4 text-blue-500" />, text: '充值', color: 'text-blue-600' }
      default:
        return { icon: <DollarSign className="h-4 w-4" />, text: '其他', color: 'text-gray-600' }
    }
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">财务管理</h1>
          <p className="text-slate-400 mt-1">系统财务概览和交易记录</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchFinanceStats} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报表
          </Button>
        </div>
      </div>

      {/* 财务统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total assets</CardTitle>
            <Wallet className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalBalance}</div>
            <p className="text-xs text-muted-foreground">系统总资产价值</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">总收入</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalIncome}</div>
            <p className="text-xs text-green-100">累计总收入</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">总支出</CardTitle>
            <TrendingDown className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalExpense}</div>
            <p className="text-xs text-red-100">累计总支出</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">待处理提现</CardTitle>
            <CreditCard className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingWithdrawals}</div>
            <p className="text-xs text-orange-100">等待审核金额</p>
          </CardContent>
        </Card>
      </div>

      {/* 详细财务数据 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户资金统计 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <DollarSign className="h-5 w-5 mr-2 text-green-400" />
              用户资金统计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <p className="text-xs text-blue-100">用户余额总计</p>
                <p className="text-lg font-bold text-white">{stats.userTotalBalance}</p>
              </div>
              <div className="p-3 bg-purple-600 rounded-lg">
                <p className="text-xs text-purple-100">质押金额总计</p>
                <p className="text-lg font-bold text-white">{stats.userTotalStaking}</p>
              </div>
              <div className="p-3 bg-green-600 rounded-lg">
                <p className="text-xs text-green-100">收益总计</p>
                <p className="text-lg font-bold text-white">{stats.userTotalProfit}</p>
              </div>
              <div className="p-3 bg-orange-600 rounded-lg">
                <p className="text-xs text-orange-100">已提现总计</p>
                <p className="text-lg font-bold text-white">{stats.userTotalWithdrawn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 时间统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-600" />
              时间段统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="today">今日</TabsTrigger>
                <TabsTrigger value="month">本月</TabsTrigger>
              </TabsList>
              
              <TabsContent value="today" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">今日收入</p>
                        <p className="text-xl font-bold text-green-600">{stats.todayIncome}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">今日支出</p>
                        <p className="text-xl font-bold text-red-600">{stats.todayExpense}</p>
                      </div>
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="month" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">本月收入</p>
                        <p className="text-xl font-bold text-green-600">{stats.monthIncome}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">本月支出</p>
                        <p className="text-xl font-bold text-red-600">{stats.monthExpense}</p>
                      </div>
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* 交易记录 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              交易记录
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索地址或哈希..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="income">收入</SelectItem>
                  <SelectItem value="expense">支出</SelectItem>
                  <SelectItem value="withdraw">提现</SelectItem>
                  <SelectItem value="deposit">充值</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="pending">处理中</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">login...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无交易记录
                </div>
              ) : (
                <>
                  {transactions.map((transaction) => {
                    const typeInfo = getTypeInfo(transaction.type)
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          {typeInfo.icon}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${typeInfo.color}`}>{typeInfo.text}</span>
                              <Badge variant="outline">{transaction.currency}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">{transaction.description}</p>
                            <p className="text-xs text-gray-400">
                              用户: {transaction.userAddress.slice(0, 6)}...{transaction.userAddress.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${typeInfo.color}`}>
                            {transaction.type === 'expense' || transaction.type === 'withdraw' ? '-' : '+'}
                            {transaction.amount} {transaction.currency}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(transaction.status)}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* 分页 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        上一页
                      </Button>
                      <span className="text-sm text-gray-500">
                        第 {currentPage} 页，共 {totalPages} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 