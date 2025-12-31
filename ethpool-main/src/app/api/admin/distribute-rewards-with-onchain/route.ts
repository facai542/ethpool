import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用service role key绕过RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始执行基于链上余额的奖励发放...')

    // 1. 获取所有有效用户
    const { data: members, error: membersError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, usdt, eth')
      .eq('is_effective', 1)
      .not('wallet_address', 'is', null)

    if (membersError) {
      console.error('❌ 获取用户列表失败:', membersError)
      return NextResponse.json(
        { success: false, message: '获取用户列表失败', error: membersError.message },
        { status: 500 }
      )
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有有效用户',
        data: { affectedUsers: 0, rewards: [] }
      })
    }

    console.log(`📊 找到 ${members.length} 个有效用户`)

    // 2. 批量获取链上USDT余额
    const wallet_addresses = members.map(m => m.wallet_address)
    const balanceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blockchain/batch-usdt-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_addresses })
    })

    const balanceResult = await balanceResponse.json()
    
    if (!balanceResult.success) {
      console.error('❌ 获取链上余额失败:', balanceResult.message)
      return NextResponse.json(
        { success: false, message: '获取链上余额失败', error: balanceResult.message },
        { status: 500 }
      )
    }

    // 3. 创建地址到余额的映射
    const balanceMap = new Map()
    balanceResult.data.results.forEach((result: any) => {
      balanceMap.set(result.wallet_address.toLowerCase(), result.balance)
    })

    // 4. 获取奖励等级配置
    const { data: tiers, error: tiersError } = await supabase
      .from('reward_tiers')
      .select('*')
      .eq('is_active', true)
      .order('min_balance', { ascending: true })

    if (tiersError) {
      console.error('❌ 获取奖励等级失败:', tiersError)
      return NextResponse.json(
        { success: false, message: '获取奖励等级失败', error: tiersError.message },
        { status: 500 }
      )
    }

    // 5. 获取当前ETH价格
    const ethPrice = 2500 // 这里应该从API获取实时价格

    // 6. 计算并发放奖励
    const rewards = []
    const currentTimestamp = Math.floor(Date.now() / 1000)

    for (const member of members) {
      const onchainBalance = balanceMap.get(member.wallet_address.toLowerCase()) || 0
      
      if (onchainBalance > 0) {
        // 找到匹配的奖励等级
        const tier = tiers.find(t => 
          onchainBalance >= t.min_balance && 
          onchainBalance <= t.max_balance
        )

        if (tier) {
          // 计算奖励
          const dailyReward = onchainBalance * tier.daily_rate
          const singleReward = dailyReward / 4 // 每日4次
          const rewardEth = singleReward / ethPrice

          // 插入奖励记录
          const { data: rewardRecord, error: rewardError } = await supabase
            .from('scheduled_rewards')
            .insert({
              user_id: member.id,
              user_wallet_address: member.wallet_address,
              onchain_usdt_balance: onchainBalance,
              reward_tier_id: tier.id,
              daily_reward_usdt: dailyReward,
              single_reward_usdt: singleReward,
              eth_price_usdt: ethPrice,
              reward_eth: rewardEth,
              is_distributed: true
            })
            .select()
            .single()

          if (rewardError) {
            console.error(`❌ 插入奖励记录失败 (用户 ${member.id}):`, rewardError)
            continue
          }

          // 更新用户ETH余额
          const { error: updateError } = await supabase
            .from('nh_member_new')
            .update({ 
              eth: (member.eth || 0) + rewardEth 
            })
            .eq('id', member.id)

          if (updateError) {
            console.error(`❌ 更新用户ETH余额失败 (用户 ${member.id}):`, updateError)
          }

          // 在finance_orders表中记录奖励
          const { error: financeError } = await supabase
            .from('finance_orders')
            .insert({
              user_id: member.id,
              order_no: `REWARD_${member.id}_${currentTimestamp}`,
              method_id: 1,
              type: 'withdraw',
              amount: rewardEth,
              actual_amount: rewardEth,
              status: 1,
              remark: `[定时奖励] 链上余额: ${onchainBalance} USDT, 等级: ${tier.daily_rate * 100}%, 奖励: ${rewardEth} ETH`,
              create_time: currentTimestamp,
              updated_at: currentTimestamp
            })

          if (financeError) {
            console.error(`❌ 插入财务记录失败 (用户 ${member.id}):`, financeError)
          }

          rewards.push({
            user_id: member.id,
            user_wallet_address: member.wallet_address,
            onchain_balance: onchainBalance,
            daily_reward_usdt: dailyReward,
            single_reward_usdt: singleReward,
            reward_eth: rewardEth,
            tier_description: `${tier.daily_rate * 100}%`
          })

          console.log(`✅ 用户 ${member.wallet_address}: 余额 ${onchainBalance} USDT, 奖励 ${rewardEth} ETH`)
        }
      }
    }

    console.log(`✅ 奖励发放完成，影响用户数: ${rewards.length}`)

    return NextResponse.json({
      success: true,
      message: '基于链上余额的奖励发放成功',
      data: {
        affectedUsers: rewards.length,
        rewards
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
