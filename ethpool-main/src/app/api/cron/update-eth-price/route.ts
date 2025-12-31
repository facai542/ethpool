import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// 获取实时ETH价格
async function fetchRealtimeEthPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { 
        next: { revalidate: 0 },
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`CoinGecko API 返回错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data?.ethereum?.usd) {
      return parseFloat(data.ethereum.usd)
    }
    
    throw new Error('无效的价格数据格式')
  } catch (error) {
    console.error('获取实时ETH价格失败:', error)
    throw error
  }
}

// GET: 查询当前缓存的ETH价格
export async function GET(request: NextRequest) {
  try {
    const { data: latestPrice, error } = await supabase
      .from('eth_price_cache')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        price: latestPrice?.eth_price || null,
        source: latestPrice?.source || null,
        updatedAt: latestPrice?.created_at || null,
        expiresAt: latestPrice?.expires_at || null,
        isExpired: latestPrice ? new Date(latestPrice.expires_at) < new Date() : true
      }
    })
  } catch (error) {
    console.error('查询ETH价格缓存失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
    }, { status: 500 })
  }
}

// POST: 更新ETH价格缓存（定时任务调用）
export async function POST(request: NextRequest) {
  try {
    // 验证请求来源
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    console.log('🔄 开始更新ETH价格缓存...')

    // 获取实时ETH价格
    let ethPrice: number
    let priceSource = 'coingecko'
    
    try {
      ethPrice = await fetchRealtimeEthPrice()
      console.log(`✅ 获取实时ETH价格成功: $${ethPrice}`)
    } catch (error) {
      console.warn('⚠️ 从CoinGecko获取价格失败，尝试备用源...')
      
      // 备用价格源：Binance
      try {
        const binanceResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
        const binanceData = await binanceResponse.json()
        ethPrice = parseFloat(binanceData.price)
        priceSource = 'binance'
        console.log(`✅ 从Binance获取价格成功: $${ethPrice}`)
      } catch (binanceError) {
        console.error('❌ 所有价格源都失败，使用默认价格')
        ethPrice = 3500 // 默认价格
        priceSource = 'default'
      }
    }

    // 停用所有旧的价格记录
    await supabase
      .from('eth_price_cache')
      .update({ is_active: false })
      .eq('is_active', true)

    // 插入新的价格记录
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1小时后过期

    const { data: insertedPrice, error: insertError } = await supabase
      .from('eth_price_cache')
      .insert({
        eth_price: ethPrice,
        source: priceSource,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        remark: `自动更新 - ${priceSource === 'coingecko' ? 'CoinGecko API' : priceSource === 'binance' ? 'Binance API' : '默认价格'}`
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    console.log('✅ ETH价格缓存更新成功')

    // 记录到执行日志
    await supabase
      .from('cron_execution_logs')
      .insert({
        task_name: 'update_eth_price_cache',
        status: 'success',
        affected_records: 1,
        execution_time: new Date().toISOString(),
        details: {
          ethPrice,
          source: priceSource,
          expiresAt: expiresAt.toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      message: 'ETH价格缓存更新成功',
      data: {
        price: ethPrice,
        source: priceSource,
        expiresAt: expiresAt.toISOString(),
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 更新ETH价格缓存失败:', error)

    // 记录错误日志
    await supabase
      .from('cron_execution_logs')
      .insert({
        task_name: 'update_eth_price_cache',
        status: 'error',
        affected_records: 0,
        execution_time: new Date().toISOString(),
        details: {
          error: error instanceof Error ? error.message : '未知错误'
        }
      })

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新失败'
    }, { status: 500 })
  }
}



