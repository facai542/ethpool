'use client'

import { useState, useEffect } from 'react'

interface AccountData {
  // 基本信息
  id: string
  wallet_address: string
  approved: number
  first_approved_at: string
  last_approved_at: string
  
  // 余额字段
  a_eth: string          // 总产量（累加，不减少）
  eth: string            // 可兑换余额
  usdt: string           // 已兑换USDT（累加）
  withdrawal_usdt: string // 已提现USDT（累加）
  withdrawable_usdt: string // 可提现USDT余额
  dividend_usdt: string  // 总分红
  
  // 其他字段
  daily_reward_rate: number
  last_reward_at: string
  reward_count_today: number
  telegram_user_id: string
  referral_code: string
  referred_by: string
  is_active: boolean
  created_at: string
  updated_at: string
  
  // 链上余额
  chain_usdt_balance: string
  chain_eth_balance: string
}

interface ExchangeRecord {
  id: string
  eth_amount: string
  usdt_amount: string
  exchange_rate: string
  status: string
  created_at: string
}

interface WithdrawRecord {
  id: string
  amount: string
  status: string
  created_at: string
}

interface EarningsRecord {
  id: string
  amount: string
  type: string
  description: string
  created_at: string
}

export default function TestAccountFlow() {
  const [userAddress, setUserAddress] = useState('0x8a9dEf046bA9050f55c0796Dd84a0eEAA9dbFa5A')
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [exchangeRecords, setExchangeRecords] = useState<ExchangeRecord[]>([])
  const [withdrawRecords, setWithdrawRecords] = useState<WithdrawRecord[]>([])
  const [earningsRecords, setEarningsRecords] = useState<EarningsRecord[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev])
  }

  // 获取链上余额
  const getChainBalance = async (address: string) => {
    try {
      const response = await fetch(`/api/blockchain/wallet-balance?address=${address}`)
      const data = await response.json()
      if (data.success) {
        return {
          usdt: data.data.usdt_balance || '0',
          eth: data.data.eth_balance || '0'
        }
      }
    } catch (error) {
      console.error('获取链上余额失败:', error)
    }
    return { usdt: '0', eth: '0' }
  }

  // 获取用户账户数据
  const fetchAccountData = async () => {
    setLoading(true)
    try {
      addLog('📋 获取用户账户数据...')
      
      // 获取用户信息
      const userResponse = await fetch(`/api/user/info?address=${userAddress}`)
      const userData = await userResponse.json()
      
      if (!userData.success) {
        addLog(`❌ 用户信息获取失败: ${userData.error}`)
        return
      }
      
      // 获取链上余额
      const chainBalance = await getChainBalance(userAddress)
      
      const accountInfo: AccountData = {
        ...userData.data,
        chain_usdt_balance: chainBalance.usdt,
        chain_eth_balance: chainBalance.eth
      }
      
      setAccountData(accountInfo)
      addLog(`✅ 账户数据获取成功`)
      addLog(`   - 钱包地址: ${accountInfo.wallet_address}`)
      addLog(`   - 链上USDT余额: ${accountInfo.chain_usdt_balance}`)
      addLog(`   - 链上ETH余额: ${accountInfo.chain_eth_balance}`)
      addLog(`   - 总产量: ${accountInfo.a_eth} ETH`)
      addLog(`   - 可兑换: ${accountInfo.eth} ETH`)
      addLog(`   - 已兑换: ${accountInfo.usdt} USDT`)
      addLog(`   - 已提现: ${accountInfo.withdrawal_usdt} USDT`)
      addLog(`   - 可提现: ${accountInfo.withdrawable_usdt} USDT`)
      
    } catch (error) {
      addLog(`❌ 获取账户数据失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // 获取交易记录
  const fetchTransactionRecords = async () => {
    try {
      addLog('📝 获取交易记录...')
      
      const response = await fetch(`/api/user/transactions?address=${userAddress}`)
      const data = await response.json()
      
      if (data.success) {
        setExchangeRecords(data.data.exchangeRecords || [])
        setWithdrawRecords(data.data.withdrawRecords || [])
        setEarningsRecords(data.data.earningsRecords || [])
        
        addLog(`✅ 交易记录获取成功`)
        addLog(`   - 兑换记录: ${data.data.exchangeRecords?.length || 0} 条`)
        addLog(`   - 提现记录: ${data.data.withdrawRecords?.length || 0} 条`)
        addLog(`   - 收益记录: ${data.data.earningsRecords?.length || 0} 条`)
      } else {
        addLog(`❌ 交易记录获取失败: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ 获取交易记录失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // 测试授权流程
  const testAuthorization = async () => {
    setLoading(true)
    try {
      addLog('🔐 开始测试授权流程...')
      
      // 1. 用户授权
      addLog('步骤1: 用户授权...')
      const authResponse = await fetch('/api/user/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userAddress,
          isAuthorized: true
        })
      })
      
      const authData = await authResponse.json()
      if (!authData.success) {
        addLog(`❌ 授权失败: ${authData.error}`)
        return
      }
      
      addLog(`✅ 授权成功`)
      addLog(`   - 授权金额: ${authData.data.authAmount} USDT`)
      
      // 2. 刷新账户数据
      addLog('步骤2: 刷新账户数据...')
      await fetchAccountData()
      
      // 3. 刷新交易记录
      addLog('步骤3: 刷新交易记录...')
      await fetchTransactionRecords()
      
      addLog('🎉 授权流程测试完成!')
      
    } catch (error) {
      addLog(`❌ 授权测试失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // 测试兑换流程
  const testExchange = async () => {
    if (!accountData) {
      addLog('❌ 请先获取账户数据')
      return
    }
    
    setLoading(true)
    try {
      addLog('💱 开始测试兑换流程...')
      
      const exchangeAmount = 0.001 // 兑换0.001 ETH
      addLog(`步骤1: 兑换 ${exchangeAmount} ETH 为 USDT...`)
      
      const exchangeResponse = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userAddress,
          from: 'ETH',
          to: 'USDT',
          amount: exchangeAmount
        })
      })
      
      const exchangeData = await exchangeResponse.json()
      if (!exchangeData.success) {
        addLog(`❌ 兑换失败: ${exchangeData.error}`)
        return
      }
      
      addLog(`✅ 兑换成功`)
      addLog(`   - 兑换金额: ${exchangeData.data.exchange.fromAmount} ETH`)
      addLog(`   - 获得USDT: ${exchangeData.data.exchange.toAmount} USDT`)
      addLog(`   - 汇率: ${exchangeData.data.exchange.rate}`)
      
      // 刷新数据
      addLog('步骤2: 刷新账户数据和交易记录...')
      await fetchAccountData()
      await fetchTransactionRecords()
      
      addLog('🎉 兑换流程测试完成!')
      
    } catch (error) {
      addLog(`❌ 兑换测试失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // 测试提现流程
  const testWithdraw = async () => {
    if (!accountData) {
      addLog('❌ 请先获取账户数据')
      return
    }
    
    setLoading(true)
    try {
      addLog('💸 开始测试提现流程...')
      
      const withdrawAmount = 1.0 // 提现1 USDT
      addLog(`步骤1: 提现 ${withdrawAmount} USDT...`)
      
      const withdrawResponse = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userAddress,
          amount: withdrawAmount,
          withdrawAddress: userAddress
        })
      })
      
      const withdrawData = await withdrawResponse.json()
      if (!withdrawData.success) {
        addLog(`❌ 提现失败: ${withdrawData.error}`)
        return
      }
      
      addLog(`✅ 提现申请成功`)
      addLog(`   - 提现金额: ${withdrawData.data.amount} USDT`)
      addLog(`   - 提现ID: ${withdrawData.data.withdrawId}`)
      
      // 刷新数据
      addLog('步骤2: 刷新账户数据和交易记录...')
      await fetchAccountData()
      await fetchTransactionRecords()
      
      addLog('🎉 提现流程测试完成!')
      
    } catch (error) {
      addLog(`❌ 提现测试失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // 完整流程测试
  const testCompleteFlow = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog('🚀 开始完整流程测试...')
      
      // 1. 获取初始数据
      addLog('步骤1: 获取初始账户数据...')
      await fetchAccountData()
      await fetchTransactionRecords()
      
      // 2. 测试授权
      addLog('步骤2: 测试授权流程...')
      await testAuthorization()
      
      // 3. 测试兑换
      addLog('步骤3: 测试兑换流程...')
      await testExchange()
      
      // 4. 测试提现
      addLog('步骤4: 测试提现流程...')
      await testWithdraw()
      
      addLog('🎉 完整流程测试完成!')
      
    } catch (error) {
      addLog(`❌ 完整流程测试失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userAddress) {
      fetchAccountData()
      fetchTransactionRecords()
    }
  }, [userAddress])

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">我的账户完整流程测试</h1>
        
        {/* 地址输入 */}
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

        {/* 控制按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={fetchAccountData}
            disabled={loading}
            className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {loading ? '加载中...' : '获取账户数据'}
          </button>
          
          <button
            onClick={testAuthorization}
            disabled={loading}
            className="p-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {loading ? '测试中...' : '测试授权'}
          </button>
          
          <button
            onClick={testExchange}
            disabled={loading}
            className="p-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {loading ? '测试中...' : '测试兑换'}
          </button>
          
          <button
            onClick={testWithdraw}
            disabled={loading}
            className="p-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {loading ? '测试中...' : '测试提现'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 我的账户卡片 */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">我的账户</h2>
            {accountData ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">钱包地址</label>
                    <p className="text-sm font-mono">{accountData.wallet_address}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">授权状态</label>
                    <p className="text-sm">{accountData.approved ? '已授权' : '未授权'}</p>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <h3 className="text-lg font-semibold mb-2">链上余额</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">USDT余额</label>
                      <p className="text-lg font-bold text-green-400">{accountData.chain_usdt_balance} USDT</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">ETH余额</label>
                      <p className="text-lg font-bold text-blue-400">{accountData.chain_eth_balance} ETH</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <h3 className="text-lg font-semibold mb-2">账户余额</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">总产量 (累加)</span>
                      <span className="font-bold text-yellow-400">{accountData.a_eth} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">可兑换</span>
                      <span className="font-bold text-blue-400">{accountData.eth} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">已兑换 (累加)</span>
                      <span className="font-bold text-green-400">{accountData.usdt} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">已提现 (累加)</span>
                      <span className="font-bold text-purple-400">{accountData.withdrawal_usdt} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">可提现</span>
                      <span className="font-bold text-orange-400">{accountData.withdrawable_usdt} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">总分红</span>
                      <span className="font-bold text-pink-400">{accountData.dividend_usdt} USDT</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <h3 className="text-lg font-semibold mb-2">其他信息</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">推荐码</span>
                      <span>{accountData.referral_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">每日奖励率</span>
                      <span>{accountData.daily_reward_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">今日奖励次数</span>
                      <span>{accountData.reward_count_today}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">点击"获取账户数据"加载信息</p>
            )}
          </div>

          {/* 交易记录 */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">交易记录</h2>
            
            <div className="space-y-4">
              {/* 兑换记录 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">兑换记录 ({exchangeRecords.length})</h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {exchangeRecords.length > 0 ? (
                    exchangeRecords.slice(0, 5).map((record, index) => (
                      <div key={index} className="text-sm bg-gray-800 p-2 rounded">
                        <div className="flex justify-between">
                          <span>{record.eth_amount} ETH → {record.usdt_amount} USDT</span>
                          <span className="text-gray-400">{new Date(record.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">暂无兑换记录</p>
                  )}
                </div>
              </div>

              {/* 提现记录 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-400">提现记录 ({withdrawRecords.length})</h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {withdrawRecords.length > 0 ? (
                    withdrawRecords.slice(0, 5).map((record, index) => (
                      <div key={index} className="text-sm bg-gray-800 p-2 rounded">
                        <div className="flex justify-between">
                          <span>{record.amount} USDT</span>
                          <span className="text-gray-400">{new Date(record.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">暂无提现记录</p>
                  )}
                </div>
              </div>

              {/* 收益记录 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">收益记录 ({earningsRecords.length})</h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {earningsRecords.length > 0 ? (
                    earningsRecords.slice(0, 5).map((record, index) => (
                      <div key={index} className="text-sm bg-gray-800 p-2 rounded">
                        <div className="flex justify-between">
                          <span>{record.amount} {record.type}</span>
                          <span className="text-gray-400">{new Date(record.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">暂无收益记录</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 完整流程测试按钮 */}
        <div className="mb-6">
          <button
            onClick={testCompleteFlow}
            disabled={loading}
            className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold text-lg"
          >
            {loading ? '完整流程测试中...' : '🚀 完整流程测试 (授权→兑换→提现)'}
          </button>
        </div>

        {/* 测试日志 */}
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
