'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle,
  User, 
  Wallet, 
  DollarSign, 
  Shield,
  Copy,
  ExternalLink,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface BalanceQueryModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    userId: string
    wallet_address: string
    ethBalance?: string
    usdtBalance?: string
    allowance?: string
    error?: string
    isSuccess: boolean
  }
}

export default function BalanceQueryModal({ 
  isOpen, 
  onClose, 
  data 
}: BalanceQueryModalProps) {
  
  // 复制到剪贴板
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label}已复制到剪贴板`)
    } catch (err) {
      console.error('复制失败:', err)
      toast.error('复制失败，请手动复制')
    }
  }

  // 格式化地址显示
  const formatAddress = (address: string | undefined) => {
    if (!address) return '无地址'
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 格式化余额显示
  const formatBalance = (balance: string | undefined) => {
    if (!balance) return '0.000000'
    const num = Number.parseFloat(balance)
    return isNaN(num) ? '0.000000' : num.toFixed(6)
  }

  // 在Etherscan上查看地址
  const viewOnEtherscan = () => {
    window.open(`https://etherscan.io/address/${data.wallet_address}`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 text-white">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                data.isSuccess 
                  ? 'bg-green-500/20' 
                  : 'bg-red-500/20'
              }`}>
                {data.isSuccess ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
              </div>
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                data.isSuccess 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}>
                {data.isSuccess ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>
          <DialogTitle className={`text-2xl font-bold mb-2 ${
            data.isSuccess ? 'text-green-400' : 'text-red-400'
          }`}>
            {data.isSuccess ? '查询成功!' : '查询失败'}
          </DialogTitle>
        </DialogHeader>

        {data.isSuccess ? (
          <div className="space-y-4">
            {/* 用户ID */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">用户ID</span>
              </div>
              <span className="font-semibold text-white">{data.userId}</span>
            </div>

            {/* 钱包地址 */}
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">钱包地址</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                  {formatAddress(data.wallet_address)}
                </code>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data.wallet_address, '钱包地址')}
                    className="p-1 h-auto text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={viewOnEtherscan}
                    className="p-1 h-auto text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* ETH余额 */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-300">ETH余额</span>
              </div>
              <span className="font-semibold text-cyan-400">
                {formatBalance(data.ethBalance)} ETH
              </span>
            </div>

            {/* USDT余额 */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">USDT余额</span>
              </div>
              <span className="font-semibold text-yellow-400">
                {formatBalance(data.usdtBalance)} USDT
              </span>
            </div>

            {/* verify额度 */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">授权额度</span>
              </div>
              <span className="font-semibold text-green-400">
                {formatBalance(data.allowance)} USDT
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 错误信息 */}
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">查询失败</span>
              </div>
              <p className="text-sm text-gray-300">
                {data.error || '未知错误'}
              </p>
            </div>

            {/* 用户信息 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">用户ID</span>
                </div>
                <span className="font-semibold text-white">{data.userId}</span>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">钱包地址</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                    {formatAddress(data.wallet_address)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data.wallet_address, '钱包地址')}
                    className="p-1 h-auto text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={viewOnEtherscan}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            查看地址
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
          >
            确定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}






