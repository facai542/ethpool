import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// 动态路由配置
export const dynamic = 'force-dynamic'

// ETH主网USDT合约地址
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const ETH_RPC_URL = 'https://ethereum.publicnode.com'

/**
 * 获取链上USDT余额
 */
async function getOnChainUSDTBalance(wallet_address: string): Promise<number> {
  try {
    console.log(`🔍 获取链上USDT余额: ${wallet_address}`)

    // 1. 获取最新区块号
    const blockResponse = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    })

    const blockData = await blockResponse.json()
    const blockNumber = blockData.result

    // 2. 调用USDT合约的balanceOf方法
    const balanceResponse = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: USDT_CONTRACT,
            data: `0x70a08231${wallet_address.slice(2).padStart(64, '0')}`
          },
          blockNumber
        ],
        id: 1
      })
    })

    const balanceData = await balanceResponse.json()
    
    if (balanceData.error) {
      console.error('❌ 获取余额失败:', balanceData.error)
      return 0
    }

    // 3. 解析余额 (ETH主网USDT使用6位小数)
    const balanceHex = balanceData.result
    const balanceWei = BigInt(balanceHex)
    const balance = Number(balanceWei) / Math.pow(10, 6)

    console.log(`✅ 链上USDT余额: ${wallet_address} = ${balance} USDT`)
    return balance

  } catch (error) {
    console.error('❌ 获取链上USDT余额异常:', error)
    return 0
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    console.log('🚀 开始执行基于链上余额的奖励发放...')

    // 获取所有已授权用户
    const { data: users, error: usersError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, auth_wallet_address, usdt, eth')
      .eq('is_active', 0)
      .eq('is_effective', 1)
      .eq('approved', 1)

    if (usersError) {
      throw new Error(`获取用户列表失败: ${usersError.message}`)
    }

    console.log(`📊 找到 ${users.length} 个已授权用户`)

    const results = {
      totalUsers: users.length,
      successfulDistributions: 0,
      failedDistributions: 0,
      totalUSDT: 0,
      totalETH: 0,
      onChainBalances: 0,
      databaseBalances: 0,
      details: []
    }

    // 获取当前ETH价格
    const { data: ethPriceData } = await supabase.rpc('get_current_eth_price')
    const ethPrice = ethPriceData || 4300

    for (const user of users) {
      try {
        const userAddress = user.auth_wallet_address || user.wallet_address
        console.log(`\n👤 处理用户 ${user.id}: ${userAddress}`)

        // 获取链上USDT余额
        const onChainBalance = await getOnChainUSDTBalance(userAddress)
        const databaseBalance = Number(user.usdt || 0)
        
        // 选择使用的余额（优先链上余额）
        const actualBalance = onChainBalance > 0 ? onChainBalance : databaseBalance
        const balanceSource = onChainBalance > 0 ? 'onchain' : 'database'

        console.log(`   - 链上余额: ${onChainBalance} USDT`)
        console.log(`   - 数据库余额: ${databaseBalance} USDT`)
        console.log(`   - 使用余额: ${actualBalance} USDT (来源: ${balanceSource})`)

        // 检查最低余额要求
        if (actualBalance < 50) {
          console.log(`   - 余额不足，跳过`)
          continue
        }

        // 根据余额计算奖励率
        let dailyRate = 0.02 // 默认2%
        if (actualBalance >= 200000) dailyRate = 0.05
        else if (actualBalance >= 100000) dailyRate = 0.04
        else if (actualBalance >= 10000) dailyRate = 0.03
        else if (actualBalance >= 5000) dailyRate = 0.025

        // 计算奖励
        const dailyRewardUSDT = actualBalance * dailyRate
        const periodRewardUSDT = dailyRewardUSDT / 4 // 每6小时
        const periodRewardETH = periodRewardUSDT / ethPrice

        // 更新用户ETH余额
        const currentETH = Number(user.eth || 0)
        const newETH = currentETH + periodRewardETH

        const { error: updateError } = await supabase
          .from('nh_member_new')
          .update({
            eth: newETH.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          throw new Error(`更新用户ETH余额失败: ${updateError.message}`)
        }

        // 记录奖励发放日志
        const { error: logError } = await supabase
          .from('reward_distribution_log')
          .insert({
            user_id: user.id,
            user_wallet_address: userAddress,
            usdt_balance: actualBalance,
            daily_rate: dailyRate,
            daily_reward_usdt: dailyRewardUSDT,
            period_reward_usdt: periodRewardUSDT,
            eth_price: ethPrice,
            period_reward_eth: periodRewardETH,
            period_number: Math.floor(new Date().getHours() / 6) + 1,
            status: 'success',
            error_message: `余额来源: ${balanceSource}, 链上余额: ${onChainBalance}, 数据库余额: ${databaseBalance}`,
            balance_source: balanceSource
          })

        if (logError) {
          console.error(`记录日志失败: ${logError.message}`)
        }

        results.successfulDistributions++
        results.totalUSDT += periodRewardUSDT
        results.totalETH += periodRewardETH
        
        if (balanceSource === 'onchain') {
          results.onChainBalances++
        } else {
          results.databaseBalances++
        }

        results.details.push({
          userId: user.id,
          wallet_address: userAddress,
          onChainBalance,
          databaseBalance,
          actualBalance,
          balanceSource,
          rewardUSDT: periodRewardUSDT,
          rewardETH: periodRewardETH
        })

        console.log(`   ✅ 奖励发放成功: ${periodRewardUSDT} USDT -> ${periodRewardETH} ETH`)

        // 添加延迟避免RPC限制
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ 用户 ${user.id} 处理失败:`, error)
        results.failedDistributions++
      }
    }

    console.log(`\n🎉 奖励发放完成:`)
    console.log(`   - 总用户: ${results.totalUsers}`)
    console.log(`   - 成功: ${results.successfulDistributions}`)
    console.log(`   - 失败: ${results.failedDistributions}`)
    console.log(`   - 链上余额: ${results.onChainBalances}`)
    console.log(`   - 数据库余额: ${results.databaseBalances}`)
    console.log(`   - 总USDT: ${results.totalUSDT.toFixed(2)}`)
    console.log(`   - 总ETH: ${results.totalETH.toFixed(6)}`)

    return NextResponse.json({
      success: true,
      message: '基于链上余额的奖励发放完成',
      data: results
    })

  } catch (error) {
    console.error('❌ 奖励发放异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误: ' + error.message },
      { status: 500 }
    )
  }
}

