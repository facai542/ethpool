import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, activity_id } = body

    if (!address || !activity_id) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 从user_activities表查询该用户的活动
    const { data: activity, error: activityError } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_address', address)
      .eq('activity_id', activity_id)
      .eq('is_enabled', true)
      .single()

    if (activityError || !activity) {
      console.error('查询活动失败:', activityError)
      return NextResponse.json(
        { success: false, error: '活动不存在或已结束' },
        { status: 404 }
      )
    }

    // 检查活动是否已过期
    const now = new Date()
    const expiresAt = new Date(activity.expires_at)
    
    if (now.getTime() > expiresAt.getTime()) {
      return NextResponse.json(
        { success: false, error: '活动已结束' },
        { status: 400 }
      )
    }

    // 检查用户是否已参与
    const { data: existingParticipation } = await supabase
      .from('user_activity_participation')
      .select('*')
      .eq('user_address', address)
      .eq('activity_id', activity_id)
      .eq('status', 'active')
      .single()

    if (existingParticipation) {
      return NextResponse.json(
        { success: false, error: '您已参与此活动' },
        { status: 400 }
      )
    }

    // 记录用户参与
    const { data: participation, error: participationError } = await supabase
      .from('user_activity_participation')
      .insert([{
        user_address: address,
        activity_id: activity_id, // 直接使用字符串
        participated_at: new Date().toISOString(),
        status: 'active'
      }])
      .select()
      .single()

    if (participationError) {
      throw new Error('记录参与失败: ' + participationError.message)
    }

    // 发送Telegram通知
    try {
      // 查询用户信息
      const { data: user } = await supabase
        .from('nh_member_new')
        .select('id')
        .eq('wallet_address', address)
        .single()

      if (user) {
        // 插入Telegram通知队列
        await supabase
          .from('telegram_notification_queue')
          .insert({
            user_id: user.id,
            notification_type: 'user_participate_activity',
            notification_data: {
              userId: user.id,
              wallet_address: address,
              activityId: activity_id,
              standardAmount: activity.standard_amount,
              timestamp: new Date().toISOString()
            },
            is_sent: false,
            created_at: new Date().toISOString()
          })
        
        console.log('✅ 参与活动通知已加入队列')
      }
    } catch (notifError) {
      console.error('⚠️ 发送Telegram通知失败（非致命错误）:', notifError)
    }

    return NextResponse.json({
      success: true,
      message: '参与活动成功',
      data: participation
    })

  } catch (error) {
    console.error('参与活动失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}




