/**
 * 修复 Moralis Stream Webhook 配置
 */

const Moralis = require('moralis').default

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const STREAM_ID = 'cfa94e99-d7fe-4e1d-825f-fb50648671f0'
const CORRECT_WEBHOOK_URL = 'https://ethmax.vercel.app/api/moralis/webhook'

async function main() {
  console.log('修复 Moralis Stream Webhook 配置')
  console.log('='.repeat(60))
  console.log('')
  
  try {
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    console.log('✅ Moralis 初始化成功\n')
    
    // 1. 获取所有 Streams
    console.log('1. 查询所有 Streams...')
    const streams = await Moralis.Streams.getAll({ limit: 10 })
    
    console.log(`找到 ${streams.result?.length || 0} 个 Stream:\n`)
    
    if (streams.result && streams.result.length > 0) {
      streams.result.forEach((s, idx) => {
        console.log(`Stream ${idx + 1}:`)
        console.log(`  ID: ${s.id}`)
        console.log(`  Tag: ${s.tag}`)
        console.log(`  Webhook: ${s.webhookUrl}`)
        console.log(`  状态: ${s.status}`)
        console.log(`  链: ${s.chains}`)
        console.log('')
        
        // 检查 Webhook URL 是否正确
        if (s.id === STREAM_ID) {
          if (s.webhookUrl !== CORRECT_WEBHOOK_URL) {
            console.log(`  ❌ Webhook URL 不正确！`)
            console.log(`     当前: ${s.webhookUrl}`)
            console.log(`     应该: ${CORRECT_WEBHOOK_URL}`)
            console.log(`     需要更新！\n`)
          } else {
            console.log(`  ✅ Webhook URL 正确\n`)
          }
          
          if (s.status !== 'active') {
            console.log(`  ❌ Stream 状态: ${s.status}（应该是 active）\n`)
          }
        }
      })
    }
    
    // 2. 更新 Webhook URL（如果需要）
    console.log('2. 更新 Webhook URL...')
    try {
      await Moralis.Streams.update({
        id: STREAM_ID,
        webhookUrl: CORRECT_WEBHOOK_URL
      })
      console.log('✅ Webhook URL 已更新\n')
    } catch (e) {
      if (e.message.includes('no changes')) {
        console.log('ℹ️  Webhook URL 已经是正确的，无需更新\n')
      } else {
        console.error('❌ 更新失败:', e.message, '\n')
      }
    }
    
    // 3. 确保 Stream 是激活状态
    console.log('3. 激活 Stream...')
    try {
      await Moralis.Streams.updateStatus({
        id: STREAM_ID,
        status: 'active'
      })
      console.log('✅ Stream 已激活\n')
    } catch (e) {
      if (e.message.includes('already active') || e.message.includes('no changes')) {
        console.log('ℹ️  Stream 已经是激活状态\n')
      } else {
        console.error('❌ 激活失败:', e.message, '\n')
      }
    }
    
    console.log('='.repeat(60))
    console.log('✅ 配置检查完成')
    console.log('='.repeat(60))
    console.log('')
    console.log('下一步：')
    console.log('1. 访问 https://admin.moralis.io/streams')
    console.log('2. 找到你的 Stream 并点击 "Test Stream"')
    console.log('3. 检查 Vercel 日志是否收到测试请求')
    console.log('4. 如果收到测试请求，说明配置正确')
    console.log('5. 然后进行真实转账测试')
    console.log('')
    
  } catch (error) {
    console.error('执行失败:', error.message)
    console.error('详细错误:', error)
  }
}

main()


