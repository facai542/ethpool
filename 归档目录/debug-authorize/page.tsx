'use client'

import { useState, useEffect } from 'react'
// import { useI18n } from '@/hooks/useI18n'

interface DebugResult {
  step: string
  success: boolean
  message: string
  data?: any
  error?: string
  timestamp: string
}

interface UserData {
  id: number
  address: string
  auth_address: string
  is_effective: number
  approved: number
  has_received_eth_reward: boolean
  eth: number
  usdt: number
  cash: number
  add_time: string
  update_time: string
}

interface TransactionRecord {
  id: number
  type: string
  amount: string
  remark: string
  description: string
  create_time: string
  status: string
}

export default function DebugAuthorizePage() {
  // const { t } = useI18n()
  const [testAddress, setTestAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debugResults, setDebugResults] = useState<DebugResult[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactionRecords, setTransactionRecords] = useState<TransactionRecord[]>([])
  const [ethPrice, setEthPrice] = useState<number>(0)

  // 生成随机测试地址
  const generateTestAddress = () => {
    const address = '0x' + Math.random().toString(16).substr(2, 40)
    setTestAddress(address)
  }

  // 添加调试结果
  const addDebugResult = (step: string, success: boolean, message: string, data?: any, error?: string) => {
    const result: DebugResult = {
      step,
      success,
      message,
      data,
      error,
      timestamp: new Date().toLocaleString()
    }
    setDebugResults(prev => [...prev, result])
  }

  // 获取ETH价格
  const fetchEthPrice = async () => {
    try {
      const response = await fetch('/api/test/eth-price')
      if (response.ok) {
        const result = await response.json()
        setEthPrice(result.data?.prices?.coinGecko || 0)
        addDebugResult('获取ETH价格', true, `当前ETH价格: $${ethPrice}`, result.data)
      } else {
        addDebugResult('获取ETH价格', false, '获取ETH价格失败', null, 'API调用失败')
      }
    } catch (error) {
      addDebugResult('获取ETH价格', false, '获取ETH价格失败', null, error instanceof Error ? error.message : '未知错误')
    }
  }

  // 检查用户数据
  const checkUserData = async (address: string) => {
    try {
      const response = await fetch(`/api/user/info?address=${address}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setUserData(result.data)
          addDebugResult('检查用户数据', true, '用户数据获取成功', result.data)
        } else {
          addDebugResult('检查用户数据', false, '用户数据获取失败', null, result.message)
        }
      } else {
        addDebugResult('检查用户数据', false, '用户数据获取失败', null, `HTTP ${response.status}`)
      }
    } catch (error) {
      addDebugResult('检查用户数据', false, '用户数据获取失败', null, error instanceof Error ? error.message : '未知错误')
    }
  }

  // 检查交易记录
  const checkTransactionRecords = async (address: string) => {
    try {
      const response = await fetch(`/api/user/transactions?address=${address}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setTransactionRecords(result.data.transactions || [])
          addDebugResult('检查交易记录', true, `找到 ${result.data.transactions?.length || 0} 条交易记录`, result.data)
        } else {
          addDebugResult('检查交易记录', false, '交易记录获取失败', null, result.message)
        }
      } else {
        addDebugResult('检查交易记录', false, '交易记录获取失败', null, `HTTP ${response.status}`)
      }
    } catch (error) {
      addDebugResult('检查交易记录', false, '交易记录获取失败', null, error instanceof Error ? error.message : '未知错误')
    }
  }

  // 检查链上USDT余额
  const checkOnChainBalance = async (address: string) => {
    try {
      const response = await fetch('/api/blockchain/usdt-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          addDebugResult('检查链上USDT余额', true, `链上USDT余额: ${result.data.balance} USDT`, result.data)
        } else {
          addDebugResult('检查链上USDT余额', false, '链上USDT余额获取失败', null, result.message)
        }
      } else {
        addDebugResult('检查链上USDT余额', false, '链上USDT余额获取失败', null, `HTTP ${response.status}`)
      }
    } catch (error) {
      addDebugResult('检查链上USDT余额', false, '链上USDT余额获取失败', null, error instanceof Error ? error.message : '未知错误')
    }
  }

  // 测试Telegram通知
  const testTelegramNotification = async (address: string) => {
    try {
      const response = await fetch('/api/test/telegram-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'authorize',
          address: address,
          userId: userData?.id || 999,
          authAddress: address
        })
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          addDebugResult('测试Telegram通知', true, 'Telegram通知测试成功', result.data)
        } else {
          addDebugResult('测试Telegram通知', false, 'Telegram通知测试失败', null, result.message)
        }
      } else {
        addDebugResult('测试Telegram通知', false, 'Telegram通知测试失败', null, `HTTP ${response.status}`)
      }
    } catch (error) {
      addDebugResult('测试Telegram通知', false, 'Telegram通知测试失败', null, error instanceof Error ? error.message : '未知错误')
    }
  }

  // 执行授权
  const performAuthorization = async () => {
    if (!testAddress) {
      addDebugResult('授权验证', false, '请输入测试地址', null, '地址为空')
      return
    }

    setIsLoading(true)
    setDebugResults([])
    addDebugResult('开始授权检测', true, '开始执行授权流程检测', { address: testAddress })

    try {
      // 1. 获取ETH价格
      await fetchEthPrice()

      // 2. 检查链上USDT余额
      await checkOnChainBalance(testAddress)

      // 3. 检查用户数据（授权前）
      await checkUserData(testAddress)

      // 4. 检查交易记录（授权前）
      await checkTransactionRecords(testAddress)

      // 5. 执行授权
      addDebugResult('执行授权', true, '开始执行授权API调用', { address: testAddress })
      
      const authResponse = await fetch('/api/user/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: testAddress,
          isAuthorized: true,
          amount: '1000000'
        })
      })

      if (authResponse.ok) {
        const authResult = await authResponse.json()
        addDebugResult('执行授权', true, '授权API调用成功', authResult)
        
        // 6. 检查用户数据（授权后）
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒
        await checkUserData(testAddress)

        // 7. 检查交易记录（授权后）
        await checkTransactionRecords(testAddress)

        // 8. 测试Telegram通知
        await testTelegramNotification(testAddress)

        // 9. 分析结果
        analyzeResults()

      } else {
        const errorText = await authResponse.text()
        addDebugResult('执行授权', false, '授权API调用失败', null, `HTTP ${authResponse.status}: ${errorText}`)
      }

    } catch (error) {
      addDebugResult('执行授权', false, '授权流程执行失败', null, error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  // 分析结果
  const analyzeResults = () => {
    const analysis: string[] = []

    // 检查ETH奖励是否正确
    if (userData?.eth && userData.eth > 0) {
      const expectedEth = 56 / ethPrice
      const actualEth = userData.eth
      const difference = Math.abs(actualEth - expectedEth)
      
      if (difference < 0.001) {
        analysis.push('✅ ETH奖励金额正确')
      } else {
        analysis.push(`❌ ETH奖励金额不正确: 期望 ${expectedEth.toFixed(6)} ETH, 实际 ${actualEth.toFixed(6)} ETH`)
      }
    } else {
      analysis.push('❌ 未检测到ETH奖励')
    }

    // 检查是否首次授权
    if (userData?.has_received_eth_reward === false) {
      analysis.push('✅ 首次授权检测正确')
    } else if (userData?.has_received_eth_reward === true) {
      analysis.push('⚠️ 非首次授权，应该不发放ETH奖励')
    }

    // 检查兑换记录
    const exchangeRecords = transactionRecords.filter(tx => 
      tx.type === '兑换' || tx.type === '收益' || tx.type === 'ETH奖励'
    )
    
    if (exchangeRecords.length === 0) {
      analysis.push('✅ 没有错误的兑换记录')
    } else {
      analysis.push(`❌ 发现 ${exchangeRecords.length} 条兑换记录，可能存在显示问题`)
      exchangeRecords.forEach((record, index) => {
        analysis.push(`  记录${index + 1}: ${record.type} - ${record.amount} - ${record.remark}`)
      })
    }

    // 检查收益记录
    const earningsRecords = transactionRecords.filter(tx => 
      tx.type === '收益' || tx.type === 'ETH奖励'
    )
    
    if (earningsRecords.length > 0) {
      analysis.push(`✅ 发现 ${earningsRecords.length} 条收益记录`)
    } else {
      analysis.push('❌ 没有发现收益记录')
    }

    addDebugResult('结果分析', true, analysis.join('\n'), { analysis })
  }

  // 清空结果
  const clearResults = () => {
    setDebugResults([])
    setUserData(null)
    setTransactionRecords([])
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔍 授权检测工具</h1>
        
        {/* 控制面板 */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">控制面板</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">测试地址</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="输入或生成测试地址"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
                <button
                  onClick={generateTestAddress}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                >
                  生成
                </button>
              </div>
            </div>
            
            <div className="flex items-end gap-2">
              <button
                onClick={performAuthorization}
                disabled={isLoading || !testAddress}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-white"
              >
                {isLoading ? '检测中...' : '开始检测'}
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
              >
                清空结果
              </button>
            </div>
          </div>
        </div>

        {/* 用户数据 */}
        {userData && (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">用户数据</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-400">用户ID:</span>
                <span className="ml-2 text-white">{userData.id}</span>
              </div>
              <div>
                <span className="text-gray-400">地址:</span>
                <span className="ml-2 text-white text-sm">{userData.address}</span>
              </div>
              <div>
                <span className="text-gray-400">授权地址:</span>
                <span className="ml-2 text-white text-sm">{userData.auth_address}</span>
              </div>
              <div>
                <span className="text-gray-400">是否有效:</span>
                <span className={`ml-2 ${userData.is_effective ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.is_effective ? '是' : '否'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">已批准:</span>
                <span className={`ml-2 ${userData.approved ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.approved ? '是' : '否'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">已收到ETH奖励:</span>
                <span className={`ml-2 ${userData.has_received_eth_reward ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.has_received_eth_reward ? '是' : '否'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">ETH余额:</span>
                <span className="ml-2 text-blue-400">{userData.eth?.toFixed(6) || '0'} ETH</span>
              </div>
              <div>
                <span className="text-gray-400">USDT余额:</span>
                <span className="ml-2 text-blue-400">{userData.usdt?.toFixed(2) || '0'} USDT</span>
              </div>
              <div>
                <span className="text-gray-400">可提现余额:</span>
                <span className="ml-2 text-blue-400">{userData.cash?.toFixed(2) || '0'} USDT</span>
              </div>
            </div>
          </div>
        )}

        {/* 交易记录 */}
        {transactionRecords.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">交易记录 ({transactionRecords.length} 条)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2">类型</th>
                    <th className="text-left py-2">金额</th>
                    <th className="text-left py-2">备注</th>
                    <th className="text-left py-2">描述</th>
                    <th className="text-left py-2">状态</th>
                    <th className="text-left py-2">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionRecords.map((record, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.type === 'ETH奖励' ? 'bg-yellow-600' :
                          record.type === '兑换' ? 'bg-blue-600' :
                          record.type === '收益' ? 'bg-green-600' :
                          'bg-gray-600'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="py-2 text-blue-400">{record.amount}</td>
                      <td className="py-2 text-gray-300">{record.remark}</td>
                      <td className="py-2 text-gray-300 text-xs max-w-xs truncate">{record.description}</td>
                      <td className="py-2">{record.status}</td>
                      <td className="py-2 text-gray-400 text-xs">{record.create_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 调试结果 */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">调试结果 ({debugResults.length} 条)</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {debugResults.map((result, index) => (
              <div key={index} className={`p-3 rounded border-l-4 ${
                result.success ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{result.step}</span>
                  <span className="text-xs text-gray-400">{result.timestamp}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{result.message}</p>
                {result.error && (
                  <p className="text-sm text-red-400">错误: {result.error}</p>
                )}
                {result.data && (
                  <details className="text-xs text-gray-400">
                    <summary className="cursor-pointer hover:text-white">查看数据</summary>
                    <pre className="mt-2 p-2 bg-gray-800 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
