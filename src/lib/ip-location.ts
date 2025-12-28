// IP地址获取和地理位置查询工具

/**
 * 从请求中获取真实IP地址
 * 支持各种代理和CDN场景
 */
export function getClientIP(request: Request): string | null {
  const headers = request.headers
  
  // 按优先级检查各种可能包含真实IP的header
  const ipHeaders = [
    'x-real-ip',
    'x-forwarded-for',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-cluster-client-ip',
    'forwarded-for',
    'forwarded',
    'via'
  ]
  
  for (const header of ipHeaders) {
    const value = headers.get(header)
    if (value) {
      // x-forwarded-for可能包含多个IP，取第一个
      const ip = value.split(',')[0].trim()
      if (ip && isValidIP(ip)) {
        return ip
      }
    }
  }
  
  return null
}

/**
 * 验证IP地址格式
 */
function isValidIP(ip: string): boolean {
  // IPv4正则
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6简单验证
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
  
  if (ipv4Regex.test(ip)) {
    // 验证每个段是否在0-255之间
    const parts = ip.split('.')
    return parts.every(part => {
      const num = parseInt(part, 10)
      return num >= 0 && num <= 255
    })
  }
  
  return ipv6Regex.test(ip)
}

/**
 * 使用免费API查询IP地理位置
 * 使用ip-api.com（免费，无需API key，限制45请求/分钟）
 */
export async function getIPLocation(ip: string): Promise<{
  country: string
  countryCode: string
  region: string
  city: string
  timezone: string
  isp: string
} | null> {
  try {
    // 跳过私有IP和localhost
    if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        country: '本地网络',
        countryCode: 'LOCAL',
        region: '',
        city: '',
        timezone: '',
        isp: ''
      }
    }
    
    // 使用ip-api.com免费服务
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,city,timezone,isp`, {
      signal: AbortSignal.timeout(5000) // 5秒超时
    })
    
    if (!response.ok) {
      console.warn(`IP地理位置查询失败: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    if (data.status === 'fail') {
      console.warn(`IP地理位置查询失败: ${data.message}`)
      return null
    }
    
    return {
      country: data.country || '未知',
      countryCode: data.countryCode || 'UNKNOWN',
      region: data.region || '',
      city: data.city || '',
      timezone: data.timezone || '',
      isp: data.isp || ''
    }
  } catch (error) {
    console.error('查询IP地理位置异常:', error)
    return null
  }
}

/**
 * 获取国家旗帜emoji
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === 'UNKNOWN' || countryCode === 'LOCAL') {
    return ''
  }
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  
  return String.fromCodePoint(...codePoints)
}

/**
 * 获取常见国家的中文名称
 * 支持英文国家名直接转换
 */
export function getCountryNameCN(country: string): string {
  if (!country) return '未知'
  
  // 先尝试作为国家代码查找
  const countryCodeMap: Record<string, string> = {
    'CN': '中国',
    'US': '美国',
    'JP': '日本',
    'KR': '韩国',
    'GB': '英国',
    'FR': '法国',
    'DE': '德国',
    'SG': '新加坡',
    'HK': '香港',
    'TW': '台湾',
    'RU': '俄罗斯',
    'CA': '加拿大',
    'AU': '澳大利亚',
    'IN': '印度',
    'BR': '巴西',
    'LOCAL': '本地',
    'UNKNOWN': '未知'
  }
  
  // 如果是国家代码，直接返回中文
  if (countryCodeMap[country.toUpperCase()]) {
    return countryCodeMap[country.toUpperCase()]
  }
  
  // 英文国家名到中文的映射
  const countryNameMap: Record<string, string> = {
    'China': '中国',
    'United States': '美国',
    'Japan': '日本',
    'South Korea': '韩国',
    'United Kingdom': '英国',
    'France': '法国',
    'Germany': '德国',
    'Singapore': '新加坡',
    'Hong Kong': '香港',
    'Taiwan': '台湾',
    'Russia': '俄罗斯',
    'Canada': '加拿大',
    'Australia': '澳大利亚',
    'India': '印度',
    'Brazil': '巴西',
    'Thailand': '泰国',
    'Vietnam': '越南',
    'Malaysia': '马来西亚',
    'Indonesia': '印度尼西亚',
    'Philippines': '菲律宾',
    'Netherlands': '荷兰',
    'Switzerland': '瑞士',
    'Spain': '西班牙',
    'Italy': '意大利',
    'Mexico': '墨西哥',
    'Turkey': '土耳其',
    'Poland': '波兰',
    'Sweden': '瑞典',
    'Belgium': '比利时',
    'Austria': '奥地利',
    'Norway': '挪威',
    'Ireland': '爱尔兰',
    'Denmark': '丹麦',
    'Finland': '芬兰',
    'Portugal': '葡萄牙',
    'Greece': '希腊',
    'Czech Republic': '捷克',
    'Romania': '罗马尼亚',
    'New Zealand': '新西兰',
    'Ukraine': '乌克兰',
    'Israel': '以色列',
    'Argentina': '阿根廷',
    'Colombia': '哥伦比亚',
    'Chile': '智利',
    'Peru': '秘鲁',
    'South Africa': '南非',
    'Egypt': '埃及',
    'Nigeria': '尼日利亚',
    'Kenya': '肯尼亚',
    'Pakistan': '巴基斯坦',
    'Bangladesh': '孟加拉国',
    'Saudi Arabia': '沙特阿拉伯',
    'United Arab Emirates': '阿联酋'
  }
  
  // 尝试作为英文国家名查找
  if (countryNameMap[country]) {
    return countryNameMap[country]
  }
  
  // 如果都找不到，返回原值
  return country
}

/**
 * 获取在线状态完整信息
 * 返回统一的在线状态判断结果，确保is_online和status_text完全一致
 */
export function getUserOnlineStatus(lastActiveAt: string | null | undefined): {
  isOnline: boolean
  statusText: string
  minutesAgo: number
} {
  if (!lastActiveAt) {
    return {
      isOnline: false,
      statusText: '离线',
      minutesAgo: -1
    }
  }
  
  try {
    const lastActive = new Date(lastActiveAt)
    const now = new Date()
    
    // 检查日期是否有效
    if (isNaN(lastActive.getTime())) {
      console.warn('无效的lastActiveAt日期:', lastActiveAt)
      return {
        isOnline: false,
        statusText: '离线',
        minutesAgo: -1
      }
    }
    
    const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60))
    
    // 5分钟内有活动视为在线
    const isOnline = diffMinutes <= 5
    
    let statusText: string
    if (isOnline) {
      statusText = '在线'
    } else if (diffMinutes < 1) {
      statusText = '刚刚'
    } else if (diffMinutes < 60) {
      statusText = `${diffMinutes}分钟前`
    } else if (diffMinutes < 1440) {
      statusText = `${Math.floor(diffMinutes / 60)}小时前`
    } else {
      statusText = `${Math.floor(diffMinutes / 1440)}天前`
    }
    
    return {
      isOnline,
      statusText,
      minutesAgo: diffMinutes
    }
  } catch (error) {
    console.error('获取在线状态失败:', error)
    return {
      isOnline: false,
      statusText: '离线',
      minutesAgo: -1
    }
  }
}

/**
 * 判断用户是否在线
 * 根据最后活动时间判断（5分钟内有活动视为在线）
 */
export function isUserOnline(lastActiveAt: string | null | undefined): boolean {
  return getUserOnlineStatus(lastActiveAt).isOnline
}

/**
 * 获取在线状态文本
 */
export function getOnlineStatusText(lastActiveAt: string | null | undefined): string {
  return getUserOnlineStatus(lastActiveAt).statusText
}

