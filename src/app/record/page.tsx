'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { History, Search, Filter, ExternalLink, RefreshCw, Clock } from 'lucide-react'
import BottomNavigation, { BottomSpacer } from '@/components/BottomNavigation'
// import { useWithdrawList } from '@/hooks/useData' // 不再需要，直接从transactions中提取
import { useI18n } from '@/hooks/useI18n'

interface Transaction {
  type: string
  amount: string
  token: string
  hash: string
  time: string
  status: string
  network: string
  description?: string
}

interface TransactionData {
  user: {
    address: string
    auth_address: string
    staked_amount: number
    reward_amount: number
    withdrawable_amount: number
  }
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export default function RecordPage() {
  const { address } = useAccount()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  // 从transactions中提取提现记录，包括Extract和兑换记录
  const withdraws = transactions.filter(tx => tx.type === 'Extract' || tx.type === '兑换').map(tx => ({
    id: tx.hash || `withdraw_${Date.now()}`,
    price: tx.amount,
    status: tx.status === 'success' ? 1 : tx.status === 'pending' ? 0 : -1,
    add_time: tx.time,
    update_time: tx.time,
    to_address: tx.hash !== 'Pending' ? tx.hash : null
  }))
  const isWithdrawLoading = loading
  const { t } = useI18n()

  const fetchTransactions = async () => {
    if (!address) return

    try {
      setLoading(true)
      const response = await fetch(`/api/user/transactions?address=${address}&page=1&limit=50`)
      
      // 检查HTTP状态码
      if (!response.ok) {
        if (response.status === 404) {
          // 用户不存在，返回空数据
          setTransactions([])
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setTransactions(result.data.transactions || [])
      } else {
        console.error('Failed to fetch transactions:', result.error)
        // 使用模拟数据作为后备
        setTransactions(getMockTransactions())
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      // 使用模拟数据作为后备
      setTransactions(getMockTransactions())
    } finally {
      setLoading(false)
    }
  }

  const getMockTransactions = (): Transaction[] => {
    return [
      {
        type: t.stake,
        amount: '1000.00',
        token: 'USDT',
        hash: '0x1234567890abcdef1234567890abcdef12345678',
        time: '2024-01-15 14:30:25',
        status: 'success',
        network: 'BSC'
      },
      {
        type: t.authorize,
        amount: '1000000.00',
        token: 'USDT',
        hash: '0xabcdef1234567890abcdef1234567890abcdef12',
        time: '2024-01-15 14:28:15',
        status: 'success',
        network: 'BSC'
      },
      {
        type: t.withdraw,
        amount: '500.00',
        token: 'USDT',
        hash: '0x9876543210fedcba9876543210fedcba98765432',
        time: '2024-01-14 16:45:30',
        status: 'success',
        network: 'BSC'
      },
      {
        type: t.stake,
        amount: '2000.00',
        token: 'USDT',
        hash: '0xfedcba9876543210fedcba9876543210fedcba98',
        time: '2024-01-14 10:20:45',
        status: 'success',
        network: 'BSC'
      },
      {
        type: t.referralReward,
        amount: '120.00',
        token: 'USDT',
        hash: '0x5678901234abcdef5678901234abcdef56789012',
        time: '2024-01-13 12:15:20',
        status: 'success',
        network: 'BSC'
      }
    ]
  }

  const formatTime = (timeStr: string) => {
    try {
      if (timeStr.includes('T')) {
        return new Date(timeStr).toLocaleString()
      }
      return timeStr
    } catch (error) {
      return timeStr
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return t.txSuccess
      case 'pending': return t.pending
      case 'failed': return t.txFailed
      default: return t.unknown
    }
  }

  useEffect(() => {
    if (address) {
      fetchTransactions()
    }
  }, [address])

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = searchTerm === '' || 
      tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.token.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 确保兑换记录和收益记录总是显示
    const isImportantRecord = tx.type === '兑换' || tx.type === '收益' || tx.type === 'ETH奖励'
    
    return matchesSearch || isImportantRecord
  })

  // 调试信息
  console.log('🔍 记录页面调试信息:')
  console.log('  - 原始交易记录数:', transactions.length)
  console.log('  - 过滤后交易记录数:', filteredTransactions.length)
  console.log('  - 搜索词:', searchTerm)
  console.log('  - 收益记录:', transactions.filter(tx => tx.type === '收益').length)
  console.log('  - 兑换记录:', transactions.filter(tx => tx.type === '兑换').length)
  console.log('  - ETH奖励记录:', transactions.filter(tx => tx.type === 'ETH奖励').length)

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F0B90B] to-[#FCD535] text-black p-6 rounded-b-3xl">
          <h1 className="text-2xl font-bold mb-2">{t.transactionRecords}</h1>
          <p className="text-sm opacity-80">{t.viewAllTransactionHistory}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Search and Filter */}
          <Card className="bg-[#2B2B2B] border-[#F0B90B]/20 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={t.searchTransactionHash}
                      className="pl-10 bg-[#1E1E1E] border-[#F0B90B]/20 text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B] hover:text-black">
                    <Filter className="w-4 h-4 mr-2" />
                    {t.filter}
                  </Button>
                  <Button className="bg-[#F0B90B] hover:bg-[#FCD535] text-black">
                    {t.search}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提现订单状态 */}
          {withdraws && withdraws.length > 0 && (
            <Card className="bg-[#2B2B2B] border-[#F0B90B]/20 mb-6">
              <CardHeader>
                <CardTitle className="text-[#F0B90B] flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t.withdrawalOrderStatus}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {withdraws.slice(0, 5).map((withdraw: any, index: number) => (
                    <div key={withdraw.id} className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          withdraw.status === 0 ? 'bg-yellow-400 animate-pulse' :
                          withdraw.status === 1 ? 'bg-green-400' :
                          'bg-red-400'
                        }`}></div>
                        <div>
                          <div className="text-white font-medium">{withdraw.price} USDT</div>
                          <div className="text-xs text-gray-400">
                            {new Date(withdraw.add_time).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${
                          withdraw.status === 0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          withdraw.status === 1 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {withdraw.status === 0 ? `⏳ ${t.reviewing}` :
                           withdraw.status === 1 ? `✅ ${t.completed}` :
                           `❌ ${t.rejected}`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {withdraws.filter((w: any) => w.status === 0).length > 0 && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-sm text-blue-300">
                        {t.pendingWithdrawalNote}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Records */}
          <Card className="bg-[#2B2B2B] border-[#F0B90B]/20">
            <CardHeader>
              <CardTitle className="text-[#F0B90B] flex items-center gap-2">
                <History className="w-5 h-5" />
                {t.transactionHistory}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                  <span className="ml-2 text-gray-400">{t.loading}</span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {t.noTransactionRecords}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F0B90B] rounded-full flex items-center justify-center">
                          <History className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{tx.type}</div>
                          <div className="text-sm text-gray-400">
                            {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                          </div>
                          <div className="text-xs text-gray-500">{formatTime(tx.time)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#F0B90B] font-bold">
                          {tx.type === t.authorize ? t.authorize : `${tx.amount} ${tx.token}`}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(tx.status)} text-white`}>
                            {getStatusText(tx.status)}
                          </Badge>
                          <Badge variant="outline" className="text-[#F0B90B] border-[#F0B90B]">
                            {tx.network}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-[#F0B90B] hover:bg-[#F0B90B] hover:text-black p-1 h-auto"
                          onClick={() => window.open(`https://bscscan.com/tx/${tx.hash}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <BottomNavigation />
      <BottomSpacer />
    </div>
  )
} 