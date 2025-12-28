import { supabase } from './supabase'

/**
 * ETH价格服务 - 提供实时ETH价格获取和缓存管理
 */

// 默认ETH价格（当所有API都失败时使用）
const DEFAULT_ETH_PRICE = 3500

/**
 * 从CoinGecko获取实时ETH价格
 */
async function fetchFromCoinGecko(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      {
        next: { revalidate: 0 },
        headers: { 'Accept': 'application/json' }
      }
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data?.ethereum?.usd ? parseFloat(data.ethereum.usd) : null
  } catch (error) {
    console.warn('CoinGecko API调用失败:', error)
    return null
  }
}

/**
 * 从Binance获取实时ETH价格
 */
async function fetchFromBinance(): Promise<number | null> {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data?.price ? parseFloat(data.price) : null
  } catch (error) {
    console.warn('Binance API调用失败:', error)
    return null
  }
}

/**
 * 获取缓存的ETH价格（1小时内有效）
 */
export async function getCachedEthPrice(): Promise<{ price: number; source: string; isCached: boolean }> {
  try {
    const { data: cachedPrice, error } = await supabase
      .from('eth_price_cache')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!error && cachedPrice) {
      return {
        price: parseFloat(cachedPrice.eth_price),
        source: cachedPrice.source,
        isCached: true
      }
    }
  } catch (error) {
    console.warn('获取缓存价格失败:', error)
  }

  return { price: DEFAULT_ETH_PRICE, source: 'default', isCached: false }
}

/**
 * 获取并更新实时ETH价格
 * 优先从API获取，失败则使用缓存，最后使用默认值
 */
export async function getRealtimeEthPrice(): Promise<{ price: number; source: string }> {
  // 1. 尝试从CoinGecko获取
  let price = await fetchFromCoinGecko()
  let source = 'coingecko'

  // 2. 如果失败，尝试Binance
  if (!price) {
    price = await fetchFromBinance()
    source = 'binance'
  }

  // 3. 如果还是失败，尝试从缓存获取
  if (!price) {
    const cached = await getCachedEthPrice()
    if (cached.isCached) {
      console.log(`⚠️ API获取失败，使用缓存价格: $${cached.price} (${cached.source})`)
      return { price: cached.price, source: `cached_${cached.source}` }
    }
    price = DEFAULT_ETH_PRICE
    source = 'default'
  }

  // 4. 更新缓存
  if (price && source !== 'default') {
    await updatePriceCache(price, source)
  }

  console.log(`💰 当前ETH价格: $${price} (来源: ${source})`)
  
  return { price, source }
}

/**
 * 更新价格缓存
 */
export async function updatePriceCache(price: number, source: string): Promise<void> {
  try {
    // 停用旧的缓存
    await supabase
      .from('eth_price_cache')
      .update({ is_active: false })
      .eq('is_active', true)

    // 插入新的缓存
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1小时后过期

    await supabase
      .from('eth_price_cache')
      .insert({
        eth_price: price,
        source,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        remark: `实时更新 - ${source}`
      })

    console.log(`✅ ETH价格缓存已更新: $${price} (${source})`)
  } catch (error) {
    console.error('更新价格缓存失败:', error)
  }
}

/**
 * 计算USDT等值的ETH金额
 */
export async function calculateEthReward(usdtAmount: number): Promise<{ ethAmount: number; ethPrice: number; source: string }> {
  const { price: ethPrice, source } = await getRealtimeEthPrice()
  const ethAmount = usdtAmount / ethPrice
  
  return {
    ethAmount: parseFloat(ethAmount.toFixed(8)),
    ethPrice,
    source
  }
}



