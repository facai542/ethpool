'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export default function TestRecordsPage() {
  const { address } = useAccount()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    if (!address) return

    setLoading(true)
    try {
      const response = await fetch(`/api/user/transactions?wallet_address=${address}&page=1&limit=50`)
      const result = await response.json()
      setData(result)
      console.log('API Response:', result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      fetchData()
    }
  }, [address])

  // 模拟前端页面的数据处理逻辑
  const transactions = data?.success ? data.data.transactions || [] : []
  const withdraws = transactions.filter(tx => tx.type === 'Extract' || tx.type === '兑换').map(tx => ({
    id: tx.hash || `withdraw_${Date.now()}`,
    price: tx.amount,
    status: tx.status === 'success' ? 1 : tx.status === 'pending' ? 0 : -1,
    add_time: tx.time,
    update_time: tx.time,
    to_address: tx.hash !== 'Pending' ? tx.hash : null
  }))

  const earnings = transactions.filter(tx => tx.type === '收益')
  const exchanges = transactions.filter(tx => tx.type === '兑换')
  const ethRewards = transactions.filter(tx => tx.type === 'ETH奖励')

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">记录测试页面</h1>
      
      <div className="mb-4">
        <p className="text-lg">钱包地址: {address || '未连接'}</p>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="bg-blue-500 px-4 py-2 rounded disabled:opacity-50 mt-2"
        >
          {loading ? '加载中...' : '刷新数据'}
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
            <p>总交易记录: {transactions.length} 条</p>
            <p>提现记录: {withdraws.length} 条</p>
            <p>收益记录: {earnings.length} 条</p>
            <p>兑换记录: {exchanges.length} 条</p>
            <p>ETH奖励记录: {ethRewards.length} 条</p>
          </div>

          {withdraws.length > 0 && (
            <div className="bg-gray-800 p-4 rounded">
              <h2 className="text-xl font-bold mb-2">提现记录 (应该显示在"提现订单状态"部分)</h2>
              {withdraws.map((w, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded mb-2">
                  <p><strong>ID:</strong> {w.id}</p>
                  <p><strong>金额:</strong> {w.price} USDT</p>
                  <p><strong>状态:</strong> {w.status === 1 ? '成功' : w.status === 0 ? '待处理' : '失败'}</p>
                  <p><strong>时间:</strong> {w.add_time}</p>
                </div>
              ))}
            </div>
          )}

          {earnings.length > 0 && (
            <div className="bg-gray-800 p-4 rounded">
              <h2 className="text-xl font-bold mb-2">收益记录 (应该显示在"交易记录"部分)</h2>
              {earnings.map((tx, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded mb-2">
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
            <div className="bg-gray-800 p-4 rounded">
              <h2 className="text-xl font-bold mb-2">兑换记录 (应该显示在"交易记录"部分)</h2>
              {exchanges.map((tx, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded mb-2">
                  <p><strong>类型:</strong> {tx.type}</p>
                  <p><strong>金额:</strong> {tx.amount} {tx.token}</p>
                  <p><strong>状态:</strong> {tx.status}</p>
                  <p><strong>时间:</strong> {tx.time}</p>
                  <p><strong>描述:</strong> {tx.description}</p>
                </div>
              ))}
            </div>
          )}

          {ethRewards.length > 0 && (
            <div className="bg-gray-800 p-4 rounded">
              <h2 className="text-xl font-bold mb-2">ETH奖励记录 (应该显示在"交易记录"部分)</h2>
              {ethRewards.map((tx, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded mb-2">
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

