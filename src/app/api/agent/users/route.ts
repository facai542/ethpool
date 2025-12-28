import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getUserOnlineStatus } from '@/lib/ip-location'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // 验证代理会话
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('agent_session')

    if (!sessionCookie) {
      return NextResponse.json({ 
        success: false, 
        error: '未登录或session已过期' 
      }, { status: 401 })
    }

    const agentSession = JSON.parse(sessionCookie.value)
    const agentId = agentSession.id

    console.log('📋 代理查询用户列表:', { agentId, referral_code: agentSession.referral_code })

    // 获取代理邀请的用户列表（修复：is_active=true表示正常用户）
    const { data: users, error: usersError } = await supabase
      .from('nh_member_new')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('获取用户列表失败:', usersError)
      return NextResponse.json({ 
        success: false, 
        error: '获取用户列表失败' 
      }, { status: 500 })
    }

    console.log(`✅ 获取到 ${users?.length || 0} 个用户`)

    // 格式化用户数据并添加在线状态和IP信息
    const formattedUsers = users?.map(user => {
      // 使用统一的在线状态判断函数，确保is_online和status_text完全一致
      const onlineStatus = getUserOnlineStatus(user.last_active_at)
      
      return {
        id: user.id,
        wallet_address: user.wallet_address,
        auth_wallet_address: user.auth_wallet_address,
        user_remark: user.user_remark || '',
        usdt: Number.parseFloat(user.usdt || '0'),
        chain_usdt_balance: Number.parseFloat(user.usdt || '0'),  // 链上USDT余额（就是usdt字段）
        withdrawable_usdt: Number.parseFloat(user.withdrawable_usdt || '0'),
        gj_withdrawable_usdt: Number.parseFloat(user.gj_withdrawable_usdt || '0'),
        withdrawal_usdt: Number.parseFloat(user.withdrawal_usdt || '0'),
        is_effective: user.is_effective || false,
        status: user.status || 0,
        created_at: user.created_at,
        telegram_user_id: user.telegram_user_id || '',
        approved: user.approved,
        // 添加在线状态（使用统一判断结果）
        is_online: onlineStatus.isOnline,
        online_status: onlineStatus.statusText,
        // 添加IP和国家信息
        registration_ip: user.registration_ip || null,
        registration_country: user.registration_country || null,
        last_login_ip: user.last_login_ip || null,
        last_login_country: user.last_login_country || null,
        last_active_at: user.last_active_at || null
      }
    }) || []

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length
    })
  } catch (error) {
    console.error('❌ 获取用户列表错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 更新用户备注和授权地址
export async function PATCH(request: NextRequest) {
  try {
    // 验证代理会话
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('agent_session')

    if (!sessionCookie) {
      return NextResponse.json({ 
        success: false, 
        error: '未登录或session已过期' 
      }, { status: 401 })
    }

    const agentSession = JSON.parse(sessionCookie.value)
    const agentId = agentSession.id

    const body = await request.json()
    const { userId, auth_wallet_address, user_remark } = body

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少用户ID' 
      }, { status: 400 })
    }

    console.log('📝 代理更新用户信息:', { userId, auth_wallet_address, user_remark })

    // 验证用户属于该代理
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, agent_id, wallet_address')
      .eq('id', userId)
      .single()

    if (userError || !user || user.agent_id !== agentId) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在或无权限' 
      }, { status: 403 })
    }

    // 更新用户信息（telegram_user_id字段用于存储用户备注）
    const updateData: any = {}
    if (auth_wallet_address !== undefined) updateData.auth_wallet_address = auth_wallet_address
    if (user_remark !== undefined) updateData.telegram_user_id = user_remark  // 使用telegram_user_id存储备注

    const { data: updatedUser, error: updateError } = await supabase
      .from('nh_member_new')
      .update(updateData)
      .eq('id', userId)
      .select('wallet_address')
      .single()

    if (updateError) {
      console.error('更新用户信息失败:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: '更新失败' 
      }, { status: 500 })
    }

    console.log('✅ 用户信息更新成功')

    // 如果更新了用户备注，同步更新提现订单的user_remark字段
    if (user_remark !== undefined && updatedUser.wallet_address) {
      console.log('🔄 同步更新提现订单备注...')
      
      // 获取用户的数字ID（用于nh_withdraw表）
      const numericUserId = Math.abs(parseInt(userId.replace(/-/g, '').slice(0, 8), 16)) % 1000000
      
      // 更新该用户所有提现订单的user_remark字段
      const { error: withdrawError } = await supabase
        .from('nh_withdraw')
        .update({ user_remark: user_remark })
        .eq('user_id', numericUserId)
      
      if (withdrawError) {
        console.error('同步更新提现订单备注失败:', withdrawError)
      } else {
        console.log('✅ 提现订单备注已同步更新')
      }
    }

    return NextResponse.json({
      success: true,
      message: '更新成功'
    })
  } catch (error) {
    console.error('❌ 更新用户信息错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

