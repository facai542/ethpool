import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 获取用户统计 - 使用 nh_member_new 表
    const { count: totalUsers } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: authorizedUsers } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approved', 1)

    // 质押用户：有USDT余额且已授权的用户
    const { count: stakingUsers } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approved', 1)
      .gt('usdt', 0)

    // 有收益用户：从 earning_history 表中查询有收益记录的用户
    const { data: profitUsersData } = await supabase
      .from('earning_history')
      .select('member_id')
      .gt('eth_amount', 0)
    
    const profitUsers = profitUsersData ? new Set(profitUsersData.map(r => r.member_id)).size : 0

    // 获取今日注册用户
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayRegister } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', today.toISOString())

    // 获取今日授权用户
    const { count: todayAuthorized } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approved', 1)
      .gte('first_approved_at', today.toISOString())

    // 获取本月数据
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    const { count: monthRegister } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', monthStart.toISOString())

    const { count: monthAuthorized } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approved', 1)
      .gte('first_approved_at', monthStart.toISOString())

    // 计算总余额
    const { data: balanceData } = await supabase
      .from('nh_member_new')
      .select('usdt, withdrawable_usdt, eth, a_eth')
      .eq('is_active', true)

    let totalUsdtBalance = 0
    let totalEthBalance = 0
    let totalWithdrawableBalance = 0
    let totalAuthEthBalance = 0

    if (balanceData) {
      balanceData.forEach(user => {
        totalUsdtBalance += Number.parseFloat(user.usdt || '0')
        totalEthBalance += Number.parseFloat(user.eth || '0')
        totalWithdrawableBalance += Number.parseFloat(user.withdrawable_usdt || '0')
        totalAuthEthBalance += Number.parseFloat(user.a_eth || '0')
      })
    }

    // 查询挖矿收益统计 - 从 earning_history 表
    const { data: ethEarnings } = await supabase
      .from('earning_history')
      .select('eth_amount')
      .eq('status', 'completed')

    let totalEthEarnings = 0
    if (ethEarnings) {
      ethEarnings.forEach(earning => {
        totalEthEarnings += Number.parseFloat(earning.eth_amount || '0')
      })
    }

    // 查询提现中的金额 - 从 finance_orders 表
    const { data: withdrawingOrders } = await supabase
      .from('finance_orders')
      .select('amount')
      .eq('type', 'withdraw')
      .eq('status', 0) // 0=待处理

    let totalWithdrawing = 0
    if (withdrawingOrders) {
      withdrawingOrders.forEach(order => {
        totalWithdrawing += Number.parseFloat(order.amount || '0')
      })
    }

    const stats = {
      // 总体概况
      totalUsers: totalUsers || 0,
      authorizedUsers: authorizedUsers || 0,
      unauthorizedUsers: (totalUsers || 0) - (authorizedUsers || 0),
      stakingUsers: stakingUsers || 0,
      profitUsers: profitUsers || 0,
      
      // 挖矿收益
      mineIncomeETH: totalEthEarnings.toFixed(8),
      mineIncomeTRX: '0.00000000', // TRX暂未使用
      
      // 钱包余额
      usdtBalance: totalUsdtBalance.toFixed(6),
      ethBalance: totalEthBalance.toFixed(6),
      linkUsdtBalance: totalAuthEthBalance.toFixed(6), // 使用授权ETH余额
      withdrawingUsdt: totalWithdrawing.toFixed(6),
      
      // 今日数据
      todayRegister: todayRegister || 0,
      todayAuthorized: todayAuthorized || 0,
      
      // 本月数据
      monthRegister: monthRegister || 0,
      monthAuthorized: monthAuthorized || 0,
      
      // 系统状态
      systemStatus: 'normal',
      lastUpdate: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json({
      success: false,
      error: '获取统计数据失败'
    }, { status: 500 })
  }
}
