import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

// POST: 测试授权通知
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userAddress,
      userId = '1cc6a8c0-e97a-43bb-b634-814d63af46c1', // 使用有效的UUID格式
      address = userAddress || '0x1234567890123456789012345678901234567890',
      authAmount = '1000000',
      txHash = '0xtest123456789'
    } = body

    console.log('🧪 测试授权通知:', { userId, address, authAmount, txHash })

    // 创建测试授权通知
    const { data, error } = await supabase
      .from('telegram_notification_queue')
      .insert({
        notification_type: 'user_authorize',
        user_id: userId,
        user_address: address,
        notification_data: {
          userId: userId,
          address: address,
          authAddress: address,
          authAmount: authAmount,
          txHash: txHash,
          timestamp: new Date().toISOString()
        },
        is_sent: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`创建测试通知失败: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      message: '测试授权通知已创建',
      data: {
        notificationId: data.id,
        userId,
        address,
        authAmount,
        txHash,
        createdAt: data.created_at
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 测试授权通知失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '测试失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// GET: 测试授权通知（兼容性）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '1cc6a8c0-e97a-43bb-b634-814d63af46c1' // 使用有效的UUID格式
    const address = searchParams.get('address') || '0x1234567890123456789012345678901234567890'
    const authAmount = searchParams.get('authAmount') || '1000000'
    const txHash = searchParams.get('txHash') || '0xtest123456789'

    console.log('🧪 测试授权通知:', { userId, address, authAmount, txHash })

    // 创建测试授权通知
    const { data, error } = await supabase
      .from('telegram_notification_queue')
      .insert({
        notification_type: 'user_authorize',
        user_id: userId,
        user_address: address,
        notification_data: {
          userId: userId,
          address: address,
          authAddress: address,
          authAmount: authAmount,
          txHash: txHash,
          timestamp: new Date().toISOString()
        },
        is_sent: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`创建测试通知失败: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      message: '测试授权通知已创建',
      data: {
        notificationId: data.id,
        userId,
        address,
        authAmount,
        txHash,
        createdAt: data.created_at
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 测试授权通知失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '测试失败: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
