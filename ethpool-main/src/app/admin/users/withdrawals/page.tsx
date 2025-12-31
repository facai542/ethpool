'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  DollarSign, 
  Search, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Check
} from 'lucide-react'

interface WithdrawalRecord {
  id: number
  user_id: number
  user_address: string
  user_remark?: string      // 用户备注
  agent_nickname?: string   // 代理昵称
  agent_address?: string    // 上级代理地址
  referred_by?: string      // 推荐码
  amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  transaction_hash?: string
  to_address?: string
  sh_type?: number
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
  })
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRecord | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // 获取提现记录
  const fetchWithdrawals = async (page = 1, status = 'all', search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status,
        search
      })

      const response = await fetch(`/api/admin/withdrawals?${params}`)
      const data = await response.json()

      if (data.success) {
        console.log('✅ 获取提现记录成功:', data.data)
        setWithdrawals(data.data.withdrawals)
        setPagination(data.data.pagination)
      } else {
        console.error('❌ 获取提现记录失败:', data.error)
        alert('获取提现记录失败: ' + data.error)
        setWithdrawals([])
      }
    } catch (error) {
      console.error('获取提现记录异常:', error)
      setWithdrawals([])
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchWithdrawals()
  }, [])

  // 搜索和筛选
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWithdrawals(1, statusFilter, searchTerm)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  // 更新提现状态
  const updateWithdrawalStatus = async (id: number, status: string, transactionHash?: string) => {
    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withdrawalId: id,
          status,
          transactionHash
        })
      })

      const data = await response.json()

      if (data.success) {
        // 刷新数据
        fetchWithdrawals(pagination.page, statusFilter, searchTerm)
        alert('提现状态更新成功')
      } else {
        alert('更新失败: ' + data.error)
      }
    } catch (error) {
      console.error('更新提现状态失败:', error)
      alert('更新失败')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>
      case 'pending':
        return <Badge className="bg-yellow-600 text-white"><Clock className="w-3 h-3 mr-1" />处理中</Badge>
      case 'failed':
        return <Badge className="bg-red-600 text-white"><XCircle className="w-3 h-3 mr-1" />失败</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败，请手动复制')
    }
  }

  // 打开详情弹窗
  const openDetailDialog = (withdrawal: WithdrawalRecord) => {
    setSelectedWithdrawal(withdrawal)
    setShowDetailDialog(true)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">提现订单</h1>
          <p className="text-slate-400">管理用户提现申请</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          导出数据
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">提现记录</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索用户地址或订单ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              aria-label="筛选状态"
            >
              <option value="all">全部状态</option>
              <option value="pending">处理中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>
          </div>

          {/* 表格 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">订单ID</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">用户地址</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">代理昵称</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">用户备注</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">提现金额</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">状态</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">交易哈希</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">创建时间</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-2 text-white">#{withdrawal.id}</td>
                    <td className="py-3 px-2 text-white font-mono text-sm">
                      {withdrawal.user_address.slice(0, 6)}...{withdrawal.user_address.slice(-4)}
                    </td>
                    <td className="py-3 px-2 text-slate-300 text-sm">
                      {withdrawal.agent_nickname || '默认代理'}
                    </td>
                    <td className="py-3 px-2 text-slate-300 text-sm max-w-[200px] truncate" title={withdrawal.user_remark || '无备注'}>
                      {withdrawal.user_remark || '无备注'}
                    </td>
                    <td className="py-3 px-2 text-white font-semibold">
                      {withdrawal.amount.toFixed(2)} USDT
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="py-3 px-2 text-white font-mono text-sm">
                      {withdrawal.transaction_hash ? 
                        <a 
                          href={`https://etherscan.io/tx/${withdrawal.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {withdrawal.transaction_hash.slice(0, 10)}...
                        </a> : 
                        '-'
                      }
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-sm">
                      {new Date(withdrawal.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-400 hover:text-white p-1"
                          title="查看详情"
                          onClick={() => openDetailDialog(withdrawal)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {withdrawal.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-400 hover:text-green-300 p-1"
                              title="批准提现"
                              onClick={() => {
                                if (confirm(`确定要批准提现 ${withdrawal.amount.toFixed(2)} USDT 吗？`)) {
                                  updateWithdrawalStatus(withdrawal.id, 'completed')
                                }
                              }}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-400 hover:text-red-300 p-1"
                              title="拒绝提现"
                              onClick={() => {
                                if (confirm(`确定要拒绝提现 ${withdrawal.amount.toFixed(2)} USDT 吗？`)) {
                                  updateWithdrawalStatus(withdrawal.id, 'failed')
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {withdrawals.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-400">
              没有找到匹配的提现记录
            </div>
          )}

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-400">
                显示第 {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条记录
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchWithdrawals(pagination.page - 1, statusFilter, searchTerm)}
                >
                  上一页
                </Button>
                <span className="px-3 py-2 text-sm text-slate-300">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasMore}
                  onClick={() => fetchWithdrawals(pagination.page + 1, statusFilter, searchTerm)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">提现订单详情</DialogTitle>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-4">
              {/* 订单ID */}
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="text-sm text-slate-400 mb-1">订单ID</div>
                  <div className="text-lg font-semibold">#{selectedWithdrawal.id}</div>
                </div>
                <div>{getStatusBadge(selectedWithdrawal.status)}</div>
              </div>

              {/* 提现金额 */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-400">提现金额</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white h-8 px-2"
                    onClick={() => copyToClipboard(selectedWithdrawal.amount.toFixed(2), 'amount')}
                  >
                    {copiedField === 'amount' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {selectedWithdrawal.amount.toFixed(2)} USDT
                </div>
              </div>

              {/* 提现地址 */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-400">提现地址</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white h-8 px-2"
                    onClick={() => copyToClipboard(selectedWithdrawal.to_address || selectedWithdrawal.user_address, 'address')}
                  >
                    {copiedField === 'address' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="text-base font-mono break-all text-blue-400">
                  {selectedWithdrawal.to_address || selectedWithdrawal.user_address}
                </div>
              </div>

              {/* 提款时间 */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-400">提款时间</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white h-8 px-2"
                    onClick={() => copyToClipboard(new Date(selectedWithdrawal.created_at).toLocaleString('zh-CN'), 'time')}
                  >
                    {copiedField === 'time' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="text-base">
                  {new Date(selectedWithdrawal.created_at).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>

              {/* 交易哈希 */}
              {selectedWithdrawal.transaction_hash && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-slate-400">交易哈希</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white h-8 px-2"
                      onClick={() => copyToClipboard(selectedWithdrawal.transaction_hash || '', 'hash')}
                    >
                      {copiedField === 'hash' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <a
                    href={`https://etherscan.io/tx/${selectedWithdrawal.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-mono break-all text-blue-400 hover:text-blue-300"
                  >
                    {selectedWithdrawal.transaction_hash}
                  </a>
                </div>
              )}

              {/* 代理昵称 */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">代理昵称</div>
                <div className="text-base text-slate-300">
                  {selectedWithdrawal.agent_nickname || '默认代理'}
                </div>
              </div>

              {/* 用户备注 */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">用户备注</div>
                <div className="text-base text-slate-300">
                  {selectedWithdrawal.user_remark || '无备注'}
                </div>
              </div>

              {/* 用户ID */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">用户ID</div>
                <div className="text-base text-slate-300">
                  {selectedWithdrawal.user_id}
                </div>
              </div>

              {/* 更新时间 */}
              {selectedWithdrawal.updated_at && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">更新时间</div>
                  <div className="text-base text-slate-300">
                    {new Date(selectedWithdrawal.updated_at).toLocaleString('zh-CN')}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              {selectedWithdrawal.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      if (confirm(`确定要批准提现 ${selectedWithdrawal.amount.toFixed(2)} USDT 吗？`)) {
                        updateWithdrawalStatus(selectedWithdrawal.id, 'completed')
                        setShowDetailDialog(false)
                      }
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    批准提现
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    onClick={() => {
                      if (confirm(`确定要拒绝提现 ${selectedWithdrawal.amount.toFixed(2)} USDT 吗？`)) {
                        updateWithdrawalStatus(selectedWithdrawal.id, 'failed')
                        setShowDetailDialog(false)
                      }
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    拒绝提现
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}