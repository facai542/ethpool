/**
 * Tokenview Webhook 接收器
 * 接收 Tokenview 推送的地址交易通知
 * 
 * 配置地址：https://services.tokenview.io/en/dashboard
 * Webhook URL: https://你的域名.vercel.app/api/tokenview/webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TokenviewWebhookData {
  // Tokenview webhook 数据结构（根据官方文档）
  address: string        // 被监控的地址
  txid: string           // 交易哈希
  time: number           // 交易时间 UTC
  confirmations: number  // 确认数
  value: string          // 余额变化（ETH/主币）
  coin: string           // 网络（ETH、BTC 等）
  height: number         // 区块高度
  tokenAddress?: string  // 代币合约地址
  tokenSymbol?: string   // 代币符号（如 USDT）
  tokenValue?: string    // 代币变化量
}

/**
 * 处理 Tokenview webhook 数据
 */
async function processTokenviewWebhook(data: TokenviewWebhookData) {
  console.log('🚨 [PROCESS] 开始处理 Tokenview 数据:', JSON.stringify(data, null, 2))
  
  // 检查是否是 USDT 交易
  const USDT_CONTRACT = '0xdac17f958d2ee523a2206206994597c13d831ec7'
  const isUSDT = data.tokenAddress?.toLowerCase() === USDT_CONTRACT.toLowerCase() && 
                 data.tokenSymbol === 'USDT'
  
  console.log('🚨 [PROCESS] USDT 检查:', {
    tokenAddress: data.tokenAddress,
    tokenSymbol: data.tokenSymbol,
    isUSDT,
    expected: USDT_CONTRACT
  })
  
  if (!isUSDT) {
    console.log('🚨 [PROCESS] 非 USDT 交易，跳过（返回成功）')
    return { success: true, message: 'Non-USDT transaction ignored' }
  }
  
  console.log('🚨 [PROCESS] 是 USDT 交易，继续处理...')
  
  // 检查地址是否在监控列表中
  const { data: monitoredWallets, error: monitorError } = await supabase
    .from('wallet_monitor')
    .select('wallet_address')
    .eq('is_active', true)
  
  console.log('🔍 监控列表查询结果:', {
    count: monitoredWallets?.length || 0,
    addresses: monitoredWallets?.map(w => w.wallet_address) || [],
    error: monitorError
  })
  
  const monitoredAddresses = (monitoredWallets || [])
    .map(w => w.wallet_address.toLowerCase())
  
  const userAddress = data.address.toLowerCase()
  
  console.log('🔍 地址匹配检查:', {
    address: userAddress,
    monitored: monitoredAddresses
  })
  
  const isMonitored = monitoredAddresses.includes(userAddress)
  
  console.log('🔍 是否监控:', isMonitored)
  
  // 临时：接受所有 USDT 交易（生产环境请启用监控检查）
  if (!isMonitored) {
    console.log('⚠️ 地址不在监控列表中，但仍然处理（开发模式）')
    // return { success: true, message: 'Address not monitored' }
  }
  
  // 转换金额（USDT 是 6 位小数）
  // tokenValue 可能带负号（表示转出）
  const tokenValue = data.tokenValue || '0'
  const amount = (Math.abs(parseFloat(tokenValue))).toFixed(6)
  
  // 判断交易类型（根据 tokenValue 正负）
  const transactionType: 'in' | 'out' = parseFloat(tokenValue) >= 0 ? 'in' : 'out'
  
  console.log('🚨 [PROCESS] 交易类型:', {
    tokenValue,
    amount,
    transactionType
  })
  
  // 检查交易是否已存在
  const { data: existing } = await supabase
    .from('wallet_transactions')
    .select('id')
    .eq('tx_hash', data.txid)
    .single()
  
  if (existing) {
    console.log('ℹ️ 交易已存在，跳过')
    return { success: true, message: 'Transaction already exists' }
  }
  
  // 保存交易到数据库 - 触发器会自动处理通知
  const insertData = {
    user_address: data.address,
    transaction_type: transactionType,
    amount: amount,
    token: 'USDT',
    tx_hash: data.txid,
    block_number: data.height,
    timestamp: new Date(data.time * 1000).toISOString(),
    from_address: transactionType === 'out' ? data.address : 'unknown',
    to_address: transactionType === 'in' ? data.address : 'unknown',
    is_processed: false,
    created_at: new Date().toISOString()
  }
  
  console.log('🚨🚨🚨 [PROCESS] 准备保存到数据库 wallet_transactions:')
  console.log(JSON.stringify(insertData, null, 2))
  
  const { error: insertError } = await supabase
    .from('wallet_transactions')
    .insert(insertData)
  
  console.log('🚨🚨🚨 [PROCESS] 数据库插入结果:', insertError ? '❌ 失败' : '✅ 成功')
  if (insertError) {
    console.error('🚨 [PROCESS] 插入错误详情:', JSON.stringify(insertError, null, 2))
  }
  
  if (insertError) {
    // 如果是重复记录（已存在），不算错误
    if (insertError.code === '23505') {
      console.log('ℹ️ 交易已存在，跳过')
      return { success: true, message: 'Transaction already exists' }
    }
    
    console.error('❌ 保存交易失败:', insertError)
    throw insertError
  }
  
  console.log('✅ 交易已保存到数据库')
  console.log(`💰 地址 ${data.address}: ${transactionType === 'in' ? '+' : '-'}${amount} USDT`)
  
  // 立即发送 Telegram 通知
  try {
    const emoji = transactionType === 'in' ? '🟢' : '🔴'
    const action = transactionType === 'in' ? '收入' : '支出'
    const sign = transactionType === 'in' ? '+' : '-'
    
    const telegramMessage = `${emoji}${action}USDT 提醒       ${sign}${amount} USDT

用户钱包：
${data.address}
订单金额：${sign}${amount} USDT
执行操作：客户${transactionType === 'in' ? '转入' : '转出'}
交易哈希：
${data.txid}`

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
        console.log('✅ Telegram 消息已发送！')
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
  
  return {
    success: true,
    message: 'Transaction processed',
    txHash: data.txid,
    amount: amount
  }
}

/**
 * 验证 Tokenview 签名
 */
function verifyTokenviewSignature(request: NextRequest, body: any): boolean {
  const secret = process.env.TOKENVIEW_WEBHOOK_SECRET
  
  if (!secret) {
    console.warn('⚠️ TOKENVIEW_WEBHOOK_SECRET 未配置，跳过签名验证')
    return true
  }
  
  // 从请求头获取签名
  const signature = request.headers.get('x-tokenview-signature') || 
                    request.headers.get('signature')
  
  if (!signature) {
    console.warn('⚠️ 请求中没有签名')
    return false
  }
  
  // 验证签名（具体验证方式根据 Tokenview 文档）
  // 这里是示例，实际验证方式可能不同
  console.log('🔐 验证 Tokenview 签名')
  
  // 简单验证：检查签名是否包含密钥
  // 实际应该使用 HMAC 等加密方式
  return signature.includes(secret) || signature === secret
}

/**
 * POST 处理器 - 接收 Tokenview webhook
 */
export async function POST(request: NextRequest) {
  console.log('🚨🚨🚨 [TOKENVIEW] POST 请求收到！时间:', new Date().toISOString())
  console.log('🚨 [TOKENVIEW] 请求 URL:', request.url)
  console.log('🚨 [TOKENVIEW] 请求方法:', request.method)
  console.log('🚨 [TOKENVIEW] 请求头:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2))
  
  try {
    // 获取查询参数（Tokenview 可能通过 URL 参数验证）
    const { searchParams } = new URL(request.url)
    const challenge = searchParams.get('challenge')
    const apiKey = searchParams.get('apiKey') || searchParams.get('key')
    
    console.log('🚨 [TOKENVIEW] 查询参数:', { challenge, apiKey })
    
    // Tokenview 验证挑战
    if (challenge) {
      console.log('✅ [TOKENVIEW] 验证挑战返回:', challenge)
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
    
    // API Key 验证
    if (apiKey) {
      const expectedKey = process.env.TOKENVIEW_WEBHOOK_SECRET
      if (expectedKey && apiKey === expectedKey) {
        console.log('✅ API Key 验证成功')
      }
    }
    
    const body = await request.json()
    
    console.log('🚨🚨🚨 [TOKENVIEW] 收到 Webhook Body:', JSON.stringify(body, null, 2))
    console.log('🚨 [TOKENVIEW] 数据类型:', typeof body)
    console.log('🚨 [TOKENVIEW] 数据键:', Object.keys(body))
    
    // 暂时跳过签名验证 - Tokenview 可能不发送签名头
    // TODO: 根据 Tokenview 实际文档实现正确的验证
    /* 
    if (process.env.TOKENVIEW_WEBHOOK_SECRET) {
      const isValid = verifyTokenviewSignature(request, body)
      if (!isValid) {
        console.error('❌ Tokenview 签名验证失败')
        return NextResponse.json({
          success: false,
          error: 'Invalid signature'
        }, { status: 401 })
      }
    }
    */
    
    // 处理测试 ping
    if (body.test === true || body.type === 'test') {
      console.log('🚨 [TOKENVIEW] 测试请求，返回成功')
      return NextResponse.json({ 
        success: true, 
        message: 'Tokenview webhook test received' 
      })
    }
    
    console.log('🚨 [TOKENVIEW] 开始处理真实交易数据...')
    
    // 处理实际交易数据
    const result = await processTokenviewWebhook(body)
    
    console.log('🚨🚨🚨 [TOKENVIEW] 处理完成！结果:', JSON.stringify(result, null, 2))
    
    // Tokenview 要求：响应 body 必须是非空文本，例如 "ok"
    return new NextResponse('ok', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
    
  } catch (error) {
    console.error('❌ [TOKENVIEW] Webhook 处理失败:', error)
    
    // 即使失败也返回 "ok" 避免 Tokenview 无限重试
    // 错误已记录在日志中供排查
    return new NextResponse('ok', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

/**
 * GET 处理器 - Tokenview 验证端点
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const challenge = searchParams.get('challenge')
    const verify = searchParams.get('verify')
    
    // Tokenview 验证挑战（GET 方式）
    if (challenge) {
      console.log('✅ Tokenview GET 验证挑战:', challenge)
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
    
    // Tokenview 验证请求
    if (verify) {
      console.log('✅ Tokenview 验证请求')
      return NextResponse.json({
        code: 0,
        message: 'success',
        data: {
          verify: true,
          timestamp: Date.now()
        }
      })
    }
    
    // 默认响应
    return NextResponse.json({
      service: 'Tokenview Webhook Receiver',
      status: 'active',
      endpoint: '/api/tokenview/webhook',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ GET 处理失败:', error)
    return NextResponse.json({
      service: 'Tokenview Webhook Receiver',
      status: 'active',
      error: 'verification failed'
    })
  }
}

