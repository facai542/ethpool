import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAgentSession } from '@/lib/auth'
import { getUserOnlineStatus } from '@/lib/ip-location'

export const dynamic = 'force-dynamic'

// GET: 获取代理线下成员列表
export async function GET(request: NextRequest) {
  try {
    // 验证代理session
    const agentSession = getAgentSession(request)
    if (!agentSession) {
      return NextResponse.json({
        success: false,
        error: '未登录或session已过期'
      }, { status: 401 })
    }

    const agentId = agentSession.id

    // 获取代理信息
    const { data: agent, error: agentError } = await supabase
      .from('nh_agents')
      .select('id, agent_name, agent_code')
      .eq('id', agentId)
      .eq('status', 'active')
      .single()

    if (agentError || !agent) {
      return NextResponse.json({
        success: false,
        error: '代理信息获取失败'
      }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const level = searchParams.get('level')
    const offset = (page - 1) * limit

    // 构建查询条件 - 查询该代理邀请的用户
    const query = supabase
      .from('nh_member_new')
      .select(`
        id,
        wallet_address,
        auth_wallet_address,
        withdrawable_usdt,
        usdt,
        gj_withdrawable_usdt,
        status,
        created_at,
        updated_at,
        agent_id,
        is_effective,
        withdrawal_usdt,
        approved
      `)
      .eq('agent_id', agentId)  // 使用agent_id字段查询
      .eq('is_active', true)  // 只查询正常用户（true=未删除）
      .order('created_at', { ascending: false })

    if (level && level !== 'all') {
      // 这里可以根据需要添加层级过滤逻辑
    }

    // 获取总数
    const { count: totalCount } = await supabase
      .from('nh_member_new')
      .select('id', { count: 'exact' })
      .eq('agent_id', agentId)
      .eq('is_active', true)

    // 获取分页数据
    const { data: members, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('获取成员列表失败:', error)
      return NextResponse.json({
        success: false,
        error: '获取成员列表失败'
      }, { status: 500 })
    }

    // 格式化返回数据
    const formattedMembers = (members || []).map(member => {
      // 使用统一的在线状态判断函数，确保is_online和status_text完全一致
      const onlineStatus = getUserOnlineStatus(member.last_active_at)
      
      return {
        id: member.id,
        wallet_address: member.wallet_address || member.auth_wallet_address,
        auth_wallet_address: member.auth_wallet_address,
        balance: Number.parseFloat(member.withdrawable_usdt || '0'),
        staking_balance: Number.parseFloat(member.usdt || '0'),
        earnings: Number.parseFloat(member.gj_withdrawable_usdt || '0'),
        withdrawn: Number.parseFloat(member.withdrawal_usdt || '0'),
        status: member.status,
        is_authorized: member.approved === 1 || member.is_effective === 1,
        join_time: member.created_at,
        last_update: member.updated_at,
        level: 1,  // 代理的直接邀请用户都是一级
        // 添加在线状态（使用统一判断结果）
        is_online: onlineStatus.isOnline,
        online_status: onlineStatus.statusText,
        // 添加IP和国家信息
        registration_ip: member.registration_ip || null,
        registration_country: member.registration_country || null,
        last_login_ip: member.last_login_ip || null,
        last_login_country: member.last_login_country || null,
        last_active_at: member.last_active_at || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        members: formattedMembers,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        currentPage: page,
        pageSize: limit
      }
    })

  } catch (error) {
    console.error('代理成员列表API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 
 
 