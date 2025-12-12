'use client'

import { createContext, useContext, type ReactNode, useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useUSDTBalance } from '@/hooks/useUSDTBalance'
import { useSession } from '@/hooks/useSession'

interface WalletContextType {
  // 账户信息
  account?: string
  isConnected: boolean
  chainId?: number
  balance?: string
  usdtBalance?: string
  formattedUsdtBalance?: string
  
  // 会话信息
  user?: any
  wallet?: any
  session?: any
  isAuthenticated: boolean
  
  // 操作方法
  connect: () => void
  disconnect: () => void
  refetchUsdtBalance: () => void
  refreshSession: () => Promise<void>
  
  // 状态
  isLoading: boolean
  isUsdtBalanceLoading: boolean
  error?: string
  usdtBalanceError?: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export interface WalletProviderProps {
  children: ReactNode
}

// 客户端钱包Provider
function ClientWalletProvider({ children }: WalletProviderProps) {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit() // 使用新的AppKit hook
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  
  // 会话管理
  const { 
    user, 
    wallet, 
    session, 
    isAuthenticated, 
    login, 
    logout, 
    refreshSession 
  } = useSession()
  
  // 获取USDT余额
  const { 
    balance: usdtBalance, 
    formattedBalance: formattedUsdtBalance, 
    isLoading: isUsdtBalanceLoading, 
    error: usdtBalanceError,
    refetch: refetchUsdtBalance 
  } = useUSDTBalance()

  // 钱包连接时创建会话
  useEffect(() => {
    if (address && isConnected && !isAuthenticated) {
      console.log('🔐 钱包已连接，创建用户会话...')
      login(address, 'metamask', chain?.id || 56)
        .then(success => {
          if (success) {
            console.log('✅ 用户会话创建成功')
          } else {
            console.log('❌ 用户会话创建失败')
          }
        })
        .catch(error => {
          console.error('❌ 创建用户会话异常:', error)
        })
    }
  }, [address, isConnected, isAuthenticated, login, chain?.id])

  // 调试信息
  useEffect(() => {
    console.log('🔍 Wallet状态更新:', {
      address,
      isConnected,
      chainId: chain?.id,
      chainName: chain?.name,
      hasAppKit: !!open,
      usdtBalance,
      isUsdtBalanceLoading,
      usdtBalanceError,
      isAuthenticated,
      user: user?.id
    })
  }, [address, isConnected, chain, open, usdtBalance, isUsdtBalanceLoading, usdtBalanceError, isAuthenticated, user])

  // 保存用户地址到localStorage
  useEffect(() => {
    if (address && typeof window !== 'undefined') {
      try {
        localStorage.setItem('wallet_address', address)
        // 保存连接状态
        localStorage.setItem('wallet_connected', 'true')
        localStorage.setItem('wallet_chain_id', chain?.id?.toString() || '1')
        console.log('💾 钱包连接状态已保存到localStorage')
      } catch (e) {
        console.error('无法保存钱包地址到localStorage', e)
      }
    } else if (!address && typeof window !== 'undefined') {
      // 清除连接状态
      try {
        localStorage.removeItem('wallet_connected')
        localStorage.removeItem('wallet_chain_id')
        console.log('🗑️ 钱包连接状态已清除')
      } catch (e) {
        console.error('无法清除钱包连接状态', e)
      }
    }
  }, [address, chain?.id])

  // 页面加载时恢复连接状态
  useEffect(() => {
    const restoreConnectionState = () => {
      if (typeof window === 'undefined') return
      
      try {
        const wasConnected = localStorage.getItem('wallet_connected') === 'true'
        const savedAddress = localStorage.getItem('wallet_address')
        const savedChainId = localStorage.getItem('wallet_chain_id')
        
        if (wasConnected && savedAddress && !isConnected) {
          console.log('🔄 检测到之前的连接状态，尝试恢复连接...', {
            address: savedAddress,
            chainId: savedChainId
          })
          
          // 这里不需要手动连接，Wagmi会自动处理
          // 我们只需要确保状态同步
        }
      } catch (error) {
        console.error('恢复连接状态失败:', error)
      }
    }

    // 延迟执行，确保Wagmi完全初始化
    setTimeout(restoreConnectionState, 1000)
  }, [isConnected])

  const connect = async () => {
    try {
      setIsLoading(true)
      setError(undefined)
      console.log('🔗 Starting wallet connection...')
      
      if (!open) {
        setError('钱包连接组件未正确加载')
        console.error('AppKit open function is not available')
        return
      }
      
      await open()
      console.log('✅ AppKit opened successfully')
      
    } catch (err) {
      console.error('连接钱包时出错:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
        setError('用户取消了钱包连接')
      } else if (errorMessage.includes('No provider')) {
        setError('请安装钱包应用 (如MetaMask)')
      } else {
        setError('连接钱包时出错')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      console.log('🔌 Disconnecting wallet...')
      
      // 先登出会话
      if (isAuthenticated) {
        await logout()
        console.log('✅ 用户会话已登出')
      }
      
      // 断开钱包连接
      disconnect()
      
      // 清除localStorage存储
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('wallet_address')
        } catch (e) {
          console.error('清除钱包地址时出错', e)
        }
      }
    } catch (err) {
      console.error('断开钱包连接时出错:', err)
      setError('断开钱包时出错')
    }
  }

  const value: WalletContextType = {
    account: address,
    isConnected,
    chainId: chain?.id,
    balance: undefined,
    usdtBalance,
    formattedUsdtBalance,
    
    // 会话信息
    user,
    wallet,
    session,
    isAuthenticated,
    
    connect,
    disconnect: handleDisconnect,
    refetchUsdtBalance,
    refreshSession,
    
    isLoading,
    isUsdtBalanceLoading,
    error,
    usdtBalanceError
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// 服务端安全钱包Provider  
function ServerWalletProvider({ children }: WalletProviderProps) {
  const value: WalletContextType = {
    account: undefined,
    isConnected: false,
    chainId: undefined,
    balance: undefined,
    usdtBalance: undefined,
    formattedUsdtBalance: undefined,
    
    connect: () => console.log('Wallet connect called on server'),
    disconnect: () => console.log('Wallet disconnect called on server'),
    refetchUsdtBalance: () => console.log('Refetch USDT balance called on server'),
    
    isLoading: false,
    isUsdtBalanceLoading: false,
    error: undefined,
    usdtBalanceError: undefined
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 服务端渲染时使用安全Provider
  if (!isClient) {
    return <ServerWalletProvider>{children}</ServerWalletProvider>
  }

  // 客户端渲染时使用完整功能Provider
  return <ClientWalletProvider>{children}</ClientWalletProvider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export default WalletProvider
