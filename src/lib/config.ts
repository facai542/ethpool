// 网站配置文件
// 支持开发环境、生产环境和自定义域名

export interface SiteConfig {
  name: string
  description: string
  baseUrl: string
  apiUrl: string
}

// 获取当前环境的基础URL
export function getBaseUrl(): string {
  // 在服务器端渲染时
  if (typeof window === 'undefined') {
    // 优先使用环境变量中的域名
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
    
    // 在Vercel部署时
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    
    // 开发环境默认值
    return process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000'
  }
  
  // 在客户端时，直接使用当前访问的域名
  return window.location.origin
}

// 获取网站配置
export function getSiteConfig(): SiteConfig {
  const baseUrl = getBaseUrl()
  
  return {
    name: 'DeFi质押平台',
    description: '专业的去中心化金融质押平台',
    baseUrl,
    apiUrl: `${baseUrl}/api`
  }
}

// 生成邀请链接
export function generateInviteLink(agentName: string): string {
  const baseUrl = getBaseUrl()
  const encodedAgentName = encodeURIComponent(agentName)
  return `${baseUrl}/invite/${encodedAgentName}`
}

// 检测当前环境
export function getEnvironment(): 'development' | 'production' | 'preview' {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production' ? 'production' : 'development'
  }
  
  const hostname = window.location.hostname
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development'
  }
  
  if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
    return 'preview'
  }
  
  return 'production'
}

// 环境相关的配置
export const ENV_CONFIG = {
  development: {
    apiTimeout: 10000,
    enableDebug: true,
    enableAnalytics: false
  },
  preview: {
    apiTimeout: 15000,
    enableDebug: true,
    enableAnalytics: false
  },
  production: {
    apiTimeout: 30000,
    enableDebug: false,
    enableAnalytics: true
  }
}

// 获取当前环境配置
export function getEnvConfig() {
  const env = getEnvironment()
  return ENV_CONFIG[env]
} 
 