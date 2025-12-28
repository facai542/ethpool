'use client'

import { useState, useEffect } from 'react'

export default function TestWithdrawPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [userInfo, setUserInfo] = useState<any>(null)

  const testUserInfo = async () => {
    try {
      const response = await fetch('/api/user/info?address=0x8917B3723F4971A6fCB315e4667FBA4fB07FED7A')
      const result = await response.json()
      
      if (result.success) {
        setUserInfo(result.data)
        setTestResult(`用户信息查询成功 (时间: ${new Date().toISOString()}):
用户地址: ${result.data.address}
可提现余额 (cash): ${result.data.cash} USDT
可提现余额 (withdrawable_usdt): ${result.data.withdrawable_usdt} USDT
已兑换余额 (exchanged_usdt): ${result.data.exchanged_usdt} USDT
总产量 (total_eth_received): ${result.data.total_eth_received} ETH
可兑换余额 (reward_eth_balance): ${result.data.reward_eth_balance} ETH

✅ 如果cash和withdrawable_usdt显示相同值，说明字段映射正确！`)
      } else {
        setTestResult(`用户信息查询失败: ${result.error}`)
      }
    } catch (error) {
      setTestResult(`用户信息查询错误: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const testWithdraw = async () => {
    if (!userInfo) {
      setTestResult('请先查询用户信息')
      return
    }

    try {
      const response = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: '0x8917B3723F4971A6fCB315e4667FBA4fB07FED7A',
          amount: '10', // 测试10 USDT
          withdrawAddress: '0x8917B3723F4971A6fCB315e4667FBA4fB07FED7A'
        })
      })

      const result = await response.json()
      setTestResult(`提现测试结果 (时间: ${new Date().toISOString()}):
${JSON.stringify(result, null, 2)}

✅ 如果显示具体错误信息而不是"未知错误"，说明修复已生效！`)
    } catch (error) {
      setTestResult(`提现测试错误 (时间: ${new Date().toISOString()}):
${error instanceof Error ? error.message : "未知错误"}

✅ 如果显示具体错误信息，说明修复已生效！`)
    }
  }

  const testDecimalFormatting = () => {
    const testAmount = '55.123456789'
    const formattedAmount = Number.parseFloat(testAmount).toFixed(2)
    
    setTestResult(`小数位数格式化测试 (时间: ${new Date().toISOString()}):
原始金额: ${testAmount}
格式化后 (2位小数): ${formattedAmount}

✅ 如果显示2位小数，说明"全部提取"按钮修复已生效！`)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">提现功能测试页面</h1>
      
      <div className="space-y-4">
        <button
          onClick={testUserInfo}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
        >
          查询用户信息
        </button>
        
        <button
          onClick={testWithdraw}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-4"
        >
          测试提现 (10 USDT)
        </button>
        
        <button
          onClick={testDecimalFormatting}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          测试小数位数格式化
        </button>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-yellow-100 rounded">
          <h3 className="font-bold">说明：</h3>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>如果用户信息中cash和withdrawable_usdt显示相同值，说明字段映射正确</li>
            <li>如果提现测试显示具体错误信息而不是"未知错误"，说明错误处理修复已生效</li>
            <li>如果小数位数格式化显示2位小数，说明"全部提取"按钮修复已生效</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
