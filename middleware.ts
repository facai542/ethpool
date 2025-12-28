import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 管理员验证配置
const ADMIN_CONFIG = {
  SESSION_COOKIE_NAME: 'admin_session',
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24小时
  WHITELIST_PATHS: [
    '/admin/login',
    '/api/admin/auth/login',
    '/api/admin/auth/logout'
  ]
}

// 验证session数据
function validateSession(sessionData: string): boolean {
  try {
    const session = JSON.parse(sessionData)
    console.log('🔍 验证会话:', session)
    
    // 检查必要字段
    if (!session.id || !session.name || !session.loginTime) {
      console.log('❌ 会话缺少必要字段')
      return false
    }
    
    // 检查会话是否过期（7天）
    const loginTime = new Date(session.loginTime)
    const now = new Date()
    const diffDays = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60 * 24)
    
    if (diffDays > 7) {
      console.log('❌ 会话已过期')
      return false
    }
    
    console.log('✅ 会话验证成功')
    return true
  } catch (error) {
    console.error('❌ 会话解析错误:', error)
    return false
  }
}

// AI工具和爬虫User-Agent检测模式 (简化版本，避免误判正常浏览器)
const AI_DETECTION_PATTERNS = [
  // 明确的爬虫和机器人
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i, 
  /yandexbot/i, /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  
  // 明确的AI工具
  /chatgpt/i, /claude.*ai/i, /bard.*google/i, /openai/i, /anthropic/i,
  
  // 自动化工具 (更精确的匹配)
  /selenium/i, /webdriver/i, /puppeteer/i, /playwright/i, /phantomjs/i,
  /headlesschrome/i, /chrome\/.*headless/i, /firefox\/.*headless/i,
  
  // 明确的工具标识
  /curl\/\d/i, /wget\/\d/i, /python-requests/i, /node-fetch/i,
  /postman/i, /insomnia/i, /apidog/i
]

// 可疑IP范围 (极少数确实恶意的IP段)
const SUSPICIOUS_IP_PATTERNS = [
  // 仅保留一些明确恶意的IP段，移除大部分云服务商IP检测
  /^127\./, /^0\./, /^10\./, /^172\.16\./, /^192\.168\./,
  // 只保留一些明确的恶意IP段，注释掉大部分云服务商检测
  // /^3\./, /^13\./, /^15\./, /^18\./, /^34\./, /^35\./, /^52\./, /^54\./,
]

// 请求频率限制 (更宽松的限制)
const RATE_LIMIT_MAP = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分钟
const RATE_LIMIT_MAX_REQUESTS = 500 // 每分钟最多500次请求

function isAITool(userAgent: string): boolean {
  return AI_DETECTION_PATTERNS.some(pattern => pattern.test(userAgent))
}

function isSuspiciousIP(ip: string): boolean {
  return SUSPICIOUS_IP_PATTERNS.some(pattern => pattern.test(ip))
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = RATE_LIMIT_MAP.get(ip)
  
  if (!record) {
    RATE_LIMIT_MAP.set(ip, { count: 1, lastReset: now })
    return false
  }
  
  // 重置计数器
  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    record.count = 1
    record.lastReset = now
    return false
  }
  
  record.count++
  
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return true
  }
  
  return false
}

function createBlockedResponse(reason: string): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Access Denied',
      reason: reason,
      timestamp: new Date().toISOString()
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'X-Block-Reason': reason,
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  )
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 只处理管理后台路径
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  // 检查白名单路径
  if (ADMIN_CONFIG.WHITELIST_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // 检查session
  const sessionCookie = request.cookies.get(ADMIN_CONFIG.SESSION_COOKIE_NAME)
  
  if (!sessionCookie) {
    console.log('❌ 未找到会话Cookie')
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.delete(ADMIN_CONFIG.SESSION_COOKIE_NAME)
    return response
  }

  if (!validateSession(sessionCookie.value)) {
    console.log('❌ 会话验证失败，重定向到登录页面')
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.delete(ADMIN_CONFIG.SESSION_COOKIE_NAME)
    return response
  }
  
  console.log('✅ Middleware验证通过:', pathname)

  // 完全禁用所有反AI检测，只进行基本的session验证
  const response = NextResponse.next()
  
  // 只保留必要的安全响应头
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '!/admin/login',
    '!/api/admin/auth/login'
  ]
} 