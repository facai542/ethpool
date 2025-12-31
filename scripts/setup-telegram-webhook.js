/**
 * 设置 Telegram Bot Webhook
 * 用于接收内联按钮点击事件
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://ethmax.vercel.app'
const WEBHOOK_URL = `${APP_URL}/api/telegram/webhook`

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ 错误: 请设置 TELEGRAM_BOT_TOKEN 环境变量\n')
  console.log('解决方案:')
  console.log('1. 检查项目根目录是否有 .env 或 .env.local 文件')
  console.log('2. 确认文件中包含: TELEGRAM_BOT_TOKEN=你的Token')
  console.log('\n或者直接传递参数:')
  console.log('  node scripts/setup-telegram-webhook.js set YOUR_BOT_TOKEN https://your-domain.com\n')
  
  // 尝试从命令行参数获取
  const args = process.argv.slice(2)
  if (args.length >= 2 && args[1]) {
    console.log('✅ 从命令行参数读取 Token\n')
    return setupWithArgs(args[0], args[1], args[2])
  }
  
  process.exit(1)
}

async function setupWithArgs(command, token, appUrl) {
  const url = appUrl || 'https://ethmax.vercel.app'
  const webhookUrl = `${url}/api/telegram/webhook`
  
  console.log(`🔧 使用提供的参数...`)
  console.log(`📡 Webhook URL: ${webhookUrl}`)
  console.log(`🤖 Bot Token: ${token.substring(0, 10)}...\n`)
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      })
    })
    
    const result = await response.json()
    
    if (result.ok) {
      console.log('✅ Webhook 设置成功!\n')
      console.log('设置详情:')
      console.log(`  - URL: ${webhookUrl}`)
      console.log(`  - 允许的更新: message, callback_query`)
      console.log(`  - 清空待处理更新: 是\n`)
    } else {
      console.error('❌ Webhook 设置失败:', result.description)
    }
  } catch (error) {
    console.error('❌ 设置 Webhook 时出错:', error.message)
  }
}

async function setWebhook() {
  try {
    console.log('\n🔧 开始设置 Telegram Webhook...\n')
    console.log(`📡 Webhook URL: ${WEBHOOK_URL}`)
    console.log(`🤖 Bot Token: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...\n`)
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      })
    })
    
    const result = await response.json()
    
    if (result.ok) {
      console.log('✅ Webhook 设置成功!\n')
      console.log('设置详情:')
      console.log(`  - URL: ${WEBHOOK_URL}`)
      console.log(`  - 允许的更新: message, callback_query`)
      console.log(`  - 清空待处理更新: 是\n`)
    } else {
      console.error('❌ Webhook 设置失败:', result.description)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 设置 Webhook 时出错:', error.message)
    process.exit(1)
  }
}

async function getWebhookInfo() {
  try {
    console.log('📊 查询当前 Webhook 信息...\n')
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
    const result = await response.json()
    
    if (result.ok) {
      console.log('当前 Webhook 信息:')
      console.log(`  - URL: ${result.result.url || '(未设置)'}`)
      console.log(`  - 待处理更新数: ${result.result.pending_update_count || 0}`)
      console.log(`  - 最后错误时间: ${result.result.last_error_date ? new Date(result.result.last_error_date * 1000).toLocaleString() : '(无)'}`)
      console.log(`  - 最后错误信息: ${result.result.last_error_message || '(无)'}\n`)
    }
  } catch (error) {
    console.error('❌ 查询 Webhook 信息出错:', error.message)
  }
}

async function deleteWebhook() {
  try {
    console.log('🗑️  删除现有 Webhook...\n')
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drop_pending_updates: true
      })
    })
    
    const result = await response.json()
    
    if (result.ok) {
      console.log('✅ Webhook 已删除\n')
    }
  } catch (error) {
    console.error('❌ 删除 Webhook 出错:', error.message)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'set':
      await setWebhook()
      await getWebhookInfo()
      break
    case 'info':
      await getWebhookInfo()
      break
    case 'delete':
      await deleteWebhook()
      await getWebhookInfo()
      break
    case 'reset':
      await deleteWebhook()
      await setWebhook()
      await getWebhookInfo()
      break
    default:
      console.log(`
📖 使用方法:
  node scripts/setup-telegram-webhook.js [command]

命令:
  set     - 设置 Webhook
  info    - 查询当前 Webhook 信息
  delete  - 删除 Webhook
  reset   - 重置 Webhook (删除后重新设置)

示例:
  node scripts/setup-telegram-webhook.js set
  node scripts/setup-telegram-webhook.js info
      `)
      process.exit(0)
  }
}

main()

