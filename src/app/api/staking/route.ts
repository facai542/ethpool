import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 动态路由配置
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, wallet_address, amount, txHash } = body

    if (!wallet_address || !amount) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    if (action === 'stake') {
      return await handleStake(wallet_address, amount, txHash)
    } else if (action === 'withdraw') {
      return await handleWithdraw(wallet_address, amount)
    } else {
      return NextResponse.json(
        { error: '无效的操作类型' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('质押API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 处理质押
async function handleStake(wallet_address: string, amount: number, txHash: string) {
  try {
    // 确保用户存在
    const { data: existingUser, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, usdt, eth, is_effective, wallet_address')
      .eq('wallet_address', wallet_address)
      .eq('is_active', 0)
      .single()

    if (userError || !existingUser) {
      console.error('质押时查询用户失败:', userError || '用户不存在')
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      )
    }

    // 确保用户已verify
    if (existingUser.is_effective !== 1) {
      return NextResponse.json(
        { error: '用户未授权' },
        { status: 403 }
      )
    }

    const userId = existingUser.id
    const currentTime = new Date()
    
    // 先发放之前的奖励（如果有的话）
    try {
              await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://binancepool.net'}/api/staking/rewards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          forceUpdate: false
        })
      })
    } catch (rewardError) {
      console.log('发放历史奖励时出错（可忽略）:', rewardError)
    }
    
    // 创建质押订单
    const { data: orderData, error: orderError } = await supabase
      .from('mining_orders')
      .insert({
        user_id: userId,
        amount: amount,
        status: 1, // 活跃状态
        reward_rate: 0.008, // 修正为日收益率0.8%
        earnings: 0, // 初始收益为0
        create_time: Math.floor(Date.now() / 1000), // Unix timestamp
        start_time: Math.floor(Date.now() / 1000),
        pool_id: 1 // 默认矿池ID
      })
      .select()
      .single()

    if (orderError) {
      console.error('创建质押订单失败:', orderError)
      return NextResponse.json(
        { error: '创建质押订单失败: ' + orderError.message },
        { status: 500 }
      )
    }

    console.log('质押订单创建成功:', orderData)

    // 更新用户USDT余额和奖励时间戳
    const { error: updateError } = await supabase
      .from('nh_member_new')
      .update({
        usdt: (Number.parseFloat(existingUser.usdt || '0') + amount).toString(),
        last_reward_time: currentTime.toISOString(),
        updated_at: currentTime.toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('更新用户余额失败:', updateError)
      return NextResponse.json(
        { error: '更新用户余额失败: ' + updateError.message },
        { status: 500 }
      )
    }

    // 记录质押操作日志
    await supabase
      .from('nh_logs')
      .insert([
        {
          user_id: userId,
          action: 'stake',
          details: `用户质押 ${amount} USDT，交易哈希: ${txHash}`,
          created_at: currentTime.toISOString()
        }
      ])

    return NextResponse.json({
      success: true,
      message: '质押成功，奖励计算已开始',
      data: {
        orderId: orderData.id,
        amount: amount,
        txHash: txHash,
        dailyRate: 0.008,
        annualRate: 0.792
      }
    })
  } catch (error) {
    console.error('质押处理错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误: ' + error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

// 处理提现
async function handleWithdraw(wallet_address: string, amount: string) {
  try {
    // 查询用户信息
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('*')
      .eq('wallet_address', wallet_address)
      .eq('is_active', 0)
      .single()

    if (userError) {
      console.error('查询用户失败:', userError)
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const currentUSDT = Number.parseFloat(user.usdt || '0')
    const withdrawAmount = Number.parseFloat(amount)
    const currentTime = Math.floor(Date.now() / 1000) // Unix timestamp

    // 检查余额是否足够
    if (currentUSDT < withdrawAmount) {
      return NextResponse.json(
        { error: '余额不足' },
        { status: 400 }
      )
    }

    // 创建提现记录
    const { data: withdrawRecord, error: withdrawError } = await supabase
      .from('finance_orders')
      .insert({
        user_id: user.id,
        order_no: `WD${Date.now()}`,
        type: 2, // 1: 充值 2: 提现
        amount: withdrawAmount,
        status: 0, // 0: 待审核
        create_time: currentTime,
        updated_at: currentTime,
        remark: `用户提现申请 ${withdrawAmount} USDT`
      })
      .select()
      .single()

    if (withdrawError) {
      console.error('创建提现记录失败:', withdrawError)
      return NextResponse.json(
        { error: '创建提现记录失败' },
        { status: 500 }
      )
    }

    // 更新用户余额
    const { error: updateError } = await supabase
      .from('nh_member_new')
      .update({
        usdt: (currentUSDT - withdrawAmount).toString(),
        updated_at: currentTime
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('更新用户余额失败:', updateError)
      return NextResponse.json(
        { error: '更新用户余额失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal Submitted: Please wait for admin approval',
      data: {
        recordId: withdrawRecord.id,
        amount: amount,
        newBalance: (currentUSDT - withdrawAmount).toString(),
        status: 'pending'
      }
    })

  } catch (error) {
    console.error('提取处理错误:', error)
    return NextResponse.json(
      { error: 'Withdrawal processing failed' },
      { status: 500 }
    )
  }
} 