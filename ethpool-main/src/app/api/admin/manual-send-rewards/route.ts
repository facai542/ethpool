import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用service role key绕过RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { userIds, customRewards } = await request.json()
    
    console.log('🚀 开始手动发送奖励...')
    console.log('📊 用户ID列表:', userIds)
    console.log('🎁 自定义奖励:', customRewards)

    // 1. 获取奖励等级配置
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

    // 2. 获取用户信息
    const { data: members, error: membersError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, usdt, eth, approved')
      .in('id', userIds)
      .eq('approved', 1)
      .eq('is_active', true)

    if (membersError) {
      console.error('❌ 获取用户信息失败:', membersError)
      return NextResponse.json(
        { success: false, message: '获取用户信息失败', error: membersError.message },
        { status: 500 }
      )
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: false,
        message: '没有找到有效用户'
      })
    }

    // 3. 获取当前ETH价格
    const ethPrice = 2500 // 这里应该从API获取实时价格

    // 4. 处理每个用户的奖励
    const rewards = []
    const currentTimestamp = Math.floor(Date.now() / 1000)

    for (const member of members) {
      try {
        // 检查是否有自定义奖励
        const customReward = customRewards?.find((cr: any) => cr.userId === member.id)
        
        let rewardEth = 0
        let rewardType = 'auto'
        let remark = ''

        if (customReward) {
          // 使用自定义奖励
          rewardEth = parseFloat(customReward.ethAmount) || 0
          rewardType = customReward.type || 'manual'
          remark = `[手动奖励] ${customReward.type === 'add' ? '增加' : '减少'} ${Math.abs(rewardEth)} ETH - ${customReward.reason || '管理员手动调整'}`
        } else {
          // 使用自动计算奖励（基于数据库余额）
          const onchainBalance = member.usdt || 0
          
          if (onchainBalance > 0) {
            // 找到匹配的奖励等级
            const tier = tiers.find(t => 
              onchainBalance >= t.min_balance && 
              onchainBalance <= t.max_balance
            )

            if (tier) {
              const dailyReward = onchainBalance * tier.daily_rate
              const singleReward = dailyReward / 4 // 每日4次
              rewardEth = singleReward / ethPrice
              remark = `[手动奖励] 链上余额: ${onchainBalance} USDT, 等级: ${tier.daily_rate * 100}%, 奖励: ${rewardEth} ETH`
            }
          }
        }

        if (rewardEth > 0) {
          // 更新用户ETH余额
          const newEthBalance = (member.eth || 0) + rewardEth
          
          const { error: updateError } = await supabase
            .from('nh_member_new')
            .update({ 
              eth: newEthBalance,
              a_eth: supabase.raw(`a_eth + ${rewardEth}`), // 同时累加到总产量
              updated_at: new Date().toISOString()
            })
            .eq('id', member.id)

          if (updateError) {
            console.error(`❌ 更新用户ETH余额失败 (用户 ${member.id}):`, updateError)
            continue
          }

          // 在finance_orders表中记录奖励
          const { error: financeError } = await supabase
            .from('finance_orders')
            .insert({
              user_id: member.id,
              order_no: `MANUAL_${member.id}_${currentTimestamp}`,
              method_id: 1,
              type: 'withdraw',
              amount: rewardEth,
              actual_amount: rewardEth,
              status: 1,
              remark: remark,
              create_time: currentTimestamp,
              updated_at: currentTimestamp
            })

          if (financeError) {
            console.error(`❌ 插入财务记录失败 (用户 ${member.id}):`, financeError)
          }

          // 记录奖励详情
          rewards.push({
            userId: member.id,
            wallet_address: member.wallet_address,
            rewardEth: rewardEth,
            newEthBalance: newEthBalance,
            type: rewardType,
            remark: remark
          })

          console.log(`✅ 用户 ${member.wallet_address}: 奖励 ${rewardEth} ETH, 新余额 ${newEthBalance} ETH`)
        }
      } catch (error) {
        console.error(`❌ 处理用户 ${member.id} 奖励失败:`, error)
      }
    }

    console.log(`✅ 手动奖励发放完成，影响用户数: ${rewards.length}`)

    return NextResponse.json({
      success: true,
      message: '手动奖励发放成功',
      data: {
        affectedUsers: rewards.length,
        rewards: rewards,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 手动奖励发放异常:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '手动奖励发放异常', 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}
