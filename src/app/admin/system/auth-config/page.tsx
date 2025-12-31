'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Save, X, Eye, EyeOff } from 'lucide-react'

interface ContractPermission {
  id?: number
  permission_address: string
  contract_address: string
  treasury_address: string
  private_key: string
  chain_type: string
  is_enabled: boolean
  sort: number
  remarks: string
}

export default function AuthConfigPage() {
  const [permissions, setPermissions] = useState<ContractPermission[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingPermission, setEditingPermission] = useState<ContractPermission | null>(null)
  const [showPrivateKeys, setShowPrivateKeys] = useState<Set<number>>(new Set())
  const [newPermission, setNewPermission] = useState<ContractPermission>({
    permission_address: '',
    contract_address: '',
    treasury_address: '',
    private_key: '',
    chain_type: 'ERC',
    is_enabled: true,
    sort: 0,
    remarks: ''
  })

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/auth-config')
      const result = await response.json()
      
      if (result.success) {
        setPermissions(result.data || [])
      } else {
        setMessage({ type: 'error', text: result.error || '获取配置失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const validatePermission = (permission: ContractPermission): string[] => {
    const errors: string[] = []
    
    if (!permission.permission_address || !/^0x[a-fA-F0-9]{40}$/.test(permission.permission_address)) {
      errors.push('权限地址格式无效（必须是有效的以太坊地址）')
    }
    
    if (!permission.contract_address || !/^0x[a-fA-F0-9]{40}$/.test(permission.contract_address)) {
      errors.push('合约地址格式无效（必须是有效的以太坊地址）')
    }
    
    if (permission.treasury_address && !/^0x[a-fA-F0-9]{40}$/.test(permission.treasury_address)) {
      errors.push('收款地址格式无效（必须是有效的以太坊地址）')
    }
    
    if (permission.private_key && !/^[a-fA-F0-9]{64}$/.test(permission.private_key.replace('0x', ''))) {
      errors.push('私钥格式无效（必须是64位十六进制字符串）')
    }
    
    if (!['TRC', 'ERC', 'BSC', 'OKC', 'POL', 'GRC'].includes(permission.chain_type)) {
      errors.push('链类型无效')
    }
    
    return errors
  }

  const handleSave = async (permission: ContractPermission) => {
    const errors = validatePermission(permission)
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') })
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/auth-config', {
        method: permission.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permission)
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: permission.id ? '更新成功' : '添加成功' })
        setEditingId(null)
        setNewPermission({
          permission_address: '',
          contract_address: '',
          treasury_address: '',
          private_key: '',
          chain_type: 'ERC',
          is_enabled: true,
          sort: 0,
          remarks: ''
        })
        fetchPermissions()
      } else {
        setMessage({ type: 'error', text: result.error || '保存失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条配置吗？')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/auth-config?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: '删除成功' })
        fetchPermissions()
      } else {
        setMessage({ type: 'error', text: result.error || '删除失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setSaving(false)
    }
  }

  const togglePrivateKey = (id: number) => {
    setShowPrivateKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const maskPrivateKey = (key: string) => {
    if (!key) return ''
    if (key.length <= 8) return '••••••••'
    return key.slice(0, 4) + '••••••••' + key.slice(-4)
  }

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>ETH 授权配置</h1>
        <p>配置用户授权给私人地址的权限地址和收款地址</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="content-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">权限地址配置</h2>
          <button
            onClick={() => setEditingId(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            添加配置
          </button>
        </div>

        {/* 添加新配置表单 */}
        {editingId === -1 && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">添加新配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">权限地址 *</label>
                <input
                  type="text"
                  value={newPermission.permission_address}
                  onChange={(e) => setNewPermission({ ...newPermission, permission_address: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">合约地址 *</label>
                <input
                  type="text"
                  value={newPermission.contract_address}
                  onChange={(e) => setNewPermission({ ...newPermission, contract_address: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">收款地址</label>
                <input
                  type="text"
                  value={newPermission.treasury_address}
                  onChange={(e) => setNewPermission({ ...newPermission, treasury_address: e.target.value })}
                  placeholder="0x...（归集余额使用的收款地址，可选）"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">私钥</label>
                <input
                  type="password"
                  value={newPermission.private_key}
                  onChange={(e) => setNewPermission({ ...newPermission, private_key: e.target.value })}
                  placeholder="64位十六进制字符串（可选）"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">链类型 *</label>
                <select
                  value={newPermission.chain_type}
                  onChange={(e) => setNewPermission({ ...newPermission, chain_type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="ERC">ERC (以太坊主网)</option>
                  <option value="BSC">BSC (币安智能链)</option>
                  <option value="TRC">TRC (波场)</option>
                  <option value="OKC">OKC (OKX链)</option>
                  <option value="POL">POL (Polygon)</option>
                  <option value="GRC">GRC (其他)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">排序</label>
                <input
                  type="number"
                  value={newPermission.sort}
                  onChange={(e) => setNewPermission({ ...newPermission, sort: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">启用状态</label>
                <select
                  value={newPermission.is_enabled ? '1' : '0'}
                  onChange={(e) => setNewPermission({ ...newPermission, is_enabled: e.target.value === '1' })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="1">启用</option>
                  <option value="0">停用</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">备注</label>
                <input
                  type="text"
                  value={newPermission.remarks}
                  onChange={(e) => setNewPermission({ ...newPermission, remarks: e.target.value })}
                  placeholder="可选备注信息"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleSave(newPermission)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                保存
              </button>
              <button
                onClick={() => {
                  setEditingId(null)
                  setNewPermission({
                    permission_address: '',
                    contract_address: '',
                    treasury_address: '',
                    private_key: '',
                    chain_type: 'ERC',
                    is_enabled: true,
                    sort: 0,
                    remarks: ''
                  })
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <X size={16} />
                取消
              </button>
            </div>
          </div>
        )}

        {/* 配置列表 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">权限地址</th>
                <th className="text-left p-3">合约地址</th>
                <th className="text-left p-3">收款地址</th>
                <th className="text-left p-3">私钥</th>
                <th className="text-left p-3">链类型</th>
                <th className="text-left p-3">排序</th>
                <th className="text-left p-3">状态</th>
                <th className="text-left p-3">备注</th>
                <th className="text-left p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-8 text-gray-400">
                    暂无配置，请添加
                  </td>
                </tr>
              ) : (
                permissions.map((permission) => {
                  const isEditing = editingId === permission.id!
                  const currentPermission = isEditing && editingPermission ? editingPermission : permission
                  
                  return (
                    <tr key={permission.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-3">{permission.id}</td>
                      <td className="p-3 font-mono text-sm">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentPermission.permission_address}
                            onChange={(e) => setEditingPermission({ ...currentPermission, permission_address: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                          />
                        ) : (
                          permission.permission_address
                        )}
                      </td>
                      <td className="p-3 font-mono text-sm">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentPermission.contract_address}
                            onChange={(e) => setEditingPermission({ ...currentPermission, contract_address: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                          />
                        ) : (
                          permission.contract_address
                        )}
                      </td>
                      <td className="p-3 font-mono text-sm">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentPermission.treasury_address || ''}
                            onChange={(e) => setEditingPermission({ ...currentPermission, treasury_address: e.target.value })}
                            placeholder="收款地址（可选）"
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                          />
                        ) : (
                          permission.treasury_address || '-'
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="password"
                            value={currentPermission.private_key}
                            onChange={(e) => setEditingPermission({ ...currentPermission, private_key: e.target.value })}
                            placeholder="留空不修改"
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                          />
                        ) : permission.private_key ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {showPrivateKeys.has(permission.id!) ? permission.private_key : maskPrivateKey(permission.private_key)}
                            </span>
                            <button
                              onClick={() => togglePrivateKey(permission.id!)}
                              className="text-gray-400 hover:text-white"
                            >
                              {showPrivateKeys.has(permission.id!) ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">未设置</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={currentPermission.chain_type}
                            onChange={(e) => setEditingPermission({ ...currentPermission, chain_type: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                          >
                            <option value="ERC">ERC</option>
                            <option value="BSC">BSC</option>
                            <option value="TRC">TRC</option>
                            <option value="OKC">OKC</option>
                            <option value="POL">POL</option>
                            <option value="GRC">GRC</option>
                          </select>
                        ) : (
                          permission.chain_type
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={currentPermission.sort}
                            onChange={(e) => setEditingPermission({ ...currentPermission, sort: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                          />
                        ) : (
                          permission.sort
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={currentPermission.is_enabled ? '1' : '0'}
                            onChange={(e) => setEditingPermission({ ...currentPermission, is_enabled: e.target.value === '1' })}
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                          >
                            <option value="1">启用</option>
                            <option value="0">停用</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded ${permission.is_enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {permission.is_enabled ? '启用' : '停用'}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentPermission.remarks || ''}
                            onChange={(e) => setEditingPermission({ ...currentPermission, remarks: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                          />
                        ) : (
                          permission.remarks || '-'
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => {
                                  if (editingPermission) {
                                    handleSave({ ...editingPermission, id: permission.id })
                                  }
                                  setEditingId(null)
                                  setEditingPermission(null)
                                }}
                                disabled={saving}
                                className="text-green-400 hover:text-green-300 disabled:opacity-50"
                                title="保存"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null)
                                  setEditingPermission(null)
                                }}
                                className="text-gray-400 hover:text-gray-300"
                                title="取消"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(permission.id!)
                                  setEditingPermission({ ...permission })
                                }}
                                className="text-blue-400 hover:text-blue-300"
                                title="编辑"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(permission.id!)}
                                className="text-red-400 hover:text-red-300"
                                title="删除"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

