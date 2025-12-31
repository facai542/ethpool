/**
 * 测试 Telegram 内联按钮回调功能
 */

require('dotenv').config()

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// 模拟 Telegram 发送的 callback_query 数据
const mockCallbackQuery = {
  callback_query: {
    id: '123456789',
    from: {
      id: 7989461454,
      first_name: 'Test',
      username: 'testuser'
    },
    message: {
      message_id: 999,
      chat: {
        id: -1003149735777,
        type: 'supergroup'
      },
      text: '授权消息测试'
    },
    data: 'add_monitor:0x1234567890123456789012345678901234567890'
  }
}

async function testWebhook() {
  console.log('\n========== 测试 Telegram Webhook 回调 ==========\n')
  
  try {
    // 1. 检查 webhook 信息
    console.log('1️⃣ 检查 Telegram Webhook 设置...')
    const webhookInfo = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
    const webhookResult = await webhookInfo.json()
    
    if (webhookResult.ok) {
      console.log('   ✅ Webhook 信息:')
      console.log(`      URL: ${webhookResult.result.url || '(未设置)'}`)
      console.log(`      待处理更新: ${webhookResult.result.pending_update_count || 0}`)
      if (webhookResult.result.last_error_message) {
        console.log(`      ⚠️  最后错误: ${webhookResult.result.last_error_message}`)
      }
    }
    
    // 2. 测试 webhook 路由
    console.log('\n2️⃣ 测试 Webhook 路由...')
    const webhookResponse = await fetch(`${APP_URL}/api/telegram/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockCallbackQuery)
    })
    
    const webhookData = await webhookResponse.json()
    console.log('   ✅ Webhook 路由响应:', webhookData)
    
    // 3. 测试 callback 路由
    console.log('\n3️⃣ 测试 Callback 路由...')
    const callbackResponse = await fetch(`${APP_URL}/api/telegram/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockCallbackQuery)
    })
    
    const callbackData = await callbackResponse.json()
    console.log('   ✅ Callback 路由响应:', callbackData)
    
    // 4. 等待一段时间，查看处理结果
    console.log('\n4️⃣ 等待处理完成...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('\n========== 测试完成 ==========\n')
    console.log('✅ 所有路由测试通过!')
    console.log('\n📝 下一步:')
    console.log('   1. 运行: node scripts/setup-telegram-webhook.js set')
    console.log('   2. 在 Telegram 中点击授权消息的内联按钮')
    console.log('   3. 检查 Vercel 日志或本地控制台输出\n')
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    process.exit(1)
  }
}

testWebhook()










