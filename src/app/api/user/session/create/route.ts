import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getClientIP, getIPLocation } from '@/lib/ip-location'
import crypto from 'crypto'

// 动态路由配置
export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      walletAddress, 
      walletType = 'metamask', 
      networkId = 56,
      userAgent,
      ipAddress 
    } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: '钱包地址不能为空' },
        { status: 400 }
      )
    }

    console.log('🔐 创建用户会话:', { walletAddress, walletType, networkId })

    // 1. 查找用户 - 优先查询 nh_member_new 表
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address')
      .eq('wallet_address', walletAddress)
      .eq('is_active', true)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 2. 生成数字用户ID（从UUID转换）
    const numericUserId = typeof user.id === 'string' && user.id.includes('-')
      ? Math.abs(parseInt(user.id.replace(/-/g, '').slice(0, 8), 16)) % 1000000
      : user.id
    
    console.log('🔍 用户ID转换:', { uuid: user.id, numeric: numericUserId })
    
    // 3. 生成会话令牌
    const sessionToken = crypto.randomBytes(32).toString('hex')
    
    // 4. 设置过期时间（7天）
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // 5. 先停用该用户的所有其他会话
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', numericUserId)

    // 6. 创建新会话
    const sessionData: Record<string, string | number> = {
      user_id: numericUserId, // 使用数字ID
      wallet_address: user.wallet_address || walletAddress,
      session_token: sessionToken,
      wallet_type: walletType,
      network_id: networkId,
      expires_at: expiresAt.toISOString()
    }
    
    // 只在有值时添加可选字段
    if (userAgent) sessionData.user_agent = userAgent
    if (ipAddress) {
      sessionData.ip_wallet_address = ipAddress
      sessionData.ip_address = ipAddress  // 使用inet类型的字段
    }
    
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert(sessionData)
      .select()
      .single()
    
    // 更新用户的最后登录IP和最后活动时间
    if (!sessionError && session) {
      const clientIP = getClientIP(request)
      const ipLocation = clientIP ? await getIPLocation(clientIP) : null
      
      await supabase
        .from('nh_member_new')
        .update({
          last_login_ip: clientIP,
          last_login_country: ipLocation?.country || null,
          last_active_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    if (sessionError) {
      console.error('❌ 创建会话失败:', sessionError)
      return NextResponse.json(
        { error: '创建会话失败' },
        { status: 500 }
      )
    }

    console.log('✅ 会话创建成功:', session.id)

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        sessionToken: sessionToken,
        expiresAt: expiresAt.toISOString(),
        user: {
          id: user.id,
          wallet_address: user.wallet_address || walletAddress,
          authAddress: user.wallet_address || walletAddress
        }
      }
    })

  } catch (error) {
    console.error('❌ 创建会话异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

