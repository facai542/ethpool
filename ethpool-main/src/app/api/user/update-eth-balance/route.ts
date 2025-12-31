import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, ethAmount, reason = 'authorization_bonus', markFirstReward = false } = body

    if (!wallet_address || !ethAmount) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    console.log(`🔄 更新用户ETH余额: ${wallet_address}, 金额: ${ethAmount} ETH, 原因: ${reason}, 标记首次奖励: ${markFirstReward}`)

          // 首先获取用户当前信息
          const { data: existingUser, error: fetchError } = await supabase
            .from('nh_member_new')
            .select('*')
            .eq('wallet_address', wallet_address)
            .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ 获取用户信息失败:', fetchError)
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    const currentEthBalance = existingUser?.eth || 0
    const newEthBalance = Number.parseFloat(currentEthBalance) + Number.parseFloat(ethAmount)

    console.log(`💰 ETH余额更新: ${currentEthBalance} -> ${newEthBalance}`)

          if (existingUser) {
            // 更新现有用户
            const updateData: unknown = {
              eth: newEthBalance,
              updated_at: new Date().toISOString()
            }
            
            // 如果是首次奖励，标记用户已获得首次授权奖励
            if (markFirstReward) {
              updateData.first_authorization_reward = true
              console.log('🏷️ 标记用户已获得首次授权奖励')
            }
            
            const { error: updateError } = await supabase
              .from('nh_member_new')
              .update(updateData)
              .eq('wallet_address', wallet_address)

      if (updateError) {
        console.error('❌ 更新用户ETH余额失败:', updateError)
        return NextResponse.json(
          { success: false, error: '更新用户ETH余额失败' },
          { status: 500 }
        )
      }
          } else {
            // 创建新用户记录
            const insertData: unknown = {
              wallet_address,
              eth: newEthBalance,
              usdt: 0,
              withdrawable_usdt: 0,
              withdrawal_usdt: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: 0,
              status: 1,
              is_effective: 0
            }
            
            // 如果是首次奖励，标记用户已获得首次授权奖励
            if (markFirstReward) {
              insertData.first_authorization_reward = true
              console.log('🏷️ 新用户标记已获得首次授权奖励')
            }
            
            const { error: insertError } = await supabase
              .from('nh_member_new')
              .insert(insertData)

      if (insertError) {
        console.error('❌ 创建用户记录失败:', insertError)
        return NextResponse.json(
          { success: false, error: '创建用户记录失败' },
          { status: 500 }
        )
      }
    }

    // 记录奖励日志
    try {
      await supabase
        .from('reward_logs')
        .insert({
          user_wallet_address: wallet_address,
          reward_type: 'eth_bonus',
          amount: ethAmount,
          reason: reason,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.warn('⚠️ 记录奖励日志失败（非致命错误）:', logError)
    }

    console.log(`✅ 用户ETH余额更新成功: ${wallet_address} +${ethAmount} ETH`)

    return NextResponse.json({
      success: true,
      message: 'ETH余额更新成功',
      data: {
        wallet_address,
        previousBalance: currentEthBalance,
        addedAmount: ethAmount,
        newBalance: newEthBalance
      }
    })

  } catch (error) {
    console.error('❌ 更新ETH余额API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误: ' + error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}