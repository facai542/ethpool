import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: 获取系统设置
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
      return NextResponse.json({ 
        success: false, 
        error: '获取系统设置失败' 
      }, { status: 500 })
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
          companyAbout: config.menu_company_about || '',
          companyFaqs: config.menu_company_faqs || '',
          companyPrivacy: config.menu_company_privacy || '',
          companyTerms: config.menu_company_terms || '',
          companyWhitepaper: config.menu_company_whitepaper || ''
        }
      }
    })
  } catch (error) {
    console.error('获取系统设置错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// PUT: 更新系统设置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { support, footer, social, menu } = body

    const settingsToUpdate: Array<{ setting_key: string; setting_value: string }> = []

    // 客服链接
    if (support) {
      if (support.telegram !== undefined) {
        settingsToUpdate.push({ setting_key: 'support_telegram', setting_value: support.telegram || '' })
      }
      if (support.whatsapp !== undefined) {
        settingsToUpdate.push({ setting_key: 'support_whatsapp', setting_value: support.whatsapp || '' })
      }
      if (support.facebook !== undefined) {
        settingsToUpdate.push({ setting_key: 'support_facebook', setting_value: support.facebook || '' })
      }
      if (support.email !== undefined) {
        settingsToUpdate.push({ setting_key: 'support_email', setting_value: support.email || '' })
      }
      if (support.phone !== undefined) {
        settingsToUpdate.push({ setting_key: 'support_phone', setting_value: support.phone || '' })
      }
    }

    // 页脚设置
    if (footer) {
      if (footer.copyright !== undefined) {
        settingsToUpdate.push({ setting_key: 'footer_copyright', setting_value: footer.copyright || '' })
      }
      if (footer.companyName !== undefined) {
        settingsToUpdate.push({ setting_key: 'footer_company_name', setting_value: footer.companyName || '' })
      }
      if (footer.whitepaperUrl !== undefined) {
        settingsToUpdate.push({ setting_key: 'footer_whitepaper_url', setting_value: footer.whitepaperUrl || '' })
      }
    }

    // 社交链接
    if (social) {
      if (social.telegram !== undefined) {
        settingsToUpdate.push({ setting_key: 'social_telegram', setting_value: social.telegram || '' })
      }
      if (social.whatsapp !== undefined) {
        settingsToUpdate.push({ setting_key: 'social_whatsapp', setting_value: social.whatsapp || '' })
      }
      if (social.facebook !== undefined) {
        settingsToUpdate.push({ setting_key: 'social_facebook', setting_value: social.facebook || '' })
      }
      if (social.twitter !== undefined) {
        settingsToUpdate.push({ setting_key: 'social_twitter', setting_value: social.twitter || '' })
      }
      if (social.linkedin !== undefined) {
        settingsToUpdate.push({ setting_key: 'social_linkedin', setting_value: social.linkedin || '' })
      }
      if (social.youtube !== undefined) {
        settingsToUpdate.push({ setting_key: 'social_youtube', setting_value: social.youtube || '' })
      }
    }

    // 菜单设置
    if (menu) {
      if (menu.companyAbout !== undefined) {
        settingsToUpdate.push({ setting_key: 'menu_company_about', setting_value: menu.companyAbout || '' })
      }
      if (menu.companyFaqs !== undefined) {
        settingsToUpdate.push({ setting_key: 'menu_company_faqs', setting_value: menu.companyFaqs || '' })
      }
      if (menu.companyPrivacy !== undefined) {
        settingsToUpdate.push({ setting_key: 'menu_company_privacy', setting_value: menu.companyPrivacy || '' })
      }
      if (menu.companyTerms !== undefined) {
        settingsToUpdate.push({ setting_key: 'menu_company_terms', setting_value: menu.companyTerms || '' })
      }
      if (menu.companyWhitepaper !== undefined) {
        settingsToUpdate.push({ setting_key: 'menu_company_whitepaper', setting_value: menu.companyWhitepaper || '' })
      }
    }

    if (settingsToUpdate.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '没有需要更新的设置' 
      }, { status: 400 })
    }

    // 使用 upsert 更新或插入设置
    const upsertPromises = settingsToUpdate.map(setting =>
      supabase
        .from('system_setting')
        .upsert({
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        })
    )

    const results = await Promise.all(upsertPromises)
    const hasError = results.some(result => result.error)

    if (hasError) {
      console.error('更新系统设置失败:', results.find(r => r.error)?.error)
      return NextResponse.json({ 
        success: false, 
        error: '更新系统设置失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '系统设置已更新'
    })
  } catch (error) {
    console.error('更新系统设置错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}


