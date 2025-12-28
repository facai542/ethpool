'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type TokenConfig, formatTokenAmount } from '@/lib/multi-token-config'
import { useMultiTokenStaking } from '@/hooks/useMultiTokenStaking'
import { HexagonLoaderInline } from '@/components/HexagonLoader'
import TokenSelector from './TokenSelector'

interface MultiTokenStakingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (token: TokenConfig, amount: string) => Promise<void>
  onAuthorize: (token: TokenConfig) => Promise<void>
  isLoading: boolean
  isApproving: boolean
}

export default function MultiTokenStakingModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onAuthorize,
  isLoading,
  isApproving
}: MultiTokenStakingModalProps) {
  const [selectedToken, setSelectedToken] = useState<TokenConfig | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [showTokenSelector, setShowTokenSelector] = useState(false)
  
  const { getTokenBalance, isTokenAuthorized } = useMultiTokenStaking()

  // 验证输入金额
  const validateAmount = (value: string, token: TokenConfig | null) => {
    if (!token) return '请先选择代币'
    
    const numValue = Number.parseFloat(value)
    const balance = Number.parseFloat(getTokenBalance(token.symbol).data || '0')
    
    if (isNaN(numValue) || numValue <= 0) {
      return '请输入有效的质押金额'
    }
    
    if (numValue > balance) {
      return `质押金额不能超过${token.symbol}余额`
    }
    
    if (numValue < 0.01) {
      return `最小质押金额为0.01 ${token.symbol}`
    }
    
    return ''
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    setError(validateAmount(value, selectedToken))
  }

  const handleConfirm = async () => {
    if (!selectedToken || !amount || error) return
    
    try {
      await onConfirm(selectedToken, amount)
      setAmount('')
      setSelectedToken(null)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  const handleAuthorize = async () => {
    if (!selectedToken) return
    
    try {
      await onAuthorize(selectedToken)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  if (!isOpen) return null

  const tokenBalance = selectedToken ? getTokenBalance(selectedToken.symbol).data : '0'
  const isAuthorized = selectedToken ? isTokenAuthorized(selectedToken.symbol, amount) : false

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md">
          <Card style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(212, 175, 55, 0.2)'
          }}>
            <CardHeader className="text-center">
              <CardTitle className="text-[#d4af37]">多币种质押</CardTitle>
              <CardDescription className="text-white/80">
                选择支持的ETH代币进行质押
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 代币选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#d4af37]">选择代币</label>
                <Button
                  variant="outline"
                  onClick={() => setShowTokenSelector(true)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: selectedToken ? '#d4af37' : '#ffffff'
                  }}
                  className="w-full justify-between"
                >
                  {selectedToken ? (
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: selectedToken.color }}
                      >
                        {selectedToken.symbol.slice(0, 2)}
                      </div>
                      <span>{selectedToken.symbol} - {selectedToken.name}</span>
                    </div>
                  ) : (
                    <span>点击选择代币</span>
                  )}
                  <span>▼</span>
                </Button>
              </div>

              {/* 余额和verify状态 */}
              {selectedToken && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }} className="p-3 rounded-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">
                      {selectedToken.symbol}余额:
                    </span>
                    <Badge variant="outline" className="text-[#d4af37] border-[#d4af37] bg-[#d4af37]/10">
                      {formatTokenAmount(tokenBalance || '0')} {selectedToken.symbol}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-white/80">验证状态:</span>
                    <Badge 
                      variant={isAuthorized ? 'default' : 'secondary'} 
                      style={{
                        background: isAuthorized ? 'linear-gradient(135deg, #d4af37, #f4d03f)' : '#ef4444',
                        color: isAuthorized ? '#1a1a1a' : '#ffffff',
                        border: 'none',
                        boxShadow: isAuthorized ? '0 2px 8px rgba(212, 175, 55, 0.4)' : '0 2px 8px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      {isAuthorized ? '✅ 已验证' : '❌ 未验证'}
                    </Badge>
                  </div>
                </div>
              )}

              {/* 金额输入 */}
              {selectedToken && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#d4af37]">质押金额</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                        border: error ? '1px solid #ef4444' : '1px solid rgba(212, 175, 55, 0.3)'
                      }}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white placeholder-white/60 backdrop-blur-sm"
                      placeholder={`输入${selectedToken.symbol}数量`}
                      step="0.01"
                      min="0.01"
                    />
                    <div className="absolute right-3 top-2 text-[#d4af37]">
                      {selectedToken.symbol}
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading || isApproving}
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#d4af37'
                  }}
                  className="flex-1 hover:bg-[#d4af37]/20 backdrop-blur-sm transition-all"
                >
                  取消
                </Button>
                
                {selectedToken && !isAuthorized ? (
                  <Button
                    onClick={handleAuthorize}
                    disabled={isApproving}
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                      border: 'none',
                      color: '#1a1a1a',
                      fontWeight: '600'
                    }}
                    className="flex-1 hover:scale-105 transition-all"
                  >
                    {isApproving ? (
                      <div className="flex items-center justify-center gap-2">
                        <HexagonLoaderInline className="scale-75" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      `verify ${formatTokenAmount(selectedToken.defaultApproveAmount)} ${selectedToken.symbol}`
                    )}
                  </Button>
                ) : selectedToken ? (
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
                        <span>质押中...</span>
                      </div>
                    ) : (
                      `质押 ${amount || '0'} ${selectedToken.symbol}`
                    )}
                  </Button>
                ) : (
                  <Button
                    disabled
                    style={{
                      background: '#6b7280',
                      border: 'none',
                      color: '#ffffff'
                    }}
                    className="flex-1"
                  >
                    请先选择代币
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 代币选择器 */}
      <TokenSelector
        isOpen={showTokenSelector}
        onClose={() => setShowTokenSelector(false)}
        onTokenSelect={setSelectedToken}
        selectedToken={selectedToken || undefined}
      />
    </>
  )
} 