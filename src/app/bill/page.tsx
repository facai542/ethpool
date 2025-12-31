'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Receipt, TrendingDown, TrendingUp, CreditCard, RefreshCw, Search, Filter, Download } from 'lucide-react'
import BottomNavigation, { BottomSpacer } from '@/components/BottomNavigation'
import LanguageSelector from '@/components/LanguageSelector'
import { useI18n } from '@/hooks/useI18n'
import apiClient from '@/lib/api'

interface UserProfile {
  usdt: number
  cash: number
  withdrawal_usdt: number
  id: number
  address: string
  auth_address: string
}

interface Transaction {
  type: string
  amount: string
  token: string
  hash: string
  time: string
  status: string
  network: string
  description: string
}

interface BillRecord {
  id: string
  type: string
  amount: string
  date: string
  status: string
  description: string
  category: 'staking' | 'reward' | 'withdrawal' | 'fee' | 'other'
}

export default function BillPage() {
  const { address } = useAccount()
  const { t } = useI18n()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchUserTransactions = async () => {
    if (!address) return

    try {
      setLoading(true)
      
      // 获取用户信息
      const userInfo = await apiClient.fetchUserInfo(address)
      setUserProfile({
        id: Number.parseInt(userInfo.id),
        address: userInfo.wallet_address || address,
        auth_address: userInfo.wallet_address || address,
        usdt: userInfo.usdt || 0,
        cash: userInfo.cash || 0,
        withdrawal_usdt: userInfo.totalRewards || 0
      })

      // 获取交易记录
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
      
      const data = await response.json()
      
      if (data.success && data.data.transactions) {
        setTransactions(data.data.transactions)
      }
    } catch (error) {
      console.error('获取交易记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserTransactions()
  }, [address])

  // 将交易记录转换为账单记录格式
  const convertTransactionsToBillRecords = (transactions: Transaction[]): BillRecord[] => {
    return transactions.map((tx, index) => {
      const isIncome = tx.type === '奖励' || tx.type === '收益'
      const amount = tx.amount === 'verify' ? '0' : tx.amount
      const category = getCategoryFromType(tx.type)
      
      return {
        id: `BILL-${new Date(tx.time).getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        type: getTransactionTypeLabel(tx.type),
        amount: isIncome ? `-${amount}` : amount,
        date: new Date(tx.time).toISOString().split('T')[0],
        status: tx.status === 'success' ? 'paid' : tx.status,
        description: tx.description,
        category
      }
    })
  }

  const getCategoryFromType = (type: string): 'staking' | 'reward' | 'withdrawal' | 'fee' | 'other' => {
    const categoryMap: { [key: string]: 'staking' | 'reward' | 'withdrawal' | 'fee' | 'other' } = {
      '质押': 'staking',
      '提取': 'withdrawal',
      'verify': 'fee',
      '奖励': 'reward',
      '收益': 'reward',
      '归集': 'fee'
    }
    return categoryMap[type] || 'other'
  }

  const getTransactionTypeLabel = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      '质押': t.stakingFees,
      '提取': t.withdrawalFees,
      'verify': t.authorizationFees,
      '奖励': t.systemRewards,
      '收益': t.miningRewards,
      '归集': t.networkFees
    }
    return typeMap[type] || type
  }

  const billRecords = convertTransactionsToBillRecords(transactions)
  const filteredRecords = billRecords.filter(record =>
    record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 计算统计数据
  const totalExpense = billRecords
    .filter(record => !record.amount.startsWith('-') && record.amount !== '0')
    .reduce((sum, record) => sum + Number.parseFloat(record.amount), 0)

  const totalIncome = billRecords
    .filter(record => record.amount.startsWith('-'))
    .reduce((sum, record) => sum + Number.parseFloat(record.amount.replace('-', '')), 0)

  const totalBill = totalExpense - totalIncome

  // 按类别统计
  const stakingTotal = billRecords
    .filter(record => record.category === 'staking')
    .reduce((sum, record) => sum + Number.parseFloat(record.amount.replace('-', '')), 0)

  const rewardTotal = billRecords
    .filter(record => record.category === 'reward')
    .reduce((sum, record) => sum + Number.parseFloat(record.amount.replace('-', '')), 0)

  const withdrawalTotal = billRecords
    .filter(record => record.category === 'withdrawal')
    .reduce((sum, record) => sum + Number.parseFloat(record.amount.replace('-', '')), 0)

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F0B90B] to-[#FCD535] text-black p-6 rounded-b-3xl">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">{t.billDetails}</h1>
            <LanguageSelector />
          </div>
          <p className="text-sm opacity-80">{t.billViewAllTransactionFees}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#2B2B2B] border-[#F0B90B]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-500 flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4" />
                  {t.expenses}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <>
                    <div className="text-xl font-bold text-white">{totalExpense.toFixed(2)}</div>
                    <p className="text-xs text-gray-400">USDT</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#2B2B2B] border-[#F0B90B]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-500 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  {t.income}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <>
                    <div className="text-xl font-bold text-white">{totalIncome.toFixed(2)}</div>
                    <p className="text-xs text-gray-400">USDT</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#2B2B2B] border-[#F0B90B]/20 col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#F0B90B] flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  {t.netExpenses}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-white">{totalBill.toFixed(2)}</div>
                    <p className="text-sm text-gray-400">USDT</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-[#2B2B2B] border-blue-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-blue-400 text-sm font-semibold">{t.stakingFees}</div>
                <div className="text-lg font-bold text-white">{stakingTotal.toFixed(2)}</div>
                <div className="text-xs text-gray-400">USDT</div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#2B2B2B] border-green-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-green-400 text-sm font-semibold">{t.systemRewards}</div>
                <div className="text-lg font-bold text-white">{rewardTotal.toFixed(2)}</div>
                <div className="text-xs text-gray-400">USDT</div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#2B2B2B] border-purple-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-purple-400 text-sm font-semibold">{t.withdrawalFees}</div>
                <div className="text-lg font-bold text-white">{withdrawalTotal.toFixed(2)}</div>
                <div className="text-xs text-gray-400">USDT</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="bg-[#2B2B2B] border-[#F0B90B]/20 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={t.searchBills}
                      className="pl-10 bg-[#1E1E1E] border-[#F0B90B]/20 text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B] hover:text-black">
                    <Filter className="w-4 h-4 mr-2" />
                    {t.filterBills}
                  </Button>
                  <Button className="bg-[#F0B90B] hover:bg-[#FCD535] text-black">
                    <Download className="w-4 h-4 mr-2" />
                    {t.exportBills}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Records */}
          <Card className="bg-[#2B2B2B] border-[#F0B90B]/20">
            <CardHeader>
              <CardTitle className="text-[#F0B90B] flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                {t.billRecords} ({filteredRecords.length}{t.billRecordsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                  <span className="ml-2 text-gray-400">{t.loading}</span>
                </div>
              ) : !address ? (
                <div className="text-center py-8 text-gray-400">
                  {t.pleaseConnectWallet}
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {searchTerm ? t.noMatchingRecords : t.noBillRecords}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          record.category === 'staking' ? 'bg-blue-500' :
                          record.category === 'reward' ? 'bg-green-500' :
                          record.category === 'withdrawal' ? 'bg-purple-500' :
                          record.category === 'fee' ? 'bg-yellow-500' : 'bg-[#F0B90B]'
                        }`}>
                          <Receipt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{record.type}</div>
                          <div className="text-sm text-gray-400">{record.id}</div>
                          <div className="text-xs text-gray-500">{record.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${
                          record.amount.startsWith('-') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {record.amount === '0' ? t.authorize : 
                           record.amount.startsWith('-') ? '+' + record.amount.replace('-', '') : '-' + record.amount
                          } {record.amount !== '0' ? 'USDT' : ''}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            record.status === 'paid' || record.status === 'success' ? 'bg-green-500' : 
                            record.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          } text-white`}>
                            {record.status === 'paid' || record.status === 'success' ? t.completed : 
                             record.status === 'pending' ? t.pending : t.txFailed}
                          </Badge>
                          <div className="text-sm text-gray-400">{record.date}</div>
                        </div>
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