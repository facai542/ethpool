'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  UserCheck,
  Calendar,
  RefreshCw,
  BarChart3
} from 'lucide-react'

// 推广统计数据接口
interface PromotionStats {
  totalReferrals: number
  activeReferrals: number
  totalCommission: number
  monthlyCommission: number
  conversionRate: number
  topPromoters: {
    id: number
    name: string
    address: string
    referrals: number
    commission: number
  }[]
  monthlyData: {
    month: string
    referrals: number
    commission: number
  }[]
}

export default function PromotionStatsPage() {
  const [stats, setStats] = useState<PromotionStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommission: 0,
    monthlyCommission: 0,
    conversionRate: 0,
    topPromoters: [],
    monthlyData: []
  })
  const [loading, setLoading] = useState(true)

  // 获取推广统计数据
  const fetchStats = async () => {
    try {
      setLoading(true)
      // 模拟API调用
      const mockStats: PromotionStats = {
        totalReferrals: 1250,
        activeReferrals: 890,
        totalCommission: 25678.50,
        monthlyCommission: 4567.25,
        conversionRate: 71.2,
        topPromoters: [
          {
            id: 1,
            name: '推广员A',
            address: '0x1234...5678',
            referrals: 145,
            commission: 2890.50
          },
          {
            id: 2,
            name: '推广员B',
            address: '0x9876...5432',
            referrals: 98,
            commission: 1567.25
          },
          {
            id: 3,
            name: '推广员C',
            address: '0x1111...2222',
            referrals: 76,
            commission: 1234.75
          }
        ],
        monthlyData: [
          { month: '2024-01', referrals: 45, commission: 890.50 },
          { month: '2024-02', referrals: 67, commission: 1234.75 },
          { month: '2024-03', referrals: 89, commission: 1567.25 },
          { month: '2024-04', referrals: 123, commission: 2456.50 },
          { month: '2024-05', referrals: 156, commission: 3123.75 },
          { month: '2024-06', referrals: 189, commission: 3789.25 }
        ]
      }
      setStats(mockStats)
    } catch (error) {
      console.error('获取推广统计数据失败:', error)
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
          <h1 className="text-2xl font-bold text-white">推广统计</h1>
          <p className="text-slate-400">查看推广活动的详细统计数据</p>
        </div>
        <Button onClick={fetchStats} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总推荐数</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals.toLocaleString()}</div>
            <p className="text-xs text-blue-100">累计推荐用户</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃推荐</CardTitle>
            <UserCheck className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReferrals.toLocaleString()}</div>
            <p className="text-xs text-green-100">有效推荐用户</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总佣金</CardTitle>
            <DollarSign className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCommission.toLocaleString()}</div>
            <p className="text-xs text-purple-100">累计佣金支出</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月佣金</CardTitle>
            <Calendar className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyCommission.toLocaleString()}</div>
            <p className="text-xs text-orange-100">当月佣金支出</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">转化率</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-yellow-100">推荐转化率</p>
          </CardContent>
        </Card>
      </div>

      {/* 顶级推广员 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">顶级推广员</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topPromoters.map((promoter, index) => (
                <div key={promoter.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{promoter.name}</p>
                      <p className="text-slate-400 text-sm">{promoter.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-slate-400">推荐数</p>
                        <p className="text-lg font-bold text-white">{promoter.referrals}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">佣金</p>
                        <p className="text-lg font-bold text-green-400">${promoter.commission.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 月度趋势 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            月度趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {stats.monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {data.month.split('-')[1]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{data.month}</p>
                      <p className="text-slate-400 text-sm">月度数据</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-400">推荐数</p>
                      <p className="text-xl font-bold text-blue-400">{data.referrals}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400">佣金</p>
                      <p className="text-xl font-bold text-green-400">${data.commission.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400">趋势</p>
                      <Badge variant="default" className="bg-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {index > 0 ? `+${((data.referrals - stats.monthlyData[index - 1].referrals) / stats.monthlyData[index - 1].referrals * 100).toFixed(1)}%` : '0%'}
                      </Badge>
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