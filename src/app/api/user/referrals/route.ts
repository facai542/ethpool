import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取用户邀请统计数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get('wallet_address')

    if (!wallet_address) {
      return NextResponse.json(
        { success: false, error: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    console.log('🔍 查询用户邀请统计，地址:', wallet_address)

    // 首先获取用户信息（包括邀请码）
    const { data: userInfo, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, referral_code')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .maybeSingle()

    // 如果用户不存在，返回空数据而不是错误
    if (userError || !userInfo) {
      console.log('⚠️ 用户不存在或查询失败，返回空数据:', wallet_address)
      // 返回空数据结构，让前端可以正常显示
      return NextResponse.json({
        success: true,
        data: {
          referralCode: null,
          referralLink: null,
          stats: {
            totalReferrals: 0,
            activeReferrals: 0,
            totalEarned: '0.000',
            thisMonthEarned: '0.000'
          },
          recentReferrals: []
        }
      })
    }

    // 获取被邀请用户数量（通过referred_by字段）
    const { count: totalReferrals, error: referralError } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', userInfo.id.toString())
      .eq('is_active', true)

    // 获取活跃用户数量（已verify的用户）
    const { count: activeReferrals, error: activeError } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', userInfo.id.toString())
      .eq('is_active', true)
      .eq('approved', 1)

    // 获取邀请奖励总额（从收益记录表计算）
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('nh_member_new')
      .select('gj_withdrawable_usdt, shouyi')
      .eq('id', userInfo.id)
      .single()

    // 获取最近邀请的用户列表
    const { data: recentReferrals, error: recentError } = await supabase
      .from('nh_member_new')
      .select('wallet_address, created_at, approved, usdt')
      .eq('referred_by', userInfo.id.toString())
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (referralError || activeError) {
      console.error('❌ 查询邀请统计失败:', referralError || activeError)
    }

    // 计算邀请收益
    const totalEarned = Number.parseFloat(rewardsData?.gj_withdrawable_usdt || '0') + Number.parseFloat(rewardsData?.shouyi || '0')
    const thisMonthEarned = totalEarned * 0.1 // 简化计算，实际应该查询本月收益

    // 格式化邀请列表
    const formattedReferrals = recentReferrals?.map(referral => ({
      wallet_address: referral.wallet_address,
      date: new Date(referral.created_at).toISOString().split('T')[0],
      status: referral.approved === 1 ? 'Active' : 'Pending',
      earned: Number.parseFloat(referral.usdt || '0').toFixed(3) + ' USDT',
      tier: referral.approved === 1 ? 'Gold' : 'Bronze'
    })) || []

    // 生成正确的邀请链接
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webapp-95ojkryz0-alexs-projects-6db273bb.vercel.app'
    const referralLink = `${baseUrl}?ref=${userInfo.referral_code}`

    const response = {
      success: true,
      data: {
        referralCode: userInfo.referral_code,
        referralLink: referralLink,
        stats: {
          totalReferrals: totalReferrals || 0,
          activeReferrals: activeReferrals || 0,
          totalEarned: totalEarned.toFixed(3),
          thisMonthEarned: thisMonthEarned.toFixed(3)
        },
        recentReferrals: formattedReferrals
      }
    }

    console.log('✅ 邀请统计查询成功:', {
      userId: userInfo.id,
      totalReferrals,
      activeReferrals,
      inviteCode: userInfo.referral_code
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 获取邀请统计失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 