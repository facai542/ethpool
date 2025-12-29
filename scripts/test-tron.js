/**
 * TRON 网络连接测试脚本
 * 用于验证 TRON 节点连接和基本功能
 */

const TronWeb = require('tronweb')
require('dotenv').config({ path: '.env.local' })

// 测试网络配置
const NETWORKS = {
  shasta: {
    fullHost: 'https://api.shasta.trongrid.io',
    name: 'Shasta Testnet'
  },
  nile: {
    fullHost: 'https://api.nileex.io',
    name: 'Nile Testnet'
  },
  mainnet: {
    fullHost: 'https://api.trongrid.io',
    name: 'TRON Mainnet'
  },
  local: {
    fullHost: 'http://127.0.0.1:8090',
    name: 'Local Node'
  }
}

async function testTronConnection(networkName = 'shasta') {
  const network = NETWORKS[networkName] || NETWORKS.shasta
  console.log(`\n🔗 正在连接到 ${network.name}...`)
  console.log(`📍 RPC URL: ${network.fullHost}\n`)

  const tronWeb = new TronWeb({
    fullHost: network.fullHost,
    headers: process.env.TRON_API_KEY ? { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY } : {}
  })

  try {
    // 1. 测试基本连接
    console.log('1️⃣ 测试基本连接...')
    const block = await tronWeb.trx.getCurrentBlock()
    console.log(`   ✅ 连接成功！`)
    console.log(`   📦 当前区块高度: ${block.block_header.raw_data.number}`)
    console.log(`   ⏰ 区块时间: ${new Date(block.block_header.raw_data.timestamp).toLocaleString()}\n`)

    // 2. 测试账户查询
    console.log('2️⃣ 测试账户查询...')
    const testAddress = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf' // 示例地址
    try {
      const account = await tronWeb.trx.getAccount(testAddress)
      console.log(`   ✅ 账户查询成功`)
      console.log(`   📍 地址: ${testAddress}`)
      console.log(`   💰 TRX 余额: ${tronWeb.fromSun(account.balance || 0)} TRX\n`)
    } catch (error) {
      console.log(`   ⚠️  账户查询失败（可能地址不存在）: ${error.message}\n`)
    }

    // 3. 测试 TRC20 合约查询
    console.log('3️⃣ 测试 TRC20 合约查询...')
    const usdtContract = networkName === 'mainnet' 
      ? 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'  // 主网 USDT
      : 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'  // 测试网 USDT
    
    try {
      const contract = await tronWeb.contract().at(usdtContract)
      const name = await contract.name().call()
      const symbol = await contract.symbol().call()
      const decimals = await contract.decimals().call()
      
      console.log(`   ✅ 合约查询成功`)
      console.log(`   📄 合约地址: ${usdtContract}`)
      console.log(`   📛 代币名称: ${name}`)
      console.log(`   🏷️  代币符号: ${symbol}`)
      console.log(`   🔢 小数位数: ${decimals}\n`)

      // 查询余额
      try {
        const balance = await contract.balanceOf(testAddress).call()
        const balanceFormatted = tronWeb.toBigNumber(balance).dividedBy(10 ** decimals).toString()
        console.log(`   💰 ${symbol} 余额: ${balanceFormatted} ${symbol}\n`)
      } catch (error) {
        console.log(`   ⚠️  余额查询失败: ${error.message}\n`)
      }
    } catch (error) {
      console.log(`   ⚠️  合约查询失败: ${error.message}\n`)
    }

    // 4. 测试交易查询
    console.log('4️⃣ 测试交易查询...')
    try {
      const transactions = await tronWeb.trx.getTransactionsFromThis(testAddress, 1)
      console.log(`   ✅ 交易查询成功`)
      console.log(`   📊 交易数量: ${transactions.length}\n`)
    } catch (error) {
      console.log(`   ⚠️  交易查询失败: ${error.message}\n`)
    }

    console.log('✅ 所有测试完成！\n')
    return true

  } catch (error) {
    console.error('❌ 连接失败:', error.message)
    console.error('   详细错误:', error)
    return false
  }
}

// 主函数
async function main() {
  const networkName = process.argv[2] || 'shasta'
  
  console.log('🚀 TRON 网络连接测试工具')
  console.log('=' .repeat(50))
  
  const success = await testTronConnection(networkName)
  
  if (success) {
    console.log('💡 提示:')
    console.log('   - 使用 "node scripts/test-tron.js shasta" 测试 Shasta 测试网')
    console.log('   - 使用 "node scripts/test-tron.js nile" 测试 Nile 测试网')
    console.log('   - 使用 "node scripts/test-tron.js mainnet" 测试主网')
    console.log('   - 使用 "node scripts/test-tron.js local" 测试本地节点')
    process.exit(0)
  } else {
    console.log('❌ 测试失败，请检查网络连接和配置')
    process.exit(1)
  }
}

main()

