'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react'

// 财务统计数据接口
interface FinanceStats {
  totalBalance: number
  totalStaking: number
  totalRewards: number
  totalWithdrawals: number
  pendingWithdrawals: number
  monthlyProfit: number
  transactionVolume: number
  activeUsers: number
  revenueByMonth: {
    month: string
    revenue: number
    expenses: number
    profit: number
  }[]
  categoryBreakdown: {
    category: string
    amount: number
    percentage: number
  }[]
}

export default function FinanceStatsPage() {
  const [stats, setStats] = useState<FinanceStats>({
    totalBalance: 0,
    totalStaking: 0,
    totalRewards: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    monthlyProfit: 0,
    transactionVolume: 0,
    activeUsers: 0,
    revenueByMonth: [],
    categoryBreakdown: []
  })
  const [loading, setLoading] = useState(true)

  // 获取财务统计数据
  const fetchStats = async () => {
    try {
      setLoading(true)
      // 模拟API调用
      const mockStats: FinanceStats = {
        totalBalance: 567890.50,
        totalStaking: 234567.25,
        totalRewards: 45678.75,
        totalWithdrawals: 123456.00,
        pendingWithdrawals: 12345.50,
        monthlyProfit: 23456.75,
        transactionVolume: 789012.25,
        activeUsers: 456,
        revenueByMonth: [
          { month: '2024-01', revenue: 45000, expenses: 23000, profit: 22000 },
          { month: '2024-02', revenue: 52000, expenses: 25000, profit: 27000 },
          { month: '2024-03', revenue: 48000, expenses: 22000, profit: 26000 },
          { month: '2024-04', revenue: 61000, expenses: 28000, profit: 33000 },
          { month: '2024-05', revenue: 58000, expenses: 26000, profit: 32000 },
          { month: '2024-06', revenue: 67000, expenses: 29000, profit: 38000 }
        ],
        categoryBreakdown: [
          { category: '质押收益', amount: 45678.25, percentage: 35.2 },
          { category: '交易手续费', amount: 23456.50, percentage: 18.1 },
          { category: '推荐奖励', amount: 34567.75, percentage: 26.7 },
          { category: '其他收入', amount: 26098.00, percentage: 20.0 }
        ]
      }
      setStats(mockStats)
    } catch (error) {
      console.error('获取财务统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">财务统计</h1>
          <p className="text-slate-400">查看平台的财务数据和统计报表</p>
        </div>
        <Button onClick={fetchStats} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* 主要财务指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总余额</CardTitle>
            <Wallet className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-green-100">平台总资金</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">质押总额</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalStaking.toLocaleString()}</div>
            <p className="text-xs text-blue-100">用户质押资金</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">奖励支出</CardTitle>
            <DollarSign className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRewards.toLocaleString()}</div>
            <p className="text-xs text-purple-100">累计奖励发放</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">提现总额</CardTitle>
            <CreditCard className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalWithdrawals.toLocaleString()}</div>
            <p className="text-xs text-orange-100">累计提现金额</p>
          </CardContent>
        </Card>
      </div>

      {/* 次要指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">待处理提现</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">${stats.pendingWithdrawals.toLocaleString()}</div>
            <p className="text-xs text-slate-400">等待审核</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">本月利润</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">${stats.monthlyProfit.toLocaleString()}</div>
            <p className="text-xs text-slate-400">当月净利润</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">交易量</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">${stats.transactionVolume.toLocaleString()}</div>
            <p className="text-xs text-slate-400">本月交易总额</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">活跃用户</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-slate-400">本月活跃用户</p>
          </CardContent>
        </Card>
      </div>

      {/* 月度收益趋势 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            月度收益趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {stats.revenueByMonth.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {data.month.split('-')[1]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{data.month}</p>
                      <p className="text-slate-400 text-sm">月度财务数据</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-400">收入</p>
                      <p className="text-lg font-bold text-green-400">${data.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400">支出</p>
                      <p className="text-lg font-bold text-red-400">${data.expenses.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400">利润</p>
                      <p className="text-lg font-bold text-blue-400">${data.profit.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400">利润率</p>
                      <Badge variant="default" className={data.profit > 0 ? "bg-green-500" : "bg-red-500"}>
                        {((data.profit / data.revenue) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 收入分类统计 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            收入分类统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <div>
                      <p className="text-white font-medium">{category.category}</p>
                      <p className="text-slate-400 text-sm">{category.percentage}% 占比</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${category.amount.toLocaleString()}</p>
                    <div className="w-20 h-2 bg-slate-600 rounded-full mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 