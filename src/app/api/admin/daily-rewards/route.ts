import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ethers } from 'ethers'

export const dynamic = 'force-dynamic'

// USDT合约ABI
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "wallet_address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
]

const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

// 多个RPC节点
const ETH_RPC_URLS = [
  'https://ethereum.publicnode.com',
  'https://eth.llamarpc.com', 
  'https://rpc.ankr.com/eth',
  'https://ethereum.blockpi.network/v1/rpc/public',
  'https://rpc.mevblocker.io'
]

// 创建Provider
async function createProvider() {
  for (const rpcUrl of ETH_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      await provider.getBlockNumber()
      return provider
    } catch (error) {
      continue
    }
  }
  throw new Error('所有RPC节点连接失败')
}

// 获取实时汇率
async function getExchangeRate() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether,ethereum&vs_currencies=usd')
    const data = await response.json()
    
    const usdtPrice = data.tether?.usd || 1.0
    const ethPrice = data.ethereum?.usd || 3000.0
    
    return {
      usdtToEth: usdtPrice / ethPrice,
      ethToUsdt: ethPrice / usdtPrice,
      usdtPrice,
      ethPrice
    }
  } catch (error) {
    console.warn('获取实时汇率失败，使用备用汇率:', error)
    return {
      usdtToEth: 0.0003, // 备用汇率
      ethToUsdt: 3333.33,
      usdtPrice: 1.0,
      ethPrice: 3333.33
    }
  }
}

// 获取用户链上USDT余额
async function getUserChainBalance(wallet_address: string) {
  const provider = await createProvider()
  const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider)
  const balance = await usdtContract.balanceOf(wallet_address)
  return Number.parseFloat(ethers.formatUnits(balance, 6))
}

// 根据USDT余额获取收益等级
async function getRewardTier(usdtBalance: number) {
  const supabase = createSupabaseServerClient()
  const { data: tiers, error } = await supabase
    .from('reward_tiers')
    .select('*')
    .eq('is_active', true)
    .order('min_balance', { ascending: true })

  if (error) {
    throw new Error('获取收益等级失败: ' + error instanceof Error ? error.message : "未知错误")
  }

  for (const tier of tiers) {
    if (usdtBalance >= tier.min_balance && usdtBalance <= tier.max_balance) {
      return tier
    }
  }

  // 如果没有匹配的等级，返回最低等级
  return tiers[0] || { daily_rate: 0.02, tier_name: 'Default' }
}

// 计算每日收益
function calculateDailyReward(usdtBalance: number, dailyRate: number, exchangeRate: number) {
  const usdtReward = usdtBalance * dailyRate
  const ethReward = usdtReward * exchangeRate
  return {
    usdtReward: Number.parseFloat(usdtReward.toFixed(6)),
    ethReward: Number.parseFloat(ethReward.toFixed(8))
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await request.json()
    const { targetDate, forceRun = false } = body

    const rewardDate = targetDate || new Date().toISOString().split('T')[0]
    console.log(`🚀 开始执行每日收益发放: ${rewardDate}`)

    // 检查是否已经执行过
    if (!forceRun) {
      const { data: existingRewards } = await supabase
        .from('daily_rewards')
        .select('id')
        .eq('reward_date', rewardDate)
        .limit(1)

      if (existingRewards && existingRewards.length > 0) {
        return NextResponse.json({
          success: false,
          error: `今日收益已发放: ${rewardDate}`,
          data: { rewardDate, alreadyProcessed: true }
        })
      }
    }

    // 获取所有已授权的用户
    const { data: authorizedUsers, error: usersError } = await supabase
      .from('nh_member_new')
      .select('wallet_address')
      .eq('approved', 1)
      .eq('is_active', true)
      .not('wallet_address', 'is', null)

    if (usersError) {
      throw new Error('获取verify用户失败: ' + usersError.message)
    }

    if (!authorizedUsers || authorizedUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有找到已授权的用户',
        data: { rewardDate, processedUsers: 0 }
      })
    }

    console.log(`📊 找到 ${authorizedUsers.length} 个已授权用户`)

    // 获取实时汇率
    const exchangeRate = await getExchangeRate()
    console.log(`💱 实时汇率: 1 USDT = ${exchangeRate.usdtToEth} ETH`)

    let processedUsers = 0
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // 处理每个用户
    for (const user of authorizedUsers) {
      try {
        const userAddress = user.wallet_address
        console.log(`👤 处理用户: ${userAddress}`)

        // 获取用户链上USDT余额
        const usdtBalance = await getUserChainBalance(userAddress)
        console.log(`💰 用户 ${userAddress} 链上USDT余额: ${usdtBalance}`)

        // 检查余额是否在有效范围内（50 USDT以上）
        if (usdtBalance < 50) {
          console.log(`⚠️ 用户 ${userAddress} USDT余额不足50，跳过`)
          continue
        }

        // 获取收益等级
        const rewardTier = await getRewardTier(usdtBalance)
        console.log(`📈 用户 ${userAddress} 收益等级: ${rewardTier.tier_name}, 收益率: ${rewardTier.daily_rate * 100}%`)

        // 计算收益
        const rewards = calculateDailyReward(usdtBalance, rewardTier.daily_rate, exchangeRate.usdtToEth)
        console.log(`🎁 用户 ${userAddress} 收益: ${rewards.usdtReward} USDT = ${rewards.ethReward} ETH`)

        // 保存收益记录
        const { error: insertError } = await supabase
          .from('daily_rewards')
          .insert({
            user_wallet_address: userAddress,
            usdt_balance: usdtBalance,
            reward_rate: rewardTier.daily_rate,
            usdt_reward: rewards.usdtReward,
            eth_reward: rewards.ethReward,
            exchange_rate: exchangeRate.usdtToEth,
            reward_date: rewardDate,
            status: 'completed'
          })

        if (insertError) {
          console.error(`❌ 保存收益记录失败: ${userAddress}`, insertError)
          errors.push(`用户 ${userAddress}: ${insertError.message}`)
          errorCount++
        } else {
          // 更新用户ETH余额 - 同时累加到总产量和可兑换余额
          const { error: updateError } = await supabase
            .from('nh_member_new')
            .update({
              a_eth: supabase.raw(`a_eth + ${rewards.ethReward}`),  // 总产量累加
              eth: supabase.raw(`eth + ${rewards.ethReward}`),      // 可兑换余额累加
              updated_at: new Date().toISOString()
            })
            .eq('wallet_address', userAddress)

          if (updateError) {
            console.error(`❌ 更新用户ETH余额失败: ${userAddress}`, updateError)
            errors.push(`用户 ${userAddress} ETH余额更新失败: ${updateError.message}`)
          } else {
            console.log(`✅ 用户 ${userAddress} 收益发放成功: +${rewards.ethReward} ETH`)
            successCount++
          }
        }

        processedUsers++

        // 添加延迟避免RPC限制
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`❌ 处理用户失败: ${user.wallet_address}`, error)
        errors.push(`用户 ${user.wallet_address}: ${error instanceof Error ? error.message : "未知错误"}`)
        errorCount++
        processedUsers++
      }
    }

    // 更新任务统计
    await supabase
      .from('daily_reward_schedule')
      .update({
        last_run_time: new Date().toISOString(),
        run_count: supabase.raw('run_count + 1'),
        success_count: supabase.raw(`success_count + ${successCount}`),
        failure_count: supabase.raw(`failure_count + ${errorCount}`),
        last_error_message: errors.length > 0 ? errors.slice(0, 5).join('; ') : null
      })
      .eq('task_name', 'daily_reward_distribution')

    console.log(`🎉 每日收益发放完成: 处理${processedUsers}个用户, 成功${successCount}个, 失败${errorCount}个`)

    return NextResponse.json({
      success: true,
      message: '每日收益发放完成',
      data: {
        rewardDate,
        processedUsers,
        successCount,
        errorCount,
        exchangeRate: exchangeRate.usdtToEth,
        errors: errors.slice(0, 10) // 只返回前10个错误
      }
    })

  } catch (error) {
    console.error('❌ 每日收益发放失败:', error)
    return NextResponse.json(
      { success: false, error: '每日收益发放失败: ' + error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

// 获取收益发放历史
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const date = searchParams.get('date')

    let query = supabase
      .from('daily_rewards')
      .select('*', { count: 'exact' })
      .order('reward_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (date) {
      query = query.eq('reward_date', date)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw new Error('获取收益发放历史失败: ' + error instanceof Error ? error.message : "未知错误")
    }

    return NextResponse.json({
      success: true,
      data: {
        records: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('❌ 获取收益发放历史失败:', error)
    return NextResponse.json(
      { success: false, error: '获取收益发放历史失败: ' + error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}




