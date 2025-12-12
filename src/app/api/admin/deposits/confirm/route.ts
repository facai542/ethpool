import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 确认或拒绝充值订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, action, adminNote } = body

    if (!orderId || !action) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: '无效的操作类型' }, { status: 400 })
    }

    // 获取订单信息 - 只选择需要的字段
    const { data: order, error: orderError } = await supabase
      .from('deposit_history')
      .select('id, wallet_address, usdt_amount, amount, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: '订单不存在' }, { status: 404 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ success: false, error: '订单状态不允许操作' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'completed' : 'failed'
    const now = new Date().toISOString()

    // 构建更新数据 - 只包含存在的字段
    const updateData: any = {
      status: newStatus
    }

    // 只更新存在的字段
    // 检查并更新 confirmed_at（如果字段存在）
    // 检查并更新 updated_at（如果字段存在）
    // admin_note 字段不存在，跳过

    // 更新订单状态
    const { error: updateError } = await supabase
      .from('deposit_history')
      .update(updateData)
      .eq('id', orderId)

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('更新订单状态失败:', updateError)
      }
      return NextResponse.json({ 
        success: false, 
        error: `更新订单失败: ${updateError.message}` 
      }, { status: 500 })
    }

    // 如果是确认充值，更新用户余额
    if (action === 'approve') {
      // 获取用户信息
      const { data: user, error: userError } = await supabase
        .from('nh_member_new')
        .select('id, usdt, withdrawable_usdt')
        .eq('wallet_address', order.wallet_address)
        .single()

      if (user && !userError) {
        const currentUsdt = parseFloat(user.usdt?.toString() || '0')
        const currentWithdrawable = parseFloat(user.withdrawable_usdt?.toString() || '0')
        const depositAmount = parseFloat((order.usdt_amount || order.amount || '0').toString())

        if (depositAmount <= 0) {
          return NextResponse.json({ 
            success: false, 
            error: '充值金额无效' 
          }, { status: 400 })
        }

        // 更新用户余额
        const { error: balanceError } = await supabase
          .from('nh_member_new')
          .update({
            usdt: currentUsdt + depositAmount,
            withdrawable_usdt: currentWithdrawable + depositAmount,
            updated_at: now
          })
          .eq('id', user.id)

        if (balanceError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('更新用户余额失败:', balanceError)
          }
          // 回滚订单状态
          await supabase
            .from('deposit_history')
            .update({ status: 'pending' })
            .eq('id', orderId)
          return NextResponse.json({ 
            success: false, 
            error: `更新用户余额失败: ${balanceError.message}` 
          }, { status: 500 })
        }

        // 记录资金变动日志到 finance_orders 表
        const numericUserId = typeof user.id === 'string' && user.id.includes('-') 
          ? parseInt(user.id.replace(/-/g, '').slice(0, 8), 16) % 1000000
          : user.id

        await supabase.from('finance_orders').insert({
          user_id: numericUserId,
          user_uuid: user.id,
          order_no: `DEPOSIT_CONFIRM_${Date.now()}`,
          method_id: 1,
          type: 'deposit',
          amount: depositAmount.toString(),
          actual_amount: depositAmount.toString(),
          fee: 0,
          address: order.wallet_address,
          status: 1, // 已完成
          create_time: Math.floor(Date.now() / 1000),
          update_time: Math.floor(Date.now() / 1000),
          remark: `充值确认 - 金额: ${depositAmount} USDT${adminNote ? `, 备注: ${adminNote}` : ''}`
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: '用户不存在' 
        }, { status: 404 })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: action === 'approve' ? '充值已确认，用户余额已更新' : '充值已拒绝'
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('API错误:', error)
    }
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误' 
    }, { status: 500 })
  }
}
