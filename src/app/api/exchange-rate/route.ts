import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || 'USDT'
    const to = searchParams.get('to') || 'ETH'
    const amount = Number.parseFloat(searchParams.get('amount') || '1')

    console.log(`🔄 获取汇率: ${amount} ${from} -> ${to}`)

    // 使用CoinGecko API获取实时汇率
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=tether,ethereum&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    // 获取USDT和ETH的USD价格
    const usdtPrice = data.tether?.usd || 1.0
    const ethPrice = data.ethereum?.usd || 3000.0

    console.log(`💰 价格信息: USDT=${usdtPrice}, ETH=${ethPrice}`)

    // 计算汇率
    let rate = 0
    let convertedAmount = 0

    if (from === 'USDT' && to === 'ETH') {
      // USDT到ETH的汇率
      rate = usdtPrice / ethPrice
      convertedAmount = amount * rate
    } else if (from === 'ETH' && to === 'USDT') {
      // ETH到USDT的汇率
      rate = ethPrice / usdtPrice
      convertedAmount = amount * rate
    } else {
      throw new Error('不支持的货币对')
    }

    const result = {
      from,
      to,
      amount,
      rate,
      convertedAmount,
      usdtPrice,
      ethPrice,
      timestamp: new Date().toISOString()
    }

    console.log(`✅ 汇率计算完成:`, result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('❌ 获取汇率失败:', error)
    
    // 返回默认汇率作为备用
    const fallbackRate = 0.0003 // 大约1 USDT = 0.0003 ETH
    const fallbackAmount = Number.parseFloat(searchParams.get('amount') || '1') * fallbackRate
    
    return NextResponse.json({
      success: true,
      data: {
        from: searchParams.get('from') || 'USDT',
        to: searchParams.get('to') || 'ETH',
        amount: Number.parseFloat(searchParams.get('amount') || '1'),
        rate: fallbackRate,
        convertedAmount: fallbackAmount,
        usdtPrice: 1.0,
        ethPrice: 3333.33,
        timestamp: new Date().toISOString(),
        isFallback: true
      }
    })
  }
}