import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 更新用户ETH余额
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, ethAmount, reason } = body

    if (!wallet_address) {
      return NextResponse.json({ success: false, error: '缺少钱包地址' }, { status: 400 })
    }

    if (ethAmount === undefined || ethAmount === null) {
      return NextResponse.json({ success: false, error: '缺少调整金额' }, { status: 400 })
    }

    const adjustAmount = parseFloat(ethAmount.toString())
    if (isNaN(adjustAmount)) {
      return NextResponse.json({ success: false, error: '无效的金额' }, { status: 400 })
    }

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, eth, wallet_address')
      .eq('wallet_address', wallet_address)
      .single()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
    }

    const currentEth = parseFloat(user.eth?.toString() || '0')
    const newEth = currentEth + adjustAmount

    // 检查余额是否足够（如果是减少）
    if (newEth < 0) {
      return NextResponse.json({ success: false, error: 'ETH余额不足' }, { status: 400 })
    }

    const now = new Date().toISOString()

    // 更新ETH余额
    const { error: updateError } = await supabase
      .from('nh_member_new')
      .update({
        eth: newEth,
        updated_at: now
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('更新ETH余额失败:', updateError)
      return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
    }

    // 记录操作日志
    await supabase.from('nh_logs').insert({
      user_id: user.id,
      type: adjustAmount > 0 ? 'eth_add' : 'eth_subtract',
      amount: Math.abs(adjustAmount),
      description: reason || `ETH余额调整: ${adjustAmount > 0 ? '+' : ''}${adjustAmount}`,
      created_at: now
    })

    return NextResponse.json({
      success: true,
      data: {
        previousBalance: currentEth,
        newBalance: newEth,
        adjustedAmount: adjustAmount,
        message: {
          zh: `ETH余额已${adjustAmount > 0 ? '增加' : '减少'} ${Math.abs(adjustAmount)}`,
          en: `ETH balance ${adjustAmount > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustAmount)}`
        }
      }
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
