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

// POST: 停止Telegram实时监听服务
export async function POST(request: NextRequest) {
  try {
    console.log('🛑 停止Telegram实时监听服务...')

    // 停止服务
    await telegramRealtimeService.stop()

    const status = telegramRealtimeService.getStatus()

    const response = NextResponse.json({
      success: true,
      message: 'Telegram实时监听服务停止成功',
      data: {
        isRunning: status.isRunning,
        channelActive: status.channelActive,
        timestamp: new Date().toISOString()
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 停止Telegram实时监听服务失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '停止服务失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// GET: 停止Telegram实时监听服务（兼容性）
export async function GET(request: NextRequest) {
  try {
    console.log('🛑 停止Telegram实时监听服务...')

    // 停止服务
    await telegramRealtimeService.stop()

    const status = telegramRealtimeService.getStatus()

    const response = NextResponse.json({
      success: true,
      message: 'Telegram实时监听服务停止成功',
      data: {
        isRunning: status.isRunning,
        channelActive: status.channelActive,
        timestamp: new Date().toISOString()
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 停止Telegram实时监听服务失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '停止服务失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
