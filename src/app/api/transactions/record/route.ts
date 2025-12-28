/**
 * 记录交易并发送 Telegram 通知
 * 供 Railway Transfer 监听服务调用
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_address,
      transaction_type,
      amount,
      from_address,
      to_address,
      tx_hash,
      block_number,
      token,
      source
    } = body

    console.log('📝 记录交易:', {
      user_address,
      transaction_type,
      amount,
      tx_hash,
      from_address,
      to_address,
      block_number,
      token
    })

    // 检查交易是否已存在
    const { data: existing } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('tx_hash', tx_hash)
      .single()

    if (existing) {
      console.log('ℹ️ 交易已存在，跳过')
      return NextResponse.json({
        success: true,
        message: 'Transaction already exists'
      })
    }

    // 保存交易到数据库
    const timestamp = new Date().toISOString()
    const { error: insertError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_address,
        transaction_type,
        amount: amount.toString(),
        token,
        tx_hash,
        block_number,
        from_address,
        to_address,
        timestamp,  // 添加 timestamp 字段
        is_processed: false,
        created_at: timestamp
      })

    if (insertError) {
      // 如果是重复记录错误，不算失败
      if (insertError.code === '23505') {
        console.log('ℹ️ 交易已存在（唯一约束）')
        return NextResponse.json({
          success: true,
          message: 'Transaction already exists'
        })
      }

      console.error('❌ 保存交易失败:', insertError)
      console.error('   错误代码:', insertError.code)
      console.error('   错误详情:', insertError.details)
      console.error('   错误提示:', insertError.hint)
      
      return NextResponse.json({
        success: false,
        error: insertError.message,
        code: insertError.code,
        details: insertError.details
      }, { status: 500 })
    }

    console.log('✅ 交易已保存')

    // 发送 Telegram 通知
    try {
      const emoji = transaction_type === 'in' ? '🟢' : '🔴'
      const action = transaction_type === 'in' ? '收入' : '支出'
      const sign = transaction_type === 'in' ? '+' : '-'

      const telegramMessage = `${emoji}${action}USDT 提醒       ${sign}${amount} USDT

用户钱包：
${user_address}
订单金额：${sign}${amount} USDT
执行操作：客户${transaction_type === 'in' ? '转入' : '转出'}
交易哈希：
${tx_hash}`

      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: telegramMessage
            })
          }
        )

        const telegramResult = await telegramResponse.json()

        if (telegramResult.ok) {
          console.log('✅ Telegram 消息已发送')
        } else {
          console.error('❌ Telegram 发送失败:', telegramResult)
        }
      } else {
        console.warn('⚠️ Telegram 配置缺失')
      }
    } catch (telegramError) {
      console.error('❌ 发送 Telegram 异常:', telegramError)
      // 不阻止主流程
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction recorded and notification sent',
      tx_hash
    })

  } catch (error) {
    console.error('❌ 记录交易失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

