'use client'

import { useState, useEffect } from 'react'

interface TeamMember {
  id: number
  address: string
  auth_address: string
  status: number
}

interface Announcement {
  id: number
  title: string
  content: string
  type: string
  target_users: string[]
  create_time: string
  status: number
}

export default function AgentAnnouncements() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 获取代理下的成员
      const membersResponse = await fetch('/api/agent/members')
      const membersData = await membersResponse.json()
      
      if (membersData.success) {
        setMembers(membersData.data.members || [])
      }

      // 获取代理发送的公告
      const announcementsResponse = await fetch('/api/agent/announcements')
      const announcementsData = await announcementsResponse.json()
      
      if (announcementsData.success) {
        setAnnouncements(announcementsData.data || [])
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMember = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(members.map(m => m.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容')
      return
    }

    if (selectedMembers.length === 0) {
      alert('请选择接收公告的用户')
      return
    }

    try {
      const response = await fetch('/api/agent/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          targetUsers: selectedMembers
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('公告发送成功')
        setShowCreateForm(false)
        setFormData({ title: '', content: '', type: 'info' })
        setSelectedMembers([])
        fetchData()
      } else {
        alert(result.error || '发送失败')
      }
    } catch (error) {
      console.error('发送公告失败:', error)
      alert('发送失败，请重试')
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return { text: '信息', color: 'bg-blue-500' }
      case 'warning': return { text: '警告', color: 'bg-yellow-500' }
      case 'urgent': return { text: '紧急', color: 'bg-red-500' }
      default: return { text: '通知', color: 'bg-gray-500' }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">公告管理</h1>
          <p className="text-gray-400 mt-1">向您的代理用户发送公告通知</p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
        >
          <span className="mr-2">📢</span>
          发送公告
        </button>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">代理用户</h3>
              <p className="text-2xl font-bold text-white">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 mr-4">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">活跃用户</h3>
              <p className="text-2xl font-bold text-white">{members.filter(m => m.status === 1).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 mr-4">
              <span className="text-2xl">📢</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">已发公告</h3>
              <p className="text-2xl font-bold text-white">{announcements.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 创建公告表单 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">发送公告</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 公告信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    公告标题
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入公告标题"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    公告类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="选择公告类型"
                  >
                    <option value="info">信息通知</option>
                    <option value="warning">警告通知</option>
                    <option value="urgent">紧急通知</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    公告内容
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入公告内容"
                    required
                  />
                </div>
              </div>

              {/* 用户选择 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-300">
                    选择接收用户 ({selectedMembers.length}/{members.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {selectedMembers.length === members.length ? '取消全选' : '全选'}
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto bg-gray-700 rounded-lg p-4 space-y-2">
                  {members.map((member) => (
                    <label key={member.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleSelectMember(member.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm text-white">
                          {member.address ? 
                            `${member.address.slice(0, 6)}...${member.address.slice(-4)}` :
                            `用户${member.id}`
                          }
                        </div>
                        <div className="text-xs text-gray-400">
                          状态: {member.status === 1 ? '正常' : '待激活'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  发送公告
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 已发送的公告列表 */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">已发送公告</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  接收用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  发送时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {announcements.length > 0 ? (
                announcements.map((announcement) => {
                  const typeInfo = getTypeLabel(announcement.type)
                  
                  return (
                    <tr key={announcement.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{announcement.title}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">
                            {announcement.content}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${typeInfo.color}`}>
                          {typeInfo.text}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {announcement.target_users.length} 位用户
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {new Date(announcement.create_time).toLocaleString('zh-CN')}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-400 text-sm">已发送</span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    暂无发送记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 
 
 