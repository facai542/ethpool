import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: 获取充值配置（地址和二维码）
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('system_setting')
      .select('setting_key, setting_value')
      .in('setting_key', ['deposit_address', 'deposit_qrcode'])

    if (error) {
      console.error('获取充值配置失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '获取充值配置失败' 
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
        depositAddress: config.deposit_address || '',
        depositQrcode: config.deposit_qrcode || ''
      }
    })
  } catch (error) {
    console.error('获取充值配置错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// PUT: 更新充值配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { depositAddress, depositQrcode } = body

    const settingsToUpdate: Array<{ setting_key: string; setting_value: string }> = []

    if (depositAddress !== undefined) {
      settingsToUpdate.push({ 
        setting_key: 'deposit_address', 
        setting_value: depositAddress || '' 
      })
    }

    if (depositQrcode !== undefined) {
      settingsToUpdate.push({ 
        setting_key: 'deposit_qrcode', 
        setting_value: depositQrcode || '' 
      })
    }

    if (settingsToUpdate.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '没有需要更新的配置' 
      }, { status: 400 })
    }

    // 使用 upsert 更新或插入配置
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
      console.error('更新充值配置失败:', results.find(r => r.error)?.error)
      return NextResponse.json({ 
        success: false, 
        error: '更新充值配置失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '充值配置已更新'
    })
  } catch (error) {
    console.error('更新充值配置错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}


