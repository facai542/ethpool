/**
 * 调试 API - 检查 Webhook 相关数据
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // 1. 检查监控列表
    const { data: monitors, error: monitorError } = await supabase
      .from('wallet_monitor')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    // 2. 检查最近的交易记录
    const { data: transactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // 3. 检查通知队列
    const { data: notifications, error: notifError } = await supabase
      .from('telegram_notification_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // 4. 检查 Telegram 配置
    const { data: config, error: configError } = await supabase
      .from('system_config')
      .select('*')
      .in('config_key', ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'])

    return NextResponse.json({
      success: true,
      data: {
        monitors: {
          count: monitors?.length || 0,
          data: monitors || [],
          error: monitorError?.message
        },
        transactions: {
          count: transactions?.length || 0,
          data: transactions || [],
          error: txError?.message
        },
        notifications: {
          count: notifications?.length || 0,
          data: notifications || [],
          error: notifError?.message
        },
        telegramConfig: {
          data: config || [],
          error: configError?.message
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ 调试 API 错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

