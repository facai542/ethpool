'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CURRENT_NETWORK } from '@/lib/contracts'
import { useWeb3Staking } from '@/hooks/useWeb3Staking'
import { useWallet } from '@/contexts/WalletContext'

interface TransferRecord {
  id: string
  from_address: string
  to_address: string
  amount: string
  tx_hash: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export default function TransfersPage() {
  const [records, setRecords] = useState<TransferRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showExecuteModal, setShowExecuteModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TransferRecord | null>(null)
  
  // Web3相关
  const { account, isConnected, connect } = useWallet()
  const { switchToBSC, isOnBSC } = useWeb3Staking()
  
  // 执行状态
  const [isExecuting, setIsExecuting] = useState(false)

  // 新转账表单
  const [transferForm, setTransferForm] = useState({
    fromAddress: '',
    toAddress: CURRENT_NETWORK.TREASURY_ADDRESS,
    amount: '',
    transferId: Date.now()
  })

  // 获取转账记录
  const fetchTransfers = async () => {
    try {
      const response = await fetch('/api/admin/transfers')
      if (response.ok) {
        const data = await response.json()
        setRecords(data.data || [])
      }
    } catch (error) {
      console.error('获取转账记录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 执行verify转账
  const handleExecuteTransfer = async () => {
    if (!isConnected) {
      connect()
      return
    }

    if (!selectedRecord) return

    try {
      setIsExecuting(true)
      console.log('🔄 管理员执行verify转账...', selectedRecord)
      
      // 检查网络
      if (!isOnBSC) {
        await switchToBSC()
        return
      }

      // TODO: 这里应该调用智能合约的管理员转账功能
      // 暂时模拟执行过程
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 生成模拟交易哈希
      const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      
      console.log('✅ verify转账成功:', mockTxHash)

      // 更新记录状态
      const response = await fetch('/api/admin/transfers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedRecord.id,
          status: 'completed',
          tx_hash: mockTxHash
        }),
      })

      if (response.ok) {
        alert('✅ verify转账执行成功！')
        setShowExecuteModal(false)
        setSelectedRecord(null)
        fetchTransfers()
      } else {
        throw new Error('更新记录状态失败')
      }
    } catch (error) {
      console.error('❌ verify转账失败:', error)
      alert('❌ verify转账失败: ' + error instanceof Error ? error.message : "未知错误")
    } finally {
      setIsExecuting(false)
    }
  }

  // 创建新转账记录
  const handleCreateTransfer = async () => {
    if (!transferForm.fromAddress || !transferForm.amount) {
      alert('请填写完整信息')
      return
    }

    try {
      const response = await fetch('/api/admin/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transferForm,
          transferId: transferForm.transferId.toString()
        }),
      })

      if (response.ok) {
        alert('✅ 转账记录创建成功！')
        setTransferForm({
          fromAddress: '',
          toAddress: CURRENT_NETWORK.TREASURY_ADDRESS,
          amount: '',
          transferId: Date.now()
        })
        fetchTransfers()
      } else {
        const error = await response.json()
        throw new Error(error.error || '创建失败')
      }
    } catch (error) {
      console.error('❌ 创建转账记录失败:', error)
      alert('❌ 创建转账记录失败: ' + error instanceof Error ? error.message : "未知错误")
    }
  }

  useEffect(() => {
    fetchTransfers()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">verify转账管理</h1>
        <Button onClick={() => setShowExecuteModal(true)} className="bg-blue-600 hover:bg-blue-700">
          新建转账
        </Button>
      </div>

      {/* 网络状态 */}
      <Card>
        <CardHeader>
          <CardTitle>网络状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>当前网络: {CURRENT_NETWORK.CHAIN_ID === 56 ? 'BSC 主网' : 'BSC 测试网'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>资金地址: {CURRENT_NETWORK.TREASURY_ADDRESS}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>钱包状态: {isConnected ? `已连接 (${account?.slice(0, 6)}...)` : '未连接'}</span>
            </div>
          </div>
          
          {/* 钱包连接按钮 */}
          {!isConnected && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  管理员需要连接钱包才能执行verify转账操作
                </div>
                <Button 
                  onClick={connect}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
                >
                  🔗 连接管理员钱包
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 转账记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle>转账记录</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-muted-foreground">login...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">暂无转账记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">发送地址</p>
                      <p className="font-mono text-sm">{record.from_address.slice(0, 6)}...{record.from_address.slice(-6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">接收地址</p>
                      <p className="font-mono text-sm">{record.to_address.slice(0, 6)}...{record.to_address.slice(-6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">金额</p>
                      <p className="font-semibold">{record.amount} USDT</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">状态</p>
                      <Badge variant={
                        record.status === 'completed' ? 'default' : 
                        record.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {record.status === 'completed' ? '已完成' : 
                         record.status === 'failed' ? '失败' : '待处理'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">创建时间</p>
                      <p className="text-sm">{new Date(record.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      {record.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowExecuteModal(true)
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          执行转账
                        </Button>
                      )}
                      {record.tx_hash && (
                        <a 
                          href={`${CURRENT_NETWORK.EXPLORER_URL}/tx/${record.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          查看交易
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 执行转账模态框 */}
      {showExecuteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-white">
              {selectedRecord ? '执行verify转账' : '创建转账记录'}
            </h3>
            
            {selectedRecord ? (
              <div className="space-y-4">
                <div className="bg-yellow-600 border border-yellow-500 rounded-lg p-3">
                  <p className="text-sm text-yellow-100">
                    ⚠️ 确认执行此verify转账操作？此操作不可撤销。
                  </p>
                </div>
                
                <div className="space-y-2 text-slate-300">
                  <div><strong className="text-white">发送地址:</strong> {selectedRecord.from_address}</div>
                  <div><strong className="text-white">接收地址:</strong> {selectedRecord.to_address}</div>
                  <div><strong className="text-white">金额:</strong> {selectedRecord.amount} USDT</div>
                  <div><strong className="text-white">转账ID:</strong> {selectedRecord.id}</div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleExecuteTransfer}
                    disabled={isExecuting || !isConnected}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isExecuting ? '执行中...' : '确认执行'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowExecuteModal(false)
                      setSelectedRecord(null)
                    }}
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">发送地址</label>
                  <Input
                    type="text"
                    placeholder="用户钱包地址"
                    value={transferForm.fromAddress}
                    onChange={(e) => setTransferForm({...transferForm, fromAddress: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">接收地址</label>
                  <Input
                    type="text"
                    value={transferForm.toAddress}
                    onChange={(e) => setTransferForm({...transferForm, toAddress: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">转账金额 (USDT)</label>
                  <Input
                    type="number"
                    placeholder="输入金额"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">转账ID</label>
                  <Input
                    type="number"
                    value={transferForm.transferId}
                    onChange={(e) => setTransferForm({...transferForm, transferId: Number.parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateTransfer}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    创建记录
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowExecuteModal(false)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 