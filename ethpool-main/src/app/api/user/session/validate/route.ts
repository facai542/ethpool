import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 动态路由配置
export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('sessionToken')

    if (!sessionToken) {
      return NextResponse.json(
        { error: '会话令牌不能为空' },
        { status: 400 }
      )
    }

    console.log('🔍 验证会话令牌:', sessionToken)

    // 1. 查找有效会话
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        id,
        user_id,
        wallet_address,
        wallet_type,
        network_id,
        is_active,
        last_activity,
        expires_at,
        created_at,
        nh_member!inner(
          id,
          wallet_address,
          auth_wallet_address,
          status,
          is_effective,
          usdt,
          eth,
          withdrawable_usdt
        )
      `)
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { 
          success: false,
          error: '会话无效或已过期' 
        },
        { status: 401 }
      )
    }

    // 2. 更新最后活动时间
    await supabase
      .from('user_sessions')
      .update({ 
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id)

    console.log('✅ 会话验证成功:', session.user_id)

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        user: session.nh_member,
        wallet: {
          wallet_address: session.wallet_address,
          type: session.wallet_type,
          networkId: session.network_id
        },
        session: {
          lastActivity: session.last_activity,
          expiresAt: session.expires_at,
          createdAt: session.created_at
        }
      }
    })

  } catch (error) {
    console.error('❌ 验证会话异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionToken } = body

    if (!sessionToken) {
      return NextResponse.json(
        { error: '会话令牌不能为空' },
        { status: 400 }
      )
    }

    console.log('🔍 验证会话令牌:', sessionToken)

    // 1. 查找有效会话
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        id,
        user_id,
        wallet_address,
        wallet_type,
        network_id,
        is_active,
        last_activity,
        expires_at,
        created_at,
        nh_member!inner(
          id,
          wallet_address,
          auth_wallet_address,
          status,
          is_effective,
          usdt,
          eth,
          withdrawable_usdt
        )
      `)
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { 
          success: false,
          error: '会话无效或已过期' 
        },
        { status: 401 }
      )
    }

    // 2. 更新最后活动时间
    await supabase
      .from('user_sessions')
      .update({ 
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id)

    console.log('✅ 会话验证成功:', session.user_id)

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        user: session.nh_member,
        wallet: {
          wallet_address: session.wallet_address,
          type: session.wallet_type,
          networkId: session.network_id
        },
        session: {
          lastActivity: session.last_activity,
          expiresAt: session.expires_at,
          createdAt: session.created_at
        }
      }
    })

  } catch (error) {
    console.error('❌ 验证会话异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

