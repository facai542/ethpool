'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useI18n } from '@/contexts/I18nContext'
import apiClient from '@/lib/api'

interface WalletProvider {
  name: string
  icon: string
  id: string
  description: string
}

const WALLET_PROVIDERS: WalletProvider[] = [
  {
    name: 'MetaMask',
    icon: '🦊',
    id: 'metamask',
    description: 'Connect using MetaMask wallet'
  },
  {
    name: 'Trust Wallet',
    icon: '🛡️',
    id: 'trust',
    description: 'Connect using Trust Wallet'
  },
  {
    name: 'TokenPocket',
    icon: '🎯',
    id: 'tokenpocket',
    description: 'Connect using TokenPocket'
  },
  {
    name: 'imToken',
    icon: '🔑',
    id: 'imtoken',
    description: 'Connect using imToken'
  },
  {
    name: 'WalletConnect',
    icon: '🔗',
    id: 'walletconnect',
    description: 'Connect using WalletConnect protocol'
  }
]

interface WalletConnectProps {
  showBalance?: boolean
  onConnect?: (address: string) => void
  onDisconnect?: () => void
  className?: string
}

export default function WalletConnect({
  showBalance = true,
  onConnect,
  onDisconnect,
  className = ''
}: WalletConnectProps) {
  const { t, isLoaded } = useI18n()
  const { 
    account, 
    isConnected,
    chainId, 
    balance,
    usdtBalance,
    formattedUsdtBalance,
    isUsdtBalanceLoading,
    usdtBalanceError,
    refetchUsdtBalance,
    connect,
    disconnect
  } = useWallet()
  
  const [isRecordingConnection, setIsRecordingConnection] = useState(false)

  // 监听账户变化，记录连接
  useEffect(() => {
    if (account && isConnected && !isRecordingConnection) {
      recordWalletConnection(account, 'wallet')
      if (onConnect) {
        onConnect(account)
      }
    }
  }, [account, isConnected])

  // 记录钱包连接到后端
  const recordWalletConnection = async (address: string, walletType: string) => {
    try {
      setIsRecordingConnection(true)
      console.log('🔄 记录钱包连接...', address)
      
      // 记录钱包连接
      try {
        const connectionData = {
          address,
          walletType,
          connectedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          chainId: chainId || 56
        }
        
        await apiClient.recordWalletConnect(connectionData)
        console.log('✅ 钱包连接记录成功')
      } catch (error) {
        console.log('⚠️ 钱包连接记录失败:', error)
        // 不阻止流程，只记录错误
      }
      
      // 尝试创建/绑定用户档案
      try {
        await apiClient.bindUser(address)
        console.log('✅ 用户绑定成功')
      } catch (bindError) {
        console.log('⚠️ 用户绑定失败:', bindError)
        // 不阻断流程，记录错误即可
      }

      // 发送Telegram通知
      try {
        await notifyTelegramBot(address, 'connect')
        console.log('✅ Telegram连接通知发送成功')
      } catch (telegramError) {
        console.log('⚠️ Telegram连接通知失败:', telegramError)
        // 不阻断流程，记录错误即可
      }

      // 添加地址到Telegram实时动账监听系统（钱包连接时就开始监听）
      try {
        console.log('🔍 添加地址到Telegram动账监听系统（连接时）...', address)
        // 动态导入避免服务端渲染问题
        const { walletMonitorService } = await import('@/services/walletMonitorService')
        await walletMonitorService.addMonitoredAddress(address)
        console.log('✅ 地址已添加到Telegram动账监听系统（连接时）')
      } catch (monitorError) {
        console.log('⚠️ 添加地址到监听系统失败（非致命错误）:', monitorError)
        // 不阻断流程，记录错误即可
      }
      
    } catch (error) {
      console.error('❌ 记录钱包连接失败:', error)
    } finally {
      setIsRecordingConnection(false)
    }
  }

  // 发送Telegram通知
  const notifyTelegramBot = async (address: string, action: string) => {
    try {
      console.log('🤖 发送Telegram通知...', address, action)
      
      const response = await fetch('https://bot.boltcode.vip/webhook/user-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          telegramId: '123456789', // 临时ID，实际应该从用户数据获取
          action: action,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Telegram通知发送成功:', address, action)
      } else {
        console.warn('⚠️ Telegram通知失败:', result.error)
      }
    } catch (error) {
      console.warn('⚠️ Telegram通知失败:', error.message)
    }
  }

  // 处理钱包连接
  const handleConnect = () => {
    try {
      connect() // 打开AppKit模态框
    } catch (error) {
      console.error('钱包连接失败:', error)
    }
  }

  // 处理钱包断开连接
  const handleDisconnect = () => {
    disconnect()
    if (onDisconnect) {
      onDisconnect()
    }
  }

  // 复制地址
  const copyAddress = () => {
    if (account && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(account)
      // 可以添加toast通知
      console.log('地址已复制到剪贴板')
    }
  }

  // 格式化地址显示
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 格式化余额
  const formatBalance = (balance?: string) => {
    if (!balance) return '0.0000'
    return Number.parseFloat(balance).toFixed(4)
  }

  // 获取网络名称
  const getNetworkName = (chainId?: number) => {
    switch (chainId) {
      case 56: return 'BSC Mainnet'
      case 97: return 'BSC Testnet'
      case 1: return 'Ethereum Mainnet'
      default: return `Chain ${chainId || 'Unknown'}`
    }
  }

  // 等待翻译加载
  if (!isLoaded) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  // 如果已连接，显示连接信息
  if (isConnected && account) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            钱包已连接
          </h3>
          <button
            onClick={handleDisconnect}
            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            {t.disconnectWallet || '断开连接'}
          </button>
        </div>

        <div className="space-y-3">
          {/* 钱包地址 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                地址
              </p>
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {formatAddress(account)}
              </p>
            </div>
            <button
              onClick={copyAddress}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="复制地址"
            >
              📋
            </button>
          </div>

          {/* 网络信息 */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              网络
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {getNetworkName(chainId)}
            </p>
          </div>

          {/* USDT余额 */}
          {showBalance && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  USDT余额
                </p>
                <button
                  onClick={refetchUsdtBalance}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  disabled={isUsdtBalanceLoading}
                >
                  {isUsdtBalanceLoading ? '刷新中...' : '🔄'}
                </button>
              </div>
              
              {isUsdtBalanceLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-500">加载中...</span>
                </div>
              ) : usdtBalanceError ? (
                <div className="text-sm text-red-500">
                  {usdtBalanceError}
                </div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formattedUsdtBalance || '0.00 USDT'}
                </p>
              )}
            </div>
          )}

          {/* 连接状态 */}
          {isRecordingConnection && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                正在记录连接...
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 如果未连接，显示连接按钮
  return (
    <div className={`text-center ${className}`}>
      <button
        onClick={handleConnect}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
      >
        {t.connectWallet || '连接钱包'}
      </button>
      
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        连接您的数字钱包开始使用
      </p>
    </div>
  )
} 