/**
 * 批量添加地址到 Moralis Stream
 * 简化版本：直接添加所有监听地址
 */

require('dotenv').config({ path: '.env.local' })

const Moralis = require('moralis').default
const { createClient } = require('@supabase/supabase-js')

// 配置
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const SUPABASE_URL = 'https://bfcpimnfgidhgigtgehs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM'
const STREAM_ID = 'ddc148ad-ca5a-4e0e-930b-a4769022c670' // 2025-10-09 重新创建

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('='.repeat(60))
  console.log('批量添加地址到 Moralis Stream')
  console.log('='.repeat(60))
  console.log('')
  
  try {
    // 1. 初始化 Moralis
    console.log('1. 初始化 Moralis SDK...')
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    console.log('   ✅ Moralis SDK 初始化成功')
    console.log('')
    
    // 2. 从数据库获取所有监听地址
    console.log('2. 从数据库获取监听地址...')
    const { data: monitoredWallets, error } = await supabase
      .from('wallet_monitor')
      .select('wallet_address, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('   ❌ 查询失败:', error)
      return
    }
    
    console.log(`   ✅ 找到 ${monitoredWallets.length} 个监听地址`)
    
    // 显示最近的5个地址
    console.log('\n   最近添加的5个地址:')
    monitoredWallets.slice(0, 5).forEach((w, idx) => {
      console.log(`   ${idx + 1}. ${w.wallet_address} (${w.created_at})`)
    })
    console.log('')
    
    if (monitoredWallets.length === 0) {
      console.log('   ⚠️ 没有需要监听的地址')
      return
    }
    
    // 3. 批量添加到 Moralis Stream
    console.log('3. 批量添加地址到 Moralis Stream...')
    console.log(`   Stream ID: ${STREAM_ID}`)
    
    // 转换为小写（Moralis 接受小写地址）
    const addresses = monitoredWallets.map(w => w.wallet_address.toLowerCase())
    
    // Moralis 限制每次最多添加 100 个地址
    const batchSize = 100
    let totalAdded = 0
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      console.log(`\n   批次 ${Math.floor(i / batchSize) + 1}: 添加 ${batch.length} 个地址...`)
      
      try {
        await Moralis.Streams.addAddress({
          id: STREAM_ID,
          address: batch
        })
        totalAdded += batch.length
        console.log(`   ✅ 成功添加 ${batch.length} 个地址`)
      } catch (err) {
        // 如果地址已存在，会报错，这是正常的
        const errorMsg = err.message || String(err)
        if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
          console.log(`   ℹ️ 地址已存在（正常，跳过）`)
          totalAdded += batch.length
        } else {
          console.error(`   ❌ 添加失败:`, errorMsg)
        }
      }
    }
    
    console.log('')
    console.log('='.repeat(60))
    console.log('✅ 批量添加完成')
    console.log('='.repeat(60))
    console.log('')
    console.log(`总地址数: ${addresses.length}`)
    console.log(`成功添加/已存在: ${totalAdded}`)
    console.log(`Stream ID: ${STREAM_ID}`)
    console.log(`Webhook: https://ethmax.vercel.app/api/moralis/webhook`)
    console.log('')
    console.log('下一步：')
    console.log('1. 向任意监听地址转账 USDT')
    console.log('2. Moralis 会在 1-2 秒内推送 Webhook')
    console.log('3. 系统自动发送 Telegram 通知')
    console.log('')
    
  } catch (error) {
    console.error('\n❌ 执行失败:', error.message)
  }
}

main()

