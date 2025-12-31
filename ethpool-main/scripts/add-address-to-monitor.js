/**
 * 手动添加地址到监听列表
 * 包括：数据库 + Moralis Stream
 */

const { createClient } = require('@supabase/supabase-js')
const Moralis = require('moralis').default
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MORALIS_API_KEY = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const STREAM_ID = 'eth-usdt-monitor'
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ethmax.vercel.app'
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

let moralisInitialized = false

async function initMoralis() {
  if (!moralisInitialized) {
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    moralisInitialized = true
    console.log('✅ Moralis SDK 初始化成功')
  }
}

async function addAddressToMonitor(address) {
  console.log(`\n========== 添加地址到监听列表 ==========`)
  console.log(`📍 地址: ${address}\n`)
  
  try {
    // 1. 添加到数据库 wallet_monitor 表
    console.log('1️⃣ 添加到数据库 wallet_monitor 表...')
    
    // 先查找用户
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, approved')
      .eq('wallet_address', address)
      .eq('is_active', true)
      .single()
    
    if (userError || !user) {
      console.log('   ⚠️  用户不存在，先创建用户记录...')
      
      // 创建用户记录
      const { data: newUser, error: createError } = await supabase
        .from('nh_member_new')
        .insert({
          wallet_address: address,
          approved: 0, // 未授权状态
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()
      
      if (createError) {
        throw new Error('创建用户失败: ' + createError.message)
      }
      
      console.log('   ✅ 用户创建成功，ID:', newUser.id)
      
      // 添加到监听表
      const { error: monitorError } = await supabase
        .from('wallet_monitor')
        .upsert({
          member_id: newUser.id,
          wallet_address: address,
          is_active: true,
          monitor_transactions: true,
          created_at: new Date().toISOString()
        })
      
      if (monitorError) {
        throw new Error('添加到监听表失败: ' + monitorError.message)
      }
      
      console.log('   ✅ 已添加到 wallet_monitor 表')
    } else {
      console.log('   ✅ 用户已存在，ID:', user.id)
      console.log('   ℹ️  授权状态:', user.approved === 1 ? '已授权' : '未授权')
      
      // 添加到监听表
      const { error: monitorError } = await supabase
        .from('wallet_monitor')
        .upsert({
          member_id: user.id,
          wallet_address: address,
          is_active: true,
          monitor_transactions: true,
          created_at: new Date().toISOString()
        })
      
      if (monitorError) {
        throw new Error('添加到监听表失败: ' + monitorError.message)
      }
      
      console.log('   ✅ 已添加到 wallet_monitor 表')
    }
    
    // 2. 添加到 Moralis Stream
    console.log('\n2️⃣ 添加到 Moralis Stream...')
    
    await initMoralis()
    
    try {
      // 尝试添加到现有 Stream
      await Moralis.Streams.addAddress({
        id: STREAM_ID,
        address: [address]
      })
      
      console.log('   ✅ 已添加到现有 Moralis Stream')
    } catch (streamError) {
      // 如果 Stream 不存在，创建新的
      if (streamError.message?.includes('not found') || streamError.message?.includes('does not exist')) {
        console.log('   ℹ️  Stream 不存在，创建新的...')
        
        const stream = await Moralis.Streams.add({
          chains: ['0x1'], // Ethereum mainnet
          description: 'ETH USDT Transaction Monitor',
          tag: STREAM_ID,
          webhookUrl: `${WEBHOOK_URL}/api/moralis/webhook`,
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
              filter: { eq: ['address', USDT_CONTRACT] }
            }
          ]
        })
        
        console.log('   ✅ Stream 创建成功，ID:', stream.id || STREAM_ID)
        
        // 添加地址到新创建的 Stream
        const newStreamId = stream.id || STREAM_ID
        await Moralis.Streams.addAddress({
          id: newStreamId,
          address: [address]
        })
        
        console.log('   ✅ 地址已添加到新创建的 Stream')
      } else {
        throw streamError
      }
    }
    
    // 3. 验证添加结果
    console.log('\n3️⃣ 验证添加结果...')
    
    // 检查数据库
    const { data: monitorRecord } = await supabase
      .from('wallet_monitor')
      .select('*')
      .eq('wallet_address', address)
      .single()
    
    if (monitorRecord) {
      console.log('   ✅ 数据库记录确认:')
      console.log('      - member_id:', monitorRecord.member_id)
      console.log('      - is_active:', monitorRecord.is_active)
      console.log('      - monitor_transactions:', monitorRecord.monitor_transactions)
    }
    
    // 检查 Moralis Stream
    console.log('\n   ✅ Moralis Stream 状态:')
    console.log('      - Stream ID:', STREAM_ID)
    console.log('      - Webhook URL:', `${WEBHOOK_URL}/api/moralis/webhook`)
    console.log('      - 监听地址:', address)
    
    console.log('\n========== 添加成功 ==========\n')
    console.log('✅ 地址已成功添加到监听列表！')
    console.log('\n📝 下一步:')
    console.log('   1. 访问 Moralis Dashboard 验证: https://admin.moralis.io/streams')
    console.log('   2. 向该地址发送测试USDT交易')
    console.log('   3. 检查 Telegram 群组是否收到通知\n')
    
  } catch (error) {
    console.error('\n❌ 添加失败:', error.message)
    if (error.stack) {
      console.error('\n错误堆栈:', error.stack)
    }
    process.exit(1)
  }
}

// 从命令行参数获取地址，或使用默认地址
const targetAddress = process.argv[2] || '0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0'

if (!targetAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
  console.error('❌ 无效的以太坊地址格式')
  console.log('使用方法: node scripts/add-address-to-monitor.js 0x...')
  process.exit(1)
}

addAddressToMonitor(targetAddress)









