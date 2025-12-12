import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 动态路由配置
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, bindTime } = body

    if (!wallet_address) {
      return NextResponse.json(
        { success: false, error: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    console.log('🔄 绑定用户:', wallet_address)

    // 检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 查询用户失败:', checkError)
      return NextResponse.json(
        { success: false, error: '查询用户失败: ' + checkError.message },
        { status: 500 }
      )
    }

    if (existingUser) {
      console.log('✅ 用户已存在:', existingUser.id)
      return NextResponse.json({
        success: true,
        message: '用户已存在',
        data: {
          userId: existingUser.id,
          wallet_address: existingUser.wallet_address,
          isNew: false
        }
      })
    }

    // 创建新用户
    const currentTimeISO = new Date().toISOString()
    const { data: newUser, error: insertError } = await supabase
      .from('nh_member_new')
      .insert({
        wallet_address: wallet_address,
        referral_code: wallet_address.slice(-8), // 使用地址后8位作为邀请码
        is_active: true,
        approved: 0,
        created_at: currentTimeISO,
        updated_at: currentTimeISO
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ 创建用户失败:', insertError)
      return NextResponse.json(
        { success: false, error: '创建用户失败: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ 新用户创建成功:', newUser?.id)

    return NextResponse.json({
      success: true,
      message: '用户绑定成功',
      data: {
        userId: newUser?.id,
        wallet_address: wallet_address,
        isNew: true,
        inviteCode: wallet_address.slice(-8)
      }
    })

  } catch (error) {
    console.error('❌ 用户绑定API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误: ' + error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
} 