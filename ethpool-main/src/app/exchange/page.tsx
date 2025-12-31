'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calculator } from 'lucide-react'
import { RouteIcon } from '@/components/ui/route-icon'
import { useWallet } from '@/contexts/WalletContext'
import { useI18n } from '@/hooks/useI18n'

interface ExchangeRate {
  from: string
  to: string
  rate: number
  fee: number
  minAmount: number
  amount?: number
  feeAmount?: number
  netAmount?: number
  exchangedAmount?: number
  canExchange?: boolean
}

interface UserBalances {
  usdt: number
  cny: number
  usd: number
}

export default function ExchangePage() {
  const { account: address, isConnected } = useWallet()
  const { t } = useI18n()
  
  const [fromCurrency, setFromCurrency] = useState('USDT')
  const [toCurrency, setToCurrency] = useState('CNY')
  const [amount, setAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
  const [userBalances, setUserBalances] = useState<UserBalances>({ usdt: 0, cny: 0, usd: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isExchanging, setIsExchanging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const currencies = [
    { value: 'USDT', label: 'USDT', symbol: '₮' },
    { value: 'CNY', label: '人民币', symbol: '¥' },
    { value: 'USD', label: '美元', symbol: '$' }
  ]

  // 获取用户余额
  const fetchUserBalances = async () => {
    if (!address) return
    
    try {
      const response = await fetch(`/api/user/info?address=${address}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setUserBalances({
          usdt: Number.parseFloat(data.data.usdt || '0'),
          cny: Number.parseFloat(data.data.cny_balance || '0'),
          usd: Number.parseFloat(data.data.usd_balance || '0')
        })
      }
    } catch (error) {
      console.error('获取用户余额失败:', error)
    }
  }

  // 获取汇率
  const fetchExchangeRate = async () => {
    if (!fromCurrency || !toCurrency || !amount) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(
        `/api/exchange?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      )
      const data = await response.json()
      
      if (data.success) {
        setExchangeRate(data.data)
      } else {
        setError(data.error || '获取汇率失败')
      }
    } catch (error) {
      setError('获取汇率失败: ' + error instanceof Error ? error.message : "未知错误")
    } finally {
      setIsLoading(false)
    }
  }

  // 执行兑换
  const handleExchange = async () => {
    if (!address || !exchangeRate || !exchangeRate.canExchange) return
    
    setIsExchanging(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch('/api/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          from: fromCurrency,
          to: toCurrency,
          amount: Number.parseFloat(amount)
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`兑换成功！获得 ${data.data.exchange.toAmount.toFixed(8)} ${toCurrency}`)
        setAmount('')
        setExchangeRate(null)
        await fetchUserBalances() // 刷新余额
      } else {
        setError(data.error || '兑换失败')
      }
    } catch (error) {
      setError('兑换失败: ' + error instanceof Error ? error.message : "未知错误")
    } finally {
      setIsExchanging(false)
    }
  }

  // 切换货币对
  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
    setAmount('')
    setExchangeRate(null)
  }

  // 设置最大金额
  const setMaxAmount = () => {
    const balance = userBalances[fromCurrency.toLowerCase() as keyof UserBalances]
    setAmount(balance.toString())
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchUserBalances()
    }
  }, [isConnected, address])

  useEffect(() => {
    if (amount && Number.parseFloat(amount) > 0) {
      const timer = setTimeout(() => {
        fetchExchangeRate()
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setExchangeRate(null)
    }
  }, [fromCurrency, toCurrency, amount])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-bold mb-4">请连接钱包</h2>
            <p className="text-gray-600">需要连接钱包才能使用货币兑换功能</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">货币兑换</h1>
          <p className="text-gray-600">快速兑换不同货币，享受优惠汇率</p>
        </div>

        {/* 余额显示 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              账户余额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {currencies.map((currency) => (
                <div key={currency.value} className="text-center">
                  <div className="text-sm text-gray-600">{currency.label}</div>
                  <div className="text-lg font-bold">
                    {currency.symbol}{userBalances[currency.value.toLowerCase() as keyof UserBalances].toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 兑换表单 */}
        <Card>
          <CardHeader>
            <CardTitle>货币兑换</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 兑换方向 */}
            <div className="grid grid-cols-5 gap-4 items-end">
              <div className="col-span-2">
                <Label htmlFor="from-currency">从</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label} ({currency.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-center">
                <RouteIcon
                  onClick={swapCurrencies}
                  className="cursor-pointer transform hover:scale-110 duration-200 text-blue-500"
                  size={28}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="to-currency">到</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem 
                        key={currency.value} 
                        value={currency.value}
                        disabled={currency.value === fromCurrency}
                      >
                        {currency.label} ({currency.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 金额输入 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="amount">兑换金额</Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={setMaxAmount}
                  className="text-xs h-auto p-0"
                >
                  最大: {userBalances[fromCurrency.toLowerCase() as keyof UserBalances].toLocaleString()}
                </Button>
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="请输入兑换金额"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right"
              />
            </div>

            {/* 汇率信息 */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">计算汇率中...</span>
              </div>
            )}

            {exchangeRate && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">汇率</span>
                  <span className="font-medium">
                    1 {fromCurrency} = {exchangeRate.rate} {toCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">手续费 ({(exchangeRate.fee * 100).toFixed(2)}%)</span>
                  <span className="font-medium">
                    {exchangeRate.feeAmount?.toFixed(8)} {fromCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">实际兑换金额</span>
                  <span className="font-medium">
                    {exchangeRate.netAmount?.toFixed(8)} {fromCurrency}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-900 font-semibold">您将获得</span>
                  <span className="text-green-600 font-bold text-lg">
                    {exchangeRate.exchangedAmount?.toFixed(8)} {toCurrency}
                  </span>
                </div>
                
                {!exchangeRate.canExchange && (
                  <Badge variant="destructive" className="w-full justify-center">
                    最小兑换金额: {exchangeRate.minAmount} {fromCurrency}
                  </Badge>
                )}
              </div>
            )}

            {/* 错误和成功消息 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            {/* 兑换按钮 */}
            <Button
              onClick={handleExchange}
              disabled={!exchangeRate || !exchangeRate.canExchange || isExchanging}
              className="w-full"
              size="lg"
            >
              {isExchanging ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  兑换中...
                </>
              ) : (
                `兑换 ${fromCurrency} → ${toCurrency}`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 兑换说明 */}
        <Card>
          <CardHeader>
            <CardTitle>兑换说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• 兑换汇率实时更新，以实际兑换时为准</p>
            <p>• 不同货币对有不同的手续费率和最小兑换金额</p>
            <p>• 兑换完成后余额会立即更新</p>
            <p>• 所有兑换记录都会保存在您的交易历史中</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 