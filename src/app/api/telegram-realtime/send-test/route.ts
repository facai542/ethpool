import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: '消息内容不能为空' },
        { status: 400 }
      ))
    }

    // 获取环境变量
    const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').replace(/\r\n/g, '').replace(/\n/g, '').trim()
    const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || '').replace(/\r\n/g, '').replace(/\n/g, '').trim()

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('❌ Telegram配置缺失')
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'Telegram配置缺失' },
        { status: 500 }
      ))
    }

    console.log('🚀 发送测试消息到Telegram...')
    console.log('📋 消息内容:', message)
    console.log('📋 Chat ID:', TELEGRAM_CHAT_ID)

    // 直接发送到Telegram
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const result = await response.json()

    if (result.ok) {
      console.log('✅ Telegram测试消息发送成功，消息ID:', result.result?.message_id)
      return addCorsHeaders(NextResponse.json({
        success: true,
        message: '测试消息发送成功',
        data: {
          messageId: result.result?.message_id,
          chatId: result.result?.chat?.id,
          timestamp: new Date().toISOString()
        }
      }))
    } else {
      const errorMsg = result.description || '未知错误'
      console.error('❌ Telegram测试消息发送失败:', result)
      return addCorsHeaders(NextResponse.json(
        { 
          success: false, 
          error: errorMsg,
          details: result
        },
        { status: 400 }
      ))
    }

  } catch (error) {
    console.error('❌ 发送测试消息异常:', error)
    return addCorsHeaders(NextResponse.json(
      { 
        success: false,
        error: '发送失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    ))
  }
}

