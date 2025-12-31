import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用service role key绕过RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始执行高级奖励发放...')

    // 调用数据库函数执行奖励发放
    const { data, error } = await supabase.rpc('distribute_advanced_rewards')

    if (error) {
      console.error('❌ 奖励发放失败:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: '奖励发放失败', 
          error: error.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ 奖励发放成功，影响用户数:', data?.length || 0)

    // 返回结果
    return NextResponse.json({
      success: true,
      message: '奖励发放成功',
      data: {
        affectedUsers: data?.length || 0,
        rewards: data || []
      }
    })

  } catch (error) {
    console.error('❌ 奖励发放异常:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '奖励发放异常', 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 查询奖励发放记录...')

    // 查询最近的奖励发放记录
    const { data: rewards, error: rewardsError } = await supabase
      .from('scheduled_rewards')
      .select(`
        *,
        nh_member_new!inner(wallet_address, id)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (rewardsError) {
      console.error('❌ 查询奖励记录失败:', rewardsError)
      return NextResponse.json(
        { 
          success: false, 
          message: '查询奖励记录失败', 
          error: rewardsError.message 
        },
        { status: 500 }
      )
    }

    // 查询奖励等级配置
    const { data: tiers, error: tiersError } = await supabase
      .from('reward_tiers')
      .select('*')
      .eq('is_active', true)
      .order('min_balance', { ascending: true })

    if (tiersError) {
      console.error('❌ 查询奖励等级失败:', tiersError)
      return NextResponse.json(
        { 
          success: false, 
          message: '查询奖励等级失败', 
          error: tiersError.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '查询成功',
      data: {
        rewards: rewards || [],
        tiers: tiers || []
      }
    })

  } catch (error) {
    console.error('❌ 查询异常:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '查询异常', 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}
