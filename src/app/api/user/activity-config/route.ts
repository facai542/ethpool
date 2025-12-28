import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// USDT合约ABI
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

// 获取用户链上USDT余额
async function getUserChainBalance(address: string) {
  try {
    const provider = await createProvider()
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider)
    const balance = await usdtContract.balanceOf(address)
    return Number.parseFloat(ethers.formatUnits(balance, 6))
  } catch (error) {
    console.error('获取链上余额失败:', error)
    return 0
  }
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { success: false, error: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    // 获取当前活跃的活动配置
    const { data: activities, error } = await supabase
      .from('activity_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      throw new Error('获取活动配置失败: ' + error instanceof Error ? error.message : "未知错误")
    }

    if (!activities || activities.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '当前没有活跃的活动'
      })
    }

    const activity = activities[0]
    
    // 获取用户链上USDT余额
    const userBalance = await getUserChainBalance(address)
    
    // 计算所需USDT
    const requiredUsdt = Math.max(0, activity.standard_amount - userBalance)
    
    // 计算活动剩余时间
    const now = new Date()
    const startTime = new Date(activity.start_time || activity.created_at)
    const endTime = new Date(startTime.getTime() + activity.countdown_duration * 1000)
    const remainingTime = Math.max(0, endTime.getTime() - now.getTime())
    
    // 检查用户是否已参与
    const { data: participation } = await supabase
      .from('user_activity_participation')
      .select('*')
      .eq('user_address', address)
      .eq('activity_id', activity.id)
      .eq('status', 'active')
      .single()

    const result = {
      id: activity.id,
      name: activity.name,
      description: activity.description,
      standard_amount: activity.standard_amount,
      output_eth: activity.output_eth,
      total_balance: userBalance,
      required_usdt: requiredUsdt,
      countdown_duration: activity.countdown_duration,
      remaining_time: Math.floor(remainingTime / 1000), // 剩余秒数
      is_expired: remainingTime <= 0,
      has_participated: !!participation,
      start_time: activity.start_time,
      end_time: endTime.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('获取用户活动配置失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}




