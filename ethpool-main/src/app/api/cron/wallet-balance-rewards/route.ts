import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 动态路由配置
export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 开始执行钱包余额监听和奖励发放任务...')
    
    // 验证请求来源
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 第一步：获取所有已授权用户
    const { data: authorizedUsers, error: usersError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, usdt, eth, a_eth')
      .eq('approved', 1)
      .eq('is_active', true)
      .not('wallet_address', 'is', null)

    if (usersError) {
      throw new Error('获取授权用户失败: ' + usersError.message)
    }

    if (!authorizedUsers || authorizedUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有找到已授权的用户',
        data: { processedUsers: 0 }
      })
    }

    console.log(`📊 找到 ${authorizedUsers.length} 个已授权用户`)

    // 第二步：为每个用户获取链上USDT余额并更新缓存
    const { ethers } = await import('ethers')
    
    const USDT_ABI = [
      {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
      }
    ]
    
    const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    
    // RPC节点
    const ETH_RPC_URLS = [
      'https://ethereum.publicnode.com',
      'https://eth.llamarpc.com', 
      'https://rpc.ankr.com/eth',
      'https://ethereum.blockpi.network/v1/rpc/public'
    ]
    
    // 创建Provider
    let provider: any = null
    for (const rpcUrl of ETH_RPC_URLS) {
      try {
        provider = new ethers.JsonRpcProvider(rpcUrl)
        await provider.getBlockNumber()
        console.log(`✅ 连接到RPC节点: ${rpcUrl}`)
        break
      } catch (error) {
        continue
      }
    }
    
    if (!provider) {
      throw new Error('所有RPC节点连接失败')
    }
    
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider)
    
    let successCount = 0
    let skipCount = 0
    
    // 获取每个用户的链上USDT余额
    for (const user of authorizedUsers) {
      try {
        console.log(`🔍 查询用户 ${user.wallet_address} 链上USDT余额...`)
        
        const balance = await usdtContract.balanceOf(user.wallet_address)
        const usdtBalance = Number.parseFloat(ethers.formatUnits(balance, 6))
        
        console.log(`💰 用户 ${user.wallet_address} 链上USDT余额: ${usdtBalance}`)
        
        // 更新余额快照缓存
        await supabase
          .from('wallet_balance_snapshots')
          .insert({
            wallet_address: user.wallet_address,
            usdt_balance: usdtBalance,
            snapshot_time: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
        
        successCount++
        
        // 添加延迟避免RPC限制
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ 查询用户 ${user.wallet_address} 余额失败:`, error)
        skipCount++
      }
    }
    
    console.log(`📊 余额查询完成: 成功 ${successCount}，失败 ${skipCount}`)

    // 第三步：调用数据库函数检查钱包余额并发放奖励
    console.log('🎁 开始发放奖励...')
    const { data, error } = await supabase.rpc('check_wallet_balances_and_reward')

    if (error) {
      console.error('❌ 执行钱包余额检查失败:', error)
      return NextResponse.json({
        success: false,
        error: '执行钱包余额检查失败: ' + error.message
      }, { status: 500 })
    }

    console.log('✅ 钱包余额检查和奖励发放完成')

    return NextResponse.json({
      success: true,
      message: '钱包余额检查和奖励发放完成',
      data: {
        balanceQueriesSuccess: successCount,
        balanceQueriesFailed: skipCount,
        rewardDistribution: data
      }
    })

  } catch (error) {
    console.error('❌ 钱包余额监听任务执行失败:', error)
    return NextResponse.json({
      success: false,
      error: '钱包余额监听任务执行失败: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 查询钱包余额监听状态...')

    // 查询最近的执行日志
    const { data: logs, error: logsError } = await supabase
      .from('cron_execution_logs_new')
      .select('*')
      .eq('task_name', 'wallet_balance_reward_distribution')
      .order('execution_time', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('❌ 查询执行日志失败:', logsError)
    }

    // 查询钱包监听配置
    const { data: config, error: configError } = await supabase
      .from('wallet_monitor_config_new')
      .select('*')
      .eq('is_active', true)

    if (configError) {
      console.error('❌ 查询配置失败:', configError)
    }

    // 查询活跃监听的钱包数量
    const { data: activeWallets, error: walletsError } = await supabase
      .from('wallet_monitor')
      .select('id', { count: 'exact' })
      .eq('is_active', true)

    if (walletsError) {
      console.error('❌ 查询活跃钱包失败:', walletsError)
    }

    // 查询今日奖励发放统计
    const { data: todayRewards, error: rewardsError } = await supabase
      .from('scheduled_rewards_new')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date().toISOString().split('T')[0])

    if (rewardsError) {
      console.error('❌ 查询今日奖励失败:', rewardsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'running',
        activeWallets: activeWallets?.length || 0,
        todayRewards: todayRewards?.length || 0,
        recentLogs: logs || [],
        config: config || []
      }
    })

  } catch (error) {
    console.error('❌ 查询钱包余额监听状态失败:', error)
    return NextResponse.json({
      success: false,
      error: '查询钱包余额监听状态失败: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
  }
}
