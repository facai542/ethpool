/**
 * 完成 Stream 配置 - 查询并添加地址
 */

const Moralis = require('moralis').default
const { createClient } = require('@supabase/supabase-js')

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const SUPABASE_URL = 'https://bfcpimnfgidhgigtgehs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('完成 Moralis Stream 配置')
  console.log('='.repeat(60))
  console.log('')
  
  try {
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    console.log('✅ Moralis 初始化成功\n')
    
    // 1. 查询所有 Streams
    console.log('1. 查询当前的 Streams...')
    const streams = await Moralis.Streams.getAll({ limit: 20 })
    
    console.log(`找到 ${streams.result?.length || 0} 个 Stream\n`)
    
    let targetStream = null
    if (streams.result && streams.result.length > 0) {
      // 显示所有 Stream
      streams.result.forEach((s, idx) => {
        console.log(`Stream ${idx + 1}:`)
        console.log(`  ID: ${s.id}`)
        console.log(`  Tag: ${s.tag}`)
        console.log(`  Webhook: ${s.webhookUrl}`)
        console.log(`  状态: ${s.status}`)
        console.log(`  描述: ${s.description}`)
        console.log('')
        
        // 找到我们的 Stream（最新创建的或 tag 匹配的）
        if (s.tag === 'eth-usdt-monitor' || s.description?.includes('USDT')) {
          targetStream = s
        }
      })
    }
    
    if (!targetStream) {
      console.log('❌ 未找到 USDT 监听 Stream')
      console.log('请手动访问 https://admin.moralis.io/streams 创建')
      return
    }
    
    console.log(`✅ 找到目标 Stream: ${targetStream.id}`)
    console.log(`   Tag: ${targetStream.tag}`)
    console.log(`   Webhook: ${targetStream.webhookUrl}`)
    console.log(`   状态: ${targetStream.status}`)
    console.log('')
    
    // 2. 获取监听地址
    console.log('2. 获取数据库中的监听地址...')
    const { data: monitoredWallets } = await supabase
      .from('wallet_monitor')
      .select('wallet_address')
      .eq('is_active', true)
    
    const addresses = (monitoredWallets || [])
      .map(w => w.wallet_address.toLowerCase())
      .filter(addr => addr.length === 42 && addr.startsWith('0x'))
    
    console.log(`✅ 需要添加 ${addresses.length} 个地址\n`)
    
    // 3. 批量添加
    console.log('3. 批量添加地址到 Stream...')
    const batchSize = 100
    let totalAdded = 0
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      console.log(`  批次 ${Math.floor(i / batchSize) + 1}: 添加 ${batch.length} 个地址...`)
      
      try {
        await Moralis.Streams.addAddress({
          id: targetStream.id,
          address: batch
        })
        totalAdded += batch.length
        console.log(`  ✅ 成功 ${batch.length} 个`)
      } catch (err) {
        if (err.message?.includes('already exists')) {
          console.log(`  ℹ️  已存在`)
          totalAdded += batch.length
        } else {
          console.error(`  ❌ 失败:`, err.message)
        }
      }
    }
    
    console.log('')
    console.log('='.repeat(60))
    console.log('✅ 配置完成')
    console.log('='.repeat(60))
    console.log('')
    console.log('最终状态:')
    console.log(`  Stream ID: ${targetStream.id}`)
    console.log(`  监听地址: ${totalAdded}/${addresses.length}`)
    console.log(`  Webhook: ${targetStream.webhookUrl}`)
    console.log(`  状态: ${targetStream.status}`)
    console.log('')
    console.log('立即测试:')
    console.log('1. 访问 https://admin.moralis.io/streams')
    console.log(`2. 找到 Stream ID: ${targetStream.id}`)
    console.log('3. 点击 "Test Stream"')
    console.log('4. 检查 Telegram 是否收到测试消息')
    console.log('')
    console.log('如果收到测试消息 → 配置成功')
    console.log('如果没收到 → Webhook URL 可能无法访问')
    console.log('')
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message)
    console.error(error)
  }
}

main()


