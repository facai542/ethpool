'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  User, 
  DollarSign, 
  MapPin, 
  Hash, 
  Flag, 
  ExternalLink,
  Copy,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface CollectionSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    userId: string
    amount: string
    fromAddress: string
    toAddress: string
    transactionHash: string
    explorerUrl?: string
    status: string
  }
}

export default function CollectionSuccessModal({ 
  isOpen, 
  onClose, 
  data 
}: CollectionSuccessModalProps) {
  
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
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 格式化交易哈希显示
  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 text-white">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-green-400 mb-2">
            真实链上归集成功!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 用户ID */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">用户ID</span>
            </div>
            <span className="font-semibold text-white">{data.userId}</span>
          </div>

          {/* 归集金额 */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">归集金额</span>
            </div>
            <span className="font-semibold text-yellow-400">{data.amount} USDT</span>
          </div>

          {/* 从地址 */}
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">从地址</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                {formatAddress(data.fromAddress)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(data.fromAddress, '从地址')}
                className="p-1 h-auto text-gray-400 hover:text-white"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 到地址 */}
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">到地址</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                {formatAddress(data.toAddress)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(data.toAddress, '到地址')}
                className="p-1 h-auto text-gray-400 hover:text-white"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 交易哈希 */}
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">交易哈希</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                {formatTxHash(data.transactionHash)}
              </code>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.transactionHash, '交易哈希')}
                  className="p-1 h-auto text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {data.explorerUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(data.explorerUrl, '_blank')}
                    className="p-1 h-auto text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 状态 */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-300">状态</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {data.status}
            </Badge>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          {data.explorerUrl && (
            <Button
              onClick={() => window.open(data.explorerUrl, '_blank')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              查看交易
            </Button>
          )}
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





