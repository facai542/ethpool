'use client'

import React, { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  Copy, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface UserAccountCardProps {
  className?: string
  showActions?: boolean
  compact?: boolean
}

export default function UserAccountCard({ 
  className = '',
  showActions = true,
  compact = false 
}: UserAccountCardProps) {
  const { t } = useI18n()
  const {
    account,
    isConnected,
    chainId,
    usdtBalance,
    formattedUsdtBalance,
    isUsdtBalanceLoading,
    usdtBalanceError,
    refetchUsdtBalance,
    connect,
    disconnect
  } = useWallet()

  const [isRefreshing, setIsRefreshing] = useState(false)

  // 复制地址到剪贴板
  const copyAddress = async () => {
    if (!account) return
    
    try {
      await navigator.clipboard.writeText(account)
      toast.success('地址已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
      toast.error('复制失败，请手动复制')
    }
  }

  // 刷新余额
  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      await refetchUsdtBalance()
      toast.success('余额已刷新')
    } catch (err) {
      console.error('刷新余额失败:', err)
      toast.error('刷新余额失败')
    } finally {
      setIsRefreshing(false)
    }
  }

  // 在Etherscan上查看地址
  const viewOnEtherscan = () => {
    if (!account) return
    window.open(`https://etherscan.io/address/${account}`, '_blank')
  }

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (compact) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return `${address.slice(0, 10)}...${address.slice(-8)}`
  }

  // 获取网络状态
  const getNetworkStatus = () => {
    if (!chainId) return { text: '未知网络', color: 'bg-gray-500' }
    
    switch (chainId) {
      case 1:
        return { text: 'ETH主网', color: 'bg-green-500' }
      case 56:
        return { text: 'BSC主网', color: 'bg-yellow-500' }
      case 97:
        return { text: 'BSC测试网', color: 'bg-orange-500' }
      default:
        return { text: `Chain ${chainId}`, color: 'bg-red-500' }
    }
  }

  // 如果未连接，显示连接按钮
  if (!isConnected || !account) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                连接钱包
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                连接您的数字钱包以查看余额和开始使用
              </p>
            </div>

            <Button 
              onClick={connect}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              连接钱包
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const networkStatus = getNetworkStatus()

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="w-5 h-5" />
            钱包账户
          </CardTitle>
          <Badge className={networkStatus.color}>
            {networkStatus.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 钱包地址 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            钱包地址
          </label>
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <code className="flex-1 text-sm font-mono text-gray-900 dark:text-white">
              {formatAddress(account)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="p-2 h-auto"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={viewOnEtherscan}
              className="p-2 h-auto"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* USDT余额 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              USDT余额
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshBalance}
              disabled={isRefreshing || isUsdtBalanceLoading}
              className="p-2 h-auto"
            >
              <RefreshCw className={`w-4 h-4 ${(isRefreshing || isUsdtBalanceLoading) ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
            {isUsdtBalanceLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span className="text-sm text-gray-500">加载余额中...</span>
              </div>
            ) : usdtBalanceError ? (
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{usdtBalanceError}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usdtBalance || '0.00'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    USDT
                  </div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            )}
          </div>
        </div>

        {/* 网络状态提示 */}
        {chainId !== 1 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                请切换到ETH主网以使用USDT功能
              </span>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleRefreshBalance}
              disabled={isRefreshing || isUsdtBalanceLoading}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(isRefreshing || isUsdtBalanceLoading) ? 'animate-spin' : ''}`} />
              刷新余额
            </Button>
            <Button
              variant="outline"
              onClick={disconnect}
              className="flex-1"
            >
              断开连接
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 简化版本，用于紧凑显示
export function UserAccountCardCompact({ className = '' }: { className?: string }) {
  return <UserAccountCard className={className} compact={true} showActions={false} />
}

// 完整版本，包含所有功能
export function UserAccountCardFull({ className = '' }: { className?: string }) {
  return <UserAccountCard className={className} compact={false} showActions={true} />
}






