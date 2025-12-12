// 钱包工具函数 - 移动端优化
import { CURRENT_NETWORK } from './contracts'

// 检测移动端环境
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
  return mobileRegex.test(userAgent.toLowerCase())
}

// 检测是否在钱包应用内浏览器
export function isInWalletBrowser(): boolean {
  if (typeof window === 'undefined') return false
  
  const ethereum = (window as any).ethereum
  if (!ethereum) return false
  
  return !!(
    ethereum.isMetaMask || 
    ethereum.isTrustWallet ||
    ethereum.isBinance ||
    ethereum.isCoinbaseWallet ||
    ethereum.isTokenPocket
  )
}

// 获取钱包类型
export function getWalletType(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ethereum = (window as any).ethereum
  if (!ethereum) return 'none'
  
  if (ethereum.isMetaMask) return 'MetaMask'
  if (ethereum.isTrustWallet) return 'Trust Wallet'
  if (ethereum.isBinance) return 'Binance Wallet'
  if (ethereum.isCoinbaseWallet) return 'Coinbase Wallet'
  if (ethereum.isTokenPocket) return 'TokenPocket'
  
  return 'unknown'
}

// 安全的账户变化处理
export function handleAccountsChangedSafely(
  accounts: string[],
  currentAccount: string | undefined,
  onAccountChange: (account: string | undefined) => void,
  onDisconnect: () => void
): void {
  try {
    console.log('📱 处理账户变化:', { accounts, currentAccount })
    
    // 防止空账户数组
    if (!accounts || accounts.length === 0) {
      console.log('🔄 账户已断开连接')
      onDisconnect()
      return
    }
    
    const newAccount = accounts[0]
    if (newAccount && newAccount !== currentAccount) {
      console.log('🔄 账户切换:', { from: currentAccount, to: newAccount })
      onAccountChange(newAccount)
    }
  } catch (error) {
    console.error('⚠️ 处理账户变化时出错:', error)
    // 不抛出错误，避免崩溃
  }
}

// 安全的网络变化处理
export function handleChainChangedSafely(
  chainId: string,
  onChainChange: (chainId: number) => void
): void {
  try {
    console.log('🌐 处理网络变化:', chainId)
    
    const newChainId = Number.parseInt(chainId, 16)
    if (isNaN(newChainId)) {
      console.error('⚠️ 无效的网络ID:', chainId)
      return
    }
    
    console.log('🌐 新的网络ID:', newChainId)
    onChainChange(newChainId)
  } catch (error) {
    console.error('⚠️ 处理网络变化时出错:', error)
    // 不抛出错误，避免崩溃
  }
}

// 移动端优化的网络切换
export async function switchNetworkMobile(targetChainId: number): Promise<void> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('请安装支持的钱包应用')
  }
  
  const ethereum = (window as any).ethereum
  const isMobile = isMobileDevice()
  
  try {
    console.log('🌐 尝试切换到网络:', targetChainId)
    
    // 移动端添加延迟，确保钱包应用有时间响应
    if (isMobile) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${targetChainId.toString(16)}` }],
    })
    
    console.log('✅ 网络切换成功')
    
  } catch (error) {
    console.log('⚠️ 网络切换错误:', error)
    
    if (error.code === 4902) {
      // 网络不存在，添加新网络
      await addNetworkMobile(targetChainId)
    } else if (error.code === 4001) {
      throw new Error('用户取消了网络切换')
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error) || '网络切换失败'
      throw new Error(`网络切换失败: ${errorMessage}`)
    }
  }
}

// 移动端优化的网络添加
export async function addNetworkMobile(targetChainId: number): Promise<void> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('请安装支持的钱包应用')
  }
  
  const ethereum = (window as any).ethereum
  
  try {
    console.log('📝 添加新网络配置')
    
    const networkConfig = getNetworkConfig(targetChainId)
    
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig]
    })
    
    console.log('✅ 网络添加成功')
    
  } catch (error) {
    console.error('❌ 网络添加失败:', error)
    
    if (error.code === 4001) {
      throw new Error('用户取消了网络添加')
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error) || '网络添加失败'
      throw new Error(`网络添加失败: ${errorMessage}`)
    }
  }
}

// 获取网络配置
function getNetworkConfig(chainId: number) {
  switch (chainId) {
    case 1: // ETH 主网
      return {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://eth.llamarpc.com'],
        blockExplorerUrls: ['https://etherscan.io']
      }
    default:
      throw new Error(`不支持的网络ID: ${chainId}`)
  }
}

// 获取友好的错误信息
export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return '未知错误'
  
  const message = error instanceof Error ? error.message : String(error) || error.toString()
  
  // 常见错误映射
  if (message.includes('User rejected')) {
    return '用户取消了操作'
  }
  
  if (message.includes('No provider')) {
    return '请安装支持的钱包应用 (MetaMask, Trust Wallet, Binance等)'
  }
  
  if (message.includes('Chain not supported')) {
    return '钱包不支持当前网络，请手动添加 BSC 网络'
  }
  
  if (message.includes('Network Error')) {
    return '网络连接错误，请检查网络连接'
  }
  
  if (message.includes('Insufficient funds')) {
    return '余额不足，请确保有足够的 BNB 支付手续费'
  }
  
  return message
} 