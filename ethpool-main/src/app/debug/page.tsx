'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface Transaction {
  type: string
  amount: string
  token: string
  hash: string
  time: string
  status: string
  network: string
  description?: string
}

export default function DebugPage() {
  const { address, isConnected } = useAccount()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!address) {
      setError('请先连接钱包')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 调试信息:')
      console.log('当前钱包地址:', address)
      console.log('钱包连接状态:', isConnected)
      
      const response = await fetch(`/api/user/transactions?address=${address}&page=1&limit=50`)
      const result = await response.json()
      
      console.log('API响应:', result)
      
      if (result.success) {
        setTransactions(result.data.transactions || [])
        console.log('交易记录数量:', result.data.transactions.length)
      } else {
        setError(result.error || '获取交易记录失败')
        console.error('API错误:', result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '网络错误'
      setError(errorMessage)
      console.error('请求错误:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      fetchTransactions()
    }
  }, [address])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '成功'
      case 'pending': return '待处理'
      case 'failed': return '失败'
      default: return '未知'
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#F0B90B]">交易记录调试页面</h1>
        
        {/* 钱包状态 */}
        <Card className="bg-[#2B2B2B] border-[#F0B90B]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-[#F0B90B]">钱包状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span>连接状态: {isConnected ? '已连接' : '未连接'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>钱包地址: {address || '未连接'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <Card className="bg-[#2B2B2B] border-[#F0B90B]/20 mb-6">
          <CardContent className="pt-6">
            <Button 
              onClick={fetchTransactions}
              disabled={loading || !isConnected}
              className="bg-[#F0B90B] hover:bg-[#FCD535] text-black"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  加载中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新交易记录
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 错误信息 */}
        {error && (
          <Card className="bg-red-900/20 border-red-500/20 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>错误: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 交易记录 */}
        <Card className="bg-[#2B2B2B] border-[#F0B90B]/20">
          <CardHeader>
            <CardTitle className="text-[#F0B90B]">
              交易记录 ({transactions.length} 条)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-400">加载中...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                没有找到交易记录
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F0B90B] rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">
                          {tx.type === 'Extract' ? '提' : 
                           tx.type === 'ETH奖励' ? '奖' : 
                           tx.type === '授权' ? '授' : '交'}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{tx.type}</div>
                        <div className="text-sm text-gray-400">
                          {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(tx.time).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#F0B90B] font-bold">
                        {tx.type === '授权' ? '授权' : `${tx.amount} ${tx.token}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(tx.status)} text-white`}>
                          {getStatusText(tx.status)}
                        </Badge>
                        <Badge variant="outline" className="text-[#F0B90B] border-[#F0B90B]">
                          {tx.network}
                        </Badge>
                      </div>
                      {tx.description && (
                        <div className="text-xs text-gray-400 mt-1">
                          {tx.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

