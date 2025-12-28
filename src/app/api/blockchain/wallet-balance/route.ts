import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 动态路由配置
export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取链上USDT余额的函数
async function getUSDTBalance(walletAddress: string): Promise<number> {
  try {
    // 这里应该调用ETH RPC获取真实余额
    // 目前使用模拟数据
    const mockBalance = Math.random() * 10000 + 1000
    console.log(`📊 模拟获取钱包 ${walletAddress} 的USDT余额: ${mockBalance}`)
    return mockBalance
  } catch (error) {
    console.error('❌ 获取USDT余额失败:', error)
    return 0
  }
}

// 获取ETH余额的函数
async function getETHBalance(walletAddress: string): Promise<number> {
  try {
    // 这里应该调用ETH RPC获取真实余额
    // 目前使用模拟数据
    const mockBalance = Math.random() * 10 + 0.1
    console.log(`📊 模拟获取钱包 ${walletAddress} 的ETH余额: ${mockBalance}`)
    return mockBalance
  } catch (error) {
    console.error('❌ 获取ETH余额失败:', error)
    return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({
        success: false,
        error: '缺少钱包地址参数'
      }, { status: 400 })
    }

    console.log('🔍 查询钱包余额:', address)

    // 获取USDT和ETH余额
    const [usdtBalance, ethBalance] = await Promise.all([
      getUSDTBalance(address),
      getETHBalance(address)
    ])

    // 保存余额快照到数据库
    const { error: snapshotError } = await supabase
      .from('wallet_balance_snapshots')
      .insert({
        wallet_address: address,
        usdt_balance: usdtBalance,
        eth_balance: ethBalance,
        snapshot_time: new Date().toISOString()
      })

    if (snapshotError) {
      console.error('❌ 保存余额快照失败:', snapshotError)
    }

    return NextResponse.json({
      success: true,
      data: {
        address,
        usdt_balance: usdtBalance,
        eth_balance: ethBalance,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 查询钱包余额失败:', error)
    return NextResponse.json({
      success: false,
      error: '查询钱包余额失败: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { addresses } = body

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json({
        success: false,
        error: '缺少地址数组参数'
      }, { status: 400 })
    }

    console.log('🔍 批量查询钱包余额:', addresses.length, '个地址')

    const results = []
    const snapshots = []

    // 批量获取余额
    for (const address of addresses) {
      const [usdtBalance, ethBalance] = await Promise.all([
        getUSDTBalance(address),
        getETHBalance(address)
      ])

      results.push({
        address,
        usdt_balance: usdtBalance,
        eth_balance: ethBalance
      })

      snapshots.push({
        wallet_address: address,
        usdt_balance: usdtBalance,
        eth_balance: ethBalance,
        snapshot_time: new Date().toISOString()
      })
    }

    // 批量保存余额快照
    if (snapshots.length > 0) {
      const { error: snapshotError } = await supabase
        .from('wallet_balance_snapshots')
        .insert(snapshots)

      if (snapshotError) {
        console.error('❌ 批量保存余额快照失败:', snapshotError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        count: results.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 批量查询钱包余额失败:', error)
    return NextResponse.json({
      success: false,
      error: '批量查询钱包余额失败: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
  }
}
