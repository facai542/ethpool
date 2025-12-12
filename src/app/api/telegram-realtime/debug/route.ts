import { NextRequest, NextResponse } from 'next/server'
import { telegramRealtimeService } from '@/services/telegramRealtimeService'

export const dynamic = 'force-dynamic'

// 添加CORS头的辅助函数
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}

// GET: 调试Telegram服务状态
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 开始调试Telegram服务...')
    
    // 获取当前状态
    const status = telegramRealtimeService.getStatus()
    
    // 检查环境变量
    const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').replace(/\r\n/g, '').replace(/\n/g, '').trim()
    const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || '').replace(/\r\n/g, '').replace(/\n/g, '').trim()
    
    // 尝试启动服务并获取详细状态
    console.log('🚀 尝试启动服务...')
    await telegramRealtimeService.start()
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 获取更新后的状态
    const updatedStatus = telegramRealtimeService.getStatus()
    
    // 测试Telegram API连接
    let telegramTest = null
    try {
      const testResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
      const testData = await testResponse.json()
      telegramTest = {
        success: testData.ok,
        botInfo: testData.result,
        error: testData.description
      }
    } catch (error) {
      telegramTest = {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
    
    const response = NextResponse.json({
      success: true,
      message: '调试信息收集完成',
      data: {
        serviceStatus: status,
        updatedStatus: updatedStatus,
        environment: {
          hasToken: !!TELEGRAM_BOT_TOKEN,
          hasChatId: !!TELEGRAM_CHAT_ID,
          tokenLength: TELEGRAM_BOT_TOKEN.length,
          chatId: TELEGRAM_CHAT_ID,
          tokenPrefix: TELEGRAM_BOT_TOKEN.substring(0, 10) + '...'
        },
        telegramTest: telegramTest,
        timestamp: new Date().toISOString()
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 调试失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '调试失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
