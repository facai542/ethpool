'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStakeableTokens, type TokenConfig, formatTokenAmount } from '@/lib/multi-token-config'
import { useMultiTokenStaking } from '@/hooks/useMultiTokenStaking'
import { HexagonLoaderInline } from '@/components/HexagonLoader'

interface TokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  onTokenSelect: (token: TokenConfig) => void
  selectedToken?: TokenConfig
}

export default function TokenSelector({ 
  isOpen, 
  onClose, 
  onTokenSelect,
  selectedToken 
}: TokenSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { getTokenBalance, getTokenAllowance, isTokenAuthorized } = useMultiTokenStaking()
  const stakeableTokens = getStakeableTokens()

  if (!isOpen) return null

  const handleTokenSelect = (token: TokenConfig) => {
    onTokenSelect(token)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <Card style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(212, 175, 55, 0.2)'
        }}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#d4af37]">选择代币</h3>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white/60 hover:text-white p-2"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stakeableTokens.map((token) => {
                const balance = getTokenBalance(token.symbol)
                const allowance = getTokenAllowance(token.symbol)
                const isAuthorized = isTokenAuthorized(token.symbol, '1')

                return (
                  <div
                    key={token.symbol}
                    onClick={() => handleTokenSelect(token)}
                    className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-[#d4af37]/30"
                    style={{
                      background: selectedToken?.symbol === token.symbol 
                        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: token.color }}
                      >
                        {token.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{token.symbol}</div>
                        <div className="text-white/60 text-sm">{token.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white font-medium">
                        {balance.data ? formatTokenAmount(balance.data) : '0'} {token.symbol}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={isAuthorized ? 'default' : 'secondary'}
                          style={{
                            background: isAuthorized 
                              ? 'linear-gradient(135deg, #d4af37, #f4d03f)' 
                              : '#6b7280',
                            color: isAuthorized ? '#1a1a1a' : '#ffffff',
                            fontSize: '10px',
                            padding: '2px 6px'
                          }}
                        >
                          {isAuthorized ? '已授权' : '未授权'}
                        </Badge>
                        <div className="text-white/40 text-xs">
                          默认: {formatTokenAmount(token.defaultApproveAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-center text-white/60 text-sm">
                支持 {stakeableTokens.length} 种ETH代币质押
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 