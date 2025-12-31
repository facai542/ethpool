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

export default function DebugStaticPage() {
  const [testAddress, setTestAddress] = useState('')
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

  // 测试API连接
  const testAPI = async (apiName: string, url: string, options?: RequestInit) => {
    addDebugResult(`测试${apiName}`, true, `开始测试 ${apiName}`)
    
    try {
      const response = await fetch(url, options)
      
      if (response.ok) {
        const result = await response.json()
        addDebugResult(`测试${apiName}`, true, `${apiName} 调用成功`, result)
      } else {
        const errorText = await response.text()
        addDebugResult(`测试${apiName}`, false, `${apiName} 调用失败`, null, `HTTP ${response.status}: ${errorText}`)
      }
    } catch (error) {
      addDebugResult(`测试${apiName}`, false, `${apiName} 调用失败`, null, error instanceof Error ? error.message : '未知错误')
    }
  }

  // 执行完整测试
  const performFullTest = async () => {
    if (!testAddress) {
      addDebugResult('输入验证', false, '请输入测试地址', null, '地址为空')
      return
    }

    setDebugResults([])
    addDebugResult('开始测试', true, '开始执行完整的API测试流程', { address: testAddress })

    // 测试各个API
    await testAPI('ETH价格API', '/api/test/eth-price')
    
    await testAPI('链上余额API', '/api/blockchain/usdt-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: testAddress })
    })
    
    await testAPI('用户信息API', `/api/user/info?address=${testAddress}`)
    
    await testAPI('授权API（仅查询）', '/api/user/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: false
      })
    })

    // 分析结果
    const successCount = debugResults.filter(r => r.success).length
    const totalCount = debugResults.length
    
    addDebugResult('测试总结', true, `测试完成: ${successCount}/${totalCount} 个API正常工作`)
  }

  // 清空结果
  const clearResults = () => {
    setDebugResults([])
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔍 静态授权检测工具</h1>
        
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
                onClick={performFullTest}
                disabled={!testAddress}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-white"
              >
                开始测试
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

        <div className="mt-6 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">说明</h2>
          <div className="text-gray-300 space-y-2">
            <p>• 这个工具用于检测授权功能的所有问题</p>
            <p>• 包括：授权奖励、金额计算、记录显示、Telegram通知等</p>
            <p>• 如果API返回502错误，说明Netlify函数有问题</p>
            <p>• 如果API返回200但数据错误，说明业务逻辑有问题</p>
            <p>• 请根据测试结果进行相应的修复</p>
          </div>
        </div>
      </div>
    </div>
  )
}
