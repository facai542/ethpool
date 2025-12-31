import { type NextRequest, NextResponse } from 'next/server'

// 管理员验证配置
const ADMIN_CONFIG = {
  // 管理员用户名和密码（实际部署时应该使用环境变量）
  USERNAME: process.env.ADMIN_USERNAME || 'admin',
  PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  
  // Session 配置
  SESSION_COOKIE_NAME: 'admin_session',
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24小时
  
  // 白名单路由（不需要验证的页面）
  WHITELIST_PATHS: [
    '/admin/login',
    '/api/admin/auth/login',
    '/api/admin/auth/logout'
  ]
}

// 生成简单的session token
function generateSessionToken(): string {
  return Buffer.from(Date.now().toString() + Math.random().toString()).toString('base64')
}

// 验证session token
function validateSessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const timestamp = Number.parseInt(decoded.substring(0, 13))
    const now = Date.now()
    
    // 检查token是否过期
    return (now - timestamp) < ADMIN_CONFIG.SESSION_DURATION
  } catch {
    return false
  }
}

// 管理后台认证中间件
export function adminAuthMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 检查是否为管理后台路径
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  // 检查白名单路径
  if (ADMIN_CONFIG.WHITELIST_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // 检查session
  const sessionToken = request.cookies.get(ADMIN_CONFIG.SESSION_COOKIE_NAME)?.value
  
  if (!sessionToken || !validateSessionToken(sessionToken)) {
    // 重定向到登录页面
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

// 验证管理员凭据
export function verifyAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_CONFIG.USERNAME && password === ADMIN_CONFIG.PASSWORD
}

// 创建管理员session
export function createAdminSession(): string {
  return generateSessionToken()
}

// 验证管理员session
export function verifyAdminSession(token: string): boolean {
  return validateSessionToken(token)
}

export { ADMIN_CONFIG } 