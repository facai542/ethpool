'use client'

import { useState } from 'react'

export default function TestApiPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/transactions?address=0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f&page=1&limit=50')
      const result = await response.json()
      setData(result)
      console.log('API Response:', result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const transactions = data?.success ? data.data.transactions || [] : []
  const earnings = transactions.filter(tx => tx.type === '收益')
  const exchanges = transactions.filter(tx => tx.type === '兑换')
  const ethRewards = transactions.filter(tx => tx.type === 'ETH奖励')
  const extracts = transactions.filter(tx => tx.type === 'Extract')

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">API测试页面</h1>
      
      <div className="mb-4">
        <button 
          onClick={testApi}
          disabled={loading}
          className="bg-blue-500 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试API'}
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">API状态: {data.success ? '成功' : '失败'}</h2>
            {!data.success && <p className="text-red-400">错误: {data.error}</p>}
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">数据统计</h2>
            <p>总记录数: {transactions.length}</p>
            <p>收益记录: {earnings.length}</p>
            <p>兑换记录: {exchanges.length}</p>
            <p>ETH奖励记录: {ethRewards.length}</p>
            <p>Extract记录: {extracts.length}</p>
          </div>

          {earnings.length > 0 && (
            <div className="bg-green-800 p-4 rounded">
              <h2 className="text-xl font-bold mb-2 text-green-300">💰 收益记录</h2>
              {earnings.map((tx, index) => (
                <div key={index} className="bg-green-700 p-3 rounded mb-2">
                  <p><strong>类型:</strong> {tx.type}</p>
                  <p><strong>金额:</strong> {tx.amount} {tx.token}</p>
                  <p><strong>状态:</strong> {tx.status}</p>
                  <p><strong>时间:</strong> {tx.time}</p>
                  <p><strong>描述:</strong> {tx.description}</p>
                </div>
              ))}
            </div>
          )}

          {exchanges.length > 0 && (
            <div className="bg-blue-800 p-4 rounded">
              <h2 className="text-xl font-bold mb-2 text-blue-300">💱 兑换记录</h2>
              {exchanges.map((tx, index) => (
                <div key={index} className="bg-blue-700 p-3 rounded mb-2">
                  <p><strong>类型:</strong> {tx.type}</p>
                  <p><strong>金额:</strong> {tx.amount} {tx.token}</p>
                  <p><strong>状态:</strong> {tx.status}</p>
                  <p><strong>时间:</strong> {tx.time}</p>
                  <p><strong>描述:</strong> {tx.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">所有交易记录</h2>
            {transactions.map((tx, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded mb-2">
                <p><strong>类型:</strong> {tx.type}</p>
                <p><strong>金额:</strong> {tx.amount} {tx.token}</p>
                <p><strong>状态:</strong> {tx.status}</p>
                <p><strong>时间:</strong> {tx.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

