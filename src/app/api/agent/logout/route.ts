import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    cookieStore.delete('agent_session')

    return NextResponse.json({
      success: true,
      message: '退出成功'
    })
  } catch (error) {
    console.error('退出失败:', error)
    return NextResponse.json({
      success: false,
      error: '退出失败'
    }, { status: 500 })
  }
}

