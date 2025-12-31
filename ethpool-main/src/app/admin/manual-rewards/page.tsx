'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/hooks/useI18n'

interface User {
  id: number
  address: string
  usdt: number
  eth: number
  is_effective: number
  onchain_usdt_balance?: number
  error?: string
  success?: boolean
}

interface CustomReward {
  userId: number
  ethAmount: number
  type: 'add' | 'subtract'
  reason: string
}

interface RewardDetail {
  address: string
  rewardEth: number
  newEthBalance: number
  type: string
}

interface RewardResult {
  success: boolean
  message: string
  data: {
    rewards: RewardDetail[]
  }
}

export default function ManualRewardsPage() {
  const { t } = useI18n()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [queryLoading, setQueryLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [result, setResult] = useState<RewardResult | null>(null)
  const [customRewards, setCustomRewards] = useState<CustomReward[]>([])
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // 查询所有用户链上余额
  const queryAllBalances = async () => {
    setQueryLoading(true)
    try {
      const response = await fetch('/api/admin/get-all-user-balances')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data.users)
        setResult({
          success: true,
          message: `查询成功！共 ${data.data.summary.total} 个用户，成功 ${data.data.summary.success} 个，失败 ${data.data.summary.error} 个`,
          data: data.data
        })
      } else {
        setResult({
          success: false,
          message: data.message,
          error: data.error
        })
      }
    } catch (error) {
      console.error('查询失败:', error)
      setResult({
        success: false,
        message: '查询失败',
        error: error instanceof Error ? error.message : '未知错误'
      })
    } finally {
      setQueryLoading(false)
    }
  }

  // 发送奖励
  const sendRewards = async () => {
    if (selectedUsers.length === 0) {
      alert('请选择要发送奖励的用户')
      return
    }

    setSendLoading(true)
    try {
      const response = await fetch('/api/admin/manual-send-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          customRewards: customRewards.filter(cr => selectedUsers.includes(cr.userId))
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        // 重新查询余额
        await queryAllBalances()
        // 清空选择
        setSelectedUsers([])
        setCustomRewards([])
      }
    } catch (error) {
      console.error('发送奖励失败:', error)
      setResult({
        success: false,
        message: '发送奖励失败',
        error: error instanceof Error ? error.message : '未知错误'
      })
    } finally {
      setSendLoading(false)
    }
  }

  // 选择/取消选择用户
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
  }

  // 打开自定义奖励模态框
  const openCustomModal = (user: User) => {
    setEditingUser(user)
    setShowCustomModal(true)
  }

  // 保存自定义奖励
  const saveCustomReward = (customReward: CustomReward) => {
    setCustomRewards(prev => {
      const existing = prev.find(cr => cr.userId === customReward.userId)
      if (existing) {
        return prev.map(cr => cr.userId === customReward.userId ? customReward : cr)
      } else {
        return [...prev, customReward]
      }
    })
    setShowCustomModal(false)
    setEditingUser(null)
  }

  // 删除自定义奖励
  const removeCustomReward = (userId: number) => {
    setCustomRewards(prev => prev.filter(cr => cr.userId !== userId))
  }

  // 获取用户的奖励等级
  const getRewardTier = (balance: number) => {
    if (balance >= 200000) return { rate: 0.05, name: '5%' }
    if (balance >= 100000) return { rate: 0.04, name: '4%' }
    if (balance >= 10000) return { rate: 0.03, name: '3%' }
    if (balance >= 5000) return { rate: 0.025, name: '2.5%' }
    return { rate: 0.02, name: '2%' }
  }

  // 计算自动奖励
  const calculateAutoReward = (balance: number) => {
    const tier = getRewardTier(balance)
    const dailyReward = balance * tier.rate
    const singleReward = dailyReward / 4
    return singleReward / 2500 // ETH价格
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          手动发送奖励管理
        </h1>

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">操作面板</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={queryAllBalances}
              disabled={queryLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {queryLoading ? '查询中...' : '一键查询所有授权地址链上USDT余额'}
            </button>
            
            <button
              onClick={sendRewards}
              disabled={sendLoading || selectedUsers.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {sendLoading ? '发送中...' : `一键发送奖励 (${selectedUsers.length} 个用户)`}
            </button>
            
            <button
              onClick={toggleSelectAll}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              {selectedUsers.length === users.length ? '取消全选' : '全选'}
            </button>
          </div>
        </div>

        {/* 执行结果 */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">执行结果</h2>
            <div className={`p-4 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="font-medium mb-2">
                {result.success ? '✅ 执行成功' : '❌ 执行失败'}
              </div>
              <div className="text-sm text-gray-600 mb-2">{result.message}</div>
              {result.data && (
                <div className="text-sm">
                  {result.data.summary && (
                    <div>
                      <div>总用户数: {result.data.summary.total}</div>
                      <div>成功: {result.data.summary.success}</div>
                      <div>失败: {result.data.summary.error}</div>
                    </div>
                  )}
                  {result.data.rewards && result.data.rewards.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium">奖励详情:</div>
                      <div className="max-h-40 overflow-y-auto">
                        {result.data.rewards.map((reward: RewardDetail, index: number) => (
                          <div key={index} className="text-xs bg-gray-100 p-2 rounded mt-1">
                            <div>用户: {reward.address}</div>
                            <div>奖励: {reward.rewardEth} ETH</div>
                            <div>新余额: {reward.newEthBalance} ETH</div>
                            <div>类型: {reward.type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 用户列表 */}
        {users.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">授权用户列表</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-2 text-left">用户ID</th>
                    <th className="px-4 py-2 text-left">地址</th>
                    <th className="px-4 py-2 text-left">链上USDT余额</th>
                    <th className="px-4 py-2 text-left">数据库USDT余额</th>
                    <th className="px-4 py-2 text-left">当前ETH余额</th>
                    <th className="px-4 py-2 text-left">奖励等级</th>
                    <th className="px-4 py-2 text-left">自动奖励ETH</th>
                    <th className="px-4 py-2 text-left">自定义奖励</th>
                    <th className="px-4 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSelected = selectedUsers.includes(user.id)
                    const customReward = customRewards.find(cr => cr.userId === user.id)
                    const autoReward = user.onchain_usdt_balance ? calculateAutoReward(user.onchain_usdt_balance) : 0
                    const tier = user.onchain_usdt_balance ? getRewardTier(user.onchain_usdt_balance) : null
                    
                    return (
                      <tr key={user.id} className={`border-b ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleUserSelection(user.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-2 font-mono text-sm">{user.id}</td>
                        <td className="px-4 py-2 font-mono text-sm">
                          {user.address.slice(0, 10)}...{user.address.slice(-8)}
                        </td>
                        <td className="px-4 py-2">
                          {user.success ? (
                            <span className="text-green-600 font-semibold">
                              {user.onchain_usdt_balance?.toFixed(6)} USDT
                            </span>
                          ) : (
                            <span className="text-red-600">
                              {user.error || '查询失败'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">{user.usdt?.toFixed(6) || '0'} USDT</td>
                        <td className="px-4 py-2">{user.eth?.toFixed(6) || '0'} ETH</td>
                        <td className="px-4 py-2">
                          {tier ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {tier.name}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {user.success ? (
                            <span className="text-green-600 font-semibold">
                              {autoReward.toFixed(8)} ETH
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {customReward ? (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                customReward.type === 'add' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {customReward.type === 'add' ? '+' : '-'} {Math.abs(customReward.ethAmount)} ETH
                              </span>
                              <button
                                onClick={() => removeCustomReward(user.id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                删除
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openCustomModal(user)}
                              className="text-blue-500 hover:text-blue-700 text-xs"
                            >
                              设置自定义
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => openCustomModal(user)}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            调整奖励
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 自定义奖励模态框 */}
        {showCustomModal && editingUser && (
          <CustomRewardModal
            user={editingUser}
            onSave={saveCustomReward}
            onClose={() => {
              setShowCustomModal(false)
              setEditingUser(null)
            }}
            existingReward={customRewards.find(cr => cr.userId === editingUser.id)}
          />
        )}
      </div>
    </div>
  )
}

// 自定义奖励模态框组件
function CustomRewardModal({ 
  user, 
  onSave, 
  onClose, 
  existingReward 
}: { 
  user: User
  onSave: (reward: CustomReward) => void
  onClose: () => void
  existingReward?: CustomReward
}) {
  const [ethAmount, setEthAmount] = useState(existingReward?.ethAmount || 0)
  const [type, setType] = useState<'add' | 'subtract'>(existingReward?.type || 'add')
  const [reason, setReason] = useState(existingReward?.reason || '')

  const handleSave = () => {
    if (ethAmount <= 0) {
      alert('请输入有效的ETH数量')
      return
    }
    if (!reason.trim()) {
      alert('请输入调整原因')
      return
    }

    onSave({
      userId: user.id,
      ethAmount: type === 'subtract' ? -ethAmount : ethAmount,
      type,
      reason: reason.trim()
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          自定义奖励调整 - 用户 {user.id}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              地址
            </label>
            <div className="text-sm text-gray-600 font-mono">
              {user.address}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              当前ETH余额
            </label>
            <div className="text-sm text-gray-600">
              {user.eth?.toFixed(6) || '0'} ETH
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              调整类型
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'add' | 'subtract')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="add">增加奖励</option>
              <option value="subtract">减少奖励</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ETH数量
            </label>
            <input
              type="number"
              step="0.000001"
              value={ethAmount}
              onChange={(e) => setEthAmount(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="请输入ETH数量"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              调整原因
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="请输入调整原因"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
