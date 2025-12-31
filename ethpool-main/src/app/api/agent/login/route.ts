import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '请提供用户名和密码' },
        { status: 400 }
      )
    }

    console.log('🔐 代理登录尝试:', username)

    // 查询代理账号
    const { data: agent, error: agentError } = await supabase
      .from('nh_agents')
      .select('*')
      .eq('agent_code', username)
      .eq('status', 'active')
      .single()

    if (agentError || !agent) {
      console.log('❌ 代理账号不存在或已禁用:', username)
      return NextResponse.json(
        { success: false, error: '代理账号不存在或已禁用' },
        { status: 401 }
      )
    }

    // 验证密码
    if (!agent.password) {
      console.log('❌ 代理未设置密码:', username)
      return NextResponse.json(
        { success: false, error: '代理账号未设置密码，请联系管理员' },
        { status: 401 }
      )
    }

    // 检查密码是否加密
    let passwordMatch = false
    if (agent.password.startsWith('$2a$') || agent.password.startsWith('$2b$')) {
      // 密码已加密，使用bcrypt验证
      passwordMatch = await bcrypt.compare(password, agent.password)
    } else {
      // 密码未加密，直接比较（兼容性处理）
      passwordMatch = password === agent.password
    }

    if (!passwordMatch) {
      console.log('❌ 密码错误:', username)
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      )
    }

    console.log('✅ 代理登录成功:', { id: agent.id, name: agent.agent_name, code: agent.agent_code })

    // 创建会话
    const session = {
      id: agent.id,
      name: agent.agent_name,
      code: agent.agent_code,
      user_address: agent.user_address,
      referral_code: agent.referral_code,
      level: agent.level || 1,
      role: 'agent',
      loginTime: Date.now()
    }

    // 设置cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      agent: {
        id: agent.id,
        name: agent.agent_name,
        code: agent.agent_code,
        referral_code: agent.referral_code,
        level: agent.level
      }
    })

    // 设置session cookie (7天过期)
    response.cookies.set('agent_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/'
    })

    return response
  } catch (error) {
    console.error('❌ 代理登录错误:', error)
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}

