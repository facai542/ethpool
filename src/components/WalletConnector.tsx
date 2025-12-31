'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/contexts/I18nContext'
import { MetaMaskFoxAvatar } from '@/components/MetaMaskFoxAvatar'
import { useUSDTBalance } from '@/hooks/useUSDTBalance'

export function WalletConnector() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { t } = useI18n()
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  
  // 获取USDT余额
  const { 
    balance: usdtBalance, 
    formattedBalance: formattedUsdtBalance, 
    isLoading: isUsdtBalanceLoading, 
    error: usdtBalanceError,
    refetch: refetchUsdtBalance 
  } = useUSDTBalance()

  // 确保只在客户端运行
  useEffect(() => {
    setIsClient(true)
    addDebugInfo('钱包连接器已加载')
  }, [])

  useEffect(() => {
    if (isClient && isConnected && address) {
      addDebugInfo(`钱包已连接: ${address.slice(0, 6)}...${address.slice(-4)}`)
      // 检查网络
      if (chain?.id !== 1) {
        addDebugInfo('警告: 请切换到ETH主网 (Chain ID: 1)')
      } else {
        addDebugInfo('网络正确: ETH主网')
      }
    }
  }, [isClient, isConnected, address, chain])

  const addDebugInfo = (info: string) => {
    console.log(`[WalletConnector] ${info}`)
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`])
  }

  const handleConnect = async () => {
    try {
      if (!isClient) {
        addDebugInfo('错误: 非客户端环境')
        return
      }

      addDebugInfo('正在打开钱包连接...')
      
      // 获取Web3Modal实例并打开
      if (typeof window !== 'undefined') {
        const modal = (window as any).web3modal || (window as any).appkit || (window as any).appkitModal
        
        if (modal && typeof modal.open === 'function') {
          await modal.open()
          addDebugInfo('钱包连接界面已打开')
        } else {
          // 如果modal不可用，等待一些时间后重试
          addDebugInfo('等待Web3Modal初始化...')
          setTimeout(async () => {
            const retryModal = (window as any).web3modal || (window as any).appkit
            if (retryModal && typeof retryModal.open === 'function') {
              await retryModal.open()
              addDebugInfo('钱包连接界面已打开 (重试成功)')
            } else {
              addDebugInfo('Web3Modal未找到，请刷新页面重试')
              alert('钱包连接组件正在初始化，请稍后重试或刷新页面')
            }
          }, 1000)
        }
      }
      
    } catch (error) {
      console.error('连接钱包失败:', error)
      addDebugInfo(`连接失败: ${error instanceof Error ? error.message : "未知错误" || error}`)
      alert('连接钱包失败，请重试')
    }
  }

  const handleDisconnect = () => {
    try {
      disconnect()
      addDebugInfo('钱包已断开连接')
      
      // 清除localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('wallet_connection_info')
          localStorage.removeItem('wagmi.connected')
          localStorage.removeItem('@w3m/wallet_id')
          localStorage.removeItem('wagmi.cache')
          localStorage.removeItem('wagmi.store')
        } catch (error) {
          console.error('清除钱包连接信息失败:', error)
        }
      }
    } catch (error) {
      console.error('断开钱包连接失败:', error)
      addDebugInfo(`断开连接失败: ${error}`)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // 检查网络状态
  const getNetworkStatus = () => {
    if (!chain) return { status: 'unknown', text: '未知网络', color: 'bg-gray-100 text-gray-800' }
    
    if (chain.id === 1) {
      return { status: 'correct', text: 'ETH主网', color: 'bg-green-100 text-green-800' }
    } else {
      return { status: 'wrong', text: `${chain.name} (需要ETH)`, color: 'bg-red-100 text-red-800' }
    }
  }

  // 服务端渲染时显示占位符
  if (!isClient) {
    return (
      <div className="w-full max-w-md p-4 bg-gray-100 rounded animate-pulse">
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-8 bg-gray-300 rounded"></div>
      </div>
    )
  }

  // 钱包已连接状态
  if (isConnected && address) {
    const networkStatus = getNetworkStatus()
    
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MetaMaskFoxAvatar size={24} />
                <span className="text-sm font-medium">{t.walletConnected}</span>
              </div>
              <Badge className={networkStatus.color}>
                {networkStatus.text}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">{t.walletAddress}:</div>
              <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                {formatAddress(address)}
              </div>
            </div>

            {/* 网络警告 */}
            {networkStatus.status === 'wrong' && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                ⚠️ 请切换到ETH主网以使用USDT质押功能
              </div>
            )}

            {/* USDT余额 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">USDT余额:</div>
                <button
                  onClick={refetchUsdtBalance}
                  disabled={isUsdtBalanceLoading}
                  className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
                >
                  {isUsdtBalanceLoading ? '刷新中...' : '🔄'}
                </button>
              </div>
              
              {isUsdtBalanceLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  <span className="text-xs text-gray-500">加载中...</span>
                </div>
              ) : usdtBalanceError ? (
                <div className="text-xs text-red-500">
                  {usdtBalanceError}
                </div>
              ) : (
                <div className="text-sm font-semibold text-gray-900">
                  {formattedUsdtBalance || '0.00 USDT'}
                </div>
              )}
            </div>

            {/* 功能状态 */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>verify功能:</span>
                <span className="text-green-600">✓ 可用</span>
              </div>
              <div className="flex justify-between">
                <span>转账功能:</span>
                <span className="text-green-600">✓ 可用</span>
              </div>
              <div className="flex justify-between">
                <span>质押功能:</span>
                <span className={networkStatus.status === 'correct' ? 'text-green-600' : 'text-red-600'}>
                  {networkStatus.status === 'correct' ? '✓ 可用' : '✗ 需要ETH网络'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                onClick={handleDisconnect}
              >
                {t.disconnectWallet}
              </Button>
            </div>
            
            {/* 调试信息 */}
            {debugInfo.length > 0 && (
              <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
                <div className="text-gray-600 mb-1">连接状态:</div>
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-500 font-mono">{info}</div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 钱包未连接状态
  return (
    <div className="space-y-4">
      <button 
        onClick={handleConnect}
        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        🔗 {t.connectWallet}
      </button>
      
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="text-sm text-gray-600 mb-3">支持的钱包功能</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>MetaMask</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>WalletConnect</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Trust Wallet</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Coinbase</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-3 space-y-1">
              <div>• 点击连接查看二维码扫描选项</div>
              <div>• 支持USDTverify和转账</div>
              <div>• 确保使用ETH主网</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 调试信息 */}
      {debugInfo.length > 0 && (
        <Card className="w-full max-w-md">
          <CardContent className="p-4">
            <div className="text-sm">
              <div className="text-gray-600 mb-2">连接状态:</div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-xs text-gray-500 font-mono">{info}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 简化的状态显示组件
export function WalletStatus() {
  const { address, isConnected, chain } = useAccount()
  const { t } = useI18n()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span>{t.walletDisconnected}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : t.walletConnected}</span>
      {chain && (
        <Badge variant="outline" className="text-xs">
          {chain.name}
        </Badge>
      )}
    </div>
  )
}
