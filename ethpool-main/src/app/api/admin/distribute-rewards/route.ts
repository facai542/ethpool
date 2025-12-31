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
    console.log('🚀 开始执行改进的奖励发放...')

    // 调用带降级处理的奖励发放函数
    const { data, error } = await supabase.rpc('distribute_periodic_rewards_with_fallback')

    if (error) {
      console.error('❌ 奖励发放失败:', error)
      return NextResponse.json(
        { error: '奖励发放失败: ' + error.message },
        { status: 500 }
      )
    }

    console.log('✅ 奖励发放完成:', data)

    return NextResponse.json({
      success: true,
      message: '奖励发放完成',
      data
    })

  } catch (error) {
    console.error('❌ 奖励发放异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取奖励发放统计
    const { data: stats, error } = await supabase
      .from('reward_distribution_log')
      .select('*')
      .order('distribution_time', { ascending: false })
      .limit(20)

    if (error) {
      console.error('❌ 获取奖励统计失败:', error)
      return NextResponse.json(
        { error: '获取奖励统计失败: ' + error.message },
        { status: 500 }
      )
    }

    // 计算统计信息
    const totalDistributions = stats?.length || 0
    const successfulDistributions = stats?.filter(s => s.status === 'success').length || 0
    const failedDistributions = stats?.filter(s => s.status === 'failed').length || 0
    const totalUSDT = stats?.reduce((sum, s) => sum + Number(s.period_reward_usdt || 0), 0) || 0
    const totalETH = stats?.reduce((sum, s) => sum + Number(s.period_reward_eth || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        totalDistributions,
        successfulDistributions,
        failedDistributions,
        totalUSDT: totalUSDT.toFixed(6),
        totalETH: totalETH.toFixed(8),
        recentDistributions: stats
      }
    })

  } catch (error) {
    console.error('❌ 获取奖励统计异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
