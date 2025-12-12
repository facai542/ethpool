'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Edit, Trash2, Eye, Send, RefreshCw, Save, Image } from 'lucide-react'
import { TemplateSelector } from '@/components/TemplateSelector'

interface Announcement {
  id: number
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'published' | 'scheduled' | 'expired'
  target_type: 'all' | 'specific' | 'group'
  target_users?: string[]
  target_groups?: string[]
  template_style: 'modal' | 'banner' | 'toast' | 'sidebar'
  template_config: any
  auto_close: boolean
  auto_close_delay?: number
  start_time?: string
  end_time?: string
  view_count: number
  click_count: number
  created_by?: string
  created_at?: string
  updated_at?: string
}

interface AnnouncementStats {
  total: number
  published: number
  draft: number
  totalViews: number
  totalClicks: number
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState<AnnouncementStats>({ total: 0, published: 0, draft: 0, totalViews: 0, totalClicks: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    status: 'draft',
    target_type: 'all',
    target_users: [] as string[],
    template_style: 'modal',
    auto_close: false,
    auto_close_delay: 10,
    start_time: '',
    end_time: '',
    template_config: {
      width: '500px',
      height: '400px',
      background_color: '#1e293b',
      text_color: '#ffffff',
      button_color: '#3b82f6',
      animation: 'fade'
    }
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [statusFilter])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/announcements?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setAnnouncements(result.data.announcements)
        if (result.data.stats) {
          setStats(result.data.stats)
        }
      } else {
        console.error('获取公告失败:', result.error)
      }
    } catch (error) {
      console.error('获取公告失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      status: 'draft',
      target_type: 'all',
      target_users: [],
      template_style: 'modal',
      auto_close: false,
      auto_close_delay: 10,
      start_time: '',
      end_time: '',
      template_config: {
        width: '500px',
        height: '400px',
        background_color: '#1e293b',
        text_color: '#ffffff',
        button_color: '#3b82f6',
        animation: 'fade'
      }
    })
    setSelectedTemplate(null)
    setEditingAnnouncement(null)
    setShowCreateModal(false)
    setShowTemplateSelector(false)
  }

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      template_config: {
        ...template.config,
        template_id: template.config.template_id
      }
    }))
    setShowTemplateSelector(false)
  }

  const handleOpenCreate = () => {
    resetForm()
    setEditingAnnouncement(null)
    setShowCreateModal(true)
  }

  const handleOpenEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      status: announcement.status,
      target_type: announcement.target_type,
      target_users: announcement.target_users || [],
      template_style: announcement.template_style,
      auto_close: announcement.auto_close,
      auto_close_delay: announcement.auto_close_delay || 10,
      start_time: announcement.start_time ? new Date(announcement.start_time).toISOString().slice(0, 16) : '',
      end_time: announcement.end_time ? new Date(announcement.end_time).toISOString().slice(0, 16) : '',
      template_config: announcement.template_config
    })
    setEditingAnnouncement(announcement)
    setShowCreateModal(true)
    setShowTemplateSelector(false)
  }

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null
      }

      let response
      if (editingAnnouncement) {
        response = await fetch('/api/announcements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAnnouncement.id, ...payload })
        })
      } else {
        response = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const result = await response.json()
      if (result.success) {
        setShowCreateModal(false)
        resetForm()
        fetchAnnouncements()
        alert(editingAnnouncement ? '公告更新成功!' : '公告创建成功!')
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      console.error('保存公告失败:', error)
      alert('保存失败，请重试')
    }
  }

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('确定要删除这条公告吗？')) return

    try {
      const response = await fetch('/api/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      const result = await response.json()
      if (result.success) {
        fetchAnnouncements()
        alert('公告删除成功!')
      } else {
        alert(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除公告失败:', error)
      alert('删除失败，请重试')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-500',
      published: 'bg-green-500',
      scheduled: 'bg-blue-500',
      expired: 'bg-red-500'
    }
    const labels = {
      draft: '草稿',
      published: '已发布',
      scheduled: '定时发布',
      expired: '已过期'
    }
    return (
      <Badge className={`${styles[status as keyof typeof styles]} text-white`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    const labels = {
      low: '低',
      normal: '普通',
      high: '高',
      urgent: '紧急'
    }
    return (
      <Badge className={styles[priority as keyof typeof styles]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">公告管理</h1>
        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          创建公告
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">总公告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">已发布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.published}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">草稿</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.draft}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">总浏览量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.totalViews}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">总点击量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.totalClicks}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜索公告..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
        >
          <option value="all">所有状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="scheduled">定时发布</option>
          <option value="expired">已过期</option>
        </select>
        
        <Button onClick={fetchAnnouncements} variant="outline" className="border-slate-600 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 公告列表 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">login...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-8 text-center text-slate-400">®</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-600">
                  <tr className="text-left">
                    <th className="p-4 font-medium text-slate-300">标题</th>
                    <th className="p-4 font-medium text-slate-300">状态</th>
                    <th className="p-4 font-medium text-slate-300">优先级</th>
                    <th className="p-4 font-medium text-slate-300">目标</th>
                    <th className="p-4 font-medium text-slate-300">模板</th>
                    <th className="p-4 font-medium text-slate-300">浏览/点击</th>
                    <th className="p-4 font-medium text-slate-300">创建时间</th>
                    <th className="p-4 font-medium text-slate-300">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnnouncements.map((announcement) => (
                    <tr key={announcement.id} className="border-b border-slate-700 hover:bg-slate-750">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-white">{announcement.title}</div>
                          <div className="text-sm text-slate-400 truncate max-w-xs">
                            {announcement.content}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(announcement.status)}</td>
                      <td className="p-4">{getPriorityBadge(announcement.priority)}</td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-white">
                            {announcement.target_type === 'all' ? '全部用户' : 
                             announcement.target_type === 'specific' ? '指定用户' : '用户群组'}
                          </div>
                          {announcement.target_type === 'specific' && announcement.target_users && (
                            <div className="text-slate-400 text-xs truncate max-w-xs">
                              {announcement.target_users.join(', ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {announcement.template_config?.template_id ? (
                            <>
                              <Image className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-blue-400">视觉模板</span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">默认</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {announcement.view_count} / {announcement.click_count}
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {formatDate(announcement.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(announcement)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* 创建/编辑弹窗 */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingAnnouncement ? '编辑公告' : '创建公告'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAnnouncement} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧 - 基本信息 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">标题 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="content">内容 *</Label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    placeholder="请输入公告内容..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">优先级</Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    >
                      <option value="low">低</option>
                      <option value="normal">普通</option>
                      <option value="high">高</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="status">状态</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    >
                      <option value="draft">草稿</option>
                      <option value="published">已发布</option>
                    </select>
                  </div>
                </div>

                {/* 目标用户设置 */}
                <div>
                  <Label>目标用户</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="all"
                          checked={formData.target_type === 'all'}
                          onChange={(e) => setFormData({ ...formData, target_type: 'all', target_users: [] })}
                          className="text-blue-500"
                        />
                        <span className="text-sm">全部用户</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="specific"
                          checked={formData.target_type === 'specific'}
                          onChange={(e) => setFormData({ ...formData, target_type: 'specific' })}
                          className="text-blue-500"
                        />
                        <span className="text-sm">指定用户</span>
                      </label>
                    </div>

                    {formData.target_type === 'specific' && (
                      <div>
                        <Input
                          placeholder="请输入用户地址（多个地址用逗号分隔）"
                          value={formData.target_users.join(', ')}
                          onChange={(e) => {
                            const addresses = e.target.value.split(',').map(addr => addr.trim()).filter(Boolean)
                            setFormData({ ...formData, target_users: addresses })
                          }}
                          className="bg-slate-700 border-slate-600 text-white text-xs"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          示例: 0x123...abc, 0x456...def
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 自动关闭设置 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto_close"
                      checked={formData.auto_close}
                      onChange={(e) => setFormData({ ...formData, auto_close: e.target.checked })}
                      className="text-blue-500"
                    />
                    <Label htmlFor="auto_close" className="text-sm">自动关闭</Label>
                  </div>

                  {formData.auto_close && (
                    <div>
                      <Label htmlFor="auto_close_delay" className="text-sm">延迟时间（秒）</Label>
                      <Input
                        id="auto_close_delay"
                        type="number"
                        min="5"
                        max="60"
                        value={formData.auto_close_delay}
                        onChange={(e) => setFormData({ ...formData, auto_close_delay: Number(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  )}
                </div>

                {/* 时间设置 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time" className="text-sm">开始时间</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                    />
                    <p className="text-xs text-slate-400 mt-1">留空则立即发送</p>
                  </div>

                  <div>
                    <Label htmlFor="end_time" className="text-sm">结束时间</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                    />
                    <p className="text-xs text-slate-400 mt-1">留空则不过期</p>
                  </div>
                </div>
              </div>

              {/* 右侧 - 模板选择 */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-lg">公告模板</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      {showTemplateSelector ? '隐藏模板' : '选择模板'}
                    </Button>
                  </div>

                  {/* 当前选择的模板预览 */}
                  {selectedTemplate && (
                    <div className="mb-4 p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedTemplate.preview_image}
                          alt={selectedTemplate.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <div>
                          <h4 className="font-medium text-sm">{selectedTemplate.name}</h4>
                          <p className="text-xs text-slate-400">{selectedTemplate.description}</p>
                          <Badge className="mt-1 text-xs">已选择</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 模板选择器 */}
                  {showTemplateSelector && (
                    <div className="max-h-96 overflow-y-auto">
                      <TemplateSelector
                        selectedTemplateId={selectedTemplate?.id}
                        onTemplateSelect={handleTemplateSelect}
                      />
                    </div>
                  )}
                </div>

                {/* 实时预览 */}
                {selectedTemplate && formData.title && formData.content && (
                  <div>
                    <Label className="text-sm mb-2 block">实时预览</Label>
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedTemplate.config.background_image}
                        alt="预览"
                        className="w-full h-48 object-contain"
                      />
                      
                      {/* 预览标题 */}
                      {selectedTemplate.config.title_area && (
                        <div
                          className="absolute flex items-center justify-center text-center"
                          style={{
                            left: selectedTemplate.config.title_area.x,
                            top: `calc(${selectedTemplate.config.title_area.y} * 0.6)`,
                            width: selectedTemplate.config.title_area.width,
                            height: `calc(${selectedTemplate.config.title_area.height} * 0.6)`,
                            color: selectedTemplate.config.title_color || '#000',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            lineHeight: '1.2'
                          }}
                        >
                          <div className="w-full px-1 truncate">
                            {formData.title}
                          </div>
                        </div>
                      )}

                      {/* 预览内容 */}
                      {selectedTemplate.config.content_area && (
                        <div
                          className="absolute flex items-start justify-center"
                          style={{
                            left: selectedTemplate.config.content_area.x,
                            top: `calc(${selectedTemplate.config.content_area.y} * 0.6)`,
                            width: selectedTemplate.config.content_area.width,
                            height: `calc(${selectedTemplate.config.content_area.height} * 0.6)`,
                            color: selectedTemplate.config.text_color || '#333',
                            fontSize: '10px',
                            lineHeight: '1.3'
                          }}
                        >
                          <div className="w-full px-1 text-center">
                            <div className="break-words line-clamp-3">
                              {formData.content.length > 50 
                                ? formData.content.substring(0, 50) + '...' 
                                : formData.content}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.title || !formData.content}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingAnnouncement ? '更新' : '创建'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 