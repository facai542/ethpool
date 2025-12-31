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
    // 兼容新旧参数名
    const wallet_address = searchParams.get('wallet_address') || searchParams.get('address')

    if (!wallet_address) {
      return NextResponse.json(
        { error: '缺少地址参数' },
        { status: 400 }
      )
    }

    console.log('🔍 查询用户信息:', wallet_address)

    // 查询用户数据
    const { data: userData, error: userError } = await supabase
      .from('nh_member_new')
      .select('*')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (userError) {
      console.error('❌ 查询用户失败:', userError)
      return NextResponse.json(
        { error: '查询用户失败: ' + userError.message },
        { status: 500 }
      )
    }

    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    const user = userData[0]
    
    // 转换时间戳
    const formatTime = (timestamp: unknown) => {
      if (!timestamp) return null
      if (typeof timestamp === 'number') {
        return new Date(timestamp * 1000).toISOString()
      }
      return timestamp
    }

    const formattedUser = {
      ...user,
      // 兼容旧字段名
      wallet_address: user.wallet_address,
      auth_wallet_address: user.wallet_address,
      approval_status: user.approved,
      
      // ETH相关字段 - 分离总产量和可兑换余额
      total_eth_received: user.a_eth || 0,        // 总产量：累计收到的ETH奖励（不变）
      reward_eth_balance: user.eth || 0,          // 可兑换：当前可兑换的ETH余额（扣除兑换后）
      eth: user.eth || 0,                         // ETH余额：用于兑换功能检查
      
      // USDT相关字段
      withdrawn_usdt: user.withdrawal_usdt || 0,  // 已提取：已提现的USDT
      exchanged_usdt: user.usdt || 0,             // 已兑换：兑换获得的USDT
      withdrawable_usdt: user.withdrawable_usdt || 0, // 可提取：可提现的USDT余额
      total_dividend: user.dividend_usdt || 0,    // 总分红
      
      // 保留原有字段用于兼容
      withdrawable_usdt: user.withdrawable_usdt || 0,          // 可提现余额
      gj_withdrawable_usdt: user.dividend_usdt || 0            // 总分红
    }

    console.log('✅ 用户信息查询成功:', formattedUser)

    return NextResponse.json({
      success: true,
      data: formattedUser
    })

  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    return NextResponse.json(
      { error: '获取用户信息失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}