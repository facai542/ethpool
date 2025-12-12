import { type NextRequest, NextResponse } from 'next/server'
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

// GET: 获取通知队列状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') // sent, pending, failed

    console.log('📊 获取Telegram通知队列状态:', { limit, status })

    let query = supabase
      .from('telegram_notification_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // 根据状态过滤
    if (status === 'sent') {
      query = query.eq('is_sent', true)
    } else if (status === 'pending') {
      query = query.eq('is_sent', false)
    } else if (status === 'failed') {
      query = query.eq('is_sent', false).not('error_message', 'is', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ 获取通知队列失败:', error)
      const response = NextResponse.json(
        { 
          success: false,
          error: '获取通知队列失败: ' + error.message
        },
        { status: 500 }
      )
      return addCorsHeaders(response)
    }

    // 统计信息
    const stats = {
      total: data?.length || 0,
      sent: data?.filter(n => n.is_sent).length || 0,
      pending: data?.filter(n => !n.is_sent && !n.error_message).length || 0,
      failed: data?.filter(n => !n.is_sent && n.error_message).length || 0
    }

    const response = NextResponse.json({
      success: true,
      data: {
        notifications: data || [],
        stats
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 获取Telegram通知队列失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '服务器内部错误: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// POST: 添加新通知到队列
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 添加Telegram通知到队列:', body)

    // 验证必需字段
    if (!body.user_id || !body.user_address || !body.notification_type) {
      const response = NextResponse.json(
        { 
          success: false,
          error: '缺少必需字段: user_id, user_address, notification_type'
        },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // 插入通知到队列
    const { data, error } = await supabase
      .from('telegram_notification_queue')
      .insert({
        user_id: body.user_id,
        user_uuid: body.user_uuid || null,
        user_address: body.user_address,
        notification_type: body.notification_type,
        notification_data: body.notification_data || {},
        is_sent: body.is_sent || false,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('❌ 添加通知到队列失败:', error)
      const response = NextResponse.json(
        { 
          success: false,
          error: '添加通知失败: ' + error.message
        },
        { status: 500 }
      )
      return addCorsHeaders(response)
    }

    console.log('✅ 通知已添加到队列:', data?.[0]?.id)

    const response = NextResponse.json({
      success: true,
      message: '通知已添加到队列',
      data: data?.[0]
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 添加Telegram通知失败:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: '服务器内部错误: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}


