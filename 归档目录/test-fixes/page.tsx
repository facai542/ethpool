'use client'

import { useState } from 'react'

export default function TestFixesPage() {
  const [testResult, setTestResult] = useState<string>('')

  const testWithdrawError = async () => {
    try {
      const response = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: '0x1234567890123456789012345678901234567890',
          amount: '100',
          withdrawAddress: '0x1234567890123456789012345678901234567890'
        })
      })

      const result = await response.json()
      setTestResult(`提现API测试结果: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setTestResult(`提现API测试错误: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const testExchangeRecords = () => {
    const testAmount = '0.012345678901234567'
    const ethAmount = Number.parseFloat(testAmount).toFixed(4)
    const usdtAmount = (Number.parseFloat(testAmount) * 4480.37).toFixed(2)
    
    setTestResult(`兑换记录小数位数测试:
ETH金额: ${testAmount} -> ${ethAmount} (4位小数)
USDT金额: ${testAmount} -> ${usdtAmount} (2位小数)`)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">修复验证测试页面</h1>
      
      <div className="space-y-4">
        <button
          onClick={testWithdrawError}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          测试提现错误处理
        </button>
        
        <button
          onClick={testExchangeRecords}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          测试兑换记录小数位数
        </button>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
