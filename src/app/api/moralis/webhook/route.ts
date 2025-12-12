/**
 * Moralis Webhook 接收器
 * 接收链上交易事件，写入数据库，由数据库触发器自动发送Telegram通知
 * 
 * 优点：
 * - 只监听指定地址，无需扫描整个链
 * - Moralis 主动推送，实时性高
 * - 零轮询成本，不会被限制
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

/**
 * 解析 Moralis USDT Transfer 事件
 */
interface TransferEvent {
  from: string
  to: string
  value: string
  transactionHash: string
  blockNumber: number
  logIndex?: number
}

/**
 * 将交易写入数据库
 * 数据库触发器会自动处理通知发送
 */
async function saveTransactionToDatabase(event: TransferEvent, monitoredAddresses: string[]) {
  try {
    const from = event.from.toLowerCase()
    const to = event.to.toLowerCase()
    const value = event.value ? (parseInt(event.value) / 1e6).toFixed(6) : '0.000000' // USDT 6位小数
    
    // 判断是哪个监听地址的交易
    let userAddress = ''
    let transactionType: 'in' | 'out' = 'in'
    
    if (monitoredAddresses.includes(to)) {
      // 转入到监听地址
      userAddress = to
      transactionType = 'in'
    } else if (monitoredAddresses.includes(from)) {
      // 从监听地址转出
      userAddress = from
      transactionType = 'out'
    } else {
      console.log('交易地址不在监听列表中，跳过')
      return false
    }
    
    console.log(`📝 保存交易到数据库: ${userAddress} ${transactionType} ${value} USDT`)
    
    // 检查交易是否已存在（防止重复）
    const { data: existing } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('tx_hash', event.transactionHash)
      .single()
    
    if (existing) {
      console.log('交易已存在，跳过')
      return false
    }
    
    // 插入交易记录 - 触发器会自动处理通知
    const { error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_address: userAddress,
        transaction_type: transactionType,
        amount: value,
        token: 'USDT',
        tx_hash: event.transactionHash,
        block_number: event.blockNumber,
        timestamp: new Date().toISOString(),
        from_address: from,
        to_address: to,
        is_processed: false, // 触发器会处理
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('保存交易失败:', error)
      return false
    }
    
    console.log('✅ 交易已保存，触发器将自动发送通知')
    return true
  } catch (error) {
    console.error('保存交易异常:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📨 收到 Moralis Webhook:', JSON.stringify(body, null, 2))
    
    // Moralis 测试 ping
    if (body.test === true) {
      console.log('✅ Moralis Webhook 测试成功')
      return NextResponse.json({ success: true, message: 'Test received' })
    }
    
    // 获取所有监听地址
    const { data: monitoredWallets } = await supabase
      .from('wallet_monitor')
      .select('wallet_address')
      .eq('is_active', true)
    
    const monitoredAddresses = (monitoredWallets || [])
      .map(w => w.wallet_address.toLowerCase())
    
    console.log(`📋 当前监听 ${monitoredAddresses.length} 个地址`)
    
    // 解析 Moralis Stream 事件 - 支持多种数据格式
    let events: TransferEvent[] = []
    
    // 格式1: evm_logs 数组（最新格式）
    if (body.evm_logs && Array.isArray(body.evm_logs)) {
      events = body.evm_logs
        .filter((log: any) => log.address?.toLowerCase() === USDT_CONTRACT.toLowerCase())
        .map((log: any) => ({
          from: log.topic1 ? '0x' + log.topic1.slice(26) : log.from,
          to: log.topic2 ? '0x' + log.topic2.slice(26) : log.to,
          value: log.data || log.value,
          transactionHash: log.transaction_hash || log.transactionHash,
          blockNumber: parseInt(body.block?.number || log.block_number || '0'),
          logIndex: log.log_index
        }))
    }
    // 格式2: logs 数组
    else if (body.logs && Array.isArray(body.logs)) {
      events = body.logs
        .filter((log: any) => log.address?.toLowerCase() === USDT_CONTRACT.toLowerCase())
        .map((log: any) => ({
          from: log.topic1 ? '0x' + log.topic1.slice(26) : log.from,
          to: log.topic2 ? '0x' + log.topic2.slice(26) : log.to,
          value: log.data || log.value,
          transactionHash: log.transactionHash || log.transaction_hash || log.txHash,
          blockNumber: parseInt(log.blockNumber || log.block_number || '0'),
          logIndex: log.logIndex || log.log_index
        }))
    }
    // 格式3: 单个事件对象
    else if (body.from && body.to) {
      events = [{
        from: body.from,
        to: body.to,
        value: body.value || body.data,
        transactionHash: body.transactionHash || body.transaction_hash || body.txHash,
        blockNumber: parseInt(body.blockNumber || body.block_number || '0'),
        logIndex: body.logIndex || body.log_index
      }]
    }
    
    if (events.length === 0) {
      console.log('ℹ️ 未找到 USDT Transfer 事件')
      return NextResponse.json({ success: true, message: 'No USDT events' })
    }
    
    console.log(`🔍 发现 ${events.length} 个 USDT Transfer 事件`)
    
    // 处理每个事件
    let savedCount = 0
    for (const event of events) {
      const saved = await saveTransactionToDatabase(event, monitoredAddresses)
      if (saved) savedCount++
    }
    
    console.log(`✅ 成功保存 ${savedCount}/${events.length} 个交易`)
    
    return NextResponse.json({ 
      success: true, 
      processed: events.length,
      saved: savedCount
    })
  } catch (error) {
    console.error('处理 Moralis Webhook 失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}


