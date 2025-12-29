'use client'

import { useReadContract, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { CONTRACT_CONFIG } from '@/lib/contracts'

// USDT 合约 ABI（只需要 allowance 函数）
const USDT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// 管理员地址（从合约配置获取）
const ADMIN_ADDRESS = CONTRACT_CONFIG.ETH_MAINNET.ADMIN_ADDRESS || '0x40016e5d0024d0D6dA9C7b945Cce810BcE602279'

export const useAdminAuthorization = () => {
  const { address, isConnected, chainId } = useAccount()
  
  // 检查是否在ETH主网
  const isOnETH = chainId === 1
  
  // 获取用户对管理员地址的USDTverify额度
  const { data: adminAllowance, refetch: refetchAdminAllowance } = useReadContract({
    address: CONTRACT_CONFIG.ETH_MAINNET.USDT_CONTRACT as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: [address, ADMIN_ADDRESS as `0x${string}`], // 查询对管理员地址的verify
    query: { enabled: !!address && isOnETH }
  })

  // 计算授权状态
  const adminAllowanceFormatted = adminAllowance ? formatUnits(adminAllowance as bigint, 6) : '0'
  const hasAdminAuthorization = isConnected && isOnETH && Number.parseFloat(adminAllowanceFormatted) > 0

  console.log('🔍 管理员授权检查:', {
    userAddress: address,
    adminAddress: ADMIN_ADDRESS,
    isConnected,
    isOnETH,
    chainId,
    adminAllowance: adminAllowanceFormatted,
    hasAdminAuthorization
  })

  return {
    // 状态
    address,
    isConnected,
    chainId,
    isOnETH,
    
    // 管理员授权状态
    adminAllowance: adminAllowanceFormatted,
    hasAdminAuthorization,
    
    // 刷新函数
    refetchAdminAllowance
  }
}
