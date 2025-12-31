/**
 * 最终创建 Moralis Stream - 确保配置正确
 */

const Moralis = require('moralis').default
const { createClient } = require('@supabase/supabase-js')

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const SUPABASE_URL = 'https://bfcpimnfgidhgigtgehs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM'
const WEBHOOK_URL = 'https://ethmax.vercel.app/api/moralis/webhook'
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('创建 Moralis Stream - 完整配置')
  console.log('='.repeat(60))
  console.log('Webhook URL:', WEBHOOK_URL)
  console.log('')
  
  try {
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    console.log('✅ Moralis 初始化成功\n')
    
    // 1. 获取监听地址
    console.log('1. 从数据库获取监听地址...')
    const { data: monitoredWallets } = await supabase
      .from('wallet_monitor')
      .select('wallet_address')
      .eq('is_active', true)
    
    const addresses = (monitoredWallets || [])
      .map(w => w.wallet_address.toLowerCase())
      .filter(addr => addr.length === 42 && addr.startsWith('0x'))
    
    console.log(`✅ 找到 ${addresses.length} 个有效地址`)
    console.log('前3个地址:', addresses.slice(0, 3))
    console.log('')
    
    // 2. 创建 Stream（完整配置）
    console.log('2. 创建 Stream...')
    const streamConfig = {
      chains: ['0x1'],
      description: 'ETH USDT Transaction Monitor - 只监听指定地址',
      tag: 'eth-usdt-monitor',
      webhookUrl: WEBHOOK_URL,
      includeNativeTxs: false,
      includeContractLogs: true,
      allAddresses: false,
      includeInternalTxs: false,
      abi: [
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'address', name: 'to', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }
          ],
          name: 'Transfer',
          type: 'event'
        }
      ],
      topic0: ['Transfer(address,address,uint256)'],
      advancedOptions: [
        {
          topic0: 'Transfer(address,address,uint256)',
          filter: { eq: ['address', USDT_CONTRACT] }
        }
      ]
    }
    
    console.log('Stream 配置:')
    console.log('  - Webhook:', streamConfig.webhookUrl)
    console.log('  - 链: Ethereum Mainnet')
    console.log('  - 合约:', USDT_CONTRACT)
    console.log('  - 事件: Transfer')
    console.log('')
    
    const stream = await Moralis.Streams.add(streamConfig)
    
    // 从响应中获取 Stream ID
    const streamId = stream.id || stream.streamId || stream._id
    
    console.log('✅ Stream 创建成功')
    console.log('  Stream ID:', streamId)
    console.log('')
    
    // 3. 批量添加地址
    console.log('3. 批量添加监听地址...')
    const batchSize = 100
    let totalAdded = 0
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      console.log(`  批次 ${Math.floor(i / batchSize) + 1}: 添加 ${batch.length} 个地址...`)
      
      try {
        await Moralis.Streams.addAddress({
          id: streamId,
          address: batch
        })
        totalAdded += batch.length
        console.log(`  ✅ 成功添加 ${batch.length} 个地址`)
      } catch (err) {
        const errorMsg = err.message || String(err)
        if (errorMsg.includes('already exists')) {
          console.log(`  ℹ️  地址已存在`)
          totalAdded += batch.length
        } else {
          console.error(`  ❌ 失败:`, errorMsg)
        }
      }
    }
    
    console.log('')
    console.log('='.repeat(60))
    console.log('✅ 配置完成')
    console.log('='.repeat(60))
    console.log('')
    console.log('Stream 信息:')
    console.log('  ID:', streamId)
    console.log('  监听地址:', totalAdded)
    console.log('  Webhook:', WEBHOOK_URL)
    console.log('  USDT 合约:', USDT_CONTRACT)
    console.log('')
    console.log('重要：保存这个 Stream ID')
    console.log(`  ${streamId}`)
    console.log('')
    console.log('立即测试：')
    console.log('1. 访问 https://admin.moralis.io/streams')
    console.log('2. 找到 Stream（按创建时间最新的）')
    console.log('3. 点击 "Test Stream" 或 "Send Test Event"')
    console.log('4. 检查 Telegram 是否收到测试通知')
    console.log('')
    console.log('真实交易测试：')
    console.log('1. 向监听地址转账 USDT（任意金额）')
    console.log('2. 等待交易确认（约2-3分钟）')
    console.log('3. 检查 Telegram 群组')
    console.log('')
    
  } catch (error) {
    console.error('❌ 失败:', error.message)
    console.error('\n完整错误:')
    console.error(error)
  }
}

main()


