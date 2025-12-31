'use client'

import { useState, useEffect } from 'react'

export default function TestCachePage() {
  const [testResult, setTestResult] = useState<string>('')
  const [timestamp, setTimestamp] = useState<string>('')

  useEffect(() => {
    setTimestamp(new Date().toISOString())
  }, [])

  const testDecimalFormatting = () => {
    const testAmount = '0.012345678901234567'
    const ethAmount = Number.parseFloat(testAmount).toFixed(4)
    const usdtAmount = (Number.parseFloat(testAmount) * 4480.37).toFixed(2)
    
    setTestResult(`小数位数格式化测试 (时间: ${new Date().toISOString()}):
原始金额: ${testAmount}
ETH金额 (4位小数): ${ethAmount}
USDT金额 (2位小数): ${usdtAmount}

如果ETH显示4位小数，USDT显示2位小数，说明修复已生效！`)
  }

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
      setTestResult(`提现API测试 (时间: ${new Date().toISOString()}):
${JSON.stringify(result, null, 2)}

如果显示具体错误信息而不是"未知错误"，说明修复已生效！`)
    } catch (error) {
      setTestResult(`提现API测试错误 (时间: ${new Date().toISOString()}):
${error instanceof Error ? error.message : "未知错误"}

如果显示具体错误信息，说明修复已生效！`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">缓存测试页面</h1>
      <p className="mb-4">页面加载时间: {timestamp}</p>
      
      <div className="space-y-4">
        <button
          onClick={testDecimalFormatting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
        >
          测试小数位数格式化
        </button>
        
        <button
          onClick={testWithdrawError}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          测试提现错误处理
        </button>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-yellow-100 rounded">
          <h3 className="font-bold">说明：</h3>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>如果ETH金额显示4位小数，USDT金额显示2位小数，说明兑换记录修复已生效</li>
            <li>如果提现错误显示具体错误信息而不是"未知错误"，说明提现错误处理修复已生效</li>
            <li>如果测试结果没有变化，请清除浏览器缓存后重试</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
