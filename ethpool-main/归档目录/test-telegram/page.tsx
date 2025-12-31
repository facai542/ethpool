'use client'

import { useState } from 'react'

export default function TestTelegramPage() {
  const [testAddress, setTestAddress] = useState('0x0a7f24d91D34CC5B9Aa294583e428EAB802d87d0')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testChainBalance = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blockchain/wallet-balance?address=${testAddress}`)
      const data = await response.json()
      setResult({ type: 'chain_balance', data })
    } catch (error) {
      setResult({ type: 'error', error: error.message })
    }
    setLoading(false)
  }

  const testTelegramMessage = async () => {
    setLoading(true)
    try {
      // 测试构建消息（不发送到群组）
      const response = await fetch('/api/telegram/send', {
        method: 'POST'
      })
      const data = await response.json()
      setResult({ type: 'telegram_test', data })
    } catch (error) {
      setResult({ type: 'error', error: error.message })
    }
    setLoading(false)
  }

  const testWalletMonitor = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/wallet-monitor?address=${testAddress}`)
      const data = await response.json()
      setResult({ type: 'wallet_monitor', data })
    } catch (error) {
      setResult({ type: 'error', error: error.message })
    }
    setLoading(false)
  }

  const testTransactionMonitor = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cron/transaction-monitor', {
        method: 'POST'
      })
      const data = await response.json()
      setResult({ type: 'transaction_monitor', data })
    } catch (error) {
      setResult({ type: 'error', error: error.message })
    }
    setLoading(false)
  }

  const testTransactionNotification = async () => {
    setLoading(true)
    try {
      // 模拟创建钱包动账通知（不发送到群组）
      const mockNotification = {
        wallet_address: testAddress,
        notification_type: 'incoming',
        amount: 50,
        token_symbol: 'USDT',
        from_address: '0x1234567890123456789012345678901234567890',
        to_address: testAddress,
        block_number: 18500000
      }

      // 获取链上余额
      const balanceResponse = await fetch(`/api/blockchain/wallet-balance?address=${testAddress}`)
      const balanceData = await balanceResponse.json()
      
      // 获取用户信息
      const userResponse = await fetch(`/api/user/info?address=${testAddress}`)
      const userData = await userResponse.json()

      const onChainBalance = balanceData.success ? balanceData.data.usdt_balance : 0
      const userInfo = userData.success ? userData.data : null

      const isIncoming = mockNotification.notification_type === 'incoming'
      const amount = Math.abs(mockNotification.amount)
      const sign = isIncoming ? '+' : '-'
      const emoji = isIncoming ? '🟢' : '🔴'
      const action = isIncoming ? '转入' : '转出'
      
      const message = `${emoji}${isIncoming ? '收入' : '支出'}USDT 提醒       ${sign}${amount} USDT

钱包余额：${onChainBalance.toFixed(6)}
顶层代理：默认代理
代理昵称：暂未设置
用户编号：${userInfo?.id || ''}
用户备注:暂未设置
是否活动：${userInfo?.approved ? '是' : '否'}
用户钱包：${mockNotification.wallet_address}
订单金额: ${sign}${amount} USDT
授权时间:${userInfo?.created_at ? new Date(userInfo.created_at).toLocaleString('zh-CN') : ''}
交易对象:${isIncoming ? mockNotification.from_address : mockNotification.to_address}
执行操作：客户${action}`

      setResult({ 
        type: 'transaction_notification', 
        data: { 
          message, 
          mockNotification,
          onChainBalance,
          userInfo 
        } 
      })
    } catch (error) {
      setResult({ type: 'error', error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Telegram通知系统测试</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">测试地址:</label>
          <input
            type="text"
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="输入钱包地址"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testChainBalance}
            disabled={loading}
            className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            {loading ? '测试中...' : '测试链上余额获取'}
          </button>

          <button
            onClick={testTelegramMessage}
            disabled={loading}
            className="p-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            {loading ? '测试中...' : '测试Telegram消息构建'}
          </button>

          <button
            onClick={testWalletMonitor}
            disabled={loading}
            className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            {loading ? '测试中...' : '测试钱包监听状态'}
          </button>

          <button
            onClick={testTransactionMonitor}
            disabled={loading}
            className="p-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            {loading ? '测试中...' : '测试交易监听系统'}
          </button>

          <button
            onClick={testTransactionNotification}
            disabled={loading}
            className="p-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            {loading ? '测试中...' : '测试动账通知模板'}
          </button>
        </div>

        {result && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">测试结果:</h3>
            <pre className="text-sm text-gray-300 overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ 重要说明</h3>
          <p className="text-yellow-200">
            此页面仅用于测试功能，不会向Telegram群组发送实际消息。
            所有测试都在本地进行，不会影响生产环境。
          </p>
        </div>
      </div>
    </div>
  )
}
