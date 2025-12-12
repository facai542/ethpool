import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: 获取充值配置（地址和二维码）
export async function GET() {
  try {
    // 获取充值地址和二维码配置
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
      config[item.setting_key] = item.setting_value
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


