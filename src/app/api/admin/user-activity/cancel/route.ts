import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { user_id, user_address } = await request.json()

    if (!user_id && !user_address) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少用户ID或地址' 
      }, { status: 400 })
    }

    console.log('🚫 取消用户活动:', { user_id, user_address })

    // 删除或禁用用户活动记录
    const { error } = await supabase
      .from('user_activities')
      .update({ 
        is_enabled: false,
        cancelled_at: new Date().toISOString()
      })
      .eq('user_address', user_address)

    if (error) {
      console.error('取消活动失败:', error)
      // 如果表不存在或更新失败，尝试删除
      const { error: deleteError } = await supabase
        .from('user_activities')
        .delete()
        .eq('user_address', user_address)
      
      if (deleteError) {
        console.error('删除活动失败:', deleteError)
        return NextResponse.json({ 
          success: false, 
          error: '取消活动失败' 
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: '活动已取消，用户端卡片将自动隐藏'
    })
  } catch (error) {
    console.error('取消活动错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

