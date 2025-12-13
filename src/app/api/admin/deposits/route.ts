import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取充值订单列表
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // 构建查询 - 只选择存在的字段
    let query = supabase
      .from('deposit_history')
      .select('id, member_id, wallet_address, usdt_amount, tx_hash, status, created_at, completed_at, approved_at, admin_approved, approved_by, notes', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: orders, error, count } = await query

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('获取充值订单失败:', error)
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // 映射字段：将数据库字段映射为前端期望的格式
    const mappedOrders = (orders || []).map(order => ({
      id: order.id,
      user_id: order.member_id?.toString() || '',
      wallet_address: order.wallet_address || '',
      amount: parseFloat(order.usdt_amount?.toString() || '0'),
      status: order.status || 'pending',
      tx_hash: order.tx_hash || undefined,
      created_at: order.created_at || '',
      updated_at: order.completed_at || order.approved_at || undefined,
      confirmed_at: order.status === 'completed' ? (order.completed_at || order.approved_at) : undefined,
      admin_note: order.notes || undefined
    }))

    // 获取统计数据 - 只选择存在的字段，限制数量
    const { data: allOrders } = await supabase
      .from('deposit_history')
      .select('status, usdt_amount, created_at')
      .limit(10000) // 限制查询数量以提升性能

    // 映射统计数据中的金额字段
    const mappedAllOrders = (allOrders || []).map(order => ({
      ...order,
      amount: parseFloat(order.usdt_amount?.toString() || '0')
    }))

    const stats = {
      total_orders: mappedAllOrders.length || 0,
      pending_orders: mappedAllOrders.filter(o => o.status === 'pending').length || 0,
      completed_orders: mappedAllOrders.filter(o => o.status === 'completed').length || 0,
      failed_orders: mappedAllOrders.filter(o => o.status === 'failed' || o.status === 'cancelled').length || 0,
      total_amount: mappedAllOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount || 0), 0) || 0,
      today_amount: mappedAllOrders.filter(o => {
        const today = new Date().toISOString().split('T')[0]
        const orderDate = o.created_at?.split('T')[0]
        return orderDate === today && o.status === 'completed'
      }).reduce((sum, o) => sum + (o.amount || 0), 0) || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        orders: mappedOrders,
        stats,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('API错误:', error)
    }
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
