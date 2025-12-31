import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from './supabase'
import bcrypt from 'bcryptjs'
import Cookies from 'js-cookie'
import crypto from 'crypto'

// 检查管理员认证
export async function checkAdminAuth(email: string, password: string) {
  try {
    // 查询管理员 - 使用nh_admin表
    const { data: admin, error } = await supabase
      .from('nh_admin')
      .select('admin_id, admin_name, p_agentid, admin_password, role_id, status')
      .eq('admin_name', email) // admin_name字段用于用户名/邮箱
      .eq('status', 1)
      .single()

    if (error || !admin) {
      return { success: false, message: '管理员不存在或已被禁用' }
    }

    // 验证密码
    let isPasswordValid = false
    
    // 首先尝试直接比较（假设数据库中存储的是明文密码）
    if (admin.admin_password === password) {
      isPasswordValid = true
      console.log('✅ 密码直接匹配（明文）')
    } else {
      // 如果直接比较失败，尝试MD5加密后比较
      const inputPasswordMd5 = crypto.createHash('md5').update(password).digest('hex')
      isPasswordValid = (admin.admin_password === inputPasswordMd5)
      
      console.log('密码验证调试信息:')
      console.log('输入密码:', password)
      console.log('输入密码MD5:', inputPasswordMd5)
      console.log('数据库密码:', admin.admin_password)
      console.log('MD5密码匹配:', isPasswordValid)
    }
    
    if (!isPasswordValid) {
      return { success: false, message: '密码错误' }
    }

    // 更新最后登录时间
    await supabase
      .from('nh_admin')
      .update({ 
        last_login_time: new Date().toISOString()
      })
      .eq('admin_id', admin.admin_id)

    // 写入登录日志
    await supabase
      .from('nh_login_log')
      .insert({
        login_user: admin.admin_name,
        login_ip: 'localhost', // 可以从请求中获取真实IP
        login_area: '未知',
        login_user_agent: 'Web Browser',
        login_time: new Date().toISOString(),
        login_status: 1
      })

    return { 
      success: true, 
      admin: {
        id: admin.admin_id,
        name: admin.admin_name,
        role_id: admin.role_id,
        agent_id: admin.p_agentid
      }
    }
  } catch (error) {
    console.error('认证错误:', error)
    return { success: false, message: '认证失败' }
  }
}

// 获取管理员权限
export async function getAdminPermissions(adminId: number) {
  try {
    // 从nh_role表获取权限
    const { data: admin, error: adminError } = await supabase
      .from('nh_admin')
      .select('role_id')
      .eq('admin_id', adminId)
      .single()

    if (adminError || !admin) {
      console.error('获取管理员角色失败:', adminError)
      return []
    }

    const { data: roleData, error: roleError } = await supabase
      .from('nh_role')
      .select('role_id, role_name, role_node')
      .eq('role_id', admin.role_id)
      .single()

    if (roleError || !roleData) {
      console.error('获取角色权限失败:', roleError)
      return []
    }

    // 解析权限节点
    let permissions: string[] = []
    if (roleData.role_node && roleData.role_node !== '#') {
      permissions = roleData.role_node.split(',')
    } else if (roleData.role_node === '#') {
      // 超级管理员拥有所有权限
      return ['*']
    }

    return permissions || []
  } catch (error) {
    console.error('获取权限错误:', error)
    return []
  }
}

// 设置管理员登录状态
export function setAdminSession(admin: any) {
  const sessionData = {
    id: admin.id,
    name: admin.name,
    admin_name: admin.name, // 添加admin_name字段
    role_id: admin.role_id,
    agent_id: admin.agent_id || 0,
    email: admin.email || '',
    nickname: admin.nickname || admin.name,
    loginTime: new Date().toISOString()
  }

  // 设置Cookie（有效期7天）
  Cookies.set('admin_session', JSON.stringify(sessionData), { 
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return sessionData
}

// 创建管理员会话（服务器端）
export async function createAdminSession(admin: any) {
  try {
    const sessionData = {
      id: admin.id,
      name: admin.name,
      admin_name: admin.name,
      role_id: admin.role_id,
      agent_id: admin.agent_id || 0,
      email: admin.email || '',
      nickname: admin.nickname || admin.name,
      loginTime: new Date().toISOString()
    }

    // 生成会话令牌
    const token = crypto.randomBytes(32).toString('hex')
    
    return {
      success: true,
      token,
      session: sessionData
    }
  } catch (error) {
    console.error('创建会话失败:', error)
    return {
      success: false,
      error: '创建会话失败'
    }
  }
}

// 获取管理员登录状态
export function getAdminSession() {
  try {
    const sessionData = Cookies.get('admin_session')
    return sessionData ? JSON.parse(sessionData) : null
  } catch (error) {
    console.error('获取会话失败:', error)
    return null
  }
}

// 获取代理登录状态 (服务器端)
export function getAgentSession(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('admin_session')
    if (!sessionCookie) {
      return null
    }
    
    const sessionData = JSON.parse(sessionCookie.value)
    // 验证是否是代理用户
    if (sessionData && sessionData.agent_id > 0) {
      return sessionData
    }
    
    return null
  } catch (error) {
    console.error('获取代理会话失败:', error)
    return null
  }
}

// 清除管理员登录状态
export function clearAdminSession() {
  Cookies.remove('admin_session')
  Cookies.remove('admin_session_secure')
}

// 验证管理员权限中间件
export async function verifyAdminMiddleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('admin_session')
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    
    // 验证会话是否有效 - 使用正确的nh_admin表
    const { data: admin, error } = await supabase
      .from('nh_admin')
      .select('admin_id, admin_name, status')
      .eq('admin_id', session.id)
      .eq('status', 1)
      .single()

    if (error || !admin) {
      console.log('会话验证失败:', error?.message)
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_session')
      return response
    }

    console.log('✅ 会话验证成功:', admin.admin_name)
    return NextResponse.next()
  } catch (error) {
    console.error('验证中间件错误:', error)
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.delete('admin_session')
    return response
  }
}

// 格式化数字
export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化货币
export function formatCurrency(amount: number, currency = 'USDT'): string {
  return `${amount.toLocaleString()} ${currency}`
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
} 