import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // 创建Supabase客户端
    let supabase
    try {
      supabase = createSupabaseServerClient()
    } catch (clientError) {
      console.error('创建Supabase客户端失败:', clientError)
      const errorMessage = clientError instanceof Error ? clientError.message : '未知错误'
      return NextResponse.json(
        { 
          success: false, 
          error: 'Supabase配置错误: ' + errorMessage,
          details: '请检查环境变量 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY'
        },
        { status: 500 }
      )
    }

    // 查询挖矿池数据
    // status 字段是 smallint 类型：1 = 激活，0 = 非激活
    console.log('开始查询挖矿池数据...')
    const { data: pools, error } = await supabase
      .from('mining_pools')
      .select('*')
      .eq('status', 1)
      .order('id', { ascending: true })

    if (error) {
      console.error('获取挖矿池失败 - Supabase错误:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // 检查是否是表不存在的问题
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            success: false, 
            error: '数据库表不存在',
            details: 'mining_pools 表可能尚未创建，请检查数据库迁移',
            code: error.code
          },
          { status: 500 }
        )
      }
      
      // 检查是否是权限问题
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        return NextResponse.json(
          { 
            success: false, 
            error: '数据库权限不足',
            details: '请检查 Supabase Service Role Key 是否正确配置',
            code: error.code
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { 
          success: false, 
          error: '获取挖矿池失败: ' + (error.message || '未知错误'),
          details: error.details || '',
          code: error.code || 'UNKNOWN'
        },
        { status: 500 }
      )
    }

    console.log(`成功获取 ${pools?.length || 0} 个挖矿池`)
    
    return NextResponse.json({
      success: true,
      data: pools || [],
      count: pools?.length || 0
    })

  } catch (error) {
    console.error('获取挖矿池API错误:', {
      message: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误: ' + errorMessage,
        type: error instanceof Error ? error.name : 'UnknownError'
      },
      { status: 500 }
    )
  }
}

