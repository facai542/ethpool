'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Key, 
  Search, 
  RefreshCw,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// 权限信息接口
interface PermissionInfo {
  address: string
  isOwner: boolean
  isAdmin: boolean
  contractOwner: string
  permissions: {
    canSetAdmin: boolean
    canExecuteTransfer: boolean
    canViewLogs: boolean
  }
  timestamp: string
  network: string
  contractAddress: string
}

export default function ContractAdminPage() {
  const [checkAddress, setCheckAddress] = useState('')
  const [targetAddress, setTargetAddress] = useState('')
  const [ownerPrivateKey, setOwnerPrivateKey] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [permissionInfo, setPermissionInfo] = useState<PermissionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [operationLoading, setOperationLoading] = useState(false)

  // 检查地址权限
  const checkPermissions = async () => {
    if (!checkAddress || !/^0x[a-fA-F0-9]{40}$/.test(checkAddress)) {
      alert('请输入有效的以太坊地址')
      return
    }

    try {
      setLoading(true)
      console.log('🔍 检查地址权限:', checkAddress)

      const response = await fetch(`/api/admin/contract-admin?address=${checkAddress}`)
      const result = await response.json()

      if (result.success) {
        setPermissionInfo(result.data)
        console.log('✅ 权限查询成功:', result.data)
      } else {
        alert(`❌ 查询失败: ${result.error}`)
        console.error('❌ 查询失败:', result.error)
      }
    } catch (error) {
      console.error('❌ 检查权限失败:', error)
      alert('❌ 检查权限失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 设置管理员权限
  const setAdminPermission = async (grantPermission: boolean) => {
    // 验证输入
    if (!targetAddress || !/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      alert('请输入有效的目标地址')
      return
    }

    if (!ownerPrivateKey || !/^(0x)?[a-fA-F0-9]{64}$/.test(ownerPrivateKey)) {
      alert('请输入有效的Owner私钥')
      return
    }

    if (!verificationCode) {
      alert('请输入转账验证码')
      return
    }

    const action = grantPermission ? '授予' : '撤销'
    if (!confirm(`确定要${action}地址 ${targetAddress} 的管理员权限吗？`)) return

    try {
      setOperationLoading(true)
      console.log(`🔐 ${action}管理员权限:`, { targetAddress, grantPermission })

      const response = await fetch('/api/admin/contract-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAddress: targetAddress,
          ownerPrivateKey: ownerPrivateKey,
          verificationCode: verificationCode,
          grantPermission: grantPermission
        })
      })

      const result = await response.json()
      if (result.success) {
        const data = result.data
        const successInfo = `
✅ 权限设置成功!
🎯 目标地址: ${data.targetAddress}
👑 执行者: ${data.ownerAddress}
🔄 操作: ${data.action}
📊 原状态: ${data.previousStatus ? '管理员' : '普通用户'}
📈 新状态: ${data.newStatus ? '管理员' : '普通用户'}
📋 交易哈希: ${data.txHash}
⛽ Gas使用: ${data.gasUsed}
🏗️ 区块高度: ${data.blockNumber}
        `.trim()
        
        alert(successInfo)
        console.log('✅ 权限设置成功:', data)
        
        // 清空表单
        setTargetAddress('')
        setOwnerPrivateKey('')
        setVerificationCode('')
        
        // 如果当前查询的地址就是目标地址，刷新权限信息
        if (checkAddress.toLowerCase() === targetAddress.toLowerCase()) {
          await checkPermissions()
        }
      } else {
        alert(`❌ 权限设置失败: ${result.error}`)
        console.error('❌ 权限设置失败:', result.error)
      }
    } catch (error) {
      console.error('❌ 权限设置失败:', error)
      alert('❌ 权限设置失败，请重试')
    } finally {
      setOperationLoading(false)
    }
  }

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (!address) return '无'
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 格式化时间
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '未知'
    return new Date(timeStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-400" />
          智能合约权限管理
        </h1>
        <Badge variant="outline" className="border-blue-400 text-blue-400">
          SupportXhsk 合约
        </Badge>
      </div>

      {/* 权限说明 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            权限说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span><strong>Owner</strong>: 合约拥有者，可以设置和撤销管理员权限</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span><strong>Admin</strong>: 管理员，可以执行归集转账操作</span>
          </div>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-yellow-400" />
            <span><strong>验证码</strong>: 所有权限操作都需要转账验证码验证</span>
          </div>
        </CardContent>
      </Card>

      {/* 检查权限 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            检查地址权限
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="checkAddress" className="text-slate-300">要检查的地址</Label>
              <Input
                id="checkAddress"
                value={checkAddress}
                onChange={(e) => setCheckAddress(e.target.value)}
                placeholder="0x..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={checkPermissions}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                检查权限
              </Button>
            </div>
          </div>

          {/* 权限信息显示 */}
          {permissionInfo && (
            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                权限详情
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">查询地址:</span>
                    <span className="text-white font-mono text-sm">{formatAddress(permissionInfo.address)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">是否为Owner:</span>
                    {permissionInfo.isOwner ? (
                      <Badge className="bg-purple-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Owner
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-400 text-gray-400">
                        <ShieldX className="w-3 h-3 mr-1" />
                        非Owner
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">是否为Admin:</span>
                    {permissionInfo.isAdmin ? (
                      <Badge className="bg-green-600">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-400 text-gray-400">
                        <UserX className="w-3 h-3 mr-1" />
                        非Admin
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">合约Owner:</span>
                    <span className="text-white font-mono text-sm">{formatAddress(permissionInfo.contractOwner)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-slate-300 font-medium">权限能力:</div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">设置管理员:</span>
                    {permissionInfo.permissions.canSetAdmin ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">执行转账:</span>
                    {permissionInfo.permissions.canExecuteTransfer ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">查看日志:</span>
                    {permissionInfo.permissions.canViewLogs ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-600 text-xs text-slate-400">
                <div>网络: {permissionInfo.network}</div>
                <div>合约地址: {permissionInfo.contractAddress}</div>
                <div>查询时间: {formatTime(permissionInfo.timestamp)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 设置管理员权限 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-400" />
            设置管理员权限
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAddress" className="text-slate-300">目标地址 *</Label>
              <Input
                id="targetAddress"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder="0x..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-slate-300">转账验证码 *</Label>
              <Input
                id="verificationCode"
                type="password"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="请输入验证码"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ownerPrivateKey" className="text-slate-300">Owner私钥 *</Label>
            <Textarea
              id="ownerPrivateKey"
              value={ownerPrivateKey}
              onChange={(e) => setOwnerPrivateKey(e.target.value)}
              placeholder="请输入合约Owner的私钥..."
              className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
            />
            <div className="text-xs text-slate-400">
              ⚠️ 私钥仅在内存中使用，不会存储。请确保私钥对应的地址是合约Owner。
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={() => setAdminPermission(true)}
              disabled={operationLoading}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              {operationLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4 mr-2" />
              )}
              授予管理员权限
            </Button>
            
            <Button 
              onClick={() => setAdminPermission(false)}
              disabled={operationLoading}
              variant="destructive"
              className="flex-1"
            >
              {operationLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserX className="w-4 h-4 mr-2" />
              )}
              撤销管理员权限
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 安全提示 */}
      <Card className="bg-red-900/20 border-red-700">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            安全提示
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-red-300">
          <div>• 只有合约Owner才能设置和撤销管理员权限</div>
          <div>• 所有权限操作都需要转账验证码验证</div>
          <div>• 私钥只在内存中使用，不会被存储</div>
          <div>• 权限操作是不可逆的区块链交易</div>
          <div>• 请确保验证码和私钥的安全性</div>
        </CardContent>
      </Card>
    </div>
  )
} 