'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export default function DebugFilterPage() {
  const { address } = useAccount()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    if (!address) return

    setLoading(true)
    try {
      const response = await fetch(`/api/user/transactions?address=${address}&page=1&limit=50`)
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

  const transactions = data?.success ? data.data.transactions || [] : []
  
  // 模拟原始过滤逻辑
  const filteredTransactions = transactions.filter(tx =>
    tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.token.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 模拟提现记录过滤逻辑
  const withdraws = transactions.filter(tx => tx.type === 'Extract' || tx.type === '兑换').map(tx => ({
    id: tx.hash || `withdraw_${Date.now()}`,
    price: tx.amount,
    status: tx.status === 'success' ? 1 : tx.status === 'pending' ? 0 : -1,
    add_time: tx.time,
    update_time: tx.time,
    to_address: tx.hash !== 'Pending' ? tx.hash : null
  }))

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">过滤逻辑调试页面</h1>
      
      <div className="mb-4">
        <p className="text-lg">钱包地址: {address || '未连接'}</p>
        <div className="mt-2">
          <label className="block mb-2">搜索词: </label>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
            placeholder="输入搜索词"
          />
        </div>
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
            <h2 className="text-xl font-bold mb-2">数据统计</h2>
            <p>原始交易记录: {transactions.length} 条</p>
            <p>过滤后交易记录: {filteredTransactions.length} 条</p>
            <p>提现记录: {withdraws.length} 条</p>
            <p>搜索词: "{searchTerm}"</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">原始交易记录</h2>
            {transactions.map((tx, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded mb-2">
                <p><strong>类型:</strong> {tx.type}</p>
                <p><strong>金额:</strong> {tx.amount} {tx.token}</p>
                <p><strong>哈希:</strong> {tx.hash}</p>
                <p><strong>过滤测试:</strong> 
                  type包含搜索词: {tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ? '✅' : '❌'}, 
                  hash包含搜索词: {tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ? '✅' : '❌'}, 
                  token包含搜索词: {tx.token.toLowerCase().includes(searchTerm.toLowerCase()) ? '✅' : '❌'}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">过滤后交易记录 (应该显示在"交易记录"部分)</h2>
            {filteredTransactions.length === 0 ? (
              <p className="text-red-400">没有过滤后的记录！</p>
            ) : (
              filteredTransactions.map((tx, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded mb-2">
                  <p><strong>类型:</strong> {tx.type}</p>
                  <p><strong>金额:</strong> {tx.amount} {tx.token}</p>
                  <p><strong>状态:</strong> {tx.status}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">提现记录 (应该显示在"提现订单状态"部分)</h2>
            {withdraws.length === 0 ? (
              <p className="text-red-400">没有提现记录！</p>
            ) : (
              withdraws.map((w, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded mb-2">
                  <p><strong>ID:</strong> {w.id}</p>
                  <p><strong>金额:</strong> {w.price} USDT</p>
                  <p><strong>状态:</strong> {w.status === 1 ? '成功' : w.status === 0 ? '待处理' : '失败'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

