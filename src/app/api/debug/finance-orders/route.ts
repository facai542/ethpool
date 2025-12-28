import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('wallet_address')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('🔍 获取财务记录:', { userAddress, limit })

    let query = supabase
      .from('finance_orders')
      .select('*')
      .order('create_time', { ascending: false })
      .limit(limit)

    if (userAddress) {
      // 先通过地址查找用户UUID
      const { data: user, error: userError } = await supabase
        .from('nh_member_new')
        .select('id')
        .eq('wallet_address', userAddress.toLowerCase())
        .single()

      if (user && user.id) {
        // 使用UUID查询财务记录
        query = query.eq('user_uuid', user.id)
      } else {
        // 如果找不到用户，通过地址字段查询（兼容旧数据）
        query = query.eq('wallet_address', userAddress.toLowerCase())
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ 获取财务记录失败:', error)
      return NextResponse.json(
        { 
          success: false,
          error: '获取财务记录失败: ' + error.message
        },
        { status: 500 }
      )
    }

    console.log('✅ 财务记录获取成功:', data?.length || 0, '条记录')

    return NextResponse.json({
      success: true,
      data: {
        orders: data || [],
        total: data?.length || 0
      }
    })

  } catch (error) {
    console.error('❌ 财务记录API错误:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '服务器内部错误: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
  }
}
