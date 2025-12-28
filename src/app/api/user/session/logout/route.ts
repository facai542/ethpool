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
    const body = await request.json()
    const { sessionToken, logoutAll = false } = body

    if (!sessionToken) {
      return NextResponse.json(
        { error: '会话令牌不能为空' },
        { status: 400 }
      )
    }

    console.log('🚪 用户登出:', { sessionToken, logoutAll })

    if (logoutAll) {
      // 登出该用户的所有会话
      const { data: session } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('session_token', sessionToken)
        .single()

      if (session) {
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('user_id', session.user_id)
      }
    } else {
      // 只登出当前会话
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken)
    }

    console.log('✅ 登出成功')

    return NextResponse.json({
      success: true,
      message: '登出成功'
    })

  } catch (error) {
    console.error('❌ 登出异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

