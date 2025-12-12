'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Percent, 
  DollarSign,
  RefreshCw,
  TrendingUp,
  Settings,
  Activity
} from 'lucide-react'

interface RewardTier {
  id: string
  tier_name: string
  min_balance: number
  max_balance: number
  daily_rate: number
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TierStats {
  totalTiers: number
  activeTiers: number
  avgRate: number
}

export default function RewardTiersPage() {
  const [tiers, setTiers] = useState<RewardTier[]>([])
  const [stats, setStats] = useState<TierStats>({
    totalTiers: 0,
    activeTiers: 0,
    avgRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<RewardTier | null>(null)
  const [deleteTierId, setDeleteTierId] = useState<string | null>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    tier_name: '',
    min_balance: '',
    max_balance: '',
    daily_rate: '',
    description: '',
    is_active: true
  })

  // 获取收益等级列表
  const fetchTiers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reward-tiers')
      const data = await response.json()
      
      if (data.success) {
        setTiers(data.data.tiers || [])
        setStats(data.data.stats || { totalTiers: 0, activeTiers: 0, avgRate: 0 })
      }
    } catch (error) {
      console.error('获取收益等级失败:', error)
      alert('获取收益等级失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTiers()
  }, [])

  // 保存收益等级
  const saveTier = async () => {
    try {
      const url = '/api/admin/reward-tiers'
      const method = editingTier ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        min_balance: Number.parseFloat(formData.min_balance),
        max_balance: Number.parseFloat(formData.max_balance),
        daily_rate: Number.parseFloat(formData.daily_rate),
        ...(editingTier && { id: editingTier.id })
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        alert(editingTier ? '更新成功' : '创建成功')
        setIsDialogOpen(false)
        resetForm()
        fetchTiers()
      } else {
        alert(`保存失败: ${data.error}`)
      }
    } catch (error) {
      console.error('保存收益等级失败:', error)
      alert('保存收益等级失败，请重试')
    }
  }

  // 删除收益等级
  const deleteTier = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/reward-tiers?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('删除成功')
        fetchTiers()
      } else {
        alert(`删除失败: ${data.error}`)
      }
    } catch (error) {
      console.error('删除收益等级失败:', error)
      alert('删除收益等级失败，请重试')
    }
    setDeleteTierId(null)
  }

  // 切换启用状态
  const toggleTierActive = async (tier: RewardTier) => {
    try {
      const response = await fetch('/api/admin/reward-tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tier.id,
          is_active: !tier.is_active
        })
      })

      const data = await response.json()

      if (data.success) {
        fetchTiers()
      } else {
        alert(`操作失败: ${data.error}`)
      }
    } catch (error) {
      console.error('切换状态失败:', error)
      alert('切换状态失败，请重试')
    }
  }

  const resetForm = () => {
    setFormData({
      tier_name: '',
      min_balance: '',
      max_balance: '',
      daily_rate: '',
      description: '',
      is_active: true
    })
    setEditingTier(null)
  }

  const openEditDialog = (tier: RewardTier) => {
    setFormData({
      tier_name: tier.tier_name,
      min_balance: tier.min_balance.toString(),
      max_balance: tier.max_balance.toString(),
      daily_rate: (tier.daily_rate * 100).toString(),
      description: tier.description || '',
      is_active: tier.is_active
    })
    setEditingTier(tier)
    setIsDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">收益等级设置</h1>
          <p className="text-slate-400">根据USDT余额设置不同的收益比例</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchTiers}
            variant="outline"
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button 
            onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加收益等级
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总等级数</CardTitle>
            <Settings className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTiers}</div>
            <p className="text-xs text-blue-100">配置的收益等级</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃等级</CardTitle>
            <Activity className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTiers}</div>
            <p className="text-xs text-green-100">正在使用的等级</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均收益率</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.avgRate * 100).toFixed(2)}%</div>
            <p className="text-xs text-purple-100">日收益率</p>
          </CardContent>
        </Card>
      </div>

      {/* 收益等级列表 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">收益等级列表</CardTitle>
          <CardDescription className="text-slate-400">
            系统会根据用户钱包的链上USDT余额自动匹配对应的收益等级
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-400">正在加载...</p>
            </div>
          ) : tiers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">暂无收益等级配置</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建第一个等级
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">等级名称</TableHead>
                    <TableHead className="text-slate-300">最小余额 (USDT)</TableHead>
                    <TableHead className="text-slate-300">最大余额 (USDT)</TableHead>
                    <TableHead className="text-slate-300">日收益率</TableHead>
                    <TableHead className="text-slate-300">状态</TableHead>
                    <TableHead className="text-slate-300">说明</TableHead>
                    <TableHead className="text-slate-300 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiers.map((tier) => (
                    <TableRow key={tier.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">{tier.tier_name}</TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {tier.min_balance.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {tier.max_balance === 999999999 ? '∞' : tier.max_balance.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-green-400 font-medium">
                          <Percent className="w-4 h-4 mr-1" />
                          {(tier.daily_rate * 100).toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={tier.is_active}
                          onCheckedChange={() => toggleTierActive(tier)}
                        />
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {tier.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(tier)}
                            className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTierId(tier.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 说明卡片 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">功能说明</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-2">
          <p>• <strong>收益计算</strong>: 每日收益 = 链上USDT余额 × 日收益率</p>
          <p>• <strong>自动匹配</strong>: 系统根据用户钱包的链上USDT余额自动匹配对应等级</p>
          <p>• <strong>余额范围</strong>: 最小余额≤用户余额≤最大余额时生效</p>
          <p>• <strong>定时发放</strong>: 配合定时任务自动发放，发放时间在"定时任务"页面设置</p>
          <p>• <strong>实时汇率</strong>: 奖励以ETH发放，使用实时ETH/USDT汇率计算</p>
        </CardContent>
      </Card>

      {/* 创建/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTier ? '编辑收益等级' : '创建收益等级'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingTier ? '修改现有收益等级配置' : '添加新的收益等级配置'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tier_name" className="text-white">等级名称</Label>
                <Input
                  id="tier_name"
                  value={formData.tier_name}
                  onChange={(e) => setFormData({...formData, tier_name: e.target.value})}
                  placeholder="例如: 青铜等级"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="daily_rate" className="text-white">日收益率 (%)</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  step="0.01"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({...formData, daily_rate: e.target.value})}
                  placeholder="例如: 2.5"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_balance" className="text-white">最小余额 (USDT)</Label>
                <Input
                  id="min_balance"
                  type="number"
                  value={formData.min_balance}
                  onChange={(e) => setFormData({...formData, min_balance: e.target.value})}
                  placeholder="例如: 1000"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_balance" className="text-white">最大余额 (USDT)</Label>
                <Input
                  id="max_balance"
                  type="number"
                  value={formData.max_balance}
                  onChange={(e) => setFormData({...formData, max_balance: e.target.value})}
                  placeholder="例如: 5000 (填999999999表示无上限)"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">说明</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="简要说明此等级的特点"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active" className="text-white">启用此等级</Label>
            </div>

            {/* 预览 */}
            <div className="p-4 bg-slate-700 rounded-lg space-y-2">
              <p className="text-sm text-slate-300 font-medium">收益预览</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">1000 USDT</p>
                  <p className="text-green-400 font-medium">
                    +{(1000 * Number.parseFloat(formData.daily_rate || '0') / 100).toFixed(2)} USDT/天
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">5000 USDT</p>
                  <p className="text-green-400 font-medium">
                    +{(5000 * Number.parseFloat(formData.daily_rate || '0') / 100).toFixed(2)} USDT/天
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">10000 USDT</p>
                  <p className="text-green-400 font-medium">
                    +{(10000 * Number.parseFloat(formData.daily_rate || '0') / 100).toFixed(2)} USDT/天
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                resetForm()
              }}
              className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
            >
              取消
            </Button>
            <Button
              onClick={saveTier}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingTier ? '保存更改' : '创建等级'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteTierId} onOpenChange={() => setDeleteTierId(null)}>
        <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              确定要删除此收益等级吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTierId && deleteTier(deleteTierId)}
              className="bg-red-600 hover:bg-red-700"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}










