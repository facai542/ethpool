import React, { useState, useEffect } from 'react'
import { safeTokenService } from '@/lib/safe-token'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { getSafeTokenAddress } from '@/lib/contracts'

interface SafeTokenInfoProps {
  provider: any
  account: string
}

export function SafeTokenInfo({ provider, account }: SafeTokenInfoProps) {
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [tokenInfo, setTokenInfo] = useState({
    name: '',
    symbol: '',
    decimals: 0,
    totalSupply: '0',
    balance: '0',
  })
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const connectToContract = async () => {
      if (provider && account) {
        try {
          const connected = await safeTokenService.connect(provider)
          setIsConnected(connected)
          
          if (connected) {
            await loadTokenInfo()
          }
        } catch (error) {
          console.error('连接合约失败:', error)
        }
      }
    }
    
    connectToContract()
  }, [provider, account])

  const loadTokenInfo = async () => {
    try {
      const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
        safeTokenService.getName(),
        safeTokenService.getSymbol(),
        safeTokenService.getDecimals(),
        safeTokenService.getTotalSupply(),
        safeTokenService.getBalance(account)
      ])
      
      setTokenInfo({
        name,
        symbol,
        decimals,
        totalSupply,
        balance
      })
    } catch (error) {
      console.error('加载代币信息失败:', error)
    }
  }

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      toast({
        title: '输入错误',
        description: '请输入接收地址和金额',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const txHash = await safeTokenService.transfer(recipient, amount)
      toast({
        title: '转账成功',
        description: `交易哈希: ${txHash.slice(0, 10)}...`,
      })
      await loadTokenInfo()
    } catch (error) {
      toast({
        title: '转账失败',
        description: error instanceof Error ? error.message : String(error) || '请稍后再试',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const tokenAddress = getSafeTokenAddress()

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SafeToken</CardTitle>
          <CardDescription>正在连接合约...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{tokenInfo.name} ({tokenInfo.symbol})</CardTitle>
        <CardDescription>
          合约地址: {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>总供应量</Label>
              <div className="text-lg font-semibold">{Number.parseFloat(tokenInfo.totalSupply).toLocaleString()} {tokenInfo.symbol}</div>
            </div>
            <div>
              <Label>我的余额</Label>
              <div className="text-lg font-semibold">{Number.parseFloat(tokenInfo.balance).toLocaleString()} {tokenInfo.symbol}</div>
            </div>
          </div>
          
          <div className="pt-4">
            <Label htmlFor="recipient">接收地址</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="amount">转账金额</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleTransfer} 
          disabled={loading || !recipient || !amount}
        >
          {loading ? '处理中...' : '转账'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SafeTokenInfo 