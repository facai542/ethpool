import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 动态路由配置
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 获取Supabase配置 - 延迟创建客户端以避免模块加载时错误
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co'
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Supabase配置缺失:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceRoleKey
      })
      return NextResponse.json(
        { error: 'Supabase配置缺失，请检查环境变量' },
        { status: 500 }
      )
    }

    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const body = await request.json()
    const { sessionToken, logoutAll = false } = body

    if (!sessionToken) {
      return NextResponse.json(
        { error: '会话令牌不能为空' },
        { status: 400 }
      )
    }

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

    return NextResponse.json({
      success: true,
      message: '登出成功'
    })

  } catch (error) {
    console.error('登出异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

