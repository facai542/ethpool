import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 动态路由配置
export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 开始清理过期会话...')

    // 调用清理函数
    const { data, error } = await supabase.rpc('cleanup_expired_sessions')

    if (error) {
      console.error('❌ 清理过期会话失败:', error)
      return NextResponse.json(
        { error: '清理过期会话失败: ' + error.message },
        { status: 500 }
      )
    }

    const deletedCount = data || 0
    console.log(`✅ 清理完成，删除了 ${deletedCount} 个过期会话`)

    return NextResponse.json({
      success: true,
      message: `成功清理了 ${deletedCount} 个过期会话`,
      deletedCount
    })

  } catch (error) {
    console.error('❌ 清理过期会话异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取会话统计信息
    const { data: stats, error } = await supabase
      .from('user_sessions')
      .select('is_active, expires_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ 获取会话统计失败:', error)
      return NextResponse.json(
        { error: '获取会话统计失败: ' + error.message },
        { status: 500 }
      )
    }

    const now = new Date()
    const activeSessions = stats?.filter(s => s.is_active) || []
    const expiredSessions = stats?.filter(s => new Date(s.expires_at) < now) || []
    const totalSessions = stats?.length || 0

    return NextResponse.json({
      success: true,
      data: {
        totalSessions,
        activeSessions: activeSessions.length,
        expiredSessions: expiredSessions.length,
        sessions: stats
      }
    })

  } catch (error) {
    console.error('❌ 获取会话统计异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

