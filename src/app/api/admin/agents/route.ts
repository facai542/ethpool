import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取代理列表
export async function GET(request: NextRequest) {
  try {
    const { data: agents, error } = await supabase
      .from('nh_agents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取代理列表失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '获取代理列表失败' 
      }, { status: 500 })
    }

    // 格式化代理数据，添加邀请链接
    const formattedAgents = agents.map(agent => ({
      ...agent,
      invite_link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}?ref=${agent.referral_code}`
    }))

    return NextResponse.json({
      success: true,
      agents: formattedAgents
    })
  } catch (error) {
    console.error('获取代理列表错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 添加代理
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_code, agent_name, user_address, password, level, commission_rate } = body

    if (!agent_code || !agent_name || !password) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必填字段' 
      }, { status: 400 })
    }

    // 检查代理账号是否已存在
    const { data: existing } = await supabase
      .from('nh_agents')
      .select('id')
      .eq('agent_code', agent_code)
      .single()

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: '代理账号已存在' 
      }, { status: 400 })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 插入代理
    const { data: agent, error } = await supabase
      .from('nh_agents')
      .insert({
        agent_code,
        agent_name,
        user_address: user_address || '',
        password: hashedPassword,
        level: level || 1,
        status: 'active',
        commission_rate: commission_rate || 0.05,
        total_invites: 0,
        valid_invites: 0,
        total_commission: 0,
        pending_commission: 0
      })
      .select()
      .single()

    if (error) {
      console.error('添加代理失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '添加代理失败' 
      }, { status: 500 })
    }

    // 添加邀请链接
    const agentWithLink = {
      ...agent,
      invite_link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}?ref=${agent.referral_code}`
    }

    return NextResponse.json({
      success: true,
      agent: agentWithLink
    })
  } catch (error) {
    console.error('添加代理错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 更新代理
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, agent_name, user_address, level, commission_rate, status } = body

    if (!agentId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少代理ID' 
      }, { status: 400 })
    }

    const updateData: any = {}
    if (agent_name !== undefined) updateData.agent_name = agent_name
    if (user_address !== undefined) updateData.user_address = user_address
    if (level !== undefined) updateData.level = level
    if (commission_rate !== undefined) updateData.commission_rate = commission_rate
    if (status !== undefined) updateData.status = status

    const { error } = await supabase
      .from('nh_agents')
      .update(updateData)
      .eq('id', agentId)

    if (error) {
      console.error('更新代理失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '更新代理失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新代理错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 删除代理
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少代理ID' 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('nh_agents')
      .delete()
      .eq('id', Number.parseInt(id))

    if (error) {
      console.error('删除代理失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '删除代理失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除代理错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

