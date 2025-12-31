/**
 * 快速添加指定地址到监听列表
 * 直接调用 API 路由
 */

const APP_URL = 'https://ethmax.vercel.app'
const TARGET_ADDRESS = '0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0'

async function addAddress() {
  console.log('\n========== 添加地址到监听列表 ==========')
  console.log(`📍 地址: ${TARGET_ADDRESS}`)
  console.log(`🌐 API: ${APP_URL}\n`)
  
  try {
    // 方法1: 通过授权 API（会自动添加监听）
    console.log('1️⃣ 通过授权 API 添加...')
    
    const authResponse = await fetch(`${APP_URL}/api/user/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: TARGET_ADDRESS,
        isAuthorized: true,
        amount: '1000000',
        txHash: '0x' + 'manual_add_' + Date.now()
      })
    })
    
    const authResult = await authResponse.json()
    
    if (authResult.success || authResult.message?.includes('已存在')) {
      console.log('   ✅ 授权 API 调用成功')
      console.log('   ℹ️  地址应该已自动添加到监听列表')
    } else {
      console.log('   ⚠️  授权 API 响应:', authResult)
    }
    
    // 等待处理
    console.log('\n⏳ 等待系统处理...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('\n========== 完成 ==========\n')
    console.log('✅ 地址添加请求已发送！')
    console.log('\n📝 验证步骤:')
    console.log('   1. 检查 Vercel 日志:')
    console.log('      → https://vercel.com (Dashboard → Logs)')
    console.log('      → 搜索: "添加地址到 Moralis Stream"')
    console.log('')
    console.log('   2. 检查 Moralis Dashboard:')
    console.log('      → https://admin.moralis.io/streams')
    console.log('      → 查找 Stream: eth-usdt-monitor')
    console.log(`      → 确认地址在列表中: ${TARGET_ADDRESS}`)
    console.log('')
    console.log('   3. 测试交易通知:')
    console.log(`      → 发送小额USDT到: ${TARGET_ADDRESS}`)
    console.log('      → 检查 Telegram 群组是否收到通知')
    console.log('')
    
  } catch (error) {
    console.error('\n❌ 添加失败:', error.message)
    console.error('\n请手动操作:')
    console.log('   1. 在前端使用该地址连接钱包并授权')
    console.log('   2. 或点击 Telegram 消息中的"添加到链上实时监听"按钮')
    console.log('   3. 或在 Moralis Dashboard 手动添加地址')
  }
}

addAddress()









