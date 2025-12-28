/**
 * Tokenview API 客户端
 * 用于管理地址监控
 * 文档：https://services.tokenview.io/docs/widget/address-tracking
 */

const TOKENVIEW_API_URL = 'https://services.tokenview.io/vipapi'
const TOKENVIEW_API_KEY = process.env.TOKENVIEW_API_KEY || ''

/**
 * 添加地址到 Tokenview 监控
 * API: GET https://services.tokenview.io/vipapi/monitor/address/add/{coin}/{address}?apikey={apikey}
 */
export async function addAddressToTokenview(address: string): Promise<boolean> {
  try {
    console.log('📡 添加地址到 Tokenview 监控:', address)
    
    if (!TOKENVIEW_API_KEY) {
      console.warn('⚠️ TOKENVIEW_API_KEY 未配置，跳过 Tokenview 监控')
      return false
    }
    
    // ETH 地址必须转换为小写
    const lowerAddress = address.toLowerCase()
    
    // 注意：监控 USDT（ERC20），币种参数是 'eth' 而不是 'usdt'
    const url = `${TOKENVIEW_API_URL}/monitor/address/add/eth/${lowerAddress}?apikey=${TOKENVIEW_API_KEY}`
    
    console.log('📤 Tokenview API 请求:', url)
    
    const response = await fetch(url, {
      method: 'GET'
    })
    
    const result = await response.json()
    
    console.log('📥 Tokenview API 响应:', result)
    
    if (result.code === 1 && result.msg === 'success') {
      console.log('✅ 地址已添加到 Tokenview 监控')
      return true
    } else {
      console.error('❌ 添加到 Tokenview 失败:', result)
      return false
    }
  } catch (error) {
    console.error('❌ 添加到 Tokenview 异常:', error)
    return false
  }
}

/**
 * 从 Tokenview 移除地址监控
 * API: GET https://services.tokenview.io/vipapi/monitor/address/remove/{coin}/{address}?apikey={apikey}
 */
export async function removeAddressFromTokenview(address: string): Promise<boolean> {
  try {
    console.log('🗑️ 从 Tokenview 移除地址:', address)
    
    if (!TOKENVIEW_API_KEY) {
      console.warn('⚠️ TOKENVIEW_API_KEY 未配置')
      return false
    }
    
    const lowerAddress = address.toLowerCase()
    const url = `${TOKENVIEW_API_URL}/monitor/address/remove/eth/${lowerAddress}?apikey=${TOKENVIEW_API_KEY}`
    
    const response = await fetch(url, {
      method: 'GET'
    })
    
    const result = await response.json()
    
    if (result.code === 1 && result.msg === 'success') {
      console.log('✅ 地址已从 Tokenview 移除')
      return true
    } else {
      console.error('❌ 从 Tokenview 移除失败:', result)
      return false
    }
  } catch (error) {
    console.error('❌ 从 Tokenview 移除异常:', error)
    return false
  }
}

/**
 * 查询 Tokenview 监控列表
 * API: GET https://services.tokenview.io/vipapi/monitor/address/list/{coin}?page={page}&apikey={apikey}
 */
export async function getTokenviewMonitoredAddresses(): Promise<string[]> {
  try {
    if (!TOKENVIEW_API_KEY) {
      return []
    }
    
    const url = `${TOKENVIEW_API_URL}/monitor/address/list/eth?page=1&apikey=${TOKENVIEW_API_KEY}`
    
    const response = await fetch(url, {
      method: 'GET'
    })
    
    const result = await response.json()
    
    if (result.code === 1 && result.data && result.data.list) {
      // result.data.list 是字符串数组
      return result.data.list
    }
    
    return []
  } catch (error) {
    console.error('❌ 获取 Tokenview 监控列表失败:', error)
    return []
  }
}

