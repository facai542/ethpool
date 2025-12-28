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

// POST: 手动处理待发送通知
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 手动处理待发送通知...')

    // 处理待发送通知
    await telegramRealtimeService.processPendingNotifications()

    const status = telegramRealtimeService.getStatus()

    const response = NextResponse.json({
      success: true,
      message: '手动处理待发送通知完成',
      data: {
        isRunning: status.isRunning,
        channelActive: status.channelActive,
        timestamp: new Date().toISOString()
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 手动处理通知失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '处理失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// GET: 手动处理待发送通知（兼容性）
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 手动处理待发送通知...')

    // 处理待发送通知
    await telegramRealtimeService.processPendingNotifications()

    const status = telegramRealtimeService.getStatus()

    const response = NextResponse.json({
      success: true,
      message: '手动处理待发送通知完成',
      data: {
        isRunning: status.isRunning,
        channelActive: status.channelActive,
        timestamp: new Date().toISOString()
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 手动处理通知失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '处理失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}