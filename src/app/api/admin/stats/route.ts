import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 准备日期范围
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()
    const monthStartISO = monthStart.toISOString()

    // 并行执行所有查询 - 大幅提升性能
    const [
      totalUsersResult,
      authorizedUsersResult,
      stakingUsersResult,
      profitUsersResult,
      todayRegisterResult,
      todayAuthorizedResult,
      monthRegisterResult,
      monthAuthorizedResult,
      balanceDataResult,
      ethEarningsResult,
      withdrawingOrdersResult
    ] = await Promise.all([
      // 总用户数
      supabase
        .from('nh_member_new')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // 已授权用户数
      supabase
        .from('nh_member_new')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('approved', 1),
      
      // 质押用户
      supabase
        .from('nh_member_new')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('approved', 1)
        .gt('usdt', 0),
      
      // 有收益用户 - 使用distinct优化
      supabase
        .from('earning_history')
        .select('member_id')
        .gt('eth_amount', 0)
        .limit(10000), // 限制查询数量
      
      // 今日注册用户
      supabase
        .from('nh_member_new')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('created_at', todayISO),
      
      // 今日授权用户
      supabase
        .from('nh_member_new')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('approved', 1)
        .gte('first_approved_at', todayISO),
      
      // 本月注册用户
      supabase
        .from('nh_member_new')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('created_at', monthStartISO),
      
      // 本月授权用户
      supabase
        .from('nh_member_new')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('approved', 1)
        .gte('first_approved_at', monthStartISO),
      
      // 总余额数据 - 只选择需要的字段
      supabase
        .from('nh_member_new')
        .select('usdt, withdrawable_usdt, eth, a_eth')
        .eq('is_active', true)
        .limit(10000), // 限制查询数量，避免查询所有用户
      
      // 挖矿收益统计 - 使用聚合查询优化
      supabase
        .from('earning_history')
        .select('eth_amount')
        .eq('status', 'completed')
        .limit(10000), // 限制查询数量
      
      // 提现中的金额
      supabase
        .from('finance_orders')
        .select('amount')
        .eq('type', 'withdraw')
        .eq('status', 0)
    ])

    // 提取结果
    const totalUsers = totalUsersResult.count || 0
    const authorizedUsers = authorizedUsersResult.count || 0
    const stakingUsers = stakingUsersResult.count || 0
    const profitUsers = profitUsersResult.data ? new Set(profitUsersResult.data.map(r => r.member_id)).size : 0
    const todayRegister = todayRegisterResult.count || 0
    const todayAuthorized = todayAuthorizedResult.count || 0
    const monthRegister = monthRegisterResult.count || 0
    const monthAuthorized = monthAuthorizedResult.count || 0

    // 计算总余额
    let totalUsdtBalance = 0
    let totalEthBalance = 0
    let totalWithdrawableBalance = 0
    let totalAuthEthBalance = 0

    if (balanceDataResult.data) {
      balanceDataResult.data.forEach(user => {
        totalUsdtBalance += Number.parseFloat(user.usdt || '0')
        totalEthBalance += Number.parseFloat(user.eth || '0')
        totalWithdrawableBalance += Number.parseFloat(user.withdrawable_usdt || '0')
        totalAuthEthBalance += Number.parseFloat(user.a_eth || '0')
      })
    }

    // 计算总ETH收益
    let totalEthEarnings = 0
    if (ethEarningsResult.data) {
      ethEarningsResult.data.forEach(earning => {
        totalEthEarnings += Number.parseFloat(earning.eth_amount || '0')
      })
    }

    // 计算提现中金额
    let totalWithdrawing = 0
    if (withdrawingOrdersResult.data) {
      withdrawingOrdersResult.data.forEach(order => {
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
    // 只在开发环境输出错误日志
    if (process.env.NODE_ENV === 'development') {
      console.error('获取统计数据失败:', error)
    }
    return NextResponse.json({
      success: false,
      error: '获取统计数据失败'
    }, { status: 500 })
  }
}
