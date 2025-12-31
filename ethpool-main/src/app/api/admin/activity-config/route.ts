import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

// 获取活动配置
export async function GET(request: NextRequest) {
  try {
    const { data: activities, error } = await supabase
      .from('activity_config')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('获取活动配置失败: ' + error instanceof Error ? error.message : "未知错误")
    }

    return NextResponse.json({
      success: true,
      data: activities || []
    })

  } catch (error) {
    console.error('获取活动配置失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

// 创建或更新活动配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      name, 
      description, 
      standard_amount, 
      output_eth, 
      countdown_duration, 
      is_active 
    } = body

    if (!name || !standard_amount || !output_eth || !countdown_duration) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const activityData = {
      name,
      description: description || '',
      standard_amount: Number.parseFloat(standard_amount),
      output_eth: Number.parseFloat(output_eth),
      countdown_duration: Number.parseInt(countdown_duration),
      is_active: is_active === true,
      updated_at: new Date().toISOString()
    }

    let result
    if (id) {
      // 更新现有活动
      const { data, error } = await supabase
        .from('activity_config')
        .update(activityData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error('更新活动配置失败: ' + error instanceof Error ? error.message : "未知错误")
      }
      result = data
    } else {
      // 创建新活动
      const { data, error } = await supabase
        .from('activity_config')
        .insert([{
          ...activityData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        throw new Error('创建活动配置失败: ' + error instanceof Error ? error.message : "未知错误")
      }
      result = data
    }

    return NextResponse.json({
      success: true,
      message: id ? '活动配置更新成功' : '活动配置创建成功',
      data: result
    })

  } catch (error) {
    console.error('操作活动配置失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

// 删除活动配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少活动ID' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('activity_config')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error('删除活动配置失败: ' + error instanceof Error ? error.message : "未知错误")
    }

    return NextResponse.json({
      success: true,
      message: '活动配置删除成功'
    })

  } catch (error) {
    console.error('删除活动配置失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}




