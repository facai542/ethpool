/**
 * TRON 交易调试工具
 * 提供类似 Tenderly 的部分功能：
 * - 交易详情分析
 * - Gas/Energy 使用分析
 * - 合约调用追踪
 * - 错误信息解析
 */

const TronWeb = require('tronweb')
require('dotenv').config({ path: '.env.local' })

class TronDebugger {
  constructor(network = 'shasta') {
    const networks = {
      shasta: 'https://api.shasta.trongrid.io',
      nile: 'https://api.nileex.io',
      mainnet: 'https://api.trongrid.io',
      local: 'http://127.0.0.1:8090'
    }

    this.tronWeb = new TronWeb({
      fullHost: networks[network] || networks.shasta,
      headers: process.env.TRON_API_KEY ? { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY } : {}
    })
    this.network = network
  }

  /**
   * 分析交易详情
   */
  async analyzeTransaction(txHash) {
    console.log(`\n🔍 分析交易: ${txHash}`)
    console.log('='.repeat(60))

    try {
      // 获取交易信息
      const tx = await this.tronWeb.trx.getTransaction(txHash)
      const txInfo = await this.tronWeb.trx.getTransactionInfo(txHash)

      if (!tx) {
        console.log('❌ 交易不存在或尚未确认')
        return null
      }

      // 基本信息
      console.log('\n📋 基本信息:')
      console.log(`   区块号: ${tx.blockNumber || '待确认'}`)
      console.log(`   时间戳: ${tx.raw_data ? new Date(tx.raw_data.timestamp).toLocaleString() : 'N/A'}`)
      console.log(`   状态: ${txInfo ? (txInfo.receipt.result === 'SUCESS' ? '✅ 成功' : '❌ 失败') : '待确认'}`)

      // 分析合约调用
      if (tx.raw_data && tx.raw_data.contract) {
        for (const contract of tx.raw_data.contract) {
          if (contract.type === 'TriggerSmartContract') {
            await this.analyzeContractCall(contract, txInfo)
          }
        }
      }

      // 分析费用
      if (txInfo) {
        this.analyzeFees(txInfo)
      }

      // 分析日志
      if (txInfo && txInfo.log) {
        this.analyzeLogs(txInfo.log)
      }

      return { tx, txInfo }

    } catch (error) {
      console.error('❌ 分析失败:', error.message)
      return null
    }
  }

  /**
   * 分析合约调用
   */
  async analyzeContractCall(contract, txInfo) {
    console.log('\n📞 合约调用分析:')
    
    const contractAddress = this.tronWeb.address.fromHex(
      contract.parameter.value.contract_address
    )
    const callerAddress = this.tronWeb.address.fromHex(
      contract.parameter.value.owner_address
    )
    const callValue = contract.parameter.value.call_value || 0
    const data = contract.parameter.value.data

    console.log(`   合约地址: ${contractAddress}`)
    console.log(`   调用者: ${callerAddress}`)
    console.log(`   转账金额: ${this.tronWeb.fromSun(callValue)} TRX`)

    // 解析函数调用
    if (data && data.length >= 8) {
      const functionSelector = data.substring(0, 8)
      console.log(`   函数选择器: ${functionSelector}`)

      // 常见函数选择器
      const commonFunctions = {
        'a9059cbb': 'transfer(address,uint256)',
        '23b872dd': 'transferFrom(address,address,uint256)',
        '095ea7b3': 'approve(address,uint256)',
        '70a08231': 'balanceOf(address)',
        '06fdde03': 'name()',
        '95d89b41': 'symbol()',
        '313ce567': 'decimals()'
      }

      if (commonFunctions[functionSelector]) {
        console.log(`   函数名称: ${commonFunctions[functionSelector]}`)
      }

      // 解析参数
      if (data.length > 8) {
        const params = data.substring(8)
        console.log(`   参数数据: ${params}`)
      }
    }

    // 尝试获取合约信息
    try {
      const contractInstance = await this.tronWeb.contract().at(contractAddress)
      const name = await contractInstance.name().call().catch(() => null)
      const symbol = await contractInstance.symbol().call().catch(() => null)
      
      if (name) console.log(`   代币名称: ${name}`)
      if (symbol) console.log(`   代币符号: ${symbol}`)
    } catch (error) {
      // 忽略错误，可能不是标准代币合约
    }
  }

  /**
   * 分析费用使用
   */
  analyzeFees(txInfo) {
    console.log('\n💰 费用分析:')
    
    if (txInfo.receipt) {
      const receipt = txInfo.receipt
      
      console.log(`   Energy 使用: ${receipt.energy_usage_total || 0}`)
      console.log(`   Energy 费用: ${this.tronWeb.fromSun(receipt.energy_fee || 0)} TRX`)
      console.log(`   Net 使用: ${receipt.net_usage || 0}`)
      console.log(`   Net 费用: ${this.tronWeb.fromSun(receipt.net_fee || 0)} TRX`)
      
      const totalFee = (receipt.energy_fee || 0) + (receipt.net_fee || 0)
      console.log(`   总费用: ${this.tronWeb.fromSun(totalFee)} TRX`)
    }

    if (txInfo.fee) {
      console.log(`   交易费用: ${this.tronWeb.fromSun(txInfo.fee)} TRX`)
    }
  }

  /**
   * 分析事件日志
   */
  analyzeLogs(logs) {
    if (!logs || logs.length === 0) {
      return
    }

    console.log('\n📊 事件日志:')
    
    logs.forEach((log, index) => {
      console.log(`\n   事件 #${index + 1}:`)
      console.log(`     合约地址: ${this.tronWeb.address.fromHex(log.address)}`)
      console.log(`     Topics: ${log.topics.length}`)
      
      // 解析 Transfer 事件
      if (log.topics.length >= 3) {
        const transferTopic = 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
        if (log.topics[0] === transferTopic) {
          const from = this.tronWeb.address.fromHex('41' + log.topics[1].substring(26))
          const to = this.tronWeb.address.fromHex('41' + log.topics[2].substring(26))
          const value = this.tronWeb.toBigNumber('0x' + log.data).toString()
          
          console.log(`     类型: Transfer`)
          console.log(`     从: ${from}`)
          console.log(`     到: ${to}`)
          console.log(`     金额: ${value}`)
        }
      }
    })
  }

  /**
   * 模拟交易（只读）
   */
  async simulateTransaction(txHash) {
    console.log(`\n🎮 模拟交易: ${txHash}`)
    console.log('='.repeat(60))

    const result = await this.analyzeTransaction(txHash)
    
    if (result && result.txInfo) {
      console.log('\n✅ 模拟完成')
      if (result.txInfo.receipt && result.txInfo.receipt.result !== 'SUCESS') {
        console.log('⚠️  交易失败，请检查错误信息')
      }
    }

    return result
  }

  /**
   * 监控地址交易
   */
  async monitorAddress(address, limit = 10) {
    console.log(`\n👀 监控地址: ${address}`)
    console.log('='.repeat(60))

    try {
      // 获取交易列表
      const transactions = await this.tronWeb.trx.getTransactionsFromThis(address, limit)
      
      console.log(`\n📋 最近 ${transactions.length} 笔交易:\n`)

      for (const tx of transactions) {
        console.log(`   TX: ${tx.txID}`)
        console.log(`   时间: ${new Date(tx.raw_data.timestamp).toLocaleString()}`)
        console.log(`   区块: ${tx.blockNumber || '待确认'}`)
        console.log('')
      }

      return transactions
    } catch (error) {
      console.error('❌ 监控失败:', error.message)
      return []
    }
  }
}

// CLI 使用
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const debugger = new TronDebugger(args[1] || 'shasta')

  console.log('🔧 TRON 交易调试工具')
  console.log('='.repeat(60))

  switch (command) {
    case 'analyze':
    case 'a':
      if (!args[1]) {
        console.log('❌ 请提供交易哈希')
        console.log('   用法: node scripts/tron-debugger.js analyze <txHash> [network]')
        process.exit(1)
      }
      await debugger.analyzeTransaction(args[1])
      break

    case 'simulate':
    case 's':
      if (!args[1]) {
        console.log('❌ 请提供交易哈希')
        console.log('   用法: node scripts/tron-debugger.js simulate <txHash> [network]')
        process.exit(1)
      }
      await debugger.simulateTransaction(args[1])
      break

    case 'monitor':
    case 'm':
      if (!args[1]) {
        console.log('❌ 请提供地址')
        console.log('   用法: node scripts/tron-debugger.js monitor <address> [network] [limit]')
        process.exit(1)
      }
      await debugger.monitorAddress(args[1], parseInt(args[2]) || 10)
      break

    default:
      console.log('\n📖 使用方法:')
      console.log('   analyze <txHash> [network]  - 分析交易详情')
      console.log('   simulate <txHash> [network]  - 模拟交易')
      console.log('   monitor <address> [network] [limit] - 监控地址交易')
      console.log('\n🌐 可用网络: shasta, nile, mainnet, local')
      console.log('\n💡 示例:')
      console.log('   node scripts/tron-debugger.js analyze <txHash> shasta')
      console.log('   node scripts/tron-debugger.js monitor <address> shasta 20')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = TronDebugger

