import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 获取用户平台账户余额
 * @param wallet_address 钱包地址
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const wallet_address = searchParams.get('wallet_address')

    if (!wallet_address) {
      return NextResponse.json({
        success: false,
        error: '缺少钱包地址参数'
      }, { status: 400 })
    }

    console.log(`📊 查询用户余额: ${wallet_address}`)

    // 1. 查询用户ID
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('id')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
    }

    // 2. 查询用户余额
    const { data: balance, error: balanceError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (balanceError && balanceError.code !== 'PGRST116') {
      // PGRST116 是"未找到记录"错误，这是正常的
      console.error('查询用户余额失败:', balanceError)
      return NextResponse.json({
        success: false,
        error: balanceError.message
      }, { status: 500 })
    }

    // 如果没有余额记录，返回零值
    const result = balance || {
      total_rewards_usdt: 0,
      total_rewards_eth: 0,
      available_eth: 0,
      withdrawn_eth: 0
    }

    return NextResponse.json({
      success: true,
      data: {
        total_rewards_usdt: parseFloat(result.total_rewards_usdt || '0'),
        total_rewards_eth: parseFloat(result.total_rewards_eth || '0'),
        available_eth: parseFloat(result.available_eth || '0'),
        withdrawn_eth: parseFloat(result.withdrawn_eth || '0'),
        last_periodic_reward_at: result.last_periodic_reward_at || null
      }
    })
  } catch (error) {
    console.error('查询用户余额异常:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

