import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId, forbidden } = await request.json()

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少用户ID' 
      }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    console.log(`🔒 ${forbidden ? '禁止' : '允许'}用户收益:`, userId)

    // 更新用户的收益权限
    const { error } = await supabase
      .from('nh_member_new')
      .update({ earnings_forbidden: forbidden })
      .eq('id', userId)

    if (error) {
      console.error('更新收益权限失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '更新失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${forbidden ? '禁止' : '允许'}收益成功`
    })
  } catch (error) {
    console.error('操作失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

