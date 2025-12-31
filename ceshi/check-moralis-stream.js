/**
 * 检查 Moralis Stream 配置
 */

const Moralis = require('moralis').default

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const STREAM_ID = 'cfa94e99-d7fe-4e1d-825f-fb50648671f0'

async function main() {
  try {
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    console.log('✅ Moralis 初始化成功\n')
    
    // 1. 获取 Stream 详细信息
    console.log('1. Stream 详细信息：')
    console.log('='.repeat(60))
    const stream = await Moralis.Streams.getById({ id: STREAM_ID })
    console.log('Stream ID:', stream.id)
    console.log('状态:', stream.status)
    console.log('Webhook URL:', stream.webhookUrl)
    console.log('链:', stream.chains)
    console.log('描述:', stream.description)
    console.log('Tag:', stream.tag)
    console.log('\n')
    
    // 2. 获取 Stream 统计
    console.log('2. Stream 统计信息：')
    console.log('='.repeat(60))
    try {
      const stats = await Moralis.Streams.getStats({ id: STREAM_ID })
      console.log('总 Webhooks:', stats.totalWebhooksDelivered || 0)
      console.log('成功:', stats.totalWebhooksDelivered || 0)
      console.log('失败:', stats.totalWebhooksFailed || 0)
      console.log('\n')
    } catch (e) {
      console.log('无法获取统计信息（API可能不支持）\n')
    }
    
    // 3. 检查监听地址
    console.log('3. 检查特定地址是否在监听中：')
    console.log('='.repeat(60))
    const targetAddress = '0xb18b7561873de63f43fb797bf37c9edeb396b446'
    
    try {
      // 尝试获取地址（API 可能不支持分页）
      console.log(`检查地址: ${targetAddress}`)
      console.log('注意：Moralis API 可能不支持直接查询单个地址')
      console.log('\n')
    } catch (e) {
      console.log('无法查询地址\n')
    }
    
    // 4. 重要提醒
    console.log('4. 关键检查点：')
    console.log('='.repeat(60))
    console.log('✓ Webhook URL:', stream.webhookUrl)
    console.log('  这个 URL 必须：')
    console.log('  - 可以从公网访问（不能是localhost）')
    console.log('  - 使用 HTTPS 协议')
    console.log('  - 响应 200 状态码')
    console.log('\n')
    
    console.log('✓ 当前配置的 Webhook:', stream.webhookUrl)
    console.log('  预期的 Webhook: https://ethmax.vercel.app/api/moralis/webhook')
    console.log('\n')
    
    if (stream.status !== 'active') {
      console.log('❌ Stream 状态不是 active！')
      console.log('   需要激活 Stream')
    } else {
      console.log('✅ Stream 状态正常\n')
    }
    
    // 5. 测试 Webhook
    console.log('5. 测试 Webhook 连通性：')
    console.log('='.repeat(60))
    console.log('访问 Moralis Dashboard:')
    console.log('https://admin.moralis.io/streams')
    console.log('\n步骤：')
    console.log('1. 找到 Stream:', stream.tag || stream.id)
    console.log('2. 点击 "Test Stream" 或 "Send Test Event"')
    console.log('3. 检查是否收到测试请求')
    console.log('\n')
    
    // 6. 诊断建议
    console.log('6. 如果真实交易没有通知，检查：')
    console.log('='.repeat(60))
    console.log('□ 是否真的有链上交易发生（在 Etherscan 确认）')
    console.log('□ 交易是否已确认（至少12个区块）')
    console.log('□ Moralis Dashboard 中是否有 Webhook 调用记录')
    console.log('□ Vercel 日志中是否有 /api/moralis/webhook 的请求')
    console.log('□ Webhook URL 是否可以从 Moralis 服务器访问')
    console.log('\n')
    
    console.log('立即行动：')
    console.log('1. 访问 https://admin.moralis.io/streams')
    console.log('2. 找到你的 Stream 并点击查看详情')
    console.log('3. 查看 "Activity" 或 "Logs" 标签')
    console.log('4. 检查是否有错误信息')
    console.log('')
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
  }
}

main()


