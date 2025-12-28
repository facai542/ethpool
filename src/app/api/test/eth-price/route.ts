import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用service role key绕过RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 测试实时ETH价格获取...')
    
    // 1. 从CoinGecko获取实时价格
    let coinGeckoPrice = 0
    try {
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const priceData = await priceResponse.json()
      
      if (priceData.ethereum && priceData.ethereum.usd) {
        coinGeckoPrice = priceData.ethereum.usd
        console.log(`✅ CoinGecko价格: $${coinGeckoPrice}`)
      }
    } catch (error) {
      console.error('❌ CoinGecko API失败:', error)
    }
    
    // 2. 从数据库函数获取价格
    let dbPrice = 0
    try {
      const { data, error } = await supabase.rpc('get_current_eth_price')
      if (error) {
        console.error('❌ 数据库函数失败:', error)
      } else {
        dbPrice = data
        console.log(`✅ 数据库价格: $${dbPrice}`)
      }
    } catch (error) {
      console.error('❌ 数据库函数异常:', error)
    }
    
    // 3. 计算奖励
    const usdtAmount = 56
    const coinGeckoReward = coinGeckoPrice > 0 ? usdtAmount / coinGeckoPrice : 0
    const dbReward = dbPrice > 0 ? usdtAmount / dbPrice : 0
    const fixedReward = usdtAmount / 2500 // 固定价格
    
    return NextResponse.json({
      success: true,
      data: {
        usdtAmount: usdtAmount,
        prices: {
          coinGecko: coinGeckoPrice,
          database: dbPrice,
          fixed: 2500
        },
        rewards: {
          coinGecko: coinGeckoReward,
          database: dbReward,
          fixed: fixedReward
        },
        differences: {
          coinGeckoVsFixed: coinGeckoPrice > 0 ? ((coinGeckoReward - fixedReward) / fixedReward * 100).toFixed(2) + '%' : 'N/A',
          dbVsFixed: dbPrice > 0 ? ((dbReward - fixedReward) / fixedReward * 100).toFixed(2) + '%' : 'N/A'
        },
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ ETH价格测试失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}
