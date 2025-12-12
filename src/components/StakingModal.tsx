'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/contexts/I18nContext'
import { HexagonLoaderInline } from '@/components/HexagonLoader'

interface StakingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: string) => Promise<void>
  usdtBalance: string
  isLoading: boolean
}

export default function StakingModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  usdtBalance, 
  isLoading 
}: StakingModalProps) {
  const { t, language } = useI18n()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  // 验证输入金额
  const validateAmount = (value: string) => {
    const numValue = Number.parseFloat(value)
    const balance = Number.parseFloat(usdtBalance || '0')
    
    if (isNaN(numValue) || numValue <= 0) {
      return '请输入有效的质押金额'
    }
    
    if (numValue > balance) {
      return '质押金额不能超过USDT余额'
    }
    
    if (numValue < 1) {
      return '最小质押金额为1 USDT'
    }
    
    return ''
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    const errorMsg = validateAmount(value)
    setError(errorMsg)
  }

  const handleConfirm = async () => {
    const errorMsg = validateAmount(amount)
    if (errorMsg) {
      setError(errorMsg)
      return
    }

    try {
      await onConfirm(amount)
      onClose()
    } catch (error) {
      console.error('Staking confirmation failed:', error)
    }
  }

  // 快捷金额选择
  const quickAmounts = ['10', '50', '100', '500', '1000']
  const maxAmount = Math.floor(Number.parseFloat(usdtBalance || '0')).toString()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="rounded-2xl shadow-xl max-w-md w-full mx-4 border-2 border-[#d4af37]" style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* 顶部金色条纹 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-t-2xl"></div>
        
        <Card className="border-0 bg-transparent">
          <CardHeader className="text-center pb-2 relative z-10">
            <CardTitle className="text-xl font-bold text-[#d4af37] drop-shadow-lg" style={{textShadow: '0 2px 10px rgba(212, 175, 55, 0.5)'}}>
              {language === 'zh' ? '参与质押' : 'Stake USDT'}
            </CardTitle>
            <CardDescription className="text-white/80">
              {language === 'zh' ? '输入您要质押的USDT金额' : 'Enter the amount of USDT to stake'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 relative z-10">
            {/* 余额信息 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }} className="p-3 rounded-lg backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/80">
                  {language === 'zh' ? 'USDT余额:' : 'USDT Balance:'}
                </span>
                <Badge variant="outline" className="text-[#d4af37] border-[#d4af37] bg-[#d4af37]/10">
                  {usdtBalance || '0'} USDT
                </Badge>
              </div>
            </div>

            {/* 金额输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#d4af37]">
                {language === 'zh' ? '质押金额' : 'Stake Amount'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                    border: error ? '1px solid #ef4444' : '1px solid rgba(212, 175, 55, 0.3)'
                  }}
                  className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white placeholder-white/60 backdrop-blur-sm`}
                  placeholder={language === 'zh' ? '输入质押金额' : 'Enter stake amount'}
                  step="0.01"
                  min="1"
                />
                <div className="absolute right-3 top-2 text-[#d4af37]">
                  USDT
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#d4af37'
                }}
                className="flex-1 hover:bg-[#d4af37]/20 backdrop-blur-sm transition-all"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </Button>
              
              <Button
                onClick={handleConfirm}
                disabled={isLoading || !!error || !amount}
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  border: 'none',
                  color: '#1a1a1a',
                  fontWeight: '600'
                }}
                className="flex-1 hover:scale-105 transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <HexagonLoaderInline className="scale-75" />
                    <span>{language === 'zh' ? '质押中...' : 'Staking...'}</span>
                  </div>
                ) : (
                  language === 'zh' ? `质押 ${amount || '0'} USDT` : `Stake ${amount || '0'} USDT`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 