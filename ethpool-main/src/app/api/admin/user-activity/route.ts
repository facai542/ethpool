import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// 设置用户活动
export async function POST(request: NextRequest) {
  try {
    // 移除所有管理员会话检查

    const body = await request.json()
    const { 
      user_id, 
      user_address, 
      activity_id, 
      standard_amount, 
      countdown_hours, 
      is_enabled 
    } = body

    console.log('📝 收到设置活动请求:', JSON.stringify(body, null, 2))

    // 验证必需参数
    if (!user_id || !user_address || !activity_id) {
      console.error('❌ 缺少必需参数:', { user_id, user_address, activity_id })
      return NextResponse.json({ 
        success: false, 
        error: `缺少必需参数: user_id=${!!user_id}, user_address=${!!user_address}, activity_id=${!!activity_id}` 
      }, { status: 400 })
    }

    if (!standard_amount || standard_amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: '活动金额必须大于0' 
      }, { status: 400 })
    }

    if (!countdown_hours || countdown_hours <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: '倒计时时间必须大于0' 
      }, { status: 400 })
    }

    // 计算过期时间
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + countdown_hours)

    // 将UUID转换为数字ID（如果user_id是UUID格式）
    let numericUserId = user_id
    if (typeof user_id === 'string' && user_id.includes('-')) {
      // UUID格式，转换为数字ID
      numericUserId = Math.abs(parseInt(user_id.replace(/-/g, '').slice(0, 8), 16)) % 1000000
      console.log('🔄 UUID转数字ID:', user_id, '->', numericUserId)
    }

    // 准备活动数据
    const activityData = {
      user_id: numericUserId, // 使用数字ID
      user_address,
      activity_id,
      standard_amount: Number.parseFloat(standard_amount),
      countdown_hours: Number.parseInt(countdown_hours),
      is_enabled: Boolean(is_enabled),
      expires_at: expiresAt.toISOString()
    }

    // 保存到Supabase数据库
    const { data, error } = await supabase
      .from('user_activities')
      .upsert(activityData, { 
        onConflict: 'user_id,user_address',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('保存活动数据失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '保存活动数据失败: ' + error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: '活动设置成功',
      data: data?.[0] || activityData
    })

  } catch (error) {
    console.error('设置用户活动失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 })
  }
}

// 获取用户活动
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('user_address')

    if (!userAddress) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少用户地址参数' 
      }, { status: 400 })
    }

    // 从Supabase数据库查询用户活动
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_address', userAddress)
      .eq('is_enabled', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('查询用户活动失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '查询用户活动失败: ' + error.message 
      }, { status: 500 })
    }

    // 如果没有找到记录，返回null
    if (!data || data.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: null
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0] // 返回第一条记录
    })

  } catch (error) {
    console.error('获取用户活动失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 })
  }
}