import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取奖励设置
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('reward_settings')
      .select('*')
      .order('setting_type')

    if (error) {
      console.error('查询奖励设置失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // 格式化返回数据
    const formattedSettings = {
      first_authorization: settings?.find(s => s.setting_type === 'first_authorization') || null,
      periodic_reward: settings?.find(s => s.setting_type === 'periodic_reward') || null
    }

    return NextResponse.json({
      success: true,
      data: formattedSettings
    })
  } catch (error) {
    console.error('获取奖励设置异常:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 更新奖励设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { setting_type, is_enabled, config } = body

    console.log('更新奖励设置:', { setting_type, is_enabled, config })

    // 验证必需字段
    if (!setting_type || config === undefined) {
      return NextResponse.json({
        success: false,
        error: '缺少必需字段'
      }, { status: 400 })
    }

    // 验证 setting_type
    if (!['first_authorization', 'periodic_reward'].includes(setting_type)) {
      return NextResponse.json({
        success: false,
        error: '无效的设置类型'
      }, { status: 400 })
    }

    // 验证配置格式
    if (setting_type === 'first_authorization') {
      if (!config.reward_amount_usdt || config.reward_amount_usdt <= 0) {
        return NextResponse.json({
          success: false,
          error: '首次授权奖励金额必须大于0'
        }, { status: 400 })
      }
    } else if (setting_type === 'periodic_reward') {
      if (!config.tiers || !Array.isArray(config.tiers) || config.tiers.length === 0) {
        return NextResponse.json({
          success: false,
          error: '定时奖励必须包含至少一个奖励层级'
        }, { status: 400 })
      }
    }

    // 使用 UPSERT 更新或插入
    const { data, error } = await supabase
      .from('reward_settings')
      .upsert({
        setting_type,
        is_enabled: is_enabled ?? true,
        config,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_type'
      })
      .select()
      .single()

    if (error) {
      console.error('保存奖励设置失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    console.log('奖励设置已保存:', data)

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('保存奖励设置异常:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

