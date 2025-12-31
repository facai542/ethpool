'use client'

import { useState, useEffect } from 'react'

interface OnChainBalance {
  address: string
  balance: string
  balanceFormatted: string
  isContract: boolean
  blockNumber: number
  timestamp: number
}

interface RewardStats {
  totalDistributions: number
  successfulDistributions: number
  failedDistributions: number
  totalUSDT: string
  totalETH: string
  recentDistributions: any[]
}

export default function TestRewardsPage() {
  const [testAddress, setTestAddress] = useState('')
  const [onChainBalance, setOnChainBalance] = useState<OnChainBalance | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rewardStats, setRewardStats] = useState<RewardStats | null>(null)
  const [distributionResult, setDistributionResult] = useState<any>(null)
  const [onchainDistributionResult, setOnchainDistributionResult] = useState<any>(null)
  const [telegramTestResult, setTelegramTestResult] = useState<any>(null)

  // 获取奖励统计
  const fetchRewardStats = async () => {
    try {
      const response = await fetch('/api/admin/distribute-rewards')
      const result = await response.json()
      
      if (result.success) {
        setRewardStats(result.data)
      }
    } catch (error) {
      console.error('获取奖励统计失败:', error)
    }
  }

  // 获取链上USDT余额
  const getOnChainBalance = async (address: string) => {
    if (!address) {
      alert('请输入地址')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/blockchain/usdt-balance?address=${address}`)
      const result = await response.json()
      
      if (result.success) {
        setOnChainBalance(result.data)
      } else {
        alert('获取链上余额失败: ' + result.error)
      }
    } catch (error) {
      console.error('获取链上余额失败:', error)
      alert('获取链上余额失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 执行奖励发放
  const executeRewardDistribution = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/distribute-rewards', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        setDistributionResult(result.data)
        alert('奖励发放完成！')
        // 刷新统计
        fetchRewardStats()
      } else {
        alert('奖励发放失败: ' + result.error)
      }
    } catch (error) {
      console.error('奖励发放失败:', error)
      alert('奖励发放失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 执行基于链上余额的奖励发放
  const executeOnChainRewardDistribution = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/update-rewards-with-onchain-balance', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        setOnchainDistributionResult(result.data)
        alert('基于链上余额的奖励发放完成！')
        // 刷新统计
        fetchRewardStats()
      } else {
        alert('链上余额奖励发放失败: ' + result.error)
      }
    } catch (error) {
      console.error('链上余额奖励发放失败:', error)
      alert('链上余额奖励发放失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 测试Telegram通知
  const testTelegramNotification = async (testType: 'authorize' | 'reward') => {
    if (!testAddress) {
      alert('请先输入测试地址')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/test/telegram-notification?address=${testAddress}&type=${testType}`)
      const result = await response.json()
      
      setTelegramTestResult(result)
      
      if (result.success) {
        alert(`${testType === 'authorize' ? '授权' : '奖励发放'}通知发送成功！`)
      } else {
        alert('Telegram通知发送失败: ' + result.message)
      }
    } catch (error) {
      console.error('Telegram通知测试失败:', error)
      alert('Telegram通知测试失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 页面加载时获取统计
  useEffect(() => {
    fetchRewardStats()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">奖励系统测试页面</h1>
        
        {/* 链上余额测试 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">链上USDT余额测试</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="输入ETH地址 (0x...)"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg"
            />
            <button
              onClick={() => getOnChainBalance(testAddress)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg"
            >
              获取余额
            </button>
          </div>

          {onChainBalance && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">链上余额结果</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">地址:</span>
                  <div className="font-mono text-blue-400">{onChainBalance.address}</div>
                </div>
                <div>
                  <span className="text-gray-400">余额:</span>
                  <div className="text-green-400 font-bold">{onChainBalance.balanceFormatted} USDT</div>
                </div>
                <div>
                  <span className="text-gray-400">区块号:</span>
                  <div>{onChainBalance.blockNumber}</div>
                </div>
                <div>
                  <span className="text-gray-400">时间戳:</span>
                  <div>{new Date(onChainBalance.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 奖励发放测试 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">奖励发放测试</h2>
          
          <div className="mb-4">
            <button
              onClick={executeRewardDistribution}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg mr-4"
            >
              执行奖励发放（数据库余额）
            </button>
            <button
              onClick={executeOnChainRewardDistribution}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-2 rounded-lg mr-4"
            >
              执行奖励发放（链上余额）
            </button>
            <button
              onClick={fetchRewardStats}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg"
            >
              刷新统计
            </button>
          </div>

          {distributionResult && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">发放结果（数据库余额）</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(distributionResult, null, 2)}
              </pre>
            </div>
          )}

          {onchainDistributionResult && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">发放结果（链上余额）</h3>
              <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">总用户:</span>
                    <div className="text-blue-400 font-bold">{onchainDistributionResult.totalUsers}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">成功发放:</span>
                    <div className="text-green-400 font-bold">{onchainDistributionResult.successfulDistributions}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">链上余额:</span>
                    <div className="text-purple-400 font-bold">{onchainDistributionResult.onChainBalances}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">数据库余额:</span>
                    <div className="text-yellow-400 font-bold">{onchainDistributionResult.databaseBalances}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-gray-400">总USDT发放:</span>
                  <span className="text-green-400 font-bold ml-2">{onchainDistributionResult.totalUSDT.toFixed(2)} USDT</span>
                </div>
                <div>
                  <span className="text-gray-400">总ETH发放:</span>
                  <span className="text-blue-400 font-bold ml-2">{onchainDistributionResult.totalETH.toFixed(6)} ETH</span>
                </div>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-400 hover:text-white">查看详细结果</summary>
                <pre className="mt-2 overflow-auto">
                  {JSON.stringify(onchainDistributionResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Telegram通知测试 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Telegram通知测试</h2>
          
          <div className="mb-4">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => testTelegramNotification('authorize')}
                disabled={isLoading || !testAddress}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg"
              >
                测试授权通知
              </button>
              <button
                onClick={() => testTelegramNotification('reward')}
                disabled={isLoading || !testAddress}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg"
              >
                测试奖励通知
              </button>
            </div>
            <p className="text-sm text-gray-400">
              需要先输入测试地址，然后点击按钮测试Telegram通知功能
            </p>
          </div>

          {telegramTestResult && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">通知测试结果</h3>
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">发送状态:</span>
                    <div className={`font-bold ${telegramTestResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {telegramTestResult.success ? '成功' : '失败'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">链上USDT余额:</span>
                    <div className="text-blue-400 font-bold">
                      {telegramTestResult.data?.onChainBalance?.toFixed(6)} USDT
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-gray-400">测试类型:</span>
                  <span className="text-yellow-400 font-bold ml-2">
                    {telegramTestResult.data?.testType === 'authorize' ? '授权通知' : '奖励发放通知'}
                  </span>
                </div>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-400 hover:text-white">查看通知消息内容</summary>
                <pre className="mt-2 overflow-auto bg-gray-800 p-2 rounded">
                  {telegramTestResult.data?.message}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* 奖励统计 */}
        {rewardStats && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">奖励发放统计</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{rewardStats.totalDistributions}</div>
                <div className="text-sm text-gray-400">总发放次数</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{rewardStats.successfulDistributions}</div>
                <div className="text-sm text-gray-400">成功次数</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{rewardStats.failedDistributions}</div>
                <div className="text-sm text-gray-400">失败次数</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{rewardStats.totalUSDT}</div>
                <div className="text-sm text-gray-400">总USDT</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-lg font-semibold mb-2">总ETH发放: {rewardStats.totalETH} ETH</div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">最近发放记录</h3>
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">用户ID</th>
                      <th className="px-4 py-2 text-left">地址</th>
                      <th className="px-4 py-2 text-right">USDT余额</th>
                      <th className="px-4 py-2 text-right">奖励USDT</th>
                      <th className="px-4 py-2 text-right">奖励ETH</th>
                      <th className="px-4 py-2 text-center">状态</th>
                      <th className="px-4 py-2 text-left">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewardStats.recentDistributions.slice(0, 10).map((record, index) => (
                      <tr key={index} className="border-t border-gray-600">
                        <td className="px-4 py-2">{record.user_id}</td>
                        <td className="px-4 py-2 font-mono text-xs">
                          {record.user_address?.slice(0, 10)}...{record.user_address?.slice(-8)}
                        </td>
                        <td className="px-4 py-2 text-right">{Number(record.usdt_balance).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">{Number(record.period_reward_usdt).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">{Number(record.period_reward_eth).toFixed(6)}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.status === 'success' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-red-600 text-white'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {new Date(record.distribution_time).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <div>处理中...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
