'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { USDT_ABI } from '@/lib/contracts'
import { getContractFromEnv } from '@/lib/load-env'

// USDT合约地址
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // ETH主网USDT

export interface USDTBalanceData {
  balance: string
  formattedBalance: string
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useUSDTBalance(): USDTBalanceData {
  const { address, isConnected, chainId } = useAccount()
  const [balance, setBalance] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查是否在ETH主网
  const isOnETH = chainId === 1

  // 使用wagmi的useReadContract获取USDT余额
  const { 
    data: balanceData, 
    isLoading: contractLoading, 
    error: contractError,
    refetch: refetchContract 
  } = useReadContract({
    address: USDT_CONTRACT as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { 
      enabled: !!address && isConnected && isOnETH,
      refetchInterval: 10000, // 10秒自动刷新
      refetchIntervalInBackground: true
    }
  })

  // 格式化余额
  const formatBalance = useCallback((rawBalance: bigint | undefined): string => {
    if (!rawBalance) return '0.00'
    try {
      // USDT有6位小数
      const formatted = formatUnits(rawBalance, 6)
      const num = Number.parseFloat(formatted)
      return num.toFixed(2)
    } catch (err) {
      console.error('格式化USDT余额失败:', err)
      return '0.00'
    }
  }, [])

  // 更新余额状态
  useEffect(() => {
    if (contractLoading) {
      setIsLoading(true)
      setError(null)
    } else if (contractError) {
      setIsLoading(false)
      setError(contractError.message || '获取USDT余额失败')
      setBalance('0')
    } else if (balanceData !== undefined) {
      setIsLoading(false)
      setError(null)
      const formatted = formatBalance(balanceData as bigint)
      setBalance(formatted)
    } else {
      setIsLoading(false)
      setError(null)
      setBalance('0')
    }
  }, [balanceData, contractLoading, contractError, formatBalance])

  // 手动刷新函数
  const refetch = useCallback(() => {
    refetchContract()
  }, [refetchContract])

  // 如果未连接或不在ETH网络，返回默认值
  if (!isConnected || !address || !isOnETH) {
    return {
      balance: '0',
      formattedBalance: '0.00 USDT',
      isLoading: false,
      error: !isConnected ? '钱包未连接' : !isOnETH ? '请切换到ETH主网' : null,
      refetch: () => {}
    }
  }

  return {
    balance,
    formattedBalance: `${balance} USDT`,
    isLoading,
    error,
    refetch
  }
}

// 简化版本，只返回格式化的余额字符串
export function useUSDTBalanceSimple(): string {
  const { balance, isLoading } = useUSDTBalance()
  
  if (isLoading) {
    return '加载中...'
  }
  
  return balance
}

// 带网络检查的版本
export function useUSDTBalanceWithNetwork() {
  const { address, isConnected, chainId } = useAccount()
  const balanceData = useUSDTBalance()
  
  return {
    ...balanceData,
    isOnETH: chainId === 1,
    networkName: chainId === 1 ? 'Ethereum Mainnet' : `Chain ${chainId}`,
    needsNetworkSwitch: isConnected && chainId !== 1
  }
}






