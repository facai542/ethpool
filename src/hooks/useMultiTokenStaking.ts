'use client'

import { useAccount, useReadContract, useWriteContract, useSwitchChain } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { mainnet } from 'wagmi/chains'
import { USDT_ABI } from '@/lib/contracts'
import { TokenConfig, getTokenConfig, isNativeToken } from '@/lib/multi-token-config'
import { getStakingContractFromEnv } from '@/lib/load-env'

// 获取质押合约地址
const STAKING_CONTRACT = getStakingContractFromEnv()

export const useMultiTokenStaking = () => {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const { writeContract } = useWriteContract()

  // 检查是否在ETH网络
  const isOnETH = chainId === 1

  // 获取代币余额
  const getTokenBalance = (tokenSymbol: string) => {
    const tokenConfig = getTokenConfig(tokenSymbol)
    if (!tokenConfig) return { data: null, refetch: () => {} }

    // Native ETH余额处理
    if (isNativeToken(tokenConfig.address)) {
      // 这里需要特殊处理Native ETH余额
      return { data: null, refetch: () => {} }
    }

    // ERC-20代币余额
    const { data, refetch } = useReadContract({
      address: tokenConfig.address as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'balanceOf',
      args: [address],
      query: { enabled: !!address && isOnETH }
    })

    return {
      data: data ? formatUnits(data as bigint, tokenConfig.decimals) : '0',
      refetch
    }
  }

  // 获取代币verify额度
  const getTokenAllowance = (tokenSymbol: string) => {
    const tokenConfig = getTokenConfig(tokenSymbol)
    if (!tokenConfig || isNativeToken(tokenConfig.address)) {
      return { data: null, refetch: () => {} }
    }

    const { data, refetch } = useReadContract({
      address: tokenConfig.address as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'allowance',
      args: [address, STAKING_CONTRACT],
      query: { enabled: !!address && isOnETH }
    })

    return {
      data: data ? formatUnits(data as bigint, tokenConfig.decimals) : '0',
      refetch
    }
  }

  // 切换到ETH网络
  const switchToETH = async () => {
    try {
      await switchChain({ chainId: mainnet.id })
    } catch (error) {
      console.error('切换到ETH网络失败:', error)
      throw error
    }
  }

  // verify代币
  const approveToken = async (tokenSymbol: string, amount?: string) => {
    const tokenConfig = getTokenConfig(tokenSymbol)
    if (!tokenConfig) throw new Error(`不支持的代币: ${tokenSymbol}`)

    // Native ETH不需要verify
    if (isNativeToken(tokenConfig.address)) {
      throw new Error('Native ETH不需要授权')
    }

    const approveAmount = amount || tokenConfig.defaultApproveAmount
    const parsedAmount = parseUnits(approveAmount, tokenConfig.decimals)
    
    return writeContract({
      address: tokenConfig.address as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'approve',
      args: [STAKING_CONTRACT, parsedAmount]
    })
  }

  // 质押代币
  const stakeToken = async (tokenSymbol: string, amount: string, ratio = 100) => {
    const tokenConfig = getTokenConfig(tokenSymbol)
    if (!tokenConfig) throw new Error(`不支持的代币: ${tokenSymbol}`)

    const parsedAmount = parseUnits(amount, tokenConfig.decimals)
    
    // 这里需要根据不同代币调用不同的质押函数
    // 暂时使用通用的create方法，实际项目中可能需要不同的合约方法
    return writeContract({
      address: STAKING_CONTRACT as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: '_token', type: 'address' },
            { name: '_amount', type: 'uint256' },
            { name: '_ratio', type: 'uint256' }
          ],
          name: 'createMultiToken',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function'
        }
      ],
      functionName: 'createMultiToken',
      args: [tokenConfig.address, parsedAmount, ratio]
    })
  }

  // 检查代币授权状态
  const isTokenAuthorized = (tokenSymbol: string, requiredAmount?: string) => {
    const allowanceData = getTokenAllowance(tokenSymbol)
    const allowance = Number.parseFloat(allowanceData.data || '0')
    const required = Number.parseFloat(requiredAmount || '0')
    
    return allowance >= required && allowance > 0
  }

  return {
    // 状态
    address,
    isConnected,
    chainId,
    isOnSupportedNetwork: isOnETH,
    
    // 代币相关
    getTokenBalance,
    getTokenAllowance,
    isTokenAuthorized,
    
    // 操作
    switchToETH,
    approveToken,
    stakeToken
  }
} 