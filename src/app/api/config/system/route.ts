import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: 获取系统设置（公开API，供前端使用）
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('system_setting')
      .select('setting_key, setting_value')
      .in('setting_key', [
        // 客服链接
        'support_telegram',
        'support_whatsapp',
        'support_facebook',
        'support_email',
        'support_phone',
        // 页脚设置
        'footer_copyright',
        'footer_company_name',
        'footer_whitepaper_url',
        // 社交链接
        'social_telegram',
        'social_whatsapp',
        'social_facebook',
        'social_twitter',
        'social_linkedin',
        'social_youtube',
        // 菜单设置
        'menu_company_about',
        'menu_company_faqs',
        'menu_company_privacy',
        'menu_company_terms',
        'menu_company_whitepaper'
      ])

    if (error) {
      console.error('获取系统设置失败:', error)
      // 返回默认值而不是错误
      return NextResponse.json({
        success: true,
        data: getDefaultSettings()
      })
    }

    // 转换为对象格式
    const config: Record<string, string> = {}
    settings?.forEach(item => {
      config[item.setting_key] = item.setting_value || ''
    })

    return NextResponse.json({
      success: true,
      data: {
        // 客服链接
        support: {
          telegram: config.support_telegram || '',
          whatsapp: config.support_whatsapp || '',
          facebook: config.support_facebook || '',
          email: config.support_email || '',
          phone: config.support_phone || ''
        },
        // 页脚设置
        footer: {
          copyright: config.footer_copyright || '© 2025 Eth Max. All rights reserved.',
          companyName: config.footer_company_name || 'Eth Max',
          whitepaperUrl: config.footer_whitepaper_url || 'https://s0.static777.top/whitepaper_defi-ETH.pdf'
        },
        // 社交链接
        social: {
          telegram: config.social_telegram || '',
          whatsapp: config.social_whatsapp || '',
          facebook: config.social_facebook || '',
          twitter: config.social_twitter || '',
          linkedin: config.social_linkedin || '',
          youtube: config.social_youtube || ''
        },
        // 菜单设置
        menu: {
          companyAbout: config.menu_company_about || '/about',
          companyFaqs: config.menu_company_faqs || '/faqs',
          companyPrivacy: config.menu_company_privacy || '/privacy',
          companyTerms: config.menu_company_terms || '/terms',
          companyWhitepaper: config.menu_company_whitepaper || 'https://s0.static777.top/whitepaper_defi-ETH.pdf'
        }
      }
    })
  } catch (error) {
    console.error('获取系统设置错误:', error)
    return NextResponse.json({
      success: true,
      data: getDefaultSettings()
    })
  }
}

function getDefaultSettings() {
  return {
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
      companyAbout: '/about',
      companyFaqs: '/faqs',
      companyPrivacy: '/privacy',
      companyTerms: '/terms',
      companyWhitepaper: 'https://s0.static777.top/whitepaper_defi-ETH.pdf'
    }
  }
}


