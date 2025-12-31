import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get('wallet_address')

    if (!wallet_address) {
      return NextResponse.json({ 
        success: false, 
        error: '地址参数缺失' 
      }, { status: 400 })
    }

    console.log('🔍 检查用户首次授权状态:', wallet_address)

    // 查询用户信息
    const { data: userData, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, first_approved_at')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      console.error('用户查询失败:', userError)
      return NextResponse.json({ 
        success: false, 
        error: `用户不存在，地址: ${wallet_address}` 
      }, { status: 404 })
    }

    // 检查是否已经首次授权
    const hasReceivedFirstReward = !!userData.first_approved_at

    console.log('📊 用户首次授权状态:', {
      wallet_address,
      hasReceivedFirstReward,
      first_approved_at: userData.first_approved_at
    })

    return NextResponse.json({
      success: true,
      data: {
        wallet_address,
        hasReceivedFirstReward,
        first_approved_at: userData.first_approved_at
      }
    })

  } catch (error) {
    console.error('❌ 检查首次授权状态失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "未知错误" || '检查首次授权状态失败' 
    }, { status: 500 })
  }
}







