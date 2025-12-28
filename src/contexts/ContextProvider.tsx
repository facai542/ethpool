'use client'

import React, { type ReactNode } from 'react'
import { cookieToInitialState } from 'wagmi'
import { config, projectId, wagmiAdapter } from '@/config'
import { createAppKit } from '@reown/appkit/react'
import { mainnet } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

console.log('🔧 ContextProvider 使用项目ID:', projectId)

// 设置查询客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 30000,
    },
  },
})

if (!projectId) {
  console.error('❌ Project ID is missing!')
  throw new Error('缺少必要的 AppKit 配置：项目ID未定义')
}

// 创建 AppKit 实例，完全禁用远程配置
let appKit: any = null

try {
  appKit = createAppKit({
    adapters: [wagmiAdapter],
    projectId: projectId,
    networks: [mainnet],
    defaultNetwork: mainnet,
    metadata: {
      name: 'ETH Staking Platform',
      description: 'Ethereum USDT Staking Platform',
      url: 'http://localhost:3001',
      icons: ['http://localhost:3001/ETHImg.959d065.png']
    },
    // 完全禁用远程配置和所有功能
    features: {},
    allowUnsupportedChain: false,
    allWallets: 'ONLY_MOBILE',
    includeWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'  // Trust Wallet
    ],
  })
  console.log('✅ AppKit 初始化成功')
} catch (error) {
  console.error('❌ AppKit 初始化失败:', error)
}

export interface ContextProviderProps {
  children: ReactNode
  cookies?: string
}

export default function ContextProvider({ children, cookies }: ContextProviderProps) {
  const initialState = cookieToInitialState(config, cookies)

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 