'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface DailyReward {
  id: number
  user_address: string
  usdt_balance: number
  reward_rate: number
  usdt_reward: number
  eth_reward: number
  exchange_rate: number
  reward_date: string
  status: string
  created_at: string
}

interface RewardStats {
  processedUsers: number
  successCount: number
  errorCount: number
  exchangeRate: number
  errors: string[]
}

export default function DailyRewardsPage() {
  const [rewards, setRewards] = useState<DailyReward[]>([])
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [stats, setStats] = useState<RewardStats | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 获取收益发放历史
  const fetchRewards = async (pageNum = 1, date = '') => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      })
      
      if (date) {
        params.append('date', date)
      }

      const response = await fetch(`/api/admin/daily-rewards?${params}`)
      const data = await response.json()

      if (data.success) {
        setRewards(data.data.records)
        setTotalPages(data.data.pagination.pages)
        setPage(data.data.pagination.page)
      } else {
        setError(data.error || '获取数据失败')
      }
    } catch (err: any) {
      setError('获取数据失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 执行每日收益发放
  const executeDailyRewards = async (forceRun = false) => {
    setExecuting(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch('/api/admin/daily-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetDate: selectedDate || new Date().toISOString().split('T')[0],
          forceRun
        })
      })

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
        setSuccess(`收益发放成功！处理了 ${data.data.processedUsers} 个用户，成功 ${data.data.successCount} 个`)
        // 刷新列表
        fetchRewards(1, selectedDate)
      } else {
        setError(data.error || '执行失败')
      }
    } catch (err: any) {
      setError('执行失败: ' + err.message)
    } finally {
      setExecuting(false)
    }
  }

  // 格式化地址
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 格式化金额
  const formatAmount = (amount: number, decimals = 6) => {
    return amount.toFixed(decimals)
  }

  // 格式化百分比
  const formatPercentage = (rate: number) => {
    return (rate * 100).toFixed(2) + '%'
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />待处理</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />失败</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // 获取收益等级名称
  const getTierName = (usdtBalance: number) => {
    if (usdtBalance >= 200000) return 'Tier 5 (5%)'
    if (usdtBalance >= 100000) return 'Tier 4 (4%)'
    if (usdtBalance >= 10000) return 'Tier 3 (3%)'
    if (usdtBalance >= 5000) return 'Tier 2 (2.5%)'
    if (usdtBalance >= 50) return 'Tier 1 (2%)'
    return '无收益'
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">每日收益管理</h1>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => executeDailyRewards(false)}
            disabled={executing}
            className="bg-green-600 hover:bg-green-700"
          >
            {executing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {executing ? '执行中...' : '执行收益发放'}
          </Button>
          <Button
            onClick={() => executeDailyRewards(true)}
            disabled={executing}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            强制执行
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              执行统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.processedUsers}</div>
                <div className="text-sm text-gray-600">处理用户</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.successCount}</div>
                <div className="text-sm text-gray-600">成功发放</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
                <div className="text-sm text-gray-600">失败数量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatAmount(stats.exchangeRate, 6)}</div>
                <div className="text-sm text-gray-600">汇率 (USDT/ETH)</div>
              </div>
            </div>
            {stats.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-red-600 mb-2">错误信息:</h4>
                <div className="bg-red-50 p-3 rounded text-sm">
                  {stats.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-red-700">{error}</div>
                  ))}
                  {stats.errors.length > 5 && (
                    <div className="text-red-500">...还有 {stats.errors.length - 5} 个错误</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="date">选择日期</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={() => fetchRewards(1, selectedDate)}>
                搜索
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedDate('')
                  fetchRewards(1, '')
                }}
              >
                清除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 消息提示 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* 收益发放记录 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            收益发放记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              加载中...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户地址</TableHead>
                    <TableHead>USDT余额</TableHead>
                    <TableHead>收益等级</TableHead>
                    <TableHead>USDT奖励</TableHead>
                    <TableHead>ETH奖励</TableHead>
                    <TableHead>汇率</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>发放日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell className="font-mono text-sm">
                        {formatAddress(reward.user_address)}
                      </TableCell>
                      <TableCell>{formatAmount(reward.usdt_balance)} USDT</TableCell>
                      <TableCell>{getTierName(reward.usdt_balance)}</TableCell>
                      <TableCell>{formatAmount(reward.usdt_reward)} USDT</TableCell>
                      <TableCell>{formatAmount(reward.eth_reward, 8)} ETH</TableCell>
                      <TableCell>{formatAmount(reward.exchange_rate, 6)}</TableCell>
                      <TableCell>{getStatusBadge(reward.status)}</TableCell>
                      <TableCell>{reward.reward_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {rewards.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  暂无收益发放记录
                </div>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    第 {page} 页，共 {totalPages} 页
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchRewards(page - 1, selectedDate)}
                      disabled={page <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchRewards(page + 1, selectedDate)}
                      disabled={page >= totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




