import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 动态路由配置
export const dynamic = 'force-dynamic'

// 获取代理session
function getAgentSession(request: NextRequest) {
  const agentSessionCookie = request.cookies.get('agent_session')
  if (!agentSessionCookie) {
    return null
  }
  
  try {
    return JSON.parse(agentSessionCookie.value)
  } catch {
    return null
  }
}

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

    // 获取代理基础信息
    const { data: agent, error: agentError } = await supabase
      .from('nh_agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ 
        success: false, 
        error: '代理信息不存在' 
      }, { status: 404 })
    }

    // 构建邀请链接
    const invite_link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}?ref=${agent.referral_code}`

    // 获取邀请用户列表 - 修复：使用 nh_member 表而不是 nh_users 表
    const { data: invitedUsers, error: usersError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, auth_wallet_address, created_at, status, usdt, withdrawable_usdt, gj_withdrawable_usdt, is_effective, withdrawal_usdt')
      .eq('agent_id', agentId)  // 通过 agent_id 字段关联代理
      .eq('is_active', true)  // 只查询正常用户（true=未删除）
      .order('created_at', { ascending: false })

    if (usersError) {
      console.warn('获取邀请用户失败:', usersError)
    }

    // 格式化统计数据
    const stats = {
      agent_name: agent.agent_name,
      agent_code: agent.agent_code,
      referral_code: agent.referral_code,
      invite_link,
      total_invites: agent.total_invites || 0,
      valid_invites: agent.valid_invites || 0,
      total_commission: agent.total_commission || 0,
      commission_rate: agent.commission_rate || 0.05,
      status: agent.status,
      level: agent.level || 1
    }

    // 格式化邀请用户数据 - 修复字段映射
    const formattedUsers = (invitedUsers || []).map(user => ({
      id: user.id,
      user_wallet_address: user.wallet_address || user.auth_wallet_address,  // 使用正确的地址字段
      register_time: user.created_at,  // 使用 created_at 字段
      status: user.status === 1 ? 'active' : 'inactive',  // 根据状态判断
      total_deposit: Number.parseFloat(user.usdt || '0'),  // 质押金额作为充值金额
      current_balance: Number.parseFloat(user.withdrawable_usdt || '0') + Number.parseFloat(user.gj_withdrawable_usdt || '0'),  // 平台余额 + 收益余额
      is_authorized: user.is_effective === 1,  // 是否已verify
      earnings: Number.parseFloat(user.gj_withdrawable_usdt || '0'),  // 收益金额
      withdrawn: Number.parseFloat(user.withdrawal_usdt || '0')  // 已提现金额
    }))

    return NextResponse.json({
      success: true,
      stats,
      invitedUsers: formattedUsers
    })

  } catch (error) {
    console.error('代理dashboard API错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }, { status: 500 })
  }
} 
 