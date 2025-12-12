import { type NextRequest, NextResponse } from 'next/server'

// 使用项目内置的 Telegram 实时服务
const TELEGRAM_BOT_URL = process.env.TELEGRAM_BOT_URL || (process.env.NODE_ENV === 'production' ? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ethmax.vercel.app' : 'http://localhost:3000')

export async function POST(request: NextRequest) {
  try {
    // 检查 Content-Type，兼容非JSON请求
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      console.log('⚠️ 非JSON请求，直接返回OK')
      return NextResponse.json({ ok: true })
    }
    
    // 尝试解析JSON，失败则返回成功避免Telegram重试
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      console.log('⚠️ JSON解析失败，直接返回OK')
      return NextResponse.json({ ok: true })
    }
    
    console.log(`📡 收到Telegram Webhook:`, JSON.stringify(body, null, 2))
    
    // 处理 callback_query（按钮点击事件）
    const callbackQuery = body.callback_query as Record<string, unknown> | undefined
    if (callbackQuery) {
      const callbackData = callbackQuery.data as string
      const callbackQueryId = callbackQuery.id as string
      
      console.log(`🔘 收到按钮点击事件:`, callbackData)
      
      if (callbackData && (callbackData.startsWith('add_monitor:') || callbackData.startsWith('collection:'))) {
        console.log(`📤 立即响应 Telegram 按钮点击...`)
        
        // ⚡ 关键修复：必须立即调用 answerCallbackQuery，否则按钮会一直显示"加载中"
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
        if (TELEGRAM_BOT_TOKEN) {
          try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: '处理中，请稍候...',
                show_alert: false
              })
            })
            console.log('✅ 已立即响应 Telegram 按钮点击')
          } catch (err) {
            console.error('❌ 响应按钮点击失败:', String(err))
          }
        }
        
        console.log(`📤 转发到 callback 处理器...`)
        
        // 异步转发到 callback 处理器（不等待、不解析响应）
        fetch(`${TELEGRAM_BOT_URL}/api/telegram/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }).then((response) => {
          // 关键修复：不调用 response.json()，只记录状态
          console.log('✅ Callback 已转发，状态:', response.status)
        }).catch((err) => {
          // 捕获网络错误，不阻止主流程
          console.error('❌ 转发失败（网络错误）:', String(err))
        })
        
        // 立即返回成功，不等待处理完成
        return NextResponse.json({ success: true })
      }
    }
    
    // 处理普通消息（直接返回OK，避免错误）
    if (body.message) {
      console.log('💬 收到普通消息，忽略')
      return NextResponse.json({ success: true })
    }
    
    const action = (body as Record<string, unknown>).action as string | undefined
    const data = body as Record<string, unknown>

    console.log(`📡 处理Telegram通知请求:`, action, (data as Record<string, unknown>).address)

    // 直接使用项目内置的Telegram实时服务
    // 启动Telegram服务（如果未启动）
    try {
      await fetch(`${TELEGRAM_BOT_URL}/api/telegram-realtime/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (startError) {
      console.log('Telegram服务可能已在运行')
    }

    // 创建授权通知
    const notificationData = {
      notification_type: 'authorization',
      user_address: data.address,
      action: action,
      ...data
    }

    // 直接调用测试授权通知API
    const response = await fetch(`${TELEGRAM_BOT_URL}/api/telegram-realtime/test-authorization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userAddress: data.address,
        action: action,
        ...data
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Telegram通知失败:', result)
      return NextResponse.json(
        { success: false, error: result.error || 'Telegram通知失败' },
        { status: response.status }
      )
    }

    console.log('✅ Telegram通知成功:', result)
    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('❌ Telegram Webhook处理失败:', error)
    return NextResponse.json(
      { success: false, error: '内部服务器错误' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // 检查机器人状态
    const response = await fetch(`${TELEGRAM_BOT_URL}/api/status`)
    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      botStatus: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ 获取机器人状态失败:', error)
    return NextResponse.json(
      { success: false, error: '无法连接到机器人服务' },
      { status: 503 }
    )
  }
}


