'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Link as LinkIcon,
  Save,
  RefreshCw,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  FileText
} from 'lucide-react'

interface SystemSettings {
  support: {
    telegram: string
    whatsapp: string
    facebook: string
    email: string
    phone: string
  }
  footer: {
    copyright: string
    companyName: string
    whitepaperUrl: string
  }
  social: {
    telegram: string
    whatsapp: string
    facebook: string
    twitter: string
    linkedin: string
    youtube: string
  }
  menu: {
    companyAbout: string
    companyFaqs: string
    companyPrivacy: string
    companyTerms: string
    companyWhitepaper: string
  }
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    support: {
      telegram: '',
      whatsapp: '',
      facebook: '',
      email: '',
      phone: ''
    },
    footer: {
      copyright: '© 2025 Eth Max. All rights reserved.',
      companyName: 'Eth Max',
      whitepaperUrl: 'https://s0.static777.top/whitepaper_defi-ETH.pdf'
    },
    social: {
      telegram: '',
      whatsapp: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      youtube: ''
    },
    menu: {
      companyAbout: '',
      companyFaqs: '',
      companyPrivacy: '',
      companyTerms: '',
      companyWhitepaper: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // 获取当前设置
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system/settings')
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
      } else {
        setMessage({ type: 'error', text: result.error || '获取设置失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const handleSupportChange = (field: keyof SystemSettings['support'], value: string) => {
    setSettings(prev => ({
      ...prev,
      support: {
        ...prev.support,
        [field]: value
      }
    }))
  }

  const handleFooterChange = (field: keyof SystemSettings['footer'], value: string) => {
    setSettings(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: value
      }
    }))
  }

  const handleSocialChange = (field: keyof SystemSettings['social'], value: string) => {
    setSettings(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [field]: value
      }
    }))
  }

  const handleMenuChange = (field: keyof SystemSettings['menu'], value: string) => {
    setSettings(prev => ({
      ...prev,
      menu: {
        ...prev.menu,
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch('/api/admin/system/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: '设置保存成功！' })
        // 3秒后清除消息
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || '保存设置失败' })
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
        <p>加载设置中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>网站设置</h1>
          <p>管理客服链接、页脚内容和社交链接</p>
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
        {/* 客服链接设置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5" />
            客服链接设置
          </h3>
          <p className="mb-4">设置客服联系方式，用户可以通过这些渠道联系客服</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="support_telegram" className="text-slate-300">Telegram</Label>
                <input
                  id="support_telegram"
                  type="text"
                  value={settings.support.telegram}
                  onChange={(e) => handleSupportChange('telegram', e.target.value)}
                  placeholder="https://t.me/your_telegram"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_whatsapp" className="text-slate-300">WhatsApp</Label>
                <input
                  id="support_whatsapp"
                  type="text"
                  value={settings.support.whatsapp}
                  onChange={(e) => handleSupportChange('whatsapp', e.target.value)}
                  placeholder="https://wa.me/your_whatsapp"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_facebook" className="text-slate-300">Facebook</Label>
                <input
                  id="support_facebook"
                  type="text"
                  value={settings.support.facebook}
                  onChange={(e) => handleSupportChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/your_page"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_email" className="text-slate-300">邮箱</Label>
                <input
                  id="support_email"
                  type="email"
                  value={settings.support.email}
                  onChange={(e) => handleSupportChange('email', e.target.value)}
                  placeholder="support@example.com"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_phone" className="text-slate-300">电话</Label>
                <input
                  id="support_phone"
                  type="text"
                  value={settings.support.phone}
                  onChange={(e) => handleSupportChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 页脚设置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            页脚设置
          </h3>
          <p className="mb-4">设置页脚显示的内容和链接</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="footer_copyright" className="text-slate-300">版权信息</Label>
              <input
                id="footer_copyright"
                type="text"
                value={settings.footer.copyright}
                onChange={(e) => handleFooterChange('copyright', e.target.value)}
                placeholder="© 2025 Eth Max. All rights reserved."
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer_company_name" className="text-slate-300">公司名称</Label>
              <input
                id="footer_company_name"
                type="text"
                value={settings.footer.companyName}
                onChange={(e) => handleFooterChange('companyName', e.target.value)}
                placeholder="Eth Max"
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer_whitepaper_url" className="text-slate-300">白皮书链接</Label>
              <input
                id="footer_whitepaper_url"
                type="text"
                value={settings.footer.whitepaperUrl}
                onChange={(e) => handleFooterChange('whitepaperUrl', e.target.value)}
                placeholder="https://s0.static777.top/whitepaper_defi-ETH.pdf"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* 社交链接设置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-5 h-5" />
            社交链接设置
          </h3>
          <p className="mb-4">设置页脚显示的社交媒体链接</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="social_telegram" className="text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Telegram
                </Label>
                <input
                  id="social_telegram"
                  type="text"
                  value={settings.social.telegram}
                  onChange={(e) => handleSocialChange('telegram', e.target.value)}
                  placeholder="https://t.me/your_channel"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_whatsapp" className="text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </Label>
                <input
                  id="social_whatsapp"
                  type="text"
                  value={settings.social.whatsapp}
                  onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                  placeholder="https://wa.me/your_whatsapp"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_facebook" className="text-slate-300 flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Label>
                <input
                  id="social_facebook"
                  type="text"
                  value={settings.social.facebook}
                  onChange={(e) => handleSocialChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/your_page"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_twitter" className="text-slate-300 flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Label>
                <input
                  id="social_twitter"
                  type="text"
                  value={settings.social.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/your_account"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_linkedin" className="text-slate-300 flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Label>
                <input
                  id="social_linkedin"
                  type="text"
                  value={settings.social.linkedin}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/your_company"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_youtube" className="text-slate-300 flex items-center gap-2">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </Label>
                <input
                  id="social_youtube"
                  type="text"
                  value={settings.social.youtube}
                  onChange={(e) => handleSocialChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/@your_channel"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 菜单链接设置 */}
        <div className="content-card">
          <h3 className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-5 h-5" />
            菜单链接设置
          </h3>
          <p className="mb-4">设置页脚"公司"菜单下的链接地址</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="menu_company_about" className="text-slate-300">关于我们</Label>
              <input
                id="menu_company_about"
                type="text"
                value={settings.menu.companyAbout}
                onChange={(e) => handleMenuChange('companyAbout', e.target.value)}
                placeholder="https://example.com/about"
                className="form-input"
              />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu_company_faqs" className="text-slate-300">常见问题</Label>
              <input
                id="menu_company_faqs"
                type="text"
                value={settings.menu.companyFaqs}
                onChange={(e) => handleMenuChange('companyFaqs', e.target.value)}
                placeholder="https://example.com/faqs"
                className="form-input"
              />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu_company_privacy" className="text-slate-300">隐私政策</Label>
              <input
                id="menu_company_privacy"
                type="text"
                value={settings.menu.companyPrivacy}
                onChange={(e) => handleMenuChange('companyPrivacy', e.target.value)}
                placeholder="https://example.com/privacy"
                className="form-input"
              />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu_company_terms" className="text-slate-300">服务条款</Label>
              <input
                id="menu_company_terms"
                type="text"
                value={settings.menu.companyTerms}
                onChange={(e) => handleMenuChange('companyTerms', e.target.value)}
                placeholder="https://example.com/terms"
                className="form-input"
              />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="menu_company_whitepaper" className="text-slate-300">白皮书</Label>
              <input
                id="menu_company_whitepaper"
                type="text"
                value={settings.menu.companyWhitepaper}
                onChange={(e) => handleMenuChange('companyWhitepaper', e.target.value)}
                placeholder="https://s0.static777.top/whitepaper_defi-ETH.pdf"
                className="form-input"
              />
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <button
            onClick={fetchSettings}
            disabled={loading || saving}
            className="px-4 py-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`inline-block w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            重置
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[rgba(102,126,234,0.8)] text-white rounded-lg hover:bg-[rgba(102,126,234,1)] disabled:bg-[rgba(108,117,125,0.6)] disabled:cursor-not-allowed transition-all"
          >
            <Save className={`inline-block w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  )
}

