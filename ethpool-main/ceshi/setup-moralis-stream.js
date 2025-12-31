/**
 * Moralis Stream 配置脚本
 * 用于验证和配置 Moralis Stream API 监听指定地址的 USDT 交易
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

const Moralis = require('moralis').default
const { createClient } = require('@supabase/supabase-js')

// 配置
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const SUPABASE_URL = 'https://bfcpimnfgidhgigtgehs.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM'
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/moralis/webhook`
  : 'https://ethmax.vercel.app/api/moralis/webhook'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('='.repeat(60))
  console.log('Moralis Stream 配置工具')
  console.log('='.repeat(60))
  console.log('')
  
  try {
    // 初始化 Moralis
    console.log('1. 初始化 Moralis SDK...')
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    console.log('   ✅ Moralis SDK 初始化成功')
    console.log('')
    
    // 查询现有的 Streams
    console.log('2. 查询现有 Streams...')
    const streams = await Moralis.Streams.getAll({ limit: 100 })
    console.log(`   找到 ${streams.result?.length || 0} 个 Stream`)
    
    // 查找 USDT 监听 Stream
    let usdtStream = null
    if (streams.result) {
      for (const stream of streams.result) {
        console.log(`   - Stream ID: ${stream.id}`)
        console.log(`     Tag: ${stream.tag}`)
        console.log(`     描述: ${stream.description}`)
        console.log(`     Webhook: ${stream.webhookUrl}`)
        console.log(`     状态: ${stream.status}`)
        
        if (stream.tag === 'eth-usdt-monitor' || stream.description?.includes('USDT')) {
          usdtStream = stream
          console.log(`   ✅ 找到 USDT 监听 Stream: ${stream.id}`)
        }
      }
    }
    console.log('')
    
    // 如果没有找到，创建新的 Stream
    if (!usdtStream) {
      console.log('3. 创建新的 USDT 监听 Stream...')
      console.log(`   Webhook URL: ${WEBHOOK_URL}`)
      
      const newStream = await Moralis.Streams.add({
        chains: ['0x1'], // Ethereum mainnet
        description: 'ETH USDT Transaction Monitor',
        tag: 'eth-usdt-monitor',
        webhookUrl: WEBHOOK_URL,
        includeNativeTxs: false,
        includeContractLogs: true,
        abi: [
          {
            anonymous: false,
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'value', type: 'uint256' }
            ],
            name: 'Transfer',
            type: 'event'
          }
        ],
        topic0: ['Transfer(address,address,uint256)'],
        advancedOptions: [
          {
            topic0: 'Transfer(address,address,uint256)',
            filter: { eq: ['address', '0xdAC17F958D2ee523a2206206994597C13D831ec7'] }
          }
        ],
      })
      
      usdtStream = newStream
      console.log(`   ✅ Stream 创建成功: ${newStream.id}`)
      console.log('')
    }
    
    // 获取数据库中的监听地址
    console.log('4. 从数据库获取监听地址...')
    const { data: monitoredWallets, error } = await supabase
      .from('wallet_monitor')
      .select('wallet_address, member_id, created_at')
      .eq('is_active', true)
    
    if (error) {
      console.error('   ❌ 查询数据库失败:', error)
      return
    }
    
    console.log(`   ✅ 找到 ${monitoredWallets?.length || 0} 个监听地址`)
    console.log('')
    
    if (!monitoredWallets || monitoredWallets.length === 0) {
      console.log('   ⚠️ 没有需要监听的地址')
      return
    }
    
    // 获取 Stream 当前监听的地址
    console.log('5. 获取 Stream 当前监听的地址...')
    const streamAddresses = await Moralis.Streams.getAddresses({
      id: usdtStream.id
    })
    
    const existingAddresses = new Set(
      (streamAddresses.result || []).map(a => a.address.toLowerCase())
    )
    console.log(`   Stream 当前监听 ${existingAddresses.size} 个地址`)
    console.log('')
    
    // 批量添加缺失的地址
    console.log('6. 添加缺失的地址到 Stream...')
    const addressesToAdd = monitoredWallets
      .map(w => w.wallet_address.toLowerCase())
      .filter(addr => !existingAddresses.has(addr))
    
    if (addressesToAdd.length === 0) {
      console.log('   ℹ️ 所有地址已在监听中，无需添加')
    } else {
      console.log(`   需要添加 ${addressesToAdd.length} 个地址`)
      
      // Moralis 限制每次最多添加 100 个地址
      const batchSize = 100
      for (let i = 0; i < addressesToAdd.length; i += batchSize) {
        const batch = addressesToAdd.slice(i, i + batchSize)
        console.log(`   添加第 ${i + 1}-${Math.min(i + batchSize, addressesToAdd.length)} 个地址...`)
        
        try {
          await Moralis.Streams.addAddress({
            id: usdtStream.id,
            address: batch
          })
          console.log(`   ✅ 成功添加 ${batch.length} 个地址`)
        } catch (err) {
          console.error(`   ❌ 添加失败:`, err.message)
        }
      }
    }
    console.log('')
    
    // 最终统计
    console.log('7. 最终统计...')
    const finalAddresses = await Moralis.Streams.getAddresses({
      id: usdtStream.id
    })
    
    console.log(`   Stream ID: ${usdtStream.id}`)
    console.log(`   监听地址总数: ${finalAddresses.result?.length || 0}`)
    console.log(`   Webhook URL: ${WEBHOOK_URL}`)
    console.log(`   状态: ${usdtStream.status}`)
    console.log('')
    
    // 显示前5个监听地址
    if (finalAddresses.result && finalAddresses.result.length > 0) {
      console.log('   监听地址示例（前5个）:')
      finalAddresses.result.slice(0, 5).forEach((addr, idx) => {
        console.log(`   ${idx + 1}. ${addr.address}`)
      })
    }
    console.log('')
    
    console.log('='.repeat(60))
    console.log('✅ Moralis Stream 配置完成')
    console.log('='.repeat(60))
    console.log('')
    console.log('工作原理：')
    console.log('1. 用户授权成功 → 地址自动添加到 wallet_monitor 表')
    console.log('2. 地址自动添加到 Moralis Stream（authorize API）')
    console.log('3. 链上有 USDT 交易 → Moralis 主动推送 Webhook')
    console.log('4. /api/moralis/webhook 接收 → 写入 wallet_transactions')
    console.log('5. 数据库触发器 → 创建 Telegram 通知')
    console.log('6. telegram-notifier → 发送消息到群组')
    console.log('')
    console.log('测试方法：')
    console.log(`向任意监听地址转账 USDT → 自动收到 Telegram 通知`)
    console.log('')
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
    if (error.response?.data) {
      console.error('详细错误:', error.response.data)
    }
  }
}

main()

