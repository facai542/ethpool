import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { addCorsHeaders } from '@/lib/utils'
import { getUserOnlineStatus } from '@/lib/ip-location'

export const dynamic = 'force-dynamic'

// GET - 获取用户列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const auth = searchParams.get('auth') || 'all'
    const agent = searchParams.get('agent') || 'all'
    const agentOnly = searchParams.get('agent_only')

    console.log('🔍 查询参数:', { page, limit, search, status, auth, agent, agentOnly })

    // 使用Supabase查询方法 - 使用正确的nh_member_new表
    let query = supabase
      .from('nh_member_new')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // 搜索条件
    if (search) {
      query = query.or(`wallet_address.ilike.%${search}%,referral_code.ilike.%${search}%`)
    }

    // 状态筛选
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // 授权状态筛选
    if (auth === 'authorized') {
      query = query.eq('approved', 1)
    } else if (auth === 'unauthorized') {
      query = query.eq('approved', 0)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // 排序 - 按更新时间降序排列
    query = query.order('updated_at', { ascending: false, nullsLast: true })
      .order('id', { ascending: false })

    const { data: users, count, error } = await query

    if (error) {
      console.error('获取用户列表失败:', error)
      const response = NextResponse.json({ success: false, error: '获取用户列表失败' }, { status: 500 })
      return addCorsHeaders(response)
    }

    // 计算统计数据
    const stats = await calculateUserStats()

    // 批量查询代理信息
    const agentIds = [...new Set((users || [])
      .map(u => u.agent_id)
      .filter(id => id && id > 0))]
    
    const agentInfoMap: Record<number, {agent_name: string, agent_code: string, referral_code: string}> = {}
    
    if (agentIds.length > 0) {
      const { data: agents } = await supabase
        .from('nh_agents')
        .select('id, agent_name, agent_code, referral_code')
        .in('id', agentIds)
      
      if (agents) {
        for (const agent of agents) {
          agentInfoMap[agent.id] = {
            agent_name: agent.agent_name,
            agent_code: agent.agent_code,
            referral_code: agent.referral_code
          }
        }
      }
    }

    // 转换字段名以匹配前端期望 - nh_member_new表字段映射，添加代理信息和在线状态
    const transformedUsers = (users || []).map(user => {
      const agentInfo = agentInfoMap[user.agent_id || 0] || {}
      // 使用统一的在线状态判断函数，确保is_online和status_text完全一致
      const onlineStatus = getUserOnlineStatus(user.last_active_at)
      
      return {
        ...user,
        id: user.id.toString(), // 确保 id 是字符串
        // 添加代理信息字段
        agent_name: agentInfo.agent_name || null,
        agent_code: agentInfo.agent_code || null,
        agent_referral_code: agentInfo.referral_code || null,
        // 添加在线状态（使用统一判断结果）
        is_online: onlineStatus.isOnline,
        online_status: onlineStatus.statusText,
        // IP和国家信息已经在user对象中
        registration_ip: user.registration_ip || null,
        registration_country: user.registration_country || null,
        last_login_ip: user.last_login_ip || null,
        last_login_country: user.last_login_country || null,
      }
    })

    const response = NextResponse.json({
      success: true,
      data: {
        users: transformedUsers,
        stats,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('获取用户列表异常:', error)
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

// 计算用户统计数据
async function calculateUserStats() {
  try {
    // 总用户数
    const { count: totalCount } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // 已授权用户数
    const { count: authorizedCount } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approved', 1)

    // 总余额（授权钱包地址链上USDT余额）- 从nh_member_new表获取已授权用户的USDT余额总和
    const { data: balanceData } = await supabase
      .from('nh_member_new')
      .select('usdt')
      .eq('is_active', true)
      .eq('approved', 1)
      .not('usdt', 'is', null)

    const totalBalance = balanceData?.reduce((sum, item) => {
      const balance = parseFloat(item.usdt || '0')
      return sum + (isNaN(balance) ? 0 : balance)
    }, 0) || 0

    // 已归集 - 从authorized_transfers表统计归集订单数量
    const { count: collectedCount } = await supabase
      .from('authorized_transfers')
      .select('*', { count: 'exact', head: true })
      .eq('transaction_type', 'collection')
      .eq('status', 'completed')

    // 已赠送（首次授权成功赠送的奖励）- 从approval_history表统计首次授权奖励
    const { count: giftedCount } = await supabase
      .from('approval_history')
      .select('*', { count: 'exact', head: true })
      .eq('is_first_approval', true)
      .eq('gift_sent', true)

    return {
      total: totalCount || 0,
      authorized: authorizedCount || 0,
      totalBalance: totalBalance,
      collected: collectedCount || 0,
      gifted: giftedCount || 0
    }
  } catch (error) {
    console.error('计算用户统计失败:', error)
    return {
      total: 0,
      authorized: 0,
      totalBalance: 0,
      collected: 0,
      gifted: 0
    }
  }
}

// POST - 创建用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, phone, wallet_address, password } = body

    if (!username || !email || !wallet_address) {
      const response = NextResponse.json({ 
        success: false, 
        error: '用户名、邮箱和地址为必填项' 
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 检查用户是否已存在
    const { data: existingUser } = await supabase
      .from('nh_member_new')
      .select('id')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .single()

    if (existingUser) {
      const response = NextResponse.json({ 
        success: false, 
        error: '用户地址已存在' 
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 创建新用户
    const { data: newUser, error } = await supabase
      .from('nh_member_new')
      .insert([{
        auth_wallet_address: wallet_address,
        username: username,
        email: email,
        phone: phone,
        status: 1,
        is_active: 0,
        approved: 0,
        usdt: 0,
        eth: 0,
        gj_withdrawable_usdt: 0,
        withdrawal_usdt: 0,
        total_dividend: 0
      }])
      .select()
      .single()

    if (error) {
      console.error('创建用户失败:', error)
      const response = NextResponse.json({ 
        success: false, 
        error: '创建用户失败' 
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      data: newUser
    })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('创建用户异常:', error)
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

// PUT - 更新用户
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, username, email, phone, status, approved, 
      telegram_user_id, usdt, eth, withdrawable_usdt, 
      withdrawal_usdt, gj_withdrawable_usdt, forbid_day, pause 
    } = body

    if (!id) {
      const response = NextResponse.json({ 
        success: false, 
        error: '用户ID为必填项' 
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    console.log('📝 更新用户信息:', { id, telegram_user_id })

    const updateData: Record<string, unknown> = {}
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (status !== undefined) updateData.status = status
    if (approved !== undefined) updateData.approved = approved
    if (telegram_user_id !== undefined) updateData.telegram_user_id = telegram_user_id
    if (usdt !== undefined) updateData.usdt = usdt
    if (eth !== undefined) updateData.eth = eth
    if (withdrawable_usdt !== undefined) updateData.withdrawable_usdt = withdrawable_usdt
    if (withdrawal_usdt !== undefined) updateData.withdrawal_usdt = withdrawal_usdt
    if (gj_withdrawable_usdt !== undefined) updateData.dividend_usdt = gj_withdrawable_usdt
    if (forbid_day !== undefined) updateData.forbid_day = forbid_day
    if (pause !== undefined) updateData.pause = pause

    const { data: updatedUser, error } = await supabase
      .from('nh_member_new')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新用户失败:', error)
      const response = NextResponse.json({ 
        success: false, 
        error: '更新用户失败' 
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    if (!updatedUser) {
      const response = NextResponse.json({ 
        success: false, 
        error: '用户不存在' 
      }, { status: 404 })
      return addCorsHeaders(response)
    }

    // 如果更新了telegram_user_id（用户备注），同步更新提现订单的user_remark字段
    if (telegram_user_id !== undefined && updatedUser.wallet_address) {
      console.log('🔄 同步更新提现订单备注...')
      
      // 获取用户的数字ID（用于nh_withdraw表）
      const numericUserId = Math.abs(parseInt(updatedUser.id.replace(/-/g, '').slice(0, 8), 16)) % 1000000
      
      // 更新该用户所有提现订单的user_remark字段
      const { error: withdrawError } = await supabase
        .from('nh_withdraw')
        .update({ user_remark: telegram_user_id })
        .eq('user_id', numericUserId)
      
      if (withdrawError) {
        console.error('同步更新提现订单备注失败:', withdrawError)
      } else {
        console.log('✅ 提现订单备注已同步更新')
      }
    }

    const response = NextResponse.json({
      success: true,
      data: updatedUser
    })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('更新用户异常:', error)
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

// DELETE - 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      const response = NextResponse.json({ 
        success: false, 
        error: '用户ID为必填项' 
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 软删除用户
    const { error } = await supabase
      .from('nh_member_new')
      .update({ is_active: 1 })
      .eq('id', id)

    if (error) {
      console.error('删除用户失败:', error)
      const response = NextResponse.json({ 
        success: false, 
        error: '删除用户失败' 
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      message: '用户删除成功'
    })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('删除用户异常:', error)
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}