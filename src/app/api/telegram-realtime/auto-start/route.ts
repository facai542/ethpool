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

// GET: 自动启动Telegram实时监听服务
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 自动启动Telegram实时监听服务...')
    
    // 检查当前状态
    const currentStatus = telegramRealtimeService.getStatus()
    
    if (currentStatus.isRunning) {
      console.log('✅ Telegram实时监听服务已在运行')
      const response = NextResponse.json({
        success: true,
        message: 'Telegram实时监听服务已在运行',
        data: {
          isRunning: currentStatus.isRunning,
          channelActive: currentStatus.channelActive,
          timestamp: new Date().toISOString()
        }
      })
      return addCorsHeaders(response)
    }

    // 启动服务
    await telegramRealtimeService.start()

    const status = telegramRealtimeService.getStatus()

    const response = NextResponse.json({
      success: true,
      message: 'Telegram实时监听服务自动启动成功',
      data: {
        isRunning: status.isRunning,
        channelActive: status.channelActive,
        timestamp: new Date().toISOString()
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 自动启动Telegram实时监听服务失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '自动启动服务失败: ' + (error instanceof Error ? error.message : '未知错误'),
        data: {
          isRunning: false,
          channelActive: false,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// POST: 自动启动Telegram实时监听服务
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 自动启动Telegram实时监听服务...')
    
    // 检查当前状态
    const currentStatus = telegramRealtimeService.getStatus()
    
    if (currentStatus.isRunning) {
      console.log('✅ Telegram实时监听服务已在运行')
      const response = NextResponse.json({
        success: true,
        message: 'Telegram实时监听服务已在运行',
        data: {
          isRunning: currentStatus.isRunning,
          channelActive: currentStatus.channelActive,
          timestamp: new Date().toISOString()
        }
      })
      return addCorsHeaders(response)
    }

    // 启动服务
    await telegramRealtimeService.start()

    const status = telegramRealtimeService.getStatus()

    const response = NextResponse.json({
      success: true,
      message: 'Telegram实时监听服务自动启动成功',
      data: {
        isRunning: status.isRunning,
        channelActive: status.channelActive,
        timestamp: new Date().toISOString()
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 自动启动Telegram实时监听服务失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '自动启动服务失败: ' + (error instanceof Error ? error.message : '未知错误'),
        data: {
          isRunning: false,
          channelActive: false,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}