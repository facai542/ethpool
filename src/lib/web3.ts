import { ethers } from 'ethers'
import { CURRENT_NETWORK } from './contracts'

export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
  isLoading: boolean
  error: string | null
}

// BSC Provider
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  // 使用BSC RPC作为fallback
  return new ethers.JsonRpcProvider(CURRENT_NETWORK.RPC_URL)
}

// BSC Signer
export const getSigner = async () => {
  const provider = getProvider()
  if ('getSigner' in provider) {
    return await provider.getSigner()
  }
  throw new Error('No wallet connected')
}

// 格式化USDT数量 (18位小数)
export const formatUsdt = (wei: bigint): string => {
  return ethers.formatUnits(wei, 18)
}

// 解析USDT数量 (18位小数)
export const parseUsdt = (amount: string): bigint => {
  return ethers.parseUnits(amount, 18)
}

// 检查是否安装了MetaMask
export const isMetaMaskInstalled = (): boolean => {
  return Boolean(window.ethereum?.isMetaMask)
}

// 切换到BSC网络
export const switchToBSC = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  
  try {
    // 尝试切换到BSC主网
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38' }], // 56 in hex
    })
  } catch (switchError: any) {
    // 如果网络不存在，添加BSC网络
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x38',
          chainName: 'BSC Mainnet',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
          },
          rpcUrls: [CURRENT_NETWORK.RPC_URL],
          blockExplorerUrls: [CURRENT_NETWORK.EXPLORER_URL]
        }]
      })
    } else {
      throw switchError
    }
  }
}

// 获取当前网络名称
export const getCurrentNetworkName = (): string => {
  if (CURRENT_NETWORK.CHAIN_ID === 56) return 'BSC Mainnet'
  if (CURRENT_NETWORK.CHAIN_ID === 97) return 'BSC Testnet'
  return 'BSC Mainnet' // 默认
}

// 切换到当前网络（BSC）
export const switchToCurrentNetwork = switchToBSC

// Note: window.ethereum types are defined globally elsewhere
