import { type NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth, createAdminSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: '用户名和密码不能为空'
      }, { status: 400 })
    }

    // 验证管理员凭据
    const authResult = await checkAdminAuth(username, password)
    
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: authResult.message
      }, { status: 401 })
    }

    // 构建会话数据
    const sessionData = {
      id: authResult.admin!.admin_id,
      name: authResult.admin!.admin_name,
      admin_name: authResult.admin!.admin_name,
      role_id: authResult.admin!.role_id,
      agent_id: authResult.admin!.p_agentid || 0,
      email: authResult.admin!.email || '',
      nickname: authResult.admin!.admin_name,
      loginTime: new Date().toISOString()
    }

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      admin: sessionData
    })

    // 服务器端设置Cookie
    response.cookies.set('admin_session', JSON.stringify(sessionData), {
      httpOnly: false, // 允许客户端访问
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7天
    })

    return response

  } catch (error) {
    console.error('管理员登录失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
