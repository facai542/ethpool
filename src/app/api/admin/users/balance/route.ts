import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { addCorsHeaders } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userAddress, balanceType, operation, amount, adminAddress, reason } = body

    // 验证必需参数
    if (!userId || !balanceType || !operation || amount === undefined) {
      const response = NextResponse.json({
        success: false,
        error: '缺少必需参数'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 验证操作类型
    if (!['add', 'subtract', 'set'].includes(operation)) {
      const response = NextResponse.json({
        success: false,
        error: '无效的操作类型'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 验证余额类型 - 适配 nh_member_new 表字段
    const validBalanceTypes = ['usdt', 'withdrawable_usdt', 'eth', 'a_eth', 'dividend_usdt']
    if (!validBalanceTypes.includes(balanceType)) {
      const response = NextResponse.json({
        success: false,
        error: '无效的余额类型'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 验证金额
    const adjustAmount = Number.parseFloat(amount)
    if (isNaN(adjustAmount) || adjustAmount < 0) {
      const response = NextResponse.json({
        success: false,
        error: '无效的金额'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 获取用户当前数据
    const { data: userData, error: userError } = await supabase
      .from('nh_member_new')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('获取用户数据失败:', userError)
      const response = NextResponse.json({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
      return addCorsHeaders(response)
    }

    const currentBalance = userData[balanceType] || 0
    let newBalance = currentBalance

    // 计算新余额
    switch (operation) {
      case 'add':
        newBalance = currentBalance + adjustAmount
        break
      case 'subtract':
        newBalance = Math.max(0, currentBalance - adjustAmount) // 确保余额不为负数
        break
      case 'set':
        newBalance = adjustAmount
        break
    }

    // 更新用户余额
    const updateData = {
      [balanceType]: newBalance
    }

    const { error: updateError } = await supabase
      .from('nh_member_new')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('更新用户余额失败:', updateError)
      const response = NextResponse.json({
        success: false,
        error: '更新余额失败'
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    // 记录操作日志（可选）
    const logData = {
      user_id: userId,
      admin_wallet_address: adminAddress || 'system',
      operation: operation,
      balance_type: balanceType,
      amount: adjustAmount,
      previous_balance: currentBalance,
      new_balance: newBalance,
      reason: reason || '管理员调整',
      created_at: new Date().toISOString()
    }

    // 尝试插入日志（如果日志表存在）
    try {
      await supabase
        .from('admin_balance_logs')
        .insert([logData])
    } catch (logError) {
      console.warn('记录操作日志失败（表可能不存在）:', logError)
    }

    const response = NextResponse.json({
      success: true,
      message: '余额调整成功',
      data: {
        userId: userId,
        balanceType: balanceType,
        operation: operation,
        adjustAmount: adjustAmount,
        previousBalance: currentBalance,
        newBalance: newBalance
      }
    }, { status: 200 })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('余额调整失败:', error)
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}
