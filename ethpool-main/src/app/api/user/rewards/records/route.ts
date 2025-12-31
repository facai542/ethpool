import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 获取用户收益记录列表
 * @param wallet_address 钱包地址
 * @param page 页码（从1开始）
 * @param limit 每页数量
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const wallet_address = searchParams.get('wallet_address')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!wallet_address) {
      return NextResponse.json({
        success: false,
        error: '缺少钱包地址参数'
      }, { status: 400 })
    }

    console.log(`📊 查询用户收益记录: ${wallet_address}, 第${page}页`)

    // 1. 查询用户ID
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('id')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
    }

    // 2. 查询总记录数
    const { count, error: countError } = await supabase
      .from('reward_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')

    if (countError) {
      console.error('查询记录总数失败:', countError)
      return NextResponse.json({
        success: false,
        error: countError.message
      }, { status: 500 })
    }

    // 3. 查询分页记录
    const offset = (page - 1) * limit
    const { data: records, error: recordsError } = await supabase
      .from('reward_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (recordsError) {
      console.error('查询收益记录失败:', recordsError)
      return NextResponse.json({
        success: false,
        error: recordsError.message
      }, { status: 500 })
    }

    // 4. 格式化返回数据
    const formattedRecords = (records || []).map(record => ({
      id: record.id,
      reward_type: record.reward_type,
      reward_type_label: record.reward_type === 'first_authorization' ? '首次授权奖励' : '定时奖励',
      amount_usdt: parseFloat(record.amount_usdt),
      amount_eth: parseFloat(record.amount_eth),
      eth_price: parseFloat(record.eth_price_usdt),
      wallet_balance_usdt: record.wallet_balance_usdt ? parseFloat(record.wallet_balance_usdt) : null,
      reward_percentage: record.reward_percentage ? parseFloat(record.reward_percentage) : null,
      created_at: record.created_at,
      processed_at: record.processed_at,
      metadata: record.metadata
    }))

    return NextResponse.json({
      success: true,
      data: {
        records: formattedRecords,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('查询收益记录异常:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

