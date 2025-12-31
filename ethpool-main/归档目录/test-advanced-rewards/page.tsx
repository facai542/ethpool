'use client'

import { useState } from 'react'
import { useI18n } from '@/hooks/useI18n'

interface RewardTier {
  id: number
  tier_name: string
  min_balance: number
  max_balance: number
  daily_rate: number
  is_active: boolean
}

interface RewardRecord {
  id: number
  user_id: number
  user_address: string
  onchain_usdt_balance: number
  daily_reward_usdt: number
  single_reward_usdt: number
  eth_price_usdt: number
  reward_eth: number
  distribution_time: string
  is_distributed: boolean
  created_at: string
}

export default function TestAdvancedRewards() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [tiers, setTiers] = useState<RewardTier[]>([])
  const [rewards, setRewards] = useState<RewardRecord[]>([])

  const testRewardDistribution = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/distribute-advanced-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        // 重新获取奖励记录
        await fetchRewardRecords()
      }
    } catch (error) {
      console.error('测试失败:', error)
      setResult({ success: false, error: error instanceof Error ? error.message : '未知错误' })
    } finally {
      setLoading(false)
    }
  }

  const testOnchainRewardDistribution = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/distribute-rewards-with-onchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        // 重新获取奖励记录
        await fetchRewardRecords()
      }
    } catch (error) {
      console.error('测试失败:', error)
      setResult({ success: false, error: error instanceof Error ? error.message : '未知错误' })
    } finally {
      setLoading(false)
    }
  }

  const fetchRewardRecords = async () => {
    try {
      const response = await fetch('/api/admin/distribute-advanced-rewards')
      const data = await response.json()
      
      if (data.success) {
        setTiers(data.data.tiers || [])
        setRewards(data.data.rewards || [])
      }
    } catch (error) {
      console.error('获取奖励记录失败:', error)
    }
  }

  const calculateReward = (balance: number, rate: number) => {
    const dailyReward = balance * rate
    const singleReward = dailyReward / 4
    return {
      daily: dailyReward.toFixed(6),
      single: singleReward.toFixed(6)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          高级奖励系统测试
        </h1>

        {/* 奖励等级配置 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">奖励等级配置</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">等级</th>
                  <th className="px-4 py-2 text-left">最小余额</th>
                  <th className="px-4 py-2 text-left">最大余额</th>
                  <th className="px-4 py-2 text-left">奖励比例</th>
                  <th className="px-4 py-2 text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="border-b">
                    <td className="px-4 py-2">{tier.tier_name}</td>
                    <td className="px-4 py-2">{tier.min_balance.toLocaleString()} USDT</td>
                    <td className="px-4 py-2">
                      {tier.max_balance === 999999999 ? '无限制' : tier.max_balance.toLocaleString() + ' USDT'}
                    </td>
                    <td className="px-4 py-2">{(tier.daily_rate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tier.is_active ? '激活' : '禁用'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 奖励计算示例 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">奖励计算示例</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1000, 6000, 11000, 150000, 250000].map((balance) => {
              const tier = tiers.find(t => balance >= t.min_balance && balance <= t.max_balance)
              const reward = tier ? calculateReward(balance, tier.daily_rate) : { daily: '0', single: '0' }
              
              return (
                <div key={balance} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{balance.toLocaleString()} USDT</h3>
                  <div className="space-y-1 text-sm">
                    <div>等级: {tier?.tier_name || 'N/A'}</div>
                    <div>比例: {tier ? (tier.daily_rate * 100).toFixed(1) + '%' : 'N/A'}</div>
                    <div>每日奖励: {reward.daily} USDT</div>
                    <div>单次奖励: {reward.single} USDT</div>
                    <div>单次ETH: {(parseFloat(reward.single) / 2500).toFixed(6)} ETH</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 测试按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">测试奖励发放</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={testRewardDistribution}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
              >
                {loading ? '执行中...' : '执行奖励发放 (数据库余额)'}
              </button>
              
              <button
                onClick={testOnchainRewardDistribution}
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
              >
                {loading ? '执行中...' : '执行奖励发放 (链上余额)'}
              </button>
              
              <button
                onClick={fetchRewardRecords}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                刷新奖励记录
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>数据库余额版本:</strong> 使用用户数据库中的USDT余额计算奖励</p>
              <p><strong>链上余额版本:</strong> 实时获取用户链上USDT余额计算奖励 (推荐)</p>
            </div>
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
                  <div>影响用户数: {result.data.affectedUsers}</div>
                  {result.data.rewards && result.data.rewards.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium">奖励详情:</div>
                      <div className="max-h-40 overflow-y-auto">
                        {result.data.rewards.map((reward: any, index: number) => (
                          <div key={index} className="text-xs bg-gray-100 p-2 rounded mt-1">
                            <div>用户: {reward.user_address}</div>
                            <div>余额: {reward.onchain_balance} USDT</div>
                            <div>奖励: {reward.reward_eth} ETH</div>
                            <div>等级: {reward.tier_description}</div>
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

        {/* 奖励记录 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">奖励发放记录</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">用户地址</th>
                  <th className="px-4 py-2 text-left">链上余额</th>
                  <th className="px-4 py-2 text-left">单次奖励</th>
                  <th className="px-4 py-2 text-left">ETH奖励</th>
                  <th className="px-4 py-2 text-left">发放时间</th>
                  <th className="px-4 py-2 text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward) => (
                  <tr key={reward.id} className="border-b">
                    <td className="px-4 py-2 font-mono text-sm">
                      {reward.user_address.slice(0, 10)}...{reward.user_address.slice(-8)}
                    </td>
                    <td className="px-4 py-2">{reward.onchain_usdt_balance.toFixed(2)} USDT</td>
                    <td className="px-4 py-2">{reward.single_reward_usdt.toFixed(2)} USDT</td>
                    <td className="px-4 py-2">{reward.reward_eth.toFixed(6)} ETH</td>
                    <td className="px-4 py-2">
                      {new Date(reward.distribution_time).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        reward.is_distributed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reward.is_distributed ? '已发放' : '待发放'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
