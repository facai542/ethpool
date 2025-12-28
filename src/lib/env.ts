// 环境变量配置
export const env = {
  // API服务器地址 - 生产环境使用当前域名，本地使用具体端口
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? (typeof window !== 'undefined' ? window.location.origin : 'https://binancepool.uk')
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3003'),
  
  // Supabase配置
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk',
  
  // WebSocket地址 - 暂时禁用
  WS_BASE_URL: null,
  
  // 环境检测
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // 应用配置
  APP_NAME: 'Binance Pool - DeFi Mining Platform DApp',
  APP_VERSION: '1.0.0',
  
  // 站点配置
  SITE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://binancepool.uk'
    : 'http://localhost:3003',
  
  // 默认语言
  DEFAULT_LANGUAGE: 'en',
  
  // 支持的语言列表
  SUPPORTED_LANGUAGES: ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru'],
  
  // 区块链配置
  BSC_RPC_URL: process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
  SIGNATURE_PRIVATE_KEY: process.env.SIGNATURE_PRIVATE_KEY || '',
  
  // API路径 - 现在使用本地Supabase API
  API_PATHS: {
    // 用户相关
    USER_INFO: 'api/user/info',
    USER_AUTHORIZE: 'api/user/authorize',
    
    // 质押相关
    STAKING: 'api/staking',
    
    // 管理员相关
    ADMIN_LOGIN: 'api/admin/auth/login',
    ADMIN_STATS: 'api/admin/stats',
    ADMIN_USERS: 'api/admin/users',
  }
}

export default env 