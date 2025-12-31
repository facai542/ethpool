import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 开始Telegram服务诊断...')

    // 1. 检查环境变量
    const envCheck = {
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: !!process.env.TELEGRAM_CHAT_ID,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      BOT_TOKEN_LENGTH: process.env.TELEGRAM_BOT_TOKEN?.length || 0,
      CHAT_ID_VALUE: process.env.TELEGRAM_CHAT_ID || 'NOT_SET'
    }

    console.log('🔍 环境变量检查:', envCheck)

    // 2. 检查数据库连接
    let dbCheck = { connected: false, error: null }
    try {
      const { data, error } = await supabase
        .from('telegram_notification_queue')
        .select('count')
        .limit(1)
      
      dbCheck = { 
        connected: !error, 
        error: error?.message || null 
      }
    } catch (error) {
      dbCheck = { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }

    console.log('🔍 数据库连接检查:', dbCheck)

    // 3. 检查通知队列表
    let queueCheck = { exists: false, count: 0, recent: [], error: null }
    try {
      const { data, error } = await supabase
        .from('telegram_notification_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error) {
        queueCheck = {
          exists: true,
          count: data?.length || 0,
          recent: data || [],
          error: null
        }
      } else {
        queueCheck.error = error.message
      }
    } catch (error) {
      queueCheck.error = error instanceof Error ? error.message : 'Unknown error'
    }

    console.log('🔍 通知队列表检查:', queueCheck)

    // 4. 测试Telegram API连接
    let telegramTest = { success: false, error: null, botInfo: null }
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`)
        const result = await response.json()
        
        if (result.ok) {
          telegramTest = {
            success: true,
            error: null,
            botInfo: result.result
          }
        } else {
          telegramTest.error = result.description || 'Unknown error'
        }
      } catch (error) {
        telegramTest.error = error instanceof Error ? error.message : 'Unknown error'
      }
    } else {
      telegramTest.error = 'TELEGRAM_BOT_TOKEN not set'
    }

    console.log('🔍 Telegram API测试:', telegramTest)

    // 5. 检查用户授权记录
    let authCheck = { count: 0, recent: [], error: null }
    try {
      const { data, error } = await supabase
        .from('nh_member_new')
        .select('id, wallet_address, approved, created_at')
        .eq('approved', 1)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error) {
        authCheck = {
          count: data?.length || 0,
          recent: data || [],
          error: null
        }
      } else {
        authCheck.error = error.message
      }
    } catch (error) {
      authCheck.error = error instanceof Error ? error.message : 'Unknown error'
    }

    console.log('🔍 用户授权记录检查:', authCheck)

    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbCheck,
      notificationQueue: queueCheck,
      telegramAPI: telegramTest,
      userAuth: authCheck,
      recommendations: []
    }

    // 生成建议
    if (!envCheck.TELEGRAM_BOT_TOKEN) {
      diagnosis.recommendations.push('❌ 缺少 TELEGRAM_BOT_TOKEN 环境变量')
    }
    if (!envCheck.TELEGRAM_CHAT_ID) {
      diagnosis.recommendations.push('❌ 缺少 TELEGRAM_CHAT_ID 环境变量')
    }
    if (!dbCheck.connected) {
      diagnosis.recommendations.push('❌ 数据库连接失败')
    }
    if (!telegramTest.success) {
      diagnosis.recommendations.push('❌ Telegram API连接失败')
    }
    if (queueCheck.count === 0) {
      diagnosis.recommendations.push('⚠️ 通知队列为空，可能没有用户授权记录')
    }

    const response = NextResponse.json({
      success: true,
      message: 'Telegram服务诊断完成',
      data: diagnosis
    })

    // 添加CORS头
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return response

  } catch (error) {
    console.error('❌ Telegram服务诊断失败:', error)
    
    const response = NextResponse.json({
      success: false,
      error: '诊断失败: ' + (error instanceof Error ? error.message : '未知错误'),
      data: null
    }, { status: 500 })

    // 添加CORS头
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return response
  }
}

