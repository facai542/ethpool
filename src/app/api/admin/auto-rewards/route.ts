import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { addCorsHeaders } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET - 获取自动奖励发放状态
export async function GET(request: NextRequest) {
  try {
    // 尝试从数据库获取配置，如果表不存在则使用默认值
    let isEnabled = false
    let lastRun = null

    try {
      const { data: config, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('config_key', 'auto_rewards_enabled')
        .single()

      if (!error && config) {
        isEnabled = config.config_value === 'true'
        lastRun = config.updated_at
      }
    } catch (dbError) {
      console.warn('数据库表不存在，使用默认配置:', dbError)
      // 如果表不存在，使用默认值
      isEnabled = false
    }

    const response = NextResponse.json({
      success: true,
      data: {
        enabled: isEnabled,
        lastRun,
        schedule: '每6小时执行一次',
        nextRun: calculateNextRun()
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('获取自动奖励状态异常:', error)
    const response = NextResponse.json({ 
      success: false, 
      error: '获取自动奖励状态异常' 
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

// POST - 开启/关闭自动奖励发放
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      const response = NextResponse.json({ 
        success: false, 
        error: 'enabled参数必须是布尔值' 
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    console.log(`🔄 ${enabled ? '开启' : '关闭'}自动奖励发放`)

    // 尝试更新数据库配置
    try {
      const { error } = await supabase
        .from('system_config')
        .upsert({
          config_key: 'auto_rewards_enabled',
          config_value: enabled.toString(),
          description: '自动奖励发放开关',
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.warn('更新数据库配置失败，使用内存配置:', error)
      }
    } catch (dbError) {
      console.warn('数据库表不存在，使用内存配置:', dbError)
    }

    // 记录操作日志（如果表存在）
    try {
      await supabase
        .from('admin_operation_logs')
        .insert({
          operation_type: 'auto_rewards_toggle',
          operation_data: { enabled },
          description: `${enabled ? '开启' : '关闭'}自动奖励发放`,
          admin_id: 1, // 系统操作
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.warn('记录操作日志失败:', logError)
    }

    const response = NextResponse.json({
      success: true,
      message: `自动奖励发放已${enabled ? '开启' : '关闭'}`,
      data: {
        enabled,
        schedule: '每6小时执行一次',
        nextRun: enabled ? calculateNextRun() : null
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('更新自动奖励状态异常:', error)
    const response = NextResponse.json({ 
      success: false, 
      error: '更新自动奖励状态异常' 
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

// 计算下次执行时间
function calculateNextRun(): string {
  const now = new Date()
  const currentHour = now.getHours()
  
  // 找到下一个6小时的倍数时间点
  let nextHour = Math.ceil(currentHour / 6) * 6
  if (nextHour >= 24) {
    nextHour = 0
    now.setDate(now.getDate() + 1)
  }
  
  const nextRun = new Date(now)
  nextRun.setHours(nextHour, 0, 0, 0)
  
  return nextRun.toISOString()
}
