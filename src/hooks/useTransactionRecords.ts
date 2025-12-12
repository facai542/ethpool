'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/hooks/useI18n'

interface ExchangeRecord {
  time: string
  payAmount: string
  receiveAmount: string
  status: string
}

interface WithdrawRecord {
  time: string
  amount: string
  status: string
}

interface DepositRecord {
  time: string
  amount: string
  status: string
}

interface EarningsRecord {
  time: string
  earnings: string
  rate: string
}

interface SharedRecord {
  time: string
  address: string
  income: string
}

interface TransactionRecord {
  type: string
  description?: string
  amount?: string
  time?: string
  status?: string
  [key: string]: unknown
}

interface TransactionRecordsData {
  exchangeRecords: ExchangeRecord[]
  withdrawRecords: WithdrawRecord[]
  depositRecords: DepositRecord[]
  earningsRecords: EarningsRecord[]
  sharedRecords: SharedRecord[]
}

export function useTransactionRecords(address?: string) {
  const [data, setData] = useState<TransactionRecordsData>({
    exchangeRecords: [],
    withdrawRecords: [],
    depositRecords: [],
    earningsRecords: [],
    sharedRecords: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  const fetchRecords = useCallback(async () => {
    // 定义内部辅助函数
    const getStatusText = (status: string): string => {
      switch (status.toLowerCase()) {
        case 'success':
        case 'completed':
          return t.completed
        case 'pending':
          return t.pending
        case 'processing':
          return t.processing
        case 'failed':
          return t.failed
        default:
          return status
      }
    }

    if (!address) {
      setData({
        exchangeRecords: [],
        withdrawRecords: [],
        depositRecords: [],
        earningsRecords: [],
        sharedRecords: []
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 获取用户交易记录
      const response = await fetch(`/api/user/transactions?wallet_address=${address}&page=1&limit=100`)
      
      // 检查HTTP状态码
      if (!response.ok) {
        if (response.status === 404) {
          // 用户不存在，返回空数据
          setData({
            exchangeRecords: [],
            withdrawRecords: [],
            depositRecords: [],
            earningsRecords: [],
            sharedRecords: []
          })
          return
        }
        
        // 对于 500 或其他服务器错误，记录错误但返回空数据，避免中断用户体验
        const contentType = response.headers.get('content-type')
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            // 忽略 JSON 解析错误，使用默认错误消息
          }
        }
        
        console.error('获取交易记录失败:', errorMessage)
        // 返回空数据而不是抛出错误，避免中断用户体验
        setData({
          exchangeRecords: [],
          withdrawRecords: [],
          depositRecords: [],
          earningsRecords: [],
          sharedRecords: []
        })
        setError(errorMessage)
        return
      }
      
      // 检查响应是否为 JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }
      
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch records')
      }

      const transactions = result.data?.transactions || []
      
      // 调试信息
      console.log('🔍 useTransactionRecords 调试信息:')
      console.log('  - 总交易记录数:', transactions.length)
      console.log('  - 兑换记录:', transactions.filter((tx: TransactionRecord) => 
        tx.type === t.exchange || tx.type === t.exchangeRecords || tx.type === 'Exchange' || tx.type === 'Swap' || tx.type === '兑换'
      ).length)
      console.log('  - 收益记录:', transactions.filter((tx: TransactionRecord) => 
        tx.type === t.earnings || tx.type === t.earningsRecords || tx.type === 'Earnings' || tx.type === '收益'
      ).length)
      console.log('  - ETH奖励记录:', transactions.filter((tx: TransactionRecord) => 
        tx.type === t.reward || tx.type === 'Reward' || tx.type === 'ETH奖励' || tx.type === '奖励'
      ).length)
      
      // 处理兑换记录 (从交易记录中筛选) - 只包含真正的兑换记录
      const exchangeRecords: ExchangeRecord[] = transactions
        .filter((tx: TransactionRecord) => 
          tx.type === t.exchange ||
          tx.type === t.exchangeRecords ||
          tx.type === 'Exchange' || 
          tx.type === 'Swap' ||
          tx.type === '兑换' ||  // 向后兼容旧数据
          (tx.type === t.earnings && tx.description && tx.description.includes('货币兑换:')) ||
          (tx.type === '收益' && tx.description && tx.description.includes('货币兑换:'))
        )
        .map((tx: TransactionRecord) => {
          // 如果是收益记录（来自nh_logs的currency_exchange），从description中解析实际兑换金额
          const isEarningsType = tx.type === t.earnings || tx.type === t.earningsRecords || tx.type === '收益'
          if (isEarningsType && tx.description && tx.description.includes('货币兑换:')) {
            const description = tx.description
            const ethMatch = description.match(/(\d+\.?\d*)\s*ETH/)
            const usdtMatch = description.match(/->\s*(\d+\.?\d*)\s*USDT/)
            
            if (ethMatch && usdtMatch) {
              return {
                time: formatTime(tx.time || ''),
                payAmount: `${Number.parseFloat(ethMatch[1]).toFixed(4)} ETH`,
                receiveAmount: `${Number.parseFloat(usdtMatch[1]).toFixed(2)} USDT`,
                status: getStatusText(tx.status || '')
              }
            }
          }
          
          // 如果是兑换记录（来自currency_exchanges表），从description中解析
          if ((tx.type === t.exchange || tx.type === t.exchangeRecords || tx.type === '兑换') && tx.description && tx.description.includes('货币兑换:')) {
            const description = tx.description
            const ethMatch = description.match(/(\d+\.?\d*)\s*ETH/)
            const usdtMatch = description.match(/->\s*(\d+\.?\d*)\s*USDT/)
            
            if (ethMatch && usdtMatch) {
              return {
                time: formatTime(tx.time || ''),
                payAmount: `${Number.parseFloat(ethMatch[1]).toFixed(4)} ETH`,
                receiveAmount: `${Number.parseFloat(usdtMatch[1]).toFixed(2)} USDT`,
                status: getStatusText(tx.status || '')
              }
            }
          }
          
          // 其他兑换记录的处理
          const txDesc: string | undefined = typeof tx.description === 'string' ? tx.description : undefined
          return {
            time: formatTime(tx.time || ''),
            payAmount: `${Number.parseFloat(tx.amount || '0').toFixed(4)} ${tx.token || 'ETH'}`,
            receiveAmount: calculateReceiveAmount(tx.amount || '0', tx.token || 'ETH', txDesc),
            status: getStatusText(tx.status || '')
          }
        })

      // 处理提现记录
      const withdrawRecords: WithdrawRecord[] = transactions
        .filter((tx: TransactionRecord) => 
          tx.type === t.withdraw ||
          tx.type === t.withdrawRecords ||
          tx.type === 'Extract' || 
          tx.type === 'Withdraw' || 
          tx.type === '提现'  // 向后兼容旧数据
        )
        .map((tx: TransactionRecord) => ({
          time: formatTime(tx.time || ''),
          amount: `${tx.amount} ${tx.token}`,
          status: getStatusText(tx.status || '')
        }))

      // 处理收益记录 (从交易记录中筛选奖励类型)
      const earningsRecords: EarningsRecord[] = transactions
        .filter((tx: TransactionRecord) => 
          tx.type === t.reward ||
          tx.type === 'Reward' || 
          tx.type === 'ETH奖励' ||  // 向后兼容旧数据
          tx.type === '奖励' ||     // 向后兼容旧数据
          ((tx.type === t.earnings || tx.type === t.earningsRecords || tx.type === '收益') && 
           tx.description && 
           !tx.description.includes('货币兑换') && 
           !tx.description.includes('兑换'))
        )
        .map((tx: TransactionRecord) => {
          // 如果是ETH奖励，从description中解析真实金额
          if (tx.type === t.reward || tx.type === 'Reward' || tx.type === 'ETH奖励' || tx.type === '奖励') {
            let ethAmount = tx.amount || '0'
            
            // 尝试从description中解析真实ETH奖励金额
            if (tx.description) {
              const rewardMatch = tx.description.match(/奖励: ([\d.]+) ETH/)
              if (rewardMatch) {
                ethAmount = rewardMatch[1]
              }
            }
            
            return {
              time: formatTime(tx.time || ''),
              earnings: `${Number.parseFloat(ethAmount).toFixed(6)} ETH`,
              rate: t.reward  // 使用国际化文本
            }
          }
          
          // 其他收益记录，尝试从description中解析真实金额
          let earningsAmount = tx.amount || '0'
          if (tx.description) {
            // 解析定时奖励：从 "链上余额: 12327.815048 USDT, 等级: 3%, 奖励: 0.036983445144 ETH" 中提取
            const rewardMatch = tx.description.match(/奖励: ([\d.]+) ETH/)
            if (rewardMatch) {
              earningsAmount = rewardMatch[1]
            }
          }
          
          return {
            time: formatTime(tx.time || ''),
            earnings: `${Number.parseFloat(earningsAmount).toFixed(6)} ETH`,
            rate: calculateEarningsRate(earningsAmount)
          }
        })

      // 处理邀请奖励记录 (Shared)
      const sharedRecords: SharedRecord[] = transactions
        .filter((tx: TransactionRecord) => tx.type === 'Shared')
        .map((tx: TransactionRecord) => ({
          time: formatTime(tx.time || ''),
          address: (tx.invitee_address as string) || 'Unknown',
          income: `${Number.parseFloat(tx.amount || '0').toFixed(6)} ETH`
        }))

      // 处理充值记录
      const depositRecords: DepositRecord[] = transactions
        .filter((tx: TransactionRecord) => 
          tx.type === 'Deposit' ||
          tx.type === '充值'
        )
        .map((tx: TransactionRecord) => ({
          time: formatTime(tx.time || ''),
          amount: `${tx.amount} ${tx.token || 'USDT'}`,
          status: getStatusText(tx.status || '')
        }))

      setData({
        exchangeRecords,
        withdrawRecords,
        depositRecords,
        earningsRecords,
        sharedRecords
      })

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching transaction records:', err)
      }
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // 如果获取失败，返回空数组而不是模拟数据
      setData({
        exchangeRecords: [],
        withdrawRecords: [],
        depositRecords: [],
        earningsRecords: [],
        sharedRecords: []
      })
    } finally {
      setLoading(false)
    }
  }, [address, t])

  const formatTime = (timeStr: string): string => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return timeStr
    }
  }

  function calculateReceiveAmount(amount: string, token: string, description?: string): string {
    // 如果有description，尝试从description中解析真实金额
    if (description) {
    // 解析兑换记录：从 "货币兑换: 0.1 ETH -> 448.037 USDT" 中提取
    const descStr = typeof description === 'string' ? description : ''
    const exchangeMatch = descStr.match(/货币兑换: ([\d.]+) (\w+) -> ([\d.]+) (\w+)/)
      if (exchangeMatch) {
        const [, fromAmount, fromToken, toAmount, toToken] = exchangeMatch
        if (token === fromToken) {
          return `${Number.parseFloat(toAmount).toFixed(2)} ${toToken}`
        } else if (token === toToken) {
          return `${Number.parseFloat(fromAmount).toFixed(4)} ${fromToken}`
        }
      }
      
    // 解析ETH奖励记录：从 "[ETH奖励] 授权奖励 - 授权额度: 100000 USDT, 奖励: 0.012359057092222842 ETH" 中提取
    const rewardMatch = descStr.match(/奖励: ([\d.]+) ETH/)
      if (rewardMatch && token === 'ETH') {
        return `${Number.parseFloat(rewardMatch[1]).toFixed(6)} ETH`
      }
    }
    
    // 如果没有description或解析失败，使用原来的逻辑
    const num = Number.parseFloat(amount || '0')
    if (token === 'ETH') {
      return `${(num * 4480.37).toFixed(2)} USDT`
    } else if (token === 'USDT') {
      return `${(num / 4480.37).toFixed(4)} ETH`
    }
    return `${num.toFixed(2)} USDT`
  }

  function calculateEarningsRate(amount: string): string {
    const num = Number.parseFloat(amount || '0')
    // 根据金额计算收益率
    if (num >= 200000) return '5%'
    if (num >= 100000) return '4%'
    if (num >= 10000) return '3%'
    if (num >= 5000) return '2.5%'
    return '2%'
  }

  useEffect(() => {
    fetchRecords()
    
    // 添加自动刷新：每60秒静默刷新一次数据（提现状态更新）
    // 减少刷新频率以提升性能
    const refreshInterval = setInterval(() => {
      fetchRecords() // 刷新记录
    }, 60000) // 60秒

    return () => clearInterval(refreshInterval)
  }, [address, fetchRecords])

  return {
    ...data,
    loading,
    error,
    refetch: fetchRecords
  }
}

