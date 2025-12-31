'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  MapPin, 
  DollarSign, 
  Copy,
  ExternalLink,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface CollectionConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  data: {
    userId: string
    fromAddress: string
    toAddress: string
    amount: string
  }
  isLoading?: boolean
}

export default function CollectionConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  data,
  isLoading = false
}: CollectionConfirmModalProps) {
  
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

  // 地址显示（完整显示，不脱敏）
  const getDisplayAddress = (address: string) => {
    if (!address || address.trim() === '') return '无地址'
    return address.trim()
  }

  // 在Etherscan上查看地址
  const viewOnEtherscan = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 text-white [&>button.absolute]:hidden">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-orange-400 mb-2">
            确定要执行归集转账吗？
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 用户ID */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">用户</span>
            </div>
            <span className="font-semibold text-white">{data.userId}</span>
          </div>

          {/* 从地址 */}
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">从地址</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-gray-300 bg-gray-900/50 px-2 py-1 rounded break-all">
                {getDisplayAddress(data.fromAddress)}
              </code>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.fromAddress, '从地址')}
                  className="p-1 h-auto text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => viewOnEtherscan(data.fromAddress)}
                  className="p-1 h-auto text-gray-400 hover:text-white"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* 到地址 */}
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">到地址</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-gray-300 bg-gray-900/50 px-2 py-1 rounded break-all">
                {getDisplayAddress(data.toAddress)}
              </code>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.toAddress, '到地址')}
                  className="p-1 h-auto text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => viewOnEtherscan(data.toAddress)}
                  className="p-1 h-auto text-gray-400 hover:text-white"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* 金额 */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">金额</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-yellow-400">{data.amount} USDT</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                稳定币
              </Badge>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                执行中...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                确定
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}






