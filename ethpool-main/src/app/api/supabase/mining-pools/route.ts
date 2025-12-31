import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取挖矿池列表...')

    // 查询挖矿池数据
    const { data: pools, error } = await supabase
      .from('mining_pools')
      .select('*')
      .eq('status', 'active')
      .order('id', { ascending: true })

    if (error) {
      console.error('❌ 获取挖矿池失败:', error)
      return NextResponse.json(
        { success: false, error: '获取挖矿池失败' },
        { status: 500 }
      )
    }

    console.log('✅ 获取挖矿池成功，共', pools?.length || 0, '个池子')

    return NextResponse.json({
      success: true,
      data: pools || [],
      count: pools?.length || 0
    })

  } catch (error) {
    console.error('❌ 获取挖矿池API错误:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json(
      { success: false, error: '服务器内部错误: ' + errorMessage },
      { status: 500 }
    )
  }
}

