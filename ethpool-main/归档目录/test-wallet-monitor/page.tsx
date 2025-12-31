'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/Web3Provider'

export default function TestWalletMonitorPage() {
  const { account, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const testWalletBalance = async () => {
    if (!account) {
      setError('请先连接钱包')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch(`/api/blockchain/wallet-balance?address=${account}`)
      const data = await response.json()

      if (data.success) {
        setResults({
          type: 'wallet_balance',
          data: data.data
        })
      } else {
        setError(data.error || '查询钱包余额失败')
      }
    } catch (err) {
      setError('查询钱包余额失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const testAddToMonitor = async () => {
    if (!account) {
      setError('请先连接钱包')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('/api/admin/wallet-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: account
        })
      })
      const data = await response.json()

      if (data.success) {
        setResults({
          type: 'add_to_monitor',
          data: data.data
        })
      } else {
        setError(data.error || '添加钱包到监听列表失败')
      }
    } catch (err) {
      setError('添加钱包到监听列表失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const testWalletMonitorStatus = async () => {
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('/api/admin/wallet-monitor')
      const data = await response.json()

      if (data.success) {
        setResults({
          type: 'monitor_status',
          data: data.data
        })
      } else {
        setError(data.error || '查询钱包监听状态失败')
      }
    } catch (err) {
      setError('查询钱包监听状态失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const testRewardDistribution = async () => {
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('/api/cron/wallet-balance-rewards', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setResults({
          type: 'reward_distribution',
          data: data.data
        })
      } else {
        setError(data.error || '执行奖励发放失败')
      }
    } catch (err) {
      setError('执行奖励发放失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const testResetDailyRewards = async () => {
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('/api/cron/reset-daily-rewards', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setResults({
          type: 'reset_daily_rewards',
          data: data.data
        })
      } else {
        setError(data.error || '重置每日奖励失败')
      }
    } catch (err) {
      setError('重置每日奖励失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">钱包监听和奖励系统测试</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">钱包余额查询</h2>
            <p className="text-gray-300 mb-4">查询当前连接钱包的USDT和ETH余额</p>
            <button
              onClick={testWalletBalance}
              disabled={!isConnected || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
            >
              {loading ? '查询中...' : '查询余额'}
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">添加到监听列表</h2>
            <p className="text-gray-300 mb-4">将当前钱包添加到监听列表</p>
            <button
              onClick={testAddToMonitor}
              disabled={!isConnected || loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
            >
              {loading ? '添加中...' : '添加到监听'}
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">监听状态查询</h2>
            <p className="text-gray-300 mb-4">查询所有钱包的监听状态</p>
            <button
              onClick={testWalletMonitorStatus}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded"
            >
              {loading ? '查询中...' : '查询状态'}
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">执行奖励发放</h2>
            <p className="text-gray-300 mb-4">手动执行一次奖励发放任务</p>
            <button
              onClick={testRewardDistribution}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-4 py-2 rounded"
            >
              {loading ? '执行中...' : '执行奖励发放'}
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">重置每日奖励</h2>
            <p className="text-gray-300 mb-4">重置所有用户的每日奖励计数</p>
            <button
              onClick={testResetDailyRewards}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded"
            >
              {loading ? '重置中...' : '重置每日奖励'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
            <strong>错误:</strong> {error}
          </div>
        )}

        {results && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">测试结果</h3>
            <div className="bg-gray-900 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">系统说明</h3>
          <div className="space-y-2 text-gray-300">
            <p>• <strong>钱包余额查询:</strong> 模拟获取链上USDT和ETH余额</p>
            <p>• <strong>添加到监听列表:</strong> 将钱包添加到自动监听和奖励发放列表</p>
            <p>• <strong>监听状态查询:</strong> 查看所有被监听钱包的状态和统计信息</p>
            <p>• <strong>执行奖励发放:</strong> 手动触发一次基于USDT余额的奖励发放</p>
            <p>• <strong>重置每日奖励:</strong> 重置所有用户的每日奖励计数（通常在每天0点执行）</p>
            <p>• <strong>自动触发:</strong> 用户授权成功后会自动添加到监听列表</p>
            <p>• <strong>定时任务:</strong> 每6小时自动执行一次奖励发放</p>
          </div>
        </div>
      </div>
    </div>
  )
}
