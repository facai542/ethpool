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
    console.log('🔄 开始重置每日奖励计数...')

    // 调用数据库函数重置每日奖励计数
    const { data, error } = await supabase.rpc('reset_daily_reward_count')

    if (error) {
      console.error('❌ 重置每日奖励计数失败:', error)
      return NextResponse.json({
        success: false,
        error: '重置每日奖励计数失败: ' + error.message
      }, { status: 500 })
    }

    console.log('✅ 每日奖励计数重置完成')

    return NextResponse.json({
      success: true,
      message: '每日奖励计数重置完成',
      data: data
    })

  } catch (error) {
    console.error('❌ 重置每日奖励计数任务执行失败:', error)
    return NextResponse.json({
      success: false,
      error: '重置每日奖励计数任务执行失败: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
  }
}
