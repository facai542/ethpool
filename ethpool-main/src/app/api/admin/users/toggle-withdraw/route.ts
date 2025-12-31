import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, forbidden } = await request.json()

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少用户ID' 
      }, { status: 400 })
    }

    console.log(`🔒 ${forbidden ? '禁止' : '允许'}用户提现:`, userId)

    // 更新用户的提现权限
    const { error } = await supabase
      .from('nh_member_new')
      .update({ withdraw_forbidden: forbidden })
      .eq('id', userId)

    if (error) {
      console.error('更新提现权限失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '更新失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${forbidden ? '禁止' : '允许'}提现成功`
    })
  } catch (error) {
    console.error('操作失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

