'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { ParticleBackground } from '@/components/ParticleBackground'
import BottomNavigation, { BottomSpacer } from '@/components/BottomNavigation'
import LanguageSelector from '@/components/LanguageSelector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/contexts/I18nContext'
import { WalletConnector } from '@/components/WalletConnector'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useI18n as useI18nHook } from '@/hooks/useI18n'
import { RefreshCWIcon } from '@/components/RefreshCWIcon'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 动态导入SafeToken组件
const SafeTokenInfo = dynamic(() => import('@/components/SafeTokenInfo'), {
  loading: () => <LoadingSkeleton />,
  ssr: false
})

export default function WalletPage() {
  const { t } = useI18n()
  const [account, setAccount] = useState('')
  const [provider, setProvider] = useState<unknown>(null)

  // 检测钱包连接状态
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // 获取连接的账户
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0])
            setProvider(window.ethereum)
          } else {
            // 如果没有连接的账户，尝试自动连接
            console.log('🚀 尝试自动连接钱包...');
            try {
              const connectedAccounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
              });
              if (connectedAccounts && connectedAccounts.length > 0) {
                setAccount(connectedAccounts[0])
                setProvider(window.ethereum)
                console.log('✅ 自动钱包连接成功');
              }
            } catch (connectError) {
              console.log('⚠️ 自动钱包连接失败，用户需要手动连接:', connectError);
            }
          }

          // 监听账户变化
          window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
            if (newAccounts.length > 0) {
              setAccount(newAccounts[0])
            } else {
              setAccount('')
            }
          })
        } catch (error) {
          console.error('获取钱包账户失败:', error)
        }
      }
    }

    // 延迟一点时间确保页面完全加载
    setTimeout(checkWalletConnection, 1000);
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      <ParticleBackground />
      
      {/* Header */}
      <header className="relative z-10 bg-[#f9f900] text-black shadow-lg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4 sm:py-6">
            {/* Logo和语言选择器 */}
            <div className="flex items-center gap-2 sm:gap-4">
              <img
                src="/ETHImg.959d065.png"
                alt="Logo"
                className="h-8 sm:h-10 w-auto"
                onError={(e) => {
                  console.log('Logo加载失败，使用后备文本')
                  e.currentTarget.style.display = 'none'
                }}
              />
              <LanguageSelector />
            </div>

            {/* 右侧导航 */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm font-semibold hidden sm:inline">
                {t.wallet || '钱包'}
              </span>
              {account && (
                <span className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[120px] px-2 sm:px-3 py-1.5 sm:py-2 bg-black/10 rounded-lg">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                钱包管理
              </h1>
              <p className="text-gray-300">
                连接您的数字钱包来管理资产和进行交易
              </p>
            </div>

            {/* Wallet Connector */}
            <div className="flex justify-center mb-8">
              <WalletConnector />
            </div>

            {/* 已连接钱包时显示代币信息 */}
            {account && provider !== null && (
              <div className="mb-8">
                <Tabs defaultValue="safetoken" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="safetoken">SafeToken</TabsTrigger>
                    <TabsTrigger value="usdt">USDT</TabsTrigger>
                  </TabsList>
                  <TabsContent value="safetoken">
                    <SafeTokenInfo provider={provider} account={account} />
                  </TabsContent>
                  <TabsContent value="usdt">
                    <Card>
                      <CardHeader>
                        <CardTitle>USDT</CardTitle>
                        <CardDescription>USDT代币信息将在这里显示</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>此功能正在开发中...</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Additional Information */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">支持的钱包</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      🦊
                    </div>
                    <span className="text-sm">MetaMask</span>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      🔗
                    </div>
                    <span className="text-sm">WalletConnect</span>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      🛡️
                    </div>
                    <span className="text-sm">Trust Wallet</span>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      💼
                    </div>
                    <span className="text-sm">Coinbase</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
      <BottomSpacer />
    </div>
  )
} 