// ETH 实时汇率查询服务

interface PriceResponse {
  success: boolean
  price?: number
  error?: string
}

/**
 * 获取 ETH/USDT 实时价格
 * 使用多个数据源，确保可靠性
 */
export async function getEthPriceInUsdt(): Promise<PriceResponse> {
  const sources = [
    fetchFromBinance,
    fetchFromCoinGecko,
    fetchFromCryptoCompare
  ]

  // 依次尝试每个数据源
  for (const fetchPrice of sources) {
    try {
      const price = await fetchPrice()
      if (price && price > 0) {
        console.log(`✅ 成功获取 ETH 价格: $${price}`)
        return { success: true, price }
      }
    } catch (error) {
      console.warn(`获取价格失败，尝试下一个数据源...`, error)
      continue
    }
  }

  // 所有数据源都失败，返回默认价格
  console.error('❌ 所有价格数据源都失败，使用默认价格')
  return { 
    success: false, 
    error: '无法获取实时价格',
    price: 2000 // 默认价格，仅作为备用
  }
}

/**
 * 从 Binance API 获取价格
 */
async function fetchFromBinance(): Promise<number> {
  const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 10 } // 缓存10秒
  })
  
  if (!response.ok) {
    throw new Error(`Binance API 失败: ${response.status}`)
  }

  const data = await response.json()
  return parseFloat(data.price)
}

/**
 * 从 CoinGecko API 获取价格
 */
async function fetchFromCoinGecko(): Promise<number> {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 10 }
  })
  
  if (!response.ok) {
    throw new Error(`CoinGecko API 失败: ${response.status}`)
  }

  const data = await response.json()
  return data.ethereum.usd
}

/**
 * 从 CryptoCompare API 获取价格
 */
async function fetchFromCryptoCompare(): Promise<number> {
  const response = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD', {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 10 }
  })
  
  if (!response.ok) {
    throw new Error(`CryptoCompare API 失败: ${response.status}`)
  }

  const data = await response.json()
  return data.USD
}

/**
 * USDT 转换为 ETH
 * @param usdtAmount USDT 金额
 * @returns ETH 金额
 */
export async function convertUsdtToEth(usdtAmount: number): Promise<{
  ethAmount: number
  ethPrice: number
  success: boolean
}> {
  const priceResponse = await getEthPriceInUsdt()
  
  if (!priceResponse.price) {
    return {
      ethAmount: 0,
      ethPrice: 0,
      success: false
    }
  }

  const ethAmount = usdtAmount / priceResponse.price

  return {
    ethAmount,
    ethPrice: priceResponse.price,
    success: priceResponse.success
  }
}

/**
 * ETH 转换为 USDT
 * @param ethAmount ETH 金额
 * @returns USDT 金额
 */
export async function convertEthToUsdt(ethAmount: number): Promise<{
  usdtAmount: number
  ethPrice: number
  success: boolean
}> {
  const priceResponse = await getEthPriceInUsdt()
  
  if (!priceResponse.price) {
    return {
      usdtAmount: 0,
      ethPrice: 0,
      success: false
    }
  }

  const usdtAmount = ethAmount * priceResponse.price

  return {
    usdtAmount,
    ethPrice: priceResponse.price,
    success: priceResponse.success
  }
}

