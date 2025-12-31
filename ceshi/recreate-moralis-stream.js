/**
 * 重新创建 Moralis Stream - 完整配置
 * 用于彻底解决 Webhook 不工作的问题
 */

const Moralis = require('moralis').default
const { createClient } = require('@supabase/supabase-js')

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const SUPABASE_URL = 'https://bfcpimnfgidhgigtgehs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM'

// 请在这里填写你的实际 Vercel 域名
const WEBHOOK_URL = 'https://ethmax.vercel.app/api/moralis/webhook'

const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('重新创建 Moralis Stream - 完整配置')
  console.log('='.repeat(60))
  console.log('Webhook URL:', WEBHOOK_URL)
  console.log('USDT 合约:', USDT_CONTRACT)
  console.log('')
  
  try {
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    console.log('✅ Moralis 初始化成功\n')
    
    // 1. 获取所有监听地址
    console.log('1. 从数据库获取监听地址...')
    const { data: monitoredWallets } = await supabase
      .from('wallet_monitor')
      .select('wallet_address')
      .eq('is_active', true)
    
    const addresses = (monitoredWallets || [])
      .map(w => w.wallet_address.toLowerCase())
      .filter(addr => addr.length === 42 && addr.startsWith('0x'))
    
    console.log(`✅ 找到 ${addresses.length} 个有效地址\n`)
    
    if (addresses.length === 0) {
      console.log('❌ 没有监听地址，退出')
      return
    }
    
    // 2. 删除旧 Stream（可选）
    console.log('2. 删除旧 Stream（如果存在）...')
    try {
      const streams = await Moralis.Streams.getAll({ limit: 20 })
      for (const stream of streams.result || []) {
        if (stream.tag === 'eth-usdt-monitor') {
          console.log(`删除旧 Stream: ${stream.id}`)
          await Moralis.Streams.delete({ id: stream.id })
          console.log('✅ 旧 Stream 已删除')
        }
      }
    } catch (e) {
      console.log('ℹ️  跳过删除（可能不存在）')
    }
    console.log('')
    
    // 3. 创建新 Stream（完整配置）
    console.log('3. 创建新 Stream（完整配置）...')
    const newStream = await Moralis.Streams.add({
      chains: ['0x1'],  // Ethereum Mainnet
      description: 'ETH USDT Transaction Monitor - 监听指定地址的USDT转账',
      tag: 'eth-usdt-monitor',
      webhookUrl: WEBHOOK_URL,
      includeNativeTxs: false,  // 不监听 ETH 转账
      includeContractLogs: true,  // 监听合约事件
      allAddresses: false,  // 不监听所有地址
      includeInternalTxs: false,
      includeAllTxLogs: false,
      getNativeBalances: [],
      
      // 关键：USDT Transfer 事件 ABI
      abi: [{
        anonymous: false,
        inputs: [
          { indexed: true, internalType: 'address', name: 'from', type: 'address' },
          { indexed: true, internalType: 'address', name: 'to', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }
        ],
        name: 'Transfer',
        type: 'event'
      }],
      
      // 关键：只监听 USDT 合约的 Transfer 事件
      topic0: ['Transfer(address,address,uint256)'],
      advancedOptions: [{
        topic0: 'Transfer(address,address,uint256)',
        filter: { eq: ['address', USDT_CONTRACT] },
        includeNativeTxs: false
      }]
    })
    
    console.log('✅ Stream 创建成功')
    console.log('  Stream ID:', newStream.id)
    console.log('  Tag:', newStream.tag)
    console.log('  Webhook:', newStream.webhookUrl)
    console.log('')
    
    // 4. 批量添加地址
    console.log('4. 批量添加监听地址...')
    const batchSize = 100
    let totalAdded = 0
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      console.log(`  添加第 ${i + 1}-${Math.min(i + batchSize, addresses.length)} 个地址...`)
      
      try {
        await Moralis.Streams.addAddress({
          id: newStream.id,
          address: batch
        })
        totalAdded += batch.length
        console.log(`  ✅ 成功添加 ${batch.length} 个地址`)
      } catch (err) {
        console.error(`  ❌ 添加失败:`, err.message)
      }
    }
    
    console.log('')
    console.log('='.repeat(60))
    console.log('✅ Stream 重新创建完成')
    console.log('='.repeat(60))
    console.log('')
    console.log('新 Stream 信息：')
    console.log('  ID:', newStream.id)
    console.log('  监听地址数:', totalAdded)
    console.log('  Webhook:', WEBHOOK_URL)
    console.log('  状态: active')
    console.log('')
    console.log('重要：请将新的 Stream ID 更新到配置文件中')
    console.log(`  新 ID: ${newStream.id}`)
    console.log('')
    console.log('测试步骤：')
    console.log('1. 访问 https://admin.moralis.io/streams')
    console.log('2. 找到新创建的 Stream')
    console.log('3. 点击 "Test Stream"')
    console.log('4. 检查 Vercel 日志是否收到请求')
    console.log('5. 如果收到，向监听地址转账 USDT 测试')
    console.log('')
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message)
    if (error.response?.data) {
      console.error('详细错误:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

main()


