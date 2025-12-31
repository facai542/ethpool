import { NextRequest, NextResponse } from 'next/server'

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

// GET: 检查环境变量配置
export async function GET(request: NextRequest) {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''
    
    // 清理换行符
    const cleanToken = TELEGRAM_BOT_TOKEN.replace(/\r\n/g, '').replace(/\n/g, '').trim()
    const cleanChatId = TELEGRAM_CHAT_ID.replace(/\r\n/g, '').replace(/\n/g, '').trim()
    
    const hasToken = !!cleanToken
    const hasChatId = !!cleanChatId
    const tokenLength = cleanToken.length
    const chatIdLength = cleanChatId.length
    
    console.log('🔍 环境变量检查:', {
      originalToken: TELEGRAM_BOT_TOKEN,
      cleanToken: cleanToken,
      originalChatId: TELEGRAM_CHAT_ID,
      cleanChatId: cleanChatId,
      hasToken,
      hasChatId,
      tokenLength,
      chatIdLength
    })

    const response = NextResponse.json({
      success: true,
      message: '环境变量检查完成',
      data: {
        hasToken,
        hasChatId,
        tokenLength,
        chatIdLength,
        tokenPrefix: cleanToken.substring(0, 10) + '...',
        chatId: cleanChatId,
        isConfigValid: hasToken && hasChatId,
        originalToken: TELEGRAM_BOT_TOKEN,
        originalChatId: TELEGRAM_CHAT_ID,
        cleanToken: cleanToken,
        cleanChatId: cleanChatId
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 环境变量检查失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '检查失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
