import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 验证请求来源（可选：添加API密钥验证）
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    console.log('🕐 定时任务触发：每日收益发放')

    // 直接调用每日收益发放API（本地调用）
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://ethmax.vercel.app'}/api/admin/daily-rewards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetDate: new Date().toISOString().split('T')[0],
        forceRun: false
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log('✅ 定时任务执行成功:', result.data)
      return NextResponse.json({
        success: true,
        message: '定时任务执行成功',
        data: result.data
      })
    } else {
      console.error('❌ 定时任务执行失败:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error,
        data: result.data
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ 定时任务执行异常:', error)
    return NextResponse.json(
      { success: false, error: '定时任务执行异常: ' + error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}




