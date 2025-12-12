import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: 获取系统配置
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('system_setting')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'admin_address',
        'admin_private_key',
        'treasury_address',
        'admin_password'
      ])

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('获取系统配置失败:', error)
      }
      return NextResponse.json({ 
        success: false, 
        error: '获取系统配置失败' 
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
        adminAddress: config.admin_address || '',
        adminPrivateKey: config.admin_private_key || '',
        treasuryAddress: config.treasury_address || '',
        adminPassword: config.admin_password || ''
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('获取系统配置错误:', error)
    }
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// PUT: 更新系统配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminAddress, adminPrivateKey, treasuryAddress, adminPassword } = body

    // 验证输入
    if (adminAddress && !/^0x[a-fA-F0-9]{40}$/.test(adminAddress)) {
      return NextResponse.json({ 
        success: false, 
        error: '管理员地址格式无效' 
      }, { status: 400 })
    }

    if (adminPrivateKey && !/^[a-fA-F0-9]{64}$/.test(adminPrivateKey.replace('0x', ''))) {
      return NextResponse.json({ 
        success: false, 
        error: '管理员私钥格式无效' 
      }, { status: 400 })
    }

    if (treasuryAddress && !/^0x[a-fA-F0-9]{40}$/.test(treasuryAddress)) {
      return NextResponse.json({ 
        success: false, 
        error: '收款地址格式无效' 
      }, { status: 400 })
    }

    if (adminPassword && adminPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: '管理员密码至少6位' 
      }, { status: 400 })
    }

    // 更新配置
    const updates = []
    
    if (adminAddress !== undefined) {
      updates.push({
        setting_key: 'admin_address',
        setting_value: adminAddress
      })
    }

    if (adminPrivateKey !== undefined) {
      updates.push({
        setting_key: 'admin_private_key',
        setting_value: adminPrivateKey
      })
    }

    if (treasuryAddress !== undefined) {
      updates.push({
        setting_key: 'treasury_address',
        setting_value: treasuryAddress
      })
    }

    if (adminPassword !== undefined) {
      updates.push({
        setting_key: 'admin_password',
        setting_value: adminPassword
      })
    }

    // 使用 upsert 更新或插入配置
    for (const update of updates) {
      const { error } = await supabase
        .from('system_setting')
        .upsert({
          setting_key: update.setting_key,
          setting_value: update.setting_value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        })

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`更新配置 ${update.setting_key} 失败:`, error)
        }
        return NextResponse.json({ 
          success: false, 
          error: `更新配置失败: ${error.message}` 
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: '配置保存成功'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('更新系统配置错误:', error)
    }
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}


