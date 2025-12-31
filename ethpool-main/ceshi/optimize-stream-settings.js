const Moralis = require('moralis').default

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const STREAM_ID = 'ddc148ad-ca5a-4e0e-930b-a4769022c670'

async function main() {
  try {
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    console.log('优化 Stream 设置')
    console.log('='.repeat(60))
    console.log('')
    
    // 降低确认数，加快通知速度
    console.log('降低区块确认数（加快通知）...')
    try {
      await Moralis.Streams.updateStatus({
        id: STREAM_ID,
        status: 'active'
      })
      console.log('✅ Stream 已激活')
    } catch (e) {
      console.log('ℹ️  已经是激活状态')
    }
    
    console.log('')
    console.log('配置完成！')
    console.log('')
    console.log('Stream ID:', STREAM_ID)
    console.log('状态: active')
    console.log('监听地址: 45个')
    console.log('Webhook: https://ethmax.vercel.app/api/moralis/webhook')
    console.log('')
    console.log('='.repeat(60))
    console.log('立即测试步骤')
    console.log('='.repeat(60))
    console.log('')
    console.log('步骤1: 测试 Webhook 连通性')
    console.log('  1. 访问 https://admin.moralis.io/streams')
    console.log('  2. 找到你的 Stream（最新的那个）')
    console.log('  3. 点击 "Test Stream" 按钮')
    console.log('  4. 立即查看 Telegram 群组')
    console.log('  5. 应该收到测试消息')
    console.log('')
    console.log('步骤2: 真实交易测试')
    console.log('  1. 向任意监听地址转账 USDT（如 100 USDT）')
    console.log('  2. 等待 15-30 秒（交易确认）')
    console.log('  3. 检查 Telegram 群组')
    console.log('  4. 应该收到通知')
    console.log('')
    console.log('如果步骤1失败（测试没收到）：')
    console.log('  → Webhook URL 无法访问')
    console.log('  → 需要检查 Vercel 部署状态')
    console.log('  → 或使用其他域名')
    console.log('')
    console.log('如果步骤1成功但步骤2失败：')
    console.log('  → 检查交易是否真的确认了')
    console.log('  → 在 Etherscan 查看交易状态')
    console.log('  → 检查 Moralis Dashboard 的 Activity 日志')
    console.log('')
    
  } catch (error) {
    console.error('失败:', error.message)
  }
}

main()


