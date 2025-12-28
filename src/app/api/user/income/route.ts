import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const userAddress = searchParams.get('userAddress')
    
    if (!userAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'User wallet_address is required' 
      }, { status: 400 })
    }

    // 首先查找用户ID - 优先使用nh_member_new表
    let userId: string | number | null = null
    
    // 先查询nh_member_new表
    const { data: newUser, error: newUserError } = await supabase
      .from('nh_member_new')
      .select('id')
      .eq('wallet_address', userAddress)
      .eq('is_active', true)
      .single()
    
    if (newUser && !newUserError) {
      userId = newUser.id
      console.log('✅ 从nh_member_new表找到用户ID:', userId)
    } else {
      // 回退到旧表查询
      console.log('⚠️ nh_member_new表未找到用户，尝试旧表...')
      const { data: oldUser, error: oldUserError } = await supabase
        .from('nh_member')
        .select('id')
        .eq('wallet_address', userAddress)
        .eq('is_active', 1)
        .single()
      
      if (oldUserError || !oldUser) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 })
      }
      
      userId = oldUser.id
      console.log('✅ 从nh_member表找到用户ID:', userId)
    }

    // 获取用户收益记录 - 从finance_orders表查询
    let incomeRecords: any[] = []
    let totalCount = 0
    
    // 查询finance_orders表中的ETH奖励记录
    try {
      const { data: rewardRecords, error: rewardError } = await supabase
        .from('finance_orders')
        .select('*')
        .eq('user_id', userId)
        .like('remark', '%[ETH奖励]%')
        .order('create_time', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (rewardError) {
        console.warn('⚠️ finance_orders表ETH奖励查询失败:', rewardError)
      } else if (rewardRecords) {
        // 转换ETH奖励记录格式以匹配收益记录格式
        const convertedRewards = rewardRecords.map(record => ({
          id: `reward_${record.id}`,
          user_id: record.user_id,
          type: 'authorization_reward',
          amount: record.amount,
          description: record.remark || 'Authorization reward',
          created_at: new Date(record.create_time * 1000).toISOString(),
          updated_at: new Date(record.updated_at * 1000).toISOString()
        }))
        
        // 合并记录并按时间排序
        incomeRecords = [...incomeRecords, ...convertedRewards]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit) // 限制返回数量
        
        totalCount += rewardRecords.length
        console.log('✅ 查询到ETH奖励记录:', rewardRecords.length, '条')
      }
    } catch (error) {
      console.warn('⚠️ finance_orders表查询失败:', error)
    }

    // 获取用户收益统计 - 从finance_orders表统计
    let statsData: any[] = []
    
    // 统计ETH奖励记录
    try {
      const { data: rewardStats, error: rewardStatsError } = await supabase
        .from('finance_orders')
        .select('amount, remark')
        .eq('user_id', userId)
        .like('remark', '%[ETH奖励]%')

      if (!rewardStatsError && rewardStats) {
        const convertedRewardStats = rewardStats.map(record => ({
          type: 'authorization_reward',
          amount: record.amount
        }))
        statsData = [...statsData, ...convertedRewardStats]
      }
    } catch (error) {
      console.warn('⚠️ ETH奖励统计查询失败:', error)
    }

    // 计算统计数据
    const stats = {
      totalIncome: 0,
      stakingIncome: 0,
      referralIncome: 0,
      levelIncome: 0,
      authorizationReward: 0, // 新增：授权奖励统计
      todayIncome: 0
    }

    const today = new Date().toISOString().split('T')[0]
    
    statsData?.forEach(record => {
      const amount = Number.parseFloat(record.amount || '0')
      stats.totalIncome += amount
      
      switch (record.type) {
        case 'staking':
          stats.stakingIncome += amount
          break
        case 'referral':
          stats.referralIncome += amount
          break
        case 'level':
          stats.levelIncome += amount
          break
        case 'authorization_reward':
          stats.authorizationReward += amount
          break
      }
    })

    // 获取今日收益 - 从finance_orders表统计
    let todayIncome = 0
    
    // 统计ETH奖励记录的今日收益
    try {
      const { data: todayRewardData, error: todayRewardError } = await supabase
        .from('finance_orders')
        .select('amount, create_time')
        .eq('user_id', userId)
        .like('remark', '%[ETH奖励]%')
        .gte('create_time', Math.floor(new Date(today).getTime() / 1000))

      if (!todayRewardError && todayRewardData) {
        todayIncome += todayRewardData.reduce((sum, record) => sum + Number.parseFloat(record.amount), 0)
      }
    } catch (error) {
      console.warn('⚠️ 今日ETH奖励统计失败:', error)
    }
    
    stats.todayIncome = todayIncome

    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }

    return NextResponse.json({
      success: true,
      data: {
        records: incomeRecords || [],
        stats,
        pagination
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 