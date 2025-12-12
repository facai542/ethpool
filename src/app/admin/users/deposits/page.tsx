'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  RefreshCw,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Filter
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

// 充值订单接口
interface DepositOrder {
  id: string
  user_id: string
  wallet_address: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  tx_hash?: string
  created_at: string
  updated_at?: string
  confirmed_at?: string
  admin_note?: string
}

// 统计数据接口
interface DepositStats {
  total_orders: number
  pending_orders: number
  completed_orders: number
  failed_orders: number
  total_amount: number
  today_amount: number
}

export default function DepositsPage() {
  const [orders, setOrders] = useState<DepositOrder[]>([])
  const [stats, setStats] = useState<DepositStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<DepositOrder | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)

  // 获取充值订单列表
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/deposits')
      const result = await response.json()
      if (result.success) {
        setOrders(result.data.orders || [])
        setStats(result.data.stats || null)
      }
    } catch (error) {
      console.error('获取充值订单失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // 格式化金额
  const formatAmount = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return '0.00'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  // 格式化时间
  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">已完成</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">待处理</Badge>
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">失败</Badge>
      case 'cancelled':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">已取消</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>
    }
  }

  // 确认充值
  const handleConfirmDeposit = async (orderId: string, action: 'approve' | 'reject') => {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/deposits/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action,
          adminNote
        })
      })
      const result = await response.json()
      if (result.success) {
        alert(action === 'approve' ? '充值已确认' : '充值已拒绝')
        setShowConfirmModal(false)
        setSelectedOrder(null)
        setAdminNote('')
        fetchOrders()
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败')
    } finally {
      setProcessing(false)
    }
  }

  // 筛选订单
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tx_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">充值订单管理</h1>
          <p className="text-slate-400 mt-1">管理用户充值订单，审核和确认充值</p>
        </div>
        <Button 
          onClick={fetchOrders}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">总订单数</p>
                  <p className="text-xl font-bold text-white">{stats.total_orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">待处理</p>
                  <p className="text-xl font-bold text-yellow-400">{stats.pending_orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">已完成</p>
                  <p className="text-xl font-bold text-green-400">{stats.completed_orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">失败/取消</p>
                  <p className="text-xl font-bold text-red-400">{stats.failed_orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">总金额</p>
                  <p className="text-xl font-bold text-purple-400">${formatAmount(stats.total_amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">今日充值</p>
                  <p className="text-xl font-bold text-cyan-400">${formatAmount(stats.today_amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="搜索钱包地址、交易哈希..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-blue-600' : 'border-slate-600 text-slate-300'}
              >
                全部
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' ? 'bg-yellow-600' : 'border-slate-600 text-slate-300'}
              >
                待处理
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('completed')}
                className={statusFilter === 'completed' ? 'bg-green-600' : 'border-slate-600 text-slate-300'}
              >
                已完成
              </Button>
              <Button
                variant={statusFilter === 'failed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('failed')}
                className={statusFilter === 'failed' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                失败
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订单列表 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            充值订单列表
            <Badge variant="outline" className="ml-2 text-slate-400">
              {filteredOrders.length} 条记录
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              暂无充值订单
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">订单ID</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">钱包地址</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">金额</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">状态</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">创建时间</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-2 text-slate-300 font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-2 text-slate-300 font-mono text-xs">
                        {order.wallet_address?.slice(0, 6)}...{order.wallet_address?.slice(-4)}
                      </td>
                      <td className="py-3 px-2 text-green-400 font-medium">
                        ${formatAmount(order.amount)} USDT
                      </td>
                      <td className="py-3 px-2">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-2 text-slate-400 text-xs">
                        {formatTime(order.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowDetailModal(true)
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {order.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowConfirmModal(true)
                                }}
                                className="text-green-400 hover:text-green-300 p-1"
                                title="确认充值"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConfirmDeposit(order.id, 'reject')}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="拒绝充值"
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
          )}
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>充值订单详情</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">订单ID</Label>
                  <p className="text-white font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <Label className="text-slate-400">状态</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-slate-400">钱包地址</Label>
                <p className="text-white font-mono text-sm break-all">{selectedOrder.wallet_address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">充值金额</Label>
                  <p className="text-green-400 font-bold text-lg">${formatAmount(selectedOrder.amount)} USDT</p>
                </div>
                <div>
                  <Label className="text-slate-400">创建时间</Label>
                  <p className="text-white text-sm">{formatTime(selectedOrder.created_at)}</p>
                </div>
              </div>
              
              {selectedOrder.tx_hash && (
                <div>
                  <Label className="text-slate-400">交易哈希</Label>
                  <p className="text-blue-400 font-mono text-sm break-all">{selectedOrder.tx_hash}</p>
                </div>
              )}
              
              {selectedOrder.confirmed_at && (
                <div>
                  <Label className="text-slate-400">确认时间</Label>
                  <p className="text-white text-sm">{formatTime(selectedOrder.confirmed_at)}</p>
                </div>
              )}
              
              {selectedOrder.admin_note && (
                <div>
                  <Label className="text-slate-400">管理员备注</Label>
                  <p className="text-slate-300 text-sm">{selectedOrder.admin_note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 确认弹窗 */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>确认充值</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-700 rounded-lg">
                <p className="text-slate-400 text-sm">钱包地址</p>
                <p className="text-white font-mono text-sm">{selectedOrder.wallet_address}</p>
                <p className="text-slate-400 text-sm mt-2">充值金额</p>
                <p className="text-green-400 font-bold text-xl">${formatAmount(selectedOrder.amount)} USDT</p>
              </div>
              
              <div>
                <Label className="text-slate-400">管理员备注（可选）</Label>
                <Input
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="输入备注信息..."
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmModal(false)
                    setAdminNote('')
                  }}
                  className="flex-1 border-slate-600 text-slate-300"
                  disabled={processing}
                >
                  取消
                </Button>
                <Button
                  onClick={() => handleConfirmDeposit(selectedOrder.id, 'approve')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={processing}
                >
                  {processing ? '处理中...' : '确认充值'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


