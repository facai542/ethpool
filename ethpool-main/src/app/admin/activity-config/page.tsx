'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  Settings,
  DollarSign,
  Clock
} from 'lucide-react'

interface ActivityConfig {
  id: number
  name: string
  description: string
  standard_amount: number
  output_eth: number
  countdown_duration: number
  is_active: boolean
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export default function ActivityConfigPage() {
  const [activities, setActivities] = useState<ActivityConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    standard_amount: '',
    output_eth: '',
    countdown_duration: '',
    is_active: false
  })

  // 获取活动配置列表
  const fetchActivities = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/activity-config')
      const data = await response.json()

      if (data.success) {
        setActivities(data.data)
      } else {
        setError(data.error || '获取活动配置失败')
      }
    } catch (err: any) {
      setError('获取活动配置失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 保存活动配置
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.standard_amount || !formData.output_eth || !formData.countdown_duration) {
      setError('请填写所有必填字段')
      return
    }

    try {
      const response = await fetch('/api/admin/activity-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          ...formData,
          standard_amount: Number.parseFloat(formData.standard_amount),
          output_eth: Number.parseFloat(formData.output_eth),
          countdown_duration: Number.parseInt(formData.countdown_duration)
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(editingId ? '活动配置更新成功' : '活动配置创建成功')
        setShowForm(false)
        setEditingId(null)
        setFormData({
          name: '',
          description: '',
          standard_amount: '',
          output_eth: '',
          countdown_duration: '',
          is_active: false
        })
        fetchActivities()
      } else {
        setError(data.error || '保存失败')
      }
    } catch (err: any) {
      setError('保存失败: ' + err.message)
    }
  }

  // 编辑活动配置
  const handleEdit = (activity: ActivityConfig) => {
    setEditingId(activity.id)
    setFormData({
      name: activity.name,
      description: activity.description || '',
      standard_amount: activity.standard_amount.toString(),
      output_eth: activity.output_eth.toString(),
      countdown_duration: activity.countdown_duration.toString(),
      is_active: activity.is_active
    })
    setShowForm(true)
  }

  // 删除活动配置
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此活动配置吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/activity-config?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('活动配置删除成功')
        fetchActivities()
      } else {
        setError(data.error || '删除失败')
      }
    } catch (err: any) {
      setError('删除失败: ' + err.message)
    }
  }

  // 切换活动状态
  const toggleActivity = async (activity: ActivityConfig) => {
    try {
      const response = await fetch('/api/admin/activity-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: activity.id,
          name: activity.name,
          description: activity.description,
          standard_amount: activity.standard_amount,
          output_eth: activity.output_eth,
          countdown_duration: activity.countdown_duration,
          is_active: !activity.is_active
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`活动已${!activity.is_active ? '开启' : '关闭'}`)
        fetchActivities()
      } else {
        setError(data.error || '操作失败')
      }
    } catch (err: any) {
      setError('操作失败: ' + err.message)
    }
  }

  // 格式化时间
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN')
  }

  // 格式化倒计时
  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">活动配置管理</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建活动
        </Button>
      </div>

      {/* 消息提示 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* 活动配置表单 */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? '编辑活动配置' : '新建活动配置'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">活动名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="请输入活动名称"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="standard_amount">活动金额 (USDT) *</Label>
                  <Input
                    id="standard_amount"
                    type="number"
                    step="0.000001"
                    value={formData.standard_amount}
                    onChange={(e) => setFormData({...formData, standard_amount: e.target.value})}
                    placeholder="3000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="output_eth">输出 ETH *</Label>
                  <Input
                    id="output_eth"
                    type="number"
                    step="0.00000001"
                    value={formData.output_eth}
                    onChange={(e) => setFormData({...formData, output_eth: e.target.value})}
                    placeholder="6"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="countdown_duration">倒计时时长 (秒) *</Label>
                  <Input
                    id="countdown_duration"
                    type="number"
                    value={formData.countdown_duration}
                    onChange={(e) => setFormData({...formData, countdown_duration: e.target.value})}
                    placeholder="86400 (24小时)"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">活动描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="请输入活动描述"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">立即开启活动</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingId ? '更新' : '创建'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      name: '',
                      description: '',
                      standard_amount: '',
                      output_eth: '',
                      countdown_duration: '',
                      is_active: false
                    })
                  }}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 活动配置列表 */}
      <Card>
        <CardHeader>
          <CardTitle>活动配置列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>活动名称</TableHead>
                  <TableHead>活动金额</TableHead>
                  <TableHead>输出ETH</TableHead>
                  <TableHead>倒计时</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.name}</TableCell>
                    <TableCell>{activity.standard_amount} USDT</TableCell>
                    <TableCell>{activity.output_eth} ETH</TableCell>
                    <TableCell>{formatCountdown(activity.countdown_duration)}</TableCell>
                    <TableCell>
                      <Badge 
                        className={activity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {activity.is_active ? '活跃' : '未开启'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTime(activity.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(activity)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant={activity.is_active ? "destructive" : "default"}
                          onClick={() => toggleActivity(activity)}
                        >
                          {activity.is_active ? (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              关闭
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              开启
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activities.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              暂无活动配置
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




