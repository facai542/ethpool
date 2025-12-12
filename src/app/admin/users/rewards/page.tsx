'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2,
  RefreshCw,
  Save
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// 奖励配置数据接口
interface RewardConfig {
  id: number
  name: string
  type: 'percentage' | 'fixed'
  value: number
  min_amount: number
  max_amount: number
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<RewardConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState<RewardConfig | null>(null)
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    min_amount: 0,
    max_amount: 0,
    description: '',
    is_active: true
  })

  // 获取奖励配置列表
  const fetchRewards = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users/rewards')
      const data = await response.json()
      
      if (data.success) {
        setRewards(data.data || [])
      } else {
        console.error('获取奖励配置失败:', data.error)
        alert(`获取奖励配置失败: ${data.error}`)
      }
    } catch (error) {
      console.error('获取奖励配置失败:', error)
      alert('获取奖励配置失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  // 创建奖励配置
  const createReward = async () => {
    try {
      const response = await fetch('/api/admin/users/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      if (data.success) {
        setRewards([...rewards, data.data])
      setIsCreateModalOpen(false)
      resetForm()
        alert('✅ 奖励配置创建成功')
      } else {
        alert(`创建失败: ${data.error}`)
      }
    } catch (error) {
      console.error('创建奖励配置失败:', error)
      alert('创建奖励配置失败，请重试')
    }
  }

  // 更新奖励配置
  const updateReward = async () => {
    if (!selectedReward) return
    
    try {
      const response = await fetch('/api/admin/users/rewards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedReward.id, ...formData })
      })
      
      const data = await response.json()
      if (data.success) {
        setRewards(rewards.map(r => r.id === selectedReward.id ? data.data : r))
      setIsEditModalOpen(false)
      setSelectedReward(null)
      resetForm()
        alert('✅ 奖励配置更新成功')
      } else {
        alert(`更新失败: ${data.error}`)
      }
    } catch (error) {
      console.error('更新奖励配置失败:', error)
      alert('更新奖励配置失败，请重试')
    }
  }

  // 删除奖励配置
  const deleteReward = async (id: number) => {
    if (!window.confirm('确定要删除这个奖励配置吗？')) return
    
    try {
      const response = await fetch(`/api/admin/users/rewards?id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
      setRewards(rewards.filter(r => r.id !== id))
        alert('✅ 奖励配置删除成功')
      } else {
        alert(`删除失败: ${data.error}`)
      }
    } catch (error) {
      console.error('删除奖励配置失败:', error)
      alert('删除奖励配置失败，请重试')
    }
  }

  // 切换奖励状态
  const toggleRewardStatus = async (id: number) => {
    try {
      const reward = rewards.find(r => r.id === id)
      if (!reward) return
      
      const response = await fetch('/api/admin/users/rewards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !reward.is_active })
      })
      
      const data = await response.json()
      if (data.success) {
        setRewards(rewards.map(r => r.id === id ? data.data : r))
        alert(`✅ 奖励状态${!reward.is_active ? '启用' : '禁用'}成功`)
      } else {
        alert(`操作失败: ${data.error}`)
      }
    } catch (error) {
      console.error('切换奖励状态失败:', error)
      alert('切换奖励状态失败，请重试')
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'percentage',
      value: 0,
      min_amount: 0,
      max_amount: 0,
      description: '',
      is_active: true
    })
  }

  // 打开编辑模态框
  const openEditModal = (reward: RewardConfig) => {
    setSelectedReward(reward)
    setFormData({
      name: reward.name,
      type: reward.type,
      value: reward.value,
      min_amount: reward.min_amount,
      max_amount: reward.max_amount,
      description: reward.description,
      is_active: reward.is_active
    })
    setIsEditModalOpen(true)
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">奖励设置</h1>
          <p className="text-slate-400">管理系统奖励配置和规则</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加奖励配置
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总奖励配置</CardTitle>
            <Settings className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.length}</div>
            <p className="text-xs text-green-100">配置总数</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃配置</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.filter(r => r.is_active).length}</div>
            <p className="text-xs text-blue-100">正在使用</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已停用</CardTitle>
            <DollarSign className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.filter(r => !r.is_active).length}</div>
            <p className="text-xs text-purple-100">停用配置</p>
          </CardContent>
        </Card>
      </div>

      {/* 奖励配置列表 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">奖励配置列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="p-4 border border-slate-600 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-white">{reward.name}</h3>
                      <Badge variant={reward.is_active ? "default" : "secondary"}>
                        {reward.is_active ? '已启用' : '已停用'}
                      </Badge>
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        {reward.type === 'percentage' ? '百分比' : '固定金额'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRewardStatus(reward.id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {reward.is_active ? '停用' : '启用'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(reward)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReward(reward.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-2">{reward.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400">
                    <div>
                      <span className="text-slate-500">奖励值:</span>
                      <span className="text-white ml-2">
                        {reward.value}{reward.type === 'percentage' ? '%' : ' USDT'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">最小金额:</span>
                      <span className="text-white ml-2">{reward.min_amount} USDT</span>
                    </div>
                    <div>
                      <span className="text-slate-500">最大金额:</span>
                      <span className="text-white ml-2">{reward.max_amount} USDT</span>
                    </div>
                    <div>
                      <span className="text-slate-500">更新时间:</span>
                      <span className="text-white ml-2">
                        {new Date(reward.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建奖励配置模态框 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加奖励配置</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">配置名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-700 border-slate-600"
                placeholder="请输入配置名称"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">奖励类型</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                >
                  <option value="percentage">百分比</option>
                  <option value="fixed">固定金额</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">奖励值 *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">最小金额</Label>
                <Input
                  id="min_amount"
                  type="number"
                  step="0.01"
                  value={formData.min_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_amount: Number(e.target.value) }))}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_amount">最大金额</Label>
                <Input
                  id="max_amount"
                  type="number"
                  step="0.01"
                  value={formData.max_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_amount: Number(e.target.value) }))}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                rows={3}
                placeholder="请输入奖励配置描述"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active">启用此配置</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              取消
            </Button>
            <Button onClick={createReward} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              创建
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑奖励配置模态框 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑奖励配置</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_name">配置名称 *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-700 border-slate-600"
                placeholder="请输入配置名称"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_type">奖励类型</Label>
                <select
                  id="edit_type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                >
                  <option value="percentage">百分比</option>
                  <option value="fixed">固定金额</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_value">奖励值 *</Label>
                <Input
                  id="edit_value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_min_amount">最小金额</Label>
                <Input
                  id="edit_min_amount"
                  type="number"
                  step="0.01"
                  value={formData.min_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_amount: Number(e.target.value) }))}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_max_amount">最大金额</Label>
                <Input
                  id="edit_max_amount"
                  type="number"
                  step="0.01"
                  value={formData.max_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_amount: Number(e.target.value) }))}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description">描述</Label>
              <textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                rows={3}
                placeholder="请输入奖励配置描述"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="edit_is_active">启用此配置</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              取消
            </Button>
            <Button onClick={updateReward} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              更新
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 