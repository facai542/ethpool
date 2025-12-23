'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  QrCode,
  Save,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react'

interface DepositConfig {
  depositAddress: string
  depositQrcode: string
}

export default function DepositConfigPage() {
  const [config, setConfig] = useState<DepositConfig>({
    depositAddress: '',
    depositQrcode: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/deposit-config')
      const result = await response.json()
      
      if (result.success) {
        setConfig({
          depositAddress: result.data.depositAddress || '',
          depositQrcode: result.data.depositQrcode || ''
        })
      } else {
        setMessage({ type: 'error', text: result.error || '获取配置失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof DepositConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch('/api/admin/deposit-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: '配置保存成功！' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || '保存配置失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>加载配置中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>充值配置</h1>
          <p>管理充值地址和充值二维码</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchConfig}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500/20 border border-red-500/50' : 'bg-green-500/20 border border-green-500/50'}`}>
          <p className={message.type === 'error' ? 'text-red-400' : 'text-green-400'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 充值地址配置 */}
        <div className="space-y-4 p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">充值地址</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="depositAddress">钱包地址</Label>
            <div className="flex gap-2">
              <Input
                id="depositAddress"
                value={config.depositAddress}
                onChange={(e) => handleChange('depositAddress', e.target.value)}
                placeholder="请输入充值钱包地址"
                className="flex-1"
              />
              {config.depositAddress && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(config.depositAddress)}
                  title="复制地址"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              用户充值时将向此地址转账
            </p>
          </div>
        </div>

        {/* 充值二维码配置 */}
        <div className="space-y-4 p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">充值二维码</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="depositQrcode">二维码图片URL</Label>
            <Input
              id="depositQrcode"
              value={config.depositQrcode}
              onChange={(e) => handleChange('depositQrcode', e.target.value)}
              placeholder="请输入二维码图片URL或图片链接"
              className="flex-1"
            />
            <p className="text-sm text-muted-foreground">
              支持图片URL或Base64编码的图片
            </p>

            {/* 二维码预览 */}
            {config.depositQrcode && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">预览:</p>
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 border border-border rounded-lg overflow-hidden bg-white p-2">
                    <img
                      src={config.depositQrcode}
                      alt="充值二维码"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb3lm77niYfliqDovb08L3RleHQ+PC9zdmc+'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存配置
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

