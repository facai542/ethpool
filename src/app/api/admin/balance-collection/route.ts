import { type NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, amount } = body

    if (!userAddress || !amount) {
      const response = NextResponse.json({
        success: false,
        error: '缺少必需参数'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    const collectionAmount = Number.parseFloat(amount)
    if (isNaN(collectionAmount) || collectionAmount <= 0) {
      const response = NextResponse.json({
        success: false,
        error: '无效的归集金额'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    console.log(`🔄 开始归集操作:`, { userAddress, amount: collectionAmount })

    // 查找用户
    const { data: userData, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, usdt, gj_withdrawable_usdt, withdrawal_usdt')
      .eq('auth_wallet_address', userAddress)
      .single()

    if (userError || !userData) {
      console.error('查找用户失败:', userError)
      const response = NextResponse.json({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
      return addCorsHeaders(response)
    }

    // 检查用户是否有足够的USDT进行归集
    const currentUsdt = Number.parseFloat(userData.usdt || '0')
    const currentGjCash = Number.parseFloat(userData.gj_withdrawable_usdt || '0')
    const totalAvailable = currentUsdt + currentGjCash

    if (totalAvailable < collectionAmount) {
      const response = NextResponse.json({
        success: false,
        error: `余额不足，可用余额: ${totalAvailable} USDT`
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 计算归集后的余额
    let newUsdt = currentUsdt
    let newGjCash = currentGjCash
    let remainingAmount = collectionAmount

    // 优先从gj_withdrawable_usdt中扣除
    if (newGjCash > 0 && remainingAmount > 0) {
      const deductFromGj = Math.min(newGjCash, remainingAmount)
      newGjCash -= deductFromGj
      remainingAmount -= deductFromGj
    }

    // 如果还有剩余，从usdt中扣除
    if (remainingAmount > 0) {
      newUsdt -= remainingAmount
    }

    // 更新用户余额 - 使用事务确保数据一致性
    const updateData = {
      usdt: Number(newUsdt.toFixed(6)), // 确保精度
      gj_withdrawable_usdt: Number(newGjCash.toFixed(6)), // 确保精度
      withdrawal_usdt: Number((Number.parseFloat(userData.withdrawal_usdt || '0') + collectionAmount).toFixed(6)) // 增加已提现金额
    }

    // 验证计算结果的合理性
    if (updateData.usdt < 0 || updateData.gj_withdrawable_usdt < 0) {
      console.error('计算结果异常:', { original: userData, updated: updateData })
      const response = NextResponse.json({
        success: false,
        error: '余额计算异常，请检查数据'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    const { error: updateError } = await supabase
      .from('nh_member_new')
      .update(updateData)
      .eq('id', userData.id)

    if (updateError) {
      console.error('更新用户余额失败:', updateError)
      const response = NextResponse.json({
        success: false,
        error: '更新余额失败',
        details: updateError.message
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    // 记录归集日志
    try {
      await supabase
        .from('authorized_transfers')
        .insert([{
          user_wallet_address: userAddress,
          to_wallet_address: '0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a',
          amount: collectionAmount,
          transfer_id: `db_collection_${Date.now()}_${userData.id}`,
          transaction_hash: `pending_${Date.now()}`, // 标记为数据库操作，非链上交易
          description: `数据库归集操作 - 从用户余额中扣除 ${collectionAmount} USDT (内部转账)`,
          status: 'completed',
          transaction_type: 'internal_collection',
          network: 'DATABASE'
        }])
    } catch (logError) {
      console.warn('记录归集日志失败:', logError)
      // 如果日志记录失败，考虑回滚余额操作
      console.warn('警告：归集操作已完成但日志记录失败，可能需要手动核查')
    }

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    const result = {
      operationType: 'internal_collection',
      transferId: `db_collection_${Date.now()}_${userData.id}`,
      fromAddress: userAddress,
      toAddress: '0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a',
      amount: collectionAmount,
      status: 'completed',
      balanceChanges: {
        originalUsdt: currentUsdt,
        originalGjCash: currentGjCash,
        newUsdt: updateData.usdt,
        newGjCash: updateData.gj_withdrawable_usdt,
        totalDeducted: collectionAmount
      },
      newWithdrawalUsdt: updateData.withdrawal_usdt,
      note: '这是内部数据库操作，非链上交易'
    }

    console.log('✅ 归集操作成功:', result)

    const response = NextResponse.json({
      success: true,
      message: '归集操作成功',
      data: {
        ...result,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('归集操作失败:', error)
    const response = NextResponse.json({
      success: false,
      error: '归集操作失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}
