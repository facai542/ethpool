/**
 * 添加单个地址到 Moralis Stream
 */

require('dotenv').config({ path: '.env.local' })
const Moralis = require('moralis').default

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const STREAM_ID = 'ddc148ad-ca5a-4e0e-930b-a4769022c670'  // 2025-10-09 更新
const ADDRESS = '0xB18B7561873DE63F43fB797BF37C9EdEB396b446'

async function main() {
  console.log('添加地址到 Moralis Stream 监听')
  console.log('='.repeat(50))
  console.log(`地址: ${ADDRESS}`)
  console.log(`Stream ID: ${STREAM_ID}`)
  console.log('')
  
  try {
    // 初始化 Moralis
    await Moralis.start({ apiKey: MORALIS_API_KEY })
    console.log('✅ Moralis SDK 初始化成功')
    console.log('')
    
    // 添加地址（转换为小写）
    console.log('正在添加地址...')
    const addressLower = ADDRESS.toLowerCase()
    
    try {
      await Moralis.Streams.addAddress({
        id: STREAM_ID,
        address: [addressLower]
      })
      console.log('✅ 地址添加成功')
    } catch (err) {
      const errorMsg = err.message || String(err)
      if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
        console.log('ℹ️  地址已存在于监听列表中（这是正常的）')
        console.log('✅ 地址确认在监听中')
      } else {
        console.error('❌ 添加失败:', errorMsg)
        throw err
      }
    }
    
    console.log('')
    console.log('='.repeat(50))
    console.log('配置完成！')
    console.log('='.repeat(50))
    console.log('')
    console.log('监听详情：')
    console.log(`- 地址: ${ADDRESS}`)
    console.log(`- 链: Ethereum Mainnet`)
    console.log(`- 代币: USDT`)
    console.log(`- 状态: 监听中`)
    console.log('')
    console.log('测试方法：')
    console.log('1. 向该地址转账任意金额 USDT')
    console.log('2. 等待交易确认（约15秒）')
    console.log('3. Moralis 检测到交易（1-2秒）')
    console.log('4. 自动发送 Telegram 通知到群组')
    console.log('')
    
  } catch (error) {
    console.error('执行失败:', error.message)
  }
}

main()

