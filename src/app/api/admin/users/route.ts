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
    const agentOnly = searchParams.get('agent_only') // 代理用户筛选参数

    // 使用Supabase查询方法 - 使用正确的nh_member_new表
    // 根据status参数决定查询活跃还是非活跃用户
    const isActiveFilter = status === 'inactive' ? false : true
    
    let query = supabase
      .from('nh_member_new')
      .select('*', { count: 'exact' })
      .eq('is_active', isActiveFilter)
    
    // 如果是代理用户，只显示该代理的下级用户
    if (agentOnly) {
      const agentId = Number.parseInt(agentOnly)
      if (!isNaN(agentId) && agentId > 0) {
        query = query.eq('agent_id', agentId)
      }
    }

    // 搜索条件 - 搜索钱包地址和推荐码
    if (search) {
      query = query.or(`wallet_address.ilike.%${search}%,referral_code.ilike.%${search}%,auth_wallet_address.ilike.%${search}%`)
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

    // 并行执行用户查询和统计查询
    const [usersResult, stats] = await Promise.all([
      query,
      calculateUserStats()
    ])

    const { data: users, count, error } = usersResult

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('获取用户列表失败:', error)
      }
      const response = NextResponse.json({ success: false, error: '获取用户列表失败' }, { status: 500 })
      return addCorsHeaders(response)
    }

    // 开发环境下记录查询结果
    if (process.env.NODE_ENV === 'development' && users) {
      console.log(`[用户列表查询] 找到 ${users.length} 个用户，总计 ${count || 0} 个`)
      if (users.length > 0) {
        const authorizedCount = users.filter(u => u.approved === 1 || u.approved === '1').length
        console.log('[用户列表查询] 授权统计:', {
          总用户数: users.length,
          已授权用户数: authorizedCount,
          未授权用户数: users.length - authorizedCount
        })
        console.log('[用户列表查询] 示例用户:', {
          id: users[0].id,
          wallet_address: users[0].wallet_address,
          approved: users[0].approved,
          last_approved_at: users[0].last_approved_at,
          onchain_usdt_balance: users[0].onchain_usdt_balance,
          balance_updated_at: users[0].balance_updated_at,
          is_active: users[0].is_active,
          created_at: users[0].created_at
        })
      }
    }

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

    // 转换字段名以匹配前端期望
    const transformedUsers = (users || []).map(user => {
      const agentInfo = agentInfoMap[user.agent_id || 0] || {}
      const onlineStatus = getUserOnlineStatus(user.last_active_at)
      
      // 确保 wallet_address 字段存在，如果不存在则使用 auth_wallet_address 或空字符串
      const walletAddress = user.wallet_address || user.auth_wallet_address || ''
      
      return {
        ...user,
        id: user.id.toString(),
        wallet_address: walletAddress, // 确保 wallet_address 字段始终存在
        agent_name: agentInfo.agent_name || null,
        agent_code: agentInfo.agent_code || null,
        agent_referral_code: agentInfo.referral_code || null,
        is_online: onlineStatus.isOnline,
        online_status: onlineStatus.statusText,
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
    if (process.env.NODE_ENV === 'development') {
      console.error('获取用户列表异常:', error)
    }
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

// 计算用户统计数据 - 使用并行查询优化性能
async function calculateUserStats() {
  try {
    // 并行执行所有统计查询
    const [
      totalResult,
      authorizedResult,
      balanceResult,
      collectedResult,
      giftedResult
    ] = await Promise.all([
      // 总用户数
      supabase
        .from('nh_member_new')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // 已授权用户数
      supabase
        .from('nh_member_new')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('approved', 1),
      
      // 总余额 - 计算所有已授权用户的链上USDT余额总和
      supabase
        .from('nh_member_new')
        .select('onchain_usdt_balance')
        .eq('is_active', true)
        .eq('approved', 1)
        .not('onchain_usdt_balance', 'is', null),
      
      // 已归集 - 从 authorized_transfers 表计算所有已完成的归集操作金额总和
      supabase
        .from('authorized_transfers')
        .select('amount')
        .or('transaction_type.eq.authorized_transfer,transaction_type.eq.collection')
        .eq('status', 'completed'),
      
      // 已赠送
      supabase
        .from('approval_history')
        .select('*', { count: 'exact', head: true })
        .eq('is_first_approval', true)
        .eq('gift_sent', true)
    ])

    // 计算总余额：所有已授权用户的链上USDT余额总和
    const totalBalance = balanceResult.data?.reduce((sum, item) => {
      const balance = parseFloat(String(item.onchain_usdt_balance || '0'))
      return sum + (isNaN(balance) ? 0 : balance)
    }, 0) || 0

    // 计算已归集总金额：从 authorized_transfers 表计算所有已完成的归集操作金额总和
    const collectedAmount = collectedResult.data?.reduce((sum, item) => {
      const amount = parseFloat(String(item.amount || '0'))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0) || 0

    return {
      total: totalResult.count || 0,
      authorized: authorizedResult.count || 0,
      totalBalance: totalBalance,
      collected: collectedAmount, // 改为返回总金额而不是记录数
      gifted: giftedResult.count || 0
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('计算用户统计失败:', error)
    }
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
      const numericUserId = Math.abs(parseInt(updatedUser.id.replace(/-/g, '').slice(0, 8), 16)) % 1000000
      
      await supabase
        .from('nh_withdraw')
        .update({ user_remark: telegram_user_id })
        .eq('user_id', numericUserId)
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

    // 软删除用户 - 设置为非活跃状态
    const { error } = await supabase
      .from('nh_member_new')
      .update({ is_active: false })
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
