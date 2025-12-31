import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Moralis from 'moralis'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 诊断接口：检查监听系统配置状态
 */
export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {},
    database: {},
    moralis: {},
    issues: [],
    recommendations: []
  }

  try {
    // 1. 检查环境变量配置
    console.log('🔍 检查环境变量配置...')
    
    diagnostics.environment = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: !!process.env.TELEGRAM_CHAT_ID,
      MORALIS_API_KEY: !!process.env.MORALIS_API_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '未配置',
    }

    // 检查缺失的环境变量
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      diagnostics.issues.push('❌ TELEGRAM_BOT_TOKEN 未配置')
      diagnostics.recommendations.push('在 Vercel 环境变量中添加 TELEGRAM_BOT_TOKEN')
    }
    
    if (!process.env.TELEGRAM_CHAT_ID) {
      diagnostics.issues.push('❌ TELEGRAM_CHAT_ID 未配置')
      diagnostics.recommendations.push('在 Vercel 环境变量中添加 TELEGRAM_CHAT_ID')
    }
    
    if (!process.env.MORALIS_API_KEY) {
      diagnostics.issues.push('⚠️ MORALIS_API_KEY 未配置（代码中有硬编码的备用值）')
      diagnostics.recommendations.push('建议在 Vercel 环境变量中添加 MORALIS_API_KEY')
    }
    
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      diagnostics.issues.push('❌ NEXT_PUBLIC_APP_URL 未配置')
      diagnostics.recommendations.push('在 Vercel 环境变量中添加 NEXT_PUBLIC_APP_URL（用于 Moralis Webhook）')
    }

    // 2. 检查数据库表结构
    console.log('🔍 检查数据库表...')
    
    // 检查 wallet_monitor 表
    const { data: monitorData, error: monitorError } = await supabase
      .from('wallet_monitor')
      .select('*')
      .limit(5)

    if (monitorError) {
      diagnostics.database.wallet_monitor = {
        status: '❌ 错误',
        error: monitorError.message
      }
      diagnostics.issues.push('❌ wallet_monitor 表访问失败')
    } else {
      diagnostics.database.wallet_monitor = {
        status: '✅ 正常',
        count: monitorData.length,
        sample: monitorData.slice(0, 2)
      }
    }

    // 检查 wallet_transactions 表
    const { data: txData, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .limit(5)

    if (txError) {
      diagnostics.database.wallet_transactions = {
        status: '❌ 错误',
        error: txError.message
      }
      diagnostics.issues.push('❌ wallet_transactions 表访问失败')
    } else {
      diagnostics.database.wallet_transactions = {
        status: '✅ 正常',
        count: txData.length,
        sample: txData.slice(0, 2)
      }
    }

    // 检查 telegram_notification_queue 表
    const { data: queueData, error: queueError } = await supabase
      .from('telegram_notification_queue')
      .select('*')
      .eq('is_sent', false)
      .limit(5)

    if (queueError) {
      diagnostics.database.telegram_notification_queue = {
        status: '❌ 错误',
        error: queueError.message
      }
      diagnostics.issues.push('❌ telegram_notification_queue 表访问失败')
    } else {
      diagnostics.database.telegram_notification_queue = {
        status: '✅ 正常',
        pending_count: queueData.length,
        sample: queueData.slice(0, 2)
      }
      
      if (queueData.length > 0) {
        diagnostics.issues.push(`⚠️ 有 ${queueData.length} 条未发送的通知`)
        diagnostics.recommendations.push('检查 Supabase Edge Function (telegram-notifier) 是否部署')
      }
    }

    // 3. 检查 Moralis 配置
    console.log('🔍 检查 Moralis 配置...')
    
    try {
      const MORALIS_API_KEY = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
      
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: MORALIS_API_KEY,
        })
      }

      // 尝试获取 Stream 列表
      const streams = await Moralis.Streams.getAll({ limit: 10 })
      
      diagnostics.moralis = {
        status: '✅ API 连接正常',
        streams_count: streams.result?.length || 0,
        streams: streams.result?.map((s: any) => ({
          id: s.id,
          tag: s.tag,
          webhookUrl: s.webhookUrl,
          chains: s.chains,
          status: s.status
        }))
      }

      // 检查是否存在 eth-usdt-monitor Stream
      const targetStream = streams.result?.find((s: any) => s.tag === 'eth-usdt-monitor')
      
      if (!targetStream) {
        diagnostics.issues.push('❌ 未找到 eth-usdt-monitor Stream')
        diagnostics.recommendations.push('需要在 Moralis Dashboard 创建 Stream：https://admin.moralis.io/streams')
      } else {
        diagnostics.moralis.target_stream = {
          id: targetStream.id,
          tag: targetStream.tag,
          webhookUrl: targetStream.webhookUrl,
          chains: targetStream.chains,
          status: targetStream.status
        }
        
        // 检查 Webhook URL 是否匹配
        const expectedWebhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ethmax.vercel.app'}/api/moralis/webhook`
        if (targetStream.webhookUrl !== expectedWebhookUrl) {
          diagnostics.issues.push(`⚠️ Webhook URL 不匹配`)
          diagnostics.issues.push(`   当前: ${targetStream.webhookUrl}`)
          diagnostics.issues.push(`   期望: ${expectedWebhookUrl}`)
          diagnostics.recommendations.push('在 Moralis Dashboard 更新 Webhook URL')
        }
      }
      
    } catch (moralisError) {
      diagnostics.moralis = {
        status: '❌ 连接失败',
        error: moralisError instanceof Error ? moralisError.message : String(moralisError)
      }
      diagnostics.issues.push('❌ Moralis API 连接失败')
      diagnostics.recommendations.push('检查 MORALIS_API_KEY 是否有效')
    }

    // 4. 生成总结报告
    diagnostics.summary = {
      total_issues: diagnostics.issues.length,
      status: diagnostics.issues.length === 0 ? '✅ 系统配置正常' : '⚠️ 发现配置问题',
      ready_for_monitoring: diagnostics.issues.filter((i: string) => i.startsWith('❌')).length === 0
    }

    return NextResponse.json(diagnostics, { status: 200 })

  } catch (error) {
    console.error('❌ 诊断过程出错:', error)
    
    return NextResponse.json({
      error: '诊断失败',
      message: error instanceof Error ? error.message : String(error),
      diagnostics
    }, { status: 500 })
  }
}

