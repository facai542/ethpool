'use client'

import { useState } from 'react'

interface DebugResult {
  step: string
  success: boolean
  message: string
  data?: any
  error?: string
  timestamp: string
}

export default function DebugSimplePage() {
  const [testAddress, setTestAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debugResults, setDebugResults] = useState<DebugResult[]>([])

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

  // 执行授权测试
  const performAuthorization = async () => {
    if (!testAddress) {
      addDebugResult('输入验证', false, '请输入测试地址', null, '地址为空')
      return
    }

    setIsLoading(true)
    setDebugResults([])
    addDebugResult('开始测试', true, '开始执行授权流程测试', { address: testAddress })

    try {
      // 1. 测试ETH价格API
      addDebugResult('测试ETH价格', true, '开始测试ETH价格API')
      const ethResponse = await fetch('/api/test/eth-price')
      if (ethResponse.ok) {
        const ethResult = await ethResponse.json()
        addDebugResult('测试ETH价格', true, `ETH价格获取成功: $${ethResult.data?.prices?.coinGecko}`, ethResult.data)
      } else {
        addDebugResult('测试ETH价格', false, 'ETH价格API调用失败', null, `HTTP ${ethResponse.status}`)
      }

      // 2. 测试链上余额API
      addDebugResult('测试链上余额', true, '开始测试链上USDT余额API')
      const balanceResponse = await fetch('/api/blockchain/usdt-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: testAddress })
      })
      if (balanceResponse.ok) {
        const balanceResult = await balanceResponse.json()
        addDebugResult('测试链上余额', true, `链上USDT余额: ${balanceResult.data?.balance} USDT`, balanceResult.data)
      } else {
        addDebugResult('测试链上余额', false, '链上余额API调用失败', null, `HTTP ${balanceResponse.status}`)
      }

      // 3. 测试用户信息API
      addDebugResult('测试用户信息', true, '开始测试用户信息API')
      const userResponse = await fetch(`/api/user/info?address=${testAddress}`)
      if (userResponse.ok) {
        const userResult = await userResponse.json()
        addDebugResult('测试用户信息', true, '用户信息API调用成功', userResult.data)
      } else {
        addDebugResult('测试用户信息', false, '用户信息API调用失败', null, `HTTP ${userResponse.status}`)
      }

      // 4. 测试授权API
      addDebugResult('测试授权API', true, '开始测试授权API')
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
        addDebugResult('测试授权API', true, '授权API调用成功', authResult)
        
        // 5. 检查授权后的用户信息
        addDebugResult('检查授权后状态', true, '检查授权后的用户状态')
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒
        
        const userAfterResponse = await fetch(`/api/user/info?address=${testAddress}`)
        if (userAfterResponse.ok) {
          const userAfterResult = await userAfterResponse.json()
          addDebugResult('检查授权后状态', true, '授权后用户状态检查完成', userAfterResult.data)
          
          // 分析结果
          if (userAfterResult.data?.is_effective === 1) {
            addDebugResult('结果分析', true, '✅ 授权成功，用户状态已更新')
          } else {
            addDebugResult('结果分析', false, '❌ 授权失败，用户状态未更新')
          }
          
          if (userAfterResult.data?.eth > 0) {
            addDebugResult('结果分析', true, `✅ ETH奖励已发放: ${userAfterResult.data.eth} ETH`)
          } else {
            addDebugResult('结果分析', false, '❌ 未检测到ETH奖励')
          }
        } else {
          addDebugResult('检查授权后状态', false, '授权后用户状态检查失败', null, `HTTP ${userAfterResponse.status}`)
        }
      } else {
        const errorText = await authResponse.text()
        addDebugResult('测试授权API', false, '授权API调用失败', null, `HTTP ${authResponse.status}: ${errorText}`)
      }

    } catch (error) {
      addDebugResult('测试执行', false, '测试执行过程中发生错误', null, error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  // 清空结果
  const clearResults = () => {
    setDebugResults([])
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔍 简单授权检测工具</h1>
        
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
                {isLoading ? '测试中...' : '开始测试'}
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

        {/* 调试结果 */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果 ({debugResults.length} 条)</h2>
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