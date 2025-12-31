'use client'

import { useState } from 'react'

export default function TestSimpleFlow() {
  const [userAddress, setUserAddress] = useState('0x8917B3723F4971A6fCB315e4667FBA4fB07FED7A')
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev])
  }

  const testCompleteFlow = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog('🚀 开始测试完整流程...')
      
      // 1. 检查用户信息
      addLog('📋 步骤1: 检查用户信息...')
      const userResponse = await fetch(`/api/user/info?address=${userAddress}`)
      const userData = await userResponse.json()
      
      if (!userData.success) {
        addLog(`❌ 用户信息获取失败: ${userData.error}`)
        return
      }
      
      addLog(`✅ 用户信息: ETH余额=${userData.data.eth}, 可提现USDT=${userData.data.cash}`)
      
      // 2. 测试兑换功能
      addLog('💱 步骤2: 测试ETH兑换USDT...')
      const exchangeResponse = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userAddress,
          from: 'ETH',
          to: 'USDT',
          amount: 0.001 // 兑换0.001 ETH
        })
      })
      
      const exchangeData = await exchangeResponse.json()
      if (!exchangeData.success) {
        addLog(`❌ 兑换失败: ${exchangeData.error}`)
        return
      }
      
      addLog(`✅ 兑换成功: ${exchangeData.data.exchange.fromAmount} ETH -> ${exchangeData.data.exchange.toAmount} USDT`)
      
      // 3. 检查兑换后的余额
      addLog('💰 步骤3: 检查兑换后余额...')
      const userResponse2 = await fetch(`/api/user/info?address=${userAddress}`)
      const userData2 = await userResponse2.json()
      
      if (userData2.success) {
        addLog(`✅ 兑换后余额: ETH=${userData2.data.eth}, 可提现USDT=${userData2.data.cash}`)
      }
      
      // 4. 检查兑换记录
      addLog('📝 步骤4: 检查兑换记录...')
      const transactionsResponse = await fetch(`/api/user/transactions?address=${userAddress}`)
      const transactionsData = await transactionsResponse.json()
      
      if (transactionsData.success) {
        const exchangeRecords = transactionsData.data.exchangeRecords || []
        addLog(`✅ 兑换记录数量: ${exchangeRecords.length}`)
        exchangeRecords.forEach((record: any, index: number) => {
          addLog(`  ${index + 1}. ${record.payAmount} -> ${record.receiveAmount} (${record.time})`)
        })
      }
      
      // 5. 测试提现功能
      addLog('💸 步骤5: 测试提现功能...')
      const withdrawResponse = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userAddress,
          amount: 1.0, // 提现1 USDT
          withdrawAddress: userAddress // 提现地址
        })
      })
      
      const withdrawData = await withdrawResponse.json()
      if (!withdrawData.success) {
        addLog(`❌ 提现失败: ${withdrawData.error}`)
        return
      }
      
      addLog(`✅ 提现申请成功: ${withdrawData.data.amount} USDT`)
      
      // 6. 检查提现记录
      addLog('📋 步骤6: 检查提现记录...')
      const transactionsResponse2 = await fetch(`/api/user/transactions?address=${userAddress}`)
      const transactionsData2 = await transactionsResponse2.json()
      
      if (transactionsData2.success) {
        const withdrawRecords = transactionsData2.data.withdrawRecords || []
        addLog(`✅ 提现记录数量: ${withdrawRecords.length}`)
        withdrawRecords.forEach((record: any, index: number) => {
          addLog(`  ${index + 1}. ${record.payAmount} (${record.time}) - ${record.status}`)
        })
      }
      
      addLog('🎉 完整流程测试完成!')
      
    } catch (error) {
      addLog(`❌ 测试失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testUserInfo = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog('📋 检查用户信息...')
      const response = await fetch(`/api/user/info?address=${userAddress}`)
      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ 用户ID: ${data.data.id}`)
        addLog(`✅ ETH余额: ${data.data.eth}`)
        addLog(`✅ 总产量: ${data.data.total_eth_received}`)
        addLog(`✅ 可兑换: ${data.data.reward_eth_balance}`)
        addLog(`✅ 已兑换USDT: ${data.data.exchanged_usdt}`)
        addLog(`✅ 可提现USDT: ${data.data.cash}`)
        addLog(`✅ 钱包余额: ${data.data.wallet_balance}`)
      } else {
        addLog(`❌ 用户信息获取失败: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ 错误: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testExchange = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog('💱 测试兑换功能...')
      const response = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userAddress,
          from: 'ETH',
          to: 'USDT',
          amount: 0.001
        })
      })
      
      const data = await response.json()
      if (data.success) {
        addLog(`✅ 兑换成功: ${data.data.exchange.fromAmount} ETH -> ${data.data.exchange.toAmount} USDT`)
        addLog(`✅ 汇率: ${data.data.exchange.rate}`)
        addLog(`✅ 手续费: ${data.data.exchange.feeAmount} ETH`)
      } else {
        addLog(`❌ 兑换失败: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ 错误: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testWithdraw = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog('💸 测试提现功能...')
      const response = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userAddress,
          amount: 1.0,
          withdrawAddress: userAddress
        })
      })
      
      const data = await response.json()
      if (data.success) {
        addLog(`✅ 提现申请成功: ${data.data.amount} USDT`)
        addLog(`✅ 提现ID: ${data.data.id}`)
      } else {
        addLog(`❌ 提现失败: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ 错误: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testRecords = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog('📝 检查交易记录...')
      const response = await fetch(`/api/user/transactions?address=${userAddress}`)
      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ 总记录数: ${data.data.transactions.length}`)
        addLog(`✅ 兑换记录: ${data.data.exchangeRecords.length}`)
        addLog(`✅ 提现记录: ${data.data.withdrawRecords.length}`)
        addLog(`✅ 收益记录: ${data.data.earningsRecords.length}`)
        
        // 显示最近的兑换记录
        if (data.data.exchangeRecords.length > 0) {
          addLog('📋 最近兑换记录:')
          data.data.exchangeRecords.slice(0, 3).forEach((record: any, index: number) => {
            addLog(`  ${index + 1}. ${record.payAmount} -> ${record.receiveAmount} (${record.time})`)
          })
        }
        
        // 显示最近的提现记录
        if (data.data.withdrawRecords.length > 0) {
          addLog('📋 最近提现记录:')
          data.data.withdrawRecords.slice(0, 3).forEach((record: any, index: number) => {
            addLog(`  ${index + 1}. ${record.payAmount} (${record.time}) - ${record.status}`)
          })
        }
      } else {
        addLog(`❌ 记录查询失败: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ 错误: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">简单流程测试页面</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试地址</h2>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="输入钱包地址"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testUserInfo}
            disabled={loading}
            className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {loading ? '测试中...' : '检查用户信息'}
          </button>
          
          <button
            onClick={testExchange}
            disabled={loading}
            className="p-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {loading ? '测试中...' : '测试兑换'}
          </button>
          
          <button
            onClick={testWithdraw}
            disabled={loading}
            className="p-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {loading ? '测试中...' : '测试提现'}
          </button>
          
          <button
            onClick={testRecords}
            disabled={loading}
            className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {loading ? '测试中...' : '检查记录'}
          </button>
          
          <button
            onClick={testCompleteFlow}
            disabled={loading}
            className="p-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold col-span-2"
          >
            {loading ? '测试中...' : '完整流程测试'}
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">测试日志</h2>
          <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">点击上方按钮开始测试...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
