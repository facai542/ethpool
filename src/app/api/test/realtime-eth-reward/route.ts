import { NextRequest, NextResponse } from 'next/server'
import { getRealtimeEthPrice, calculateEthReward } from '@/lib/eth-price-service'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * 测试端点：验证实时ETH价格和授权奖励计算
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 开始测试实时ETH奖励计算...')

    // 1. 获取实时ETH价格
    const { price: realtimePrice, source } = await getRealtimeEthPrice()
    
    // 2. 计算56 USDT等值的ETH奖励
    const { ethAmount: realtimeReward, ethPrice, source: calcSource } = await calculateEthReward(56)
    
    // 3. 使用固定价格计算对比
    const fixedPrice = 2500
    const fixedReward = 56 / fixedPrice
    
    // 4. 计算差异
    const difference = realtimeReward - fixedReward
    const percentageDiff = ((difference / fixedReward) * 100).toFixed(2)
    
    // 5. 查询数据库函数获取的价格
    const { data: dbPrice, error: dbError } = await supabase
      .rpc('get_realtime_eth_price')
    
    const dbPriceValue = dbPrice ? parseFloat(dbPrice) : null
    const dbReward = dbPriceValue ? 56 / dbPriceValue : null

    // 6. 查询最新缓存
    const { data: cachedPrice } = await supabase
      .from('eth_price_cache')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      realtimePrices: {
        api: {
          price: realtimePrice,
          source,
          reward: realtimeReward.toFixed(8) + ' ETH'
        },
        database: {
          price: dbPriceValue,
          reward: dbReward ? dbReward.toFixed(8) + ' ETH' : 'N/A',
          error: dbError?.message
        },
        cache: {
          price: cachedPrice?.eth_price || null,
          source: cachedPrice?.source || null,
          expiresAt: cachedPrice?.expires_at || null,
          isExpired: cachedPrice ? new Date(cachedPrice.expires_at) < new Date() : true
        }
      },
      comparison: {
        fixed: {
          price: fixedPrice,
          reward: fixedReward.toFixed(8) + ' ETH',
          description: '使用固定价格 $2,500'
        },
        realtime: {
          price: ethPrice,
          reward: realtimeReward.toFixed(8) + ' ETH',
          description: `使用实时价格 $${ethPrice}`
        },
        difference: {
          ethDiff: difference.toFixed(8) + ' ETH',
          percentageDiff: percentageDiff + '%',
          analysis: parseFloat(percentageDiff) > 0 
            ? '实时价格更低，用户获得更多ETH' 
            : '实时价格更高，用户获得更少ETH'
        }
      },
      calculation: {
        formula: '56 USDT / ETH价格 = ETH奖励',
        examples: [
          { price: 2500, reward: (56 / 2500).toFixed(8) },
          { price: 3000, reward: (56 / 3000).toFixed(8) },
          { price: 3500, reward: (56 / 3500).toFixed(8) },
          { price: 4000, reward: (56 / 4000).toFixed(8) },
          { price: 4500, reward: (56 / 4500).toFixed(8) }
        ]
      }
    })

  } catch (error) {
    console.error('❌ 测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '测试失败'
    }, { status: 500 })
  }
}

/**
 * POST: 手动触发价格更新（用于测试）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { usdtAmount = 56 } = body

    console.log(`🧪 测试计算 ${usdtAmount} USDT 等值的ETH奖励...`)

    const result = await calculateEthReward(usdtAmount)

    return NextResponse.json({
      success: true,
      input: {
        usdtAmount,
        description: `计算 ${usdtAmount} USDT 等值的ETH`
      },
      output: {
        ethAmount: result.ethAmount,
        ethPrice: result.ethPrice,
        source: result.source
      },
      formula: `${usdtAmount} USDT ÷ $${result.ethPrice} = ${result.ethAmount} ETH`
    })

  } catch (error) {
    console.error('❌ 测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '测试失败'
    }, { status: 500 })
  }
}



