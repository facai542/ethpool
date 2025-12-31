'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Check, X, Copy, Eye, EyeOff } from 'lucide-react'

interface Agent {
  id: number
  agent_code: string
  agent_name: string
  user_address: string
  password: string
  level: number
  status: string
  commission_rate: number
  referral_code: string
  invite_link: string
  total_invites: number
  valid_invites: number
  total_commission: number
  created_at: string
}

export default function AgentsManagePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState<{[key: number]: boolean}>({})
  const [copiedField, setCopiedField] = useState('')
  const [formData, setFormData] = useState({
    agent_code: '',
    agent_name: '',
    user_address: '',
    password: '',
    level: 1,
    commission_rate: 0.05
  })

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/agents')
      const data = await response.json()
      
      if (data.success) {
        setAgents(data.agents || [])
      }
    } catch (error) {
      console.error('获取代理列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.agent_code || !formData.agent_name || !formData.password) {
      alert('请填写完整信息')
      return
    }

    try {
      const response = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        setAgents([data.agent, ...agents])
        setShowAddForm(false)
        setFormData({
          agent_code: '',
          agent_name: '',
          user_address: '',
          password: '',
          level: 1,
          commission_rate: 0.05
        })
        alert('添加成功')
      } else {
        alert('添加失败: ' + data.error)
      }
    } catch (error) {
      console.error('添加代理失败:', error)
      alert('添加失败，请重试')
    }
  }

  const handleUpdate = async (id: number) => {
    try {
      const agent = agents.find(a => a.id === id)
      if (!agent) return

      const response = await fetch('/api/admin/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: id,
          agent_name: agent.agent_name,
          user_address: agent.user_address,
          level: agent.level,
          commission_rate: agent.commission_rate,
          status: agent.status
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setEditingAgent(null)
        alert('更新成功')
      } else {
        alert('更新失败: ' + data.error)
      }
    } catch (error) {
      console.error('更新代理失败:', error)
      alert('更新失败，请重试')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个代理吗？')) return

    try {
      const response = await fetch(`/api/admin/agents?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        setAgents(agents.filter(a => a.id !== id))
        alert('删除成功')
      } else {
        alert('删除失败: ' + data.error)
      }
    } catch (error) {
      console.error('删除代理失败:', error)
      alert('删除失败，请重试')
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const togglePasswordVisibility = (id: number) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredAgents = agents.filter(agent => 
    agent.agent_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">代理管理</h1>
          <p className="text-slate-400">管理所有代理账号</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          添加代理
        </button>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">添加新代理</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">代理账号 *</label>
              <input
                type="text"
                value={formData.agent_code}
                onChange={(e) => setFormData({ ...formData, agent_code: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="代理账号"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">代理名称 *</label>
              <input
                type="text"
                value={formData.agent_name}
                onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="代理名称"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">钱包地址</label>
              <input
                type="text"
                value={formData.user_address}
                onChange={(e) => setFormData({ ...formData, user_address: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">登录密码 *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="登录密码"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">代理等级</label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: Number.parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">佣金比例 (%)</label>
              <input
                type="number"
                value={formData.commission_rate * 100}
                onChange={(e) => setFormData({ ...formData, commission_rate: Number.parseFloat(e.target.value) / 100 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              确认添加
            </button>
          </div>
        </div>
      )}

      {/* 搜索 */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索代理..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 代理列表 */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">代理账号</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">代理名称</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">邀请码</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">邀请链接</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">邀请人数</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">有效用户</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">佣金比例</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">状态</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="py-3 px-4 text-white">#{agent.id}</td>
                  <td className="py-3 px-4 text-white">{agent.agent_code}</td>
                  <td className="py-3 px-4 text-white">{agent.agent_name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-mono">{agent.referral_code}</span>
                      <button
                        onClick={() => copyToClipboard(agent.referral_code, `ref-${agent.id}`)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedField === `ref-${agent.id}` ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm truncate max-w-[150px]">{agent.invite_link}</span>
                      <button
                        onClick={() => copyToClipboard(agent.invite_link, `link-${agent.id}`)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedField === `link-${agent.id}` ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">{agent.total_invites}</td>
                  <td className="py-3 px-4 text-white">{agent.valid_invites}</td>
                  <td className="py-3 px-4 text-white">{(agent.commission_rate * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      agent.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {agent.status === 'active' ? '活跃' : '禁用'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAgents.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              {searchTerm ? '未找到匹配的代理' : '暂无代理数据'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

