import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// 奖励计算配置
const REWARD_CONFIG = {
  DAILY_RATE: 0.008, // 日收益率 0.8%
  ANNUAL_RATE: 0.792, // 年化收益率 79.2%
  MINIMUM_STAKE: 100, // 最小质押金额
  REWARD_INTERVAL: 24 * 60 * 60 * 1000, // 24小时（毫秒）
}

// GET: 查询用户质押奖励
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')
    const userId = searchParams.get('userId')
    
    if (!userAddress && !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userAddress or userId parameter is required' 
      }, { status: 400 })
    }

    console.log(`📊 查询质押奖励: ${userAddress || userId}`)

    // 构建查询条件
    let userQuery = supabase.from('nh_member_new').select('*')
    
    if (userAddress) {
      userQuery = userQuery.eq('wallet_address', userAddress)
    } else {
      userQuery = userQuery.eq('id', userId)
    }

    const { data: userData, error: userError } = await userQuery.single()

    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在' 
      }, { status: 404 })
    }

    // 计算奖励信息
    const currentTime = new Date()
    const stakeAmount = Number.parseFloat(userData.usdt || '0')
    const lastRewardTime = userData.last_reward_time ? new Date(userData.last_reward_time) : new Date(userData.created_at)
    
    // 计算可领取奖励
    const timeDiff = currentTime.getTime() - lastRewardTime.getTime()
    const daysPassed = Math.floor(timeDiff / REWARD_CONFIG.REWARD_INTERVAL)
    const pendingReward = stakeAmount * REWARD_CONFIG.DAILY_RATE * daysPassed

    // 查询历史奖励记录
    const { data: rewardHistory } = await supabase
      .from('staking_rewards')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const result = {
      user: {
        id: userData.id,
        wallet_address: userData.wallet_address,
        stakeAmount: stakeAmount,
        totalRewards: Number.parseFloat(userData.gj_withdrawable_usdt || '0'),
        withdrawnRewards: Number.parseFloat(userData.withdrawal_usdt || '0')
      },
      rewards: {
        dailyRate: REWARD_CONFIG.DAILY_RATE,
        annualRate: REWARD_CONFIG.ANNUAL_RATE,
        lastRewardTime: lastRewardTime.toISOString(),
        daysPassed: daysPassed,
        pendingReward: pendingReward,
        canClaim: pendingReward > 0 && stakeAmount >= REWARD_CONFIG.MINIMUM_STAKE
      },
      history: rewardHistory || [],
      timestamp: currentTime.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('❌ Query staking rewards error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "未知错误" || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST: 发放质押奖励
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, userId, forceUpdate = false } = body
    
    if (!userAddress && !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userAddress or userId is required' 
      }, { status: 400 })
    }

    console.log(`💰 发放质押奖励: ${userAddress || userId}`)

    // 查询用户信息
    let userQuery = supabase.from('nh_member_new').select('*')
    
    if (userAddress) {
      userQuery = userQuery.eq('wallet_address', userAddress)
    } else {
      userQuery = userQuery.eq('id', userId)
    }

    const { data: userData, error: userError } = await userQuery.single()

    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在' 
      }, { status: 404 })
    }

    const currentTime = new Date()
    const stakeAmount = Number.parseFloat(userData.usdt || '0')
    const lastRewardTime = userData.last_reward_time ? new Date(userData.last_reward_time) : new Date(userData.created_at)
    
    // 检查是否满足奖励条件
    if (stakeAmount < REWARD_CONFIG.MINIMUM_STAKE) {
      return NextResponse.json({ 
        success: false, 
        error: `质押金额不足，最少需要 ${REWARD_CONFIG.MINIMUM_STAKE} USDT` 
      }, { status: 400 })
    }

    // 检查是否需要发放奖励
    const timeDiff = currentTime.getTime() - lastRewardTime.getTime()
    const daysPassed = Math.floor(timeDiff / REWARD_CONFIG.REWARD_INTERVAL)
    
    if (daysPassed === 0 && !forceUpdate) {
      return NextResponse.json({ 
        success: false, 
        error: '距离上次奖励发放不足24小时' 
      }, { status: 400 })
    }

    // 计算奖励金额
    const rewardAmount = stakeAmount * REWARD_CONFIG.DAILY_RATE * daysPassed
    const currentTotalRewards = Number.parseFloat(userData.gj_withdrawable_usdt || '0')
    const newTotalRewards = currentTotalRewards + rewardAmount

    console.log(`💰 奖励计算:`, {
      stakeAmount,
      daysPassed,
      rewardAmount,
      currentTotalRewards,
      newTotalRewards
    })

    // 更新用户奖励余额
    const { error: updateError } = await supabase
      .from('nh_member_new')
      .update({
        gj_withdrawable_usdt: newTotalRewards.toString(),
        last_reward_time: currentTime.toISOString(),
        updated_at: currentTime.toISOString()
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('❌ 更新用户奖励失败:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: '更新用户奖励失败' 
      }, { status: 500 })
    }

    // 记录奖励发放历史
    const rewardRecord = {
      user_id: userData.id,
      user_wallet_address: userData.wallet_address,
      stake_amount: stakeAmount.toString(),
      reward_amount: rewardAmount.toString(),
      days_passed: daysPassed,
      daily_rate: REWARD_CONFIG.DAILY_RATE,
      reward_type: 'daily_staking',
      status: 'completed',
      created_at: currentTime.toISOString()
    }

    const { error: recordError } = await supabase
      .from('staking_rewards')
      .insert([rewardRecord])

    if (recordError) {
      console.error('❌ 记录奖励历史失败:', recordError)
    }

    // 记录操作日志
    await supabase
      .from('nh_logs')
      .insert([
        {
          user_id: userData.id,
          action: 'staking_reward',
          details: `质押奖励发放: ${rewardAmount.toFixed(8)} USDT (${daysPassed}天 * ${REWARD_CONFIG.DAILY_RATE * 100}% 日利率)`,
          created_at: currentTime.toISOString()
        }
      ])

    console.log('✅ 质押奖励发放成功')

    return NextResponse.json({
      success: true,
      data: {
        userId: userData.id,
        userAddress: userData.wallet_address,
        stakeAmount: stakeAmount,
        rewardAmount: rewardAmount,
        daysPassed: daysPassed,
        dailyRate: REWARD_CONFIG.DAILY_RATE,
        previousTotal: currentTotalRewards,
        newTotal: newTotalRewards,
        lastRewardTime: userData.last_reward_time,
        currentTime: currentTime.toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Distribute staking rewards error:', error)
    
    // 记录错误日志
    try {
      const requestBody = await request.json().catch(() => ({}))
      await supabase
        .from('nh_logs')
        .insert([
          {
            user_id: requestBody?.userId || 'unknown',
            action: 'staking_reward_error',
            details: `奖励发放失败: ${error instanceof Error ? error.message : "未知错误" || 'Unknown error'}`,
            created_at: new Date().toISOString()
          }
        ])
    } catch (logError) {
      console.error('记录错误日志失败:', logError)
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "未知错误" || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 