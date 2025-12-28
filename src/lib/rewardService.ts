import { createClient } from '@supabase/supabase-js'
import { convertUsdtToEth } from './ethPriceService'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RewardResult {
  success: boolean
  reward_id?: number
  amount_usdt?: number
  amount_eth?: number
  error?: string
}

/**
 * 发放首次授权奖励
 * @param userId 用户ID
 * @param walletAddress 钱包地址
 */
export async function grantFirstAuthorizationReward(
  userId: string,
  walletAddress: string
): Promise<RewardResult> {
  try {
    console.log(`🎁 开始发放首次授权奖励: 用户=${userId}`)

    // 1. 检查是否已经领取过首次授权奖励
    const { data: existingReward } = await supabase
      .from('reward_records')
      .select('id')
      .eq('user_id', userId)
      .eq('reward_type', 'first_authorization')
      .single()

    if (existingReward) {
      console.log(`⚠️ 用户已领取过首次授权奖励`)
      return {
        success: false,
        error: '已领取过首次授权奖励'
      }
    }

    // 2. 获取奖励配置
    const { data: setting } = await supabase
      .from('reward_settings')
      .select('*')
      .eq('setting_type', 'first_authorization')
      .eq('is_enabled', true)
      .single()

    if (!setting) {
      console.log(`⚠️ 首次授权奖励未启用`)
      return {
        success: false,
        error: '首次授权奖励未启用'
      }
    }

    const rewardAmountUsdt = setting.config.reward_amount_usdt

    // 3. 转换为 ETH
    const { ethAmount, ethPrice, success: priceSuccess } = await convertUsdtToEth(rewardAmountUsdt)

    if (!priceSuccess) {
      console.error(`❌ 获取ETH价格失败`)
      return {
        success: false,
        error: '获取ETH价格失败'
      }
    }

    // 4. 记录奖励到 reward_records
    const { data: rewardRecord, error: recordError } = await supabase
      .from('reward_records')
      .insert({
        user_id: userId,
        wallet_address: walletAddress.toLowerCase(),
        reward_type: 'first_authorization',
        amount_usdt: rewardAmountUsdt,
        amount_eth: ethAmount,
        eth_price_usdt: ethPrice,
        status: 'completed',
        processed_at: new Date().toISOString(),
        metadata: {
          description: '首次授权成功奖励'
        }
      })
      .select()
      .single()

    if (recordError) {
      console.error(`❌ 记录奖励失败:`, recordError)
      return {
        success: false,
        error: '记录奖励失败'
      }
    }

    // 5. 更新用户余额
    const { error: balanceError } = await supabase.rpc('update_user_balance', {
      p_user_id: userId,
      p_wallet_address: walletAddress.toLowerCase(),
      p_reward_usdt: rewardAmountUsdt,
      p_reward_eth: ethAmount
    })

    if (balanceError) {
      console.error(`❌ 更新用户余额失败:`, balanceError)
      // 不返回失败，因为奖励记录已创建
    }

    console.log(`✅ 首次授权奖励发放成功: ${rewardAmountUsdt} USDT ≈ ${ethAmount.toFixed(6)} ETH`)

    return {
      success: true,
      reward_id: rewardRecord.id,
      amount_usdt: rewardAmountUsdt,
      amount_eth: ethAmount
    }
  } catch (error) {
    console.error(`❌ 发放首次授权奖励异常:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * 发放定时奖励（单个用户）
 * @param userId 用户ID
 * @param walletAddress 钱包地址
 * @param walletBalanceUsdt 钱包USDT余额
 */
export async function grantPeriodicReward(
  userId: string,
  walletAddress: string,
  walletBalanceUsdt: number
): Promise<RewardResult> {
  try {
    console.log(`🎁 开始发放定时奖励: 用户=${userId}, 余额=${walletBalanceUsdt} USDT`)

    // 1. 获取奖励配置
    const { data: setting } = await supabase
      .from('reward_settings')
      .select('*')
      .eq('setting_type', 'periodic_reward')
      .eq('is_enabled', true)
      .single()

    if (!setting) {
      console.log(`⚠️ 定时奖励未启用`)
      return {
        success: false,
        error: '定时奖励未启用'
      }
    }

    // 2. 根据余额确定奖励比例
    const tiers = setting.config.tiers as Array<{
      min_balance: number
      max_balance: number | null
      percentage: number
    }>

    let rewardPercentage = 0
    for (const tier of tiers) {
      if (walletBalanceUsdt >= tier.min_balance) {
        if (tier.max_balance === null || walletBalanceUsdt <= tier.max_balance) {
          rewardPercentage = tier.percentage
          break
        }
      }
    }

    if (rewardPercentage === 0) {
      console.log(`⚠️ 余额不满足任何奖励层级`)
      return {
        success: false,
        error: '余额不满足奖励条件'
      }
    }

    // 3. 计算奖励金额
    const rewardAmountUsdt = (walletBalanceUsdt * rewardPercentage) / 100

    // 4. 转换为 ETH
    const { ethAmount, ethPrice, success: priceSuccess } = await convertUsdtToEth(rewardAmountUsdt)

    if (!priceSuccess) {
      console.error(`❌ 获取ETH价格失败`)
      return {
        success: false,
        error: '获取ETH价格失败'
      }
    }

    // 5. 记录奖励到 reward_records
    const { data: rewardRecord, error: recordError } = await supabase
      .from('reward_records')
      .insert({
        user_id: userId,
        wallet_address: walletAddress.toLowerCase(),
        reward_type: 'periodic_reward',
        amount_usdt: rewardAmountUsdt,
        amount_eth: ethAmount,
        eth_price_usdt: ethPrice,
        wallet_balance_usdt: walletBalanceUsdt,
        reward_percentage: rewardPercentage,
        status: 'completed',
        processed_at: new Date().toISOString(),
        metadata: {
          description: '定时奖励发放',
          tier_matched: tiers.find(t => 
            walletBalanceUsdt >= t.min_balance && 
            (t.max_balance === null || walletBalanceUsdt <= t.max_balance)
          )
        }
      })
      .select()
      .single()

    if (recordError) {
      console.error(`❌ 记录奖励失败:`, recordError)
      return {
        success: false,
        error: '记录奖励失败'
      }
    }

    // 6. 更新用户余额
    const { error: balanceError } = await supabase.rpc('update_user_balance', {
      p_user_id: userId,
      p_wallet_address: walletAddress.toLowerCase(),
      p_reward_usdt: rewardAmountUsdt,
      p_reward_eth: ethAmount
    })

    if (balanceError) {
      console.error(`❌ 更新用户余额失败:`, balanceError)
    }

    console.log(`✅ 定时奖励发放成功: ${rewardAmountUsdt.toFixed(2)} USDT (${rewardPercentage}%) ≈ ${ethAmount.toFixed(6)} ETH`)

    return {
      success: true,
      reward_id: rewardRecord.id,
      amount_usdt: rewardAmountUsdt,
      amount_eth: ethAmount
    }
  } catch (error) {
    console.error(`❌ 发放定时奖励异常:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

