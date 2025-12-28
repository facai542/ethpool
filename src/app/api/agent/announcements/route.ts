import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: 获取代理发送的公告列表
export async function GET(request: NextRequest) {
  try {
    const agentToken = request.cookies.get('agent_token')?.value
    
    if (!agentToken) {
      return NextResponse.json({
        success: false,
        error: '未认证'
      }, { status: 401 })
    }

    // 获取代理信息
    const { data: agent, error: agentError } = await supabase
      .from('nh_member_new')
      .select('id')
      .eq('auth_wallet_address', agentToken)
      .eq('status', 1)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({
        success: false,
        error: '代理信息获取失败'
      }, { status: 404 })
    }

    // 获取代理发送的公告（从agent_announcements表或相应表）
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select(`
        id,
        title,
        content,
        type,
        target_users,
        create_time,
        status,
        created_by
      `)
      .eq('created_by', agent.id)
      .eq('scope', 'agent') // 标识为代理公告
      .order('create_time', { ascending: false })

    if (error) {
      console.error('获取公告列表失败:', error)
      // 如果表不存在，返回空数组
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    return NextResponse.json({
      success: true,
      data: announcements || []
    })

  } catch (error) {
    console.error('获取代理公告失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器错误'
    }, { status: 500 })
  }
}

// POST: 发送公告给代理线下用户
export async function POST(request: NextRequest) {
  try {
    const agentToken = request.cookies.get('agent_token')?.value
    
    if (!agentToken) {
      return NextResponse.json({
        success: false,
        error: '未认证'
      }, { status: 401 })
    }

    // 获取代理信息
    const { data: agent, error: agentError } = await supabase
      .from('nh_member_new')
      .select('id, agent_level')
      .eq('auth_wallet_address', agentToken)
      .eq('status', 1)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({
        success: false,
        error: '代理信息获取失败'
      }, { status: 404 })
    }

    const { title, content, type, targetUsers } = await request.json()

    if (!title || !content || !targetUsers || targetUsers.length === 0) {
      return NextResponse.json({
        success: false,
        error: '请填写完整的公告信息'
      }, { status: 400 })
    }

    // 验证目标用户是否都是该代理的下级
    const { data: validUsers, error: validateError } = await supabase
      .from('nh_member_new')
      .select('id')
      .eq('parent_id', agent.id)
      .in('id', targetUsers)

    if (validateError || !validUsers || validUsers.length !== targetUsers.length) {
      return NextResponse.json({
        success: false,
        error: '只能向您的代理用户发送公告'
      }, { status: 403 })
    }

    const currentTime = new Date().toISOString()

    // 创建公告记录
    const { data: announcement, error: createError } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        type: type || 'info',
        target_users: targetUsers,
        scope: 'agent',
        created_by: agent.id,
        create_time: currentTime,
        status: 1
      })
      .select()
      .single()

    if (createError) {
      console.error('创建公告失败:', createError)
      
      // 如果announcements表不存在，使用备用方案
      if (createError.message?.includes('relation') || createError.message?.includes('table')) {
        // 记录到agent_logs表作为备用
        const { error: logError } = await supabase
          .from('nh_logs')
          .insert({
            user_id: agent.id,
            type: 'agent_announcement',
            content: JSON.stringify({
              title,
              content,
              type,
              targetUsers,
              timestamp: currentTime
            }),
            create_time: currentTime
          })

        if (logError) {
          console.error('记录公告失败:', logError)
        }

        return NextResponse.json({
          success: true,
          message: '公告发送成功（已记录）',
          data: {
            id: Date.now(),
            title,
            content,
            type,
            target_users: targetUsers,
            create_time: currentTime
          }
        })
      }

      return NextResponse.json({
        success: false,
        error: '公告发送失败'
      }, { status: 500 })
    }

    // 为每个目标用户创建通知记录
    const notifications = targetUsers.map((userId: number) => ({
      user_id: userId,
      title,
      content,
      type: 'agent_announcement',
      announcement_id: announcement.id,
      create_time: currentTime,
      status: 0 // 未读
    }))

    // 批量插入通知
    const { error: notifyError } = await supabase
      .from('user_notifications')
      .insert(notifications)

    if (notifyError) {
      console.error('创建通知失败:', notifyError)
      // 即使通知创建失败，公告依然算成功发送
    }

    return NextResponse.json({
      success: true,
      message: '公告发送成功',
      data: announcement
    })

  } catch (error) {
    console.error('发送代理公告失败:', error)
    return NextResponse.json({
      success: false,
      error: '发送失败'
    }, { status: 500 })
  }
} 
 
 