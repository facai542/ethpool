import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('agent_session')

    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        error: '未登录'
      }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)

    return NextResponse.json({
      success: true,
      session
    })
  } catch (error) {
    console.error('获取会话失败:', error)
    return NextResponse.json({
      success: false,
      error: '获取会话失败'
    }, { status: 500 })
  }
}

