/**
 * 测试授权后自动添加地址到 Moralis Stream 监听
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testAutoMonitor() {
  console.log('\n========== 测试自动监听功能 ==========\n')
  
  try {
    // 1. 模拟用户授权
    console.log('1️⃣ 模拟用户授权...')
    const testAddress = '0x' + '1'.repeat(40) // 测试地址
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: testAddress,
        isAuthorized: true,
        amount: '1000000',
        txHash: '0xtest123'
      })
    })
    
    const result = await response.json()
    console.log('   授权API响应:', result)
    
    // 2. 检查 wallet_monitor 表
    console.log('\n2️⃣ 检查 wallet_monitor 表...')
    const { data: monitorData, error: monitorError } = await supabase
      .from('wallet_monitor')
      .select('*')
      .eq('wallet_address', testAddress)
      .single()
    
    if (monitorData) {
      console.log('   ✅ 地址已添加到 wallet_monitor 表')
      console.log('   - member_id:', monitorData.member_id)
      console.log('   - is_active:', monitorData.is_active)
      console.log('   - monitor_transactions:', monitorData.monitor_transactions)
    } else {
      console.log('   ❌ 地址未添加到 wallet_monitor 表')
      if (monitorError) {
        console.log('   错误:', monitorError.message)
      }
    }
    
    // 3. 检查 Moralis Stream（需要 Moralis API）
    console.log('\n3️⃣ 检查 Moralis Stream 状态...')
    console.log('   ℹ️  需要手动检查 Moralis Dashboard:')
    console.log('   → 访问: https://admin.moralis.io/streams')
    console.log('   → 查找 Stream: eth-usdt-monitor')
    console.log('   → 检查监听地址列表中是否包含:', testAddress)
    
    // 4. 提示下一步
    console.log('\n4️⃣ 下一步测试...')
    console.log('   1. 在前端完成一次真实授权')
    console.log('   2. 检查 Vercel 日志中的消息:')
    console.log('      - 🔍 添加地址到 Moralis Stream 链上监听...')
    console.log('      - ✅ 地址已添加到 Moralis Stream 监听')
    console.log('   3. 登录 Moralis Dashboard 验证地址已添加')
    console.log('   4. 向该地址发送测试USDT交易')
    console.log('   5. 检查 Telegram 群组是否收到交易通知')
    
    console.log('\n========== 测试完成 ==========\n')
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    if (error.stack) {
      console.error('错误堆栈:', error.stack)
    }
    process.exit(1)
  }
}

testAutoMonitor()









