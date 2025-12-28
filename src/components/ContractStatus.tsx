'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, ExternalLink, Info } from 'lucide-react'
import { CURRENT_NETWORK } from '@/lib/contracts'

interface ContractStatusProps {
  className?: string
}

export function ContractStatus({ className }: ContractStatusProps) {
  const [contractStatus, setContractStatus] = useState<{
    usdt: 'checking' | 'deployed' | 'not-deployed'
    support: 'checking' | 'deployed' | 'not-deployed'
    isLoading: boolean
  }>({
    usdt: 'checking',
    support: 'checking',
    isLoading: true
  })

  useEffect(() => {
    checkContractStatus()
  }, [])

  const checkContractStatus = async () => {
    try {
      setContractStatus(prev => ({ ...prev, isLoading: true }))
      
      // 检查USDT合约
      const usdtStatus = CURRENT_NETWORK.USDT_CONTRACT ? 'deployed' : 'not-deployed'
      
      // 检查SupportXhsk合约
      const supportStatus = CURRENT_NETWORK.SUPPORT_CONTRACT ? 'deployed' : 'not-deployed'
      
      setContractStatus({
        usdt: usdtStatus,
        support: supportStatus,
        isLoading: false
      })
    } catch (error) {
      console.error('检查合约状态失败:', error)
      setContractStatus({
        usdt: 'not-deployed',
        support: 'not-deployed',
        isLoading: false
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'not-deployed':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'deployed':
        return <Badge variant="default" className="bg-green-100 text-green-800">已部署</Badge>
      case 'not-deployed':
        return <Badge variant="secondary">未部署</Badge>
      default:
        return <Badge variant="outline">检查中</Badge>
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          合约部署状态
        </CardTitle>
        <CardDescription>
          检查当前网络上的智能合约部署状态
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 网络信息 */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">当前网络</h4>
          <div className="text-sm text-gray-600">
            <p>网络名称: ETH 主网</p>
            <p>Chain ID: {CURRENT_NETWORK.CHAIN_ID}</p>
            <p>RPC URL: {CURRENT_NETWORK.RPC_URL}</p>
          </div>
        </div>

        {/* 合约状态 */}
        <div className="space-y-3">
          <h4 className="font-medium">合约状态</h4>
          
          {/* USDT合约 */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(contractStatus.usdt)}
              <div>
                <p className="font-medium">USDT 合约</p>
                <p className="text-sm text-gray-500">ERC-20 代币合约</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(contractStatus.usdt)}
              {CURRENT_NETWORK.USDT_CONTRACT && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(CURRENT_NETWORK.USDT_CONTRACT)}
                >
                  复制地址
                </Button>
              )}
            </div>
          </div>

          {/* SupportXhsk合约 */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(contractStatus.support)}
              <div>
                <p className="font-medium">SupportXhsk 合约</p>
                <p className="text-sm text-gray-500">质押和奖励合约</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(contractStatus.support)}
              {CURRENT_NETWORK.SUPPORT_CONTRACT && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(CURRENT_NETWORK.SUPPORT_CONTRACT)}
                >
                  复制地址
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 警告信息 */}
        {contractStatus.support === 'not-deployed' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>SupportXhsk 合约未部署</strong>
              <br />
              质押功能需要 SupportXhsk 合约才能正常工作。请联系管理员部署合约。
            </AlertDescription>
          </Alert>
        )}

        {/* 部署指引 */}
        {contractStatus.support === 'not-deployed' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-900">部署指引</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p>1. 确保你有足够的 ETH 用于支付部署费用</p>
              <p>2. 运行部署脚本:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                npx hardhat run scripts/deploy.js --network bsc
              </code>
              <p>3. 将部署后的合约地址更新到 contracts.ts 配置文件中</p>
            </div>
          </div>
        )}

        {/* 区块链浏览器链接 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(CURRENT_NETWORK.EXPLORER_URL, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            访问 Etherscan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={checkContractStatus}
            disabled={contractStatus.isLoading}
          >
            {contractStatus.isLoading ? '检查中...' : '刷新状态'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 