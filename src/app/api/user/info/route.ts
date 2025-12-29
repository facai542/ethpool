import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 动态路由配置
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 获取Supabase配置 - 延迟创建客户端以避免模块加载时错误
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co'
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Supabase配置缺失:', {
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceRoleKey
        })
      }
      return NextResponse.json(
        { error: 'Supabase配置缺失，请检查环境变量' },
        { status: 500 }
      )
    }

    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { searchParams } = new URL(request.url)
    // 兼容新旧参数名
    const wallet_address = searchParams.get('wallet_address') || searchParams.get('address')

    if (!wallet_address) {
      return NextResponse.json(
        { error: '缺少地址参数' },
        { status: 400 }
      )
    }

    // 查询用户数据 - 只选择必要的字段（包括 user_id 和链上余额）
    const { data: userData, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, user_id, wallet_address, auth_wallet_address, approved, a_eth, eth, withdrawal_usdt, usdt, withdrawable_usdt, dividend_usdt, onchain_usdt_balance, onchain_eth_balance, balance_updated_at, is_active, created_at')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (userError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 查询用户失败:', userError)
      }
      return NextResponse.json(
        { error: '查询用户失败: ' + userError.message },
        { status: 500 }
      )
    }

    if (!userData || userData.length === 0) {
      // 用户不存在时返回空数据，而不是404，让前端可以处理新用户情况
      return NextResponse.json({
        success: true,
        data: {
          wallet_address: wallet_address,
          auth_wallet_address: wallet_address,
          approved: 0,
          total_eth_received: 0,
          reward_eth_balance: 0,
          eth: 0,
          a_eth: 0,
          withdrawn_usdt: 0,
          exchanged_usdt: 0,
          withdrawable_usdt: 0,
          total_dividend: 0,
          gj_withdrawable_usdt: 0,
          cash: 0,
          usdt: 0,
          user_id: null,
          is_active: false,
          created_at: null
        }
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
        }
      })
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
      // 用户ID - 纯数字格式
      user_id: user.user_id !== undefined && user.user_id !== null ? Number(user.user_id) : null,
      
      // 兼容旧字段名
      wallet_address: user.wallet_address,
      auth_wallet_address: user.wallet_address,
      approval_status: user.approved,
      
      // ETH相关字段 - 分离总产量和可兑换余额
      total_eth_received: user.a_eth || 0,        // 总产量：累计收到的ETH奖励（不变）
      reward_eth_balance: user.eth || 0,          // 可兑换：当前可兑换的ETH余额（扣除兑换后）
      eth: user.eth || 0,                         // ETH余额：用于兑换功能检查
      a_eth: user.a_eth || 0,                     // 总收益ETH
      
      // USDT相关字段
      withdrawn_usdt: user.withdrawal_usdt || 0,  // 已提取：已提现的USDT
      exchanged_usdt: user.usdt || 0,             // 已兑换：兑换获得的USDT
      withdrawable_usdt: user.withdrawable_usdt || 0, // 可提取：可提现的USDT余额
      total_dividend: user.dividend_usdt || 0,    // 总分红
      
      // 保留原有字段用于兼容
      gj_withdrawable_usdt: user.dividend_usdt || 0,  // 总分红
      cash: user.cash || 0,                       // 平台钱包余额
      usdt: user.usdt || 0                        // 质押余额
    }

    return NextResponse.json({
      success: true,
      data: formattedUser
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
      }
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ 获取用户信息失败:', error)
    }
    return NextResponse.json(
      { error: '获取用户信息失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}