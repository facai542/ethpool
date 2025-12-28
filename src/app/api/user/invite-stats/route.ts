import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet_address')
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet wallet_address is required' }, { status: 400 })
    }

    // 获取用户的邀请统计
    const { data: userStats, error: userStatsError } = await supabase
      .from('nh_member_new')
      .select('id, referral_code, total_referrals, total_commission, commission_rate')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (userStatsError) {
      console.error('Error fetching user stats:', userStatsError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 获取被邀请用户的总交易量
    const { data: referredUsers, error: referredUsersError } = await supabase
      .from('nh_member_new')
      .select('id, username, created_at, total_trading_volume, last_active_at')
      .eq('referrer_id', userStats.id)
      .order('created_at', { ascending: false })

    if (referredUsersError) {
      console.error('Error fetching referred users:', referredUsersError)
    }

    // 计算总交易量
    const totalVolume = referredUsers?.reduce((sum, user) => sum + (user.total_trading_volume || 0), 0) || 0

    // 计算今日新增邀请
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayReferrals = referredUsers?.filter(user => 
      new Date(user.created_at) >= today
    ).length || 0

    // 活跃邀请（最近30天有活动）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeReferrals = referredUsers?.filter(user => 
      user.last_active_at && new Date(user.last_active_at) >= thirtyDaysAgo
    ).length || 0

    const stats = {
      totalReferrals: userStats.total_referrals || 0,
      totalVolume,
      totalEarnings: userStats.total_commission || 0,
      commissionRate: userStats.commission_rate || 20,
      activeReferrals,
      todayReferrals,
      inviteCode: userStats.referral_code,
      referredUsers: referredUsers?.map(user => ({
        id: user.id,
        username: user.username || 'Anonymous',
        joinDate: user.created_at,
        volume: user.total_trading_volume || 0,
        status: user.last_active_at && new Date(user.last_active_at) >= thirtyDaysAgo ? 'active' : 'inactive'
      })) || []
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in invite stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}