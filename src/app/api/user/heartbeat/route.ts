import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * 用户心跳API - 更新用户活动时间
 * 前端定期调用此API以保持在线状态
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address } = body

    if (!wallet_address) {
      return NextResponse.json(
        { success: false, error: '缺少钱包地址' },
        { status: 400 }
      )
    }

    const currentTime = new Date().toISOString()

    // 更新用户的last_active_at
    const { error } = await supabase
      .from('nh_member_new')
      .update({
        last_active_at: currentTime
      })
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)

    if (error) {
      console.error('更新用户活动时间失败:', error)
      return NextResponse.json(
        { success: false, error: '更新失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet_address,
        last_active_at: currentTime
      }
    })
  } catch (error) {
    console.error('心跳更新异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}




