'use client'

import { WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useEffect, useState } from 'react'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

// 配置查询客户端
const queryClient = new QueryClient()

// 项目ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c482c3062b88c6cc75e14712c5249b37'

// 创建模态配置
const metadata = {
  name: 'ETH USDT Staking Pool',
  description: 'USDT Staking Pool on Ethereum Network',
  url: 'https://web3pool.netlify.app',
  icons: ['/icons/binance-icon.png']
}

interface ClientOnlyWeb3ProviderProps {
  children: ReactNode
}

export default function ClientOnlyWeb3Provider({ children }: ClientOnlyWeb3ProviderProps) {
  const [wagmiConfig, setWagmiConfig] = useState<any>(null)
  const [isWeb3Ready, setIsWeb3Ready] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('🚀 客户端Web3初始化开始...')
    
    try {
      // 创建 Wagmi 配置
      const chains = [mainnet] as const
      
      const config = defaultWagmiConfig({
        chains,
        projectId,
        metadata,
        ssr: false,
        enableWalletConnect: true,
        enableInjected: true,
        enableEIP6963: true,
        enableCoinbase: true,
        // 添加存储配置以保持连接状态
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // 启用连接状态持久化
        enableNetworkSwitching: true,
        // 设置默认连接模式
        defaultChain: mainnet
      })
      
      setWagmiConfig(config)
      console.log('✅ Wagmi配置创建成功')
      
      // 延迟创建Web3Modal
      setTimeout(() => {
        try {
          const modal = createWeb3Modal({
            wagmiConfig: config,
            projectId,
            enableAnalytics: false,
            themeMode: 'light',
            themeVariables: {
              '--w3m-accent': '#F0B90B',
              '--w3m-border-radius-master': '8px',
              '--w3m-font-family': 'system-ui, -apple-system, sans-serif'
            },
            featuredWalletIds: [
              'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
              '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
              'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a'  // Uniswap Wallet
            ],
            includeWalletIds: [
              'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
              '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
              'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
              '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
              'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a'  // Uniswap Wallet
            ],
            enableOnramp: false,
            enableSwaps: false,
            allowUnsupportedChain: false
          })
          
          // 将modal实例添加到全局window对象
          ;(window as any).web3modal = modal
          ;(window as any).appkit = modal
          ;(window as any).appkitModal = modal
          console.log('✅ Web3Modal实例已添加到全局对象')
          
          setIsWeb3Ready(true)
          console.log('✅ 客户端Web3初始化完成')
        } catch (modalError) {
          console.error('❌ Web3Modal创建失败:', modalError)
          setIsWeb3Ready(true) // 即使失败也允许渲染
        }
      }, 300)
      
    } catch (error) {
      console.error('❌ Web3配置初始化失败:', error)
      setIsWeb3Ready(true) // 即使失败也允许渲染
    }
  }, [])

  // Web3配置未完成时显示加载界面
  if (!wagmiConfig || !isWeb3Ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">正在配置钱包...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 