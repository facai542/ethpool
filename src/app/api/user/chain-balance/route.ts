import { type NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import ETH_NETWORK_CONFIG from '@/config/eth-network'

// USDT合约ABI（简化版，只包含balanceOf函数）
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
]

const USDT_CONTRACT_ADDRESS = ETH_NETWORK_CONFIG.USDT_CONTRACT_ADDRESS

// 多个RPC节点，提高可靠性 - 使用 Tenderly 虚拟测试网
const ETH_RPC_URLS = [
  ETH_NETWORK_CONFIG.RPC_URL,
  ...ETH_NETWORK_CONFIG.FALLBACK_RPC_URLS
]

// 创建Provider的函数，支持多RPC节点
async function createProvider() {
  for (const rpcUrl of ETH_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      // 测试连接
      await provider.getBlockNumber()
      console.log(`✅ 成功连接到RPC节点: ${rpcUrl}`)
      return provider
    } catch (error) {
      console.warn(`⚠️ RPC节点连接失败: ${rpcUrl}`, error instanceof Error ? error.message : "未知错误")
      continue
    }
  }
  throw new Error('所有RPC节点连接失败')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { success: false, error: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    // 验证地址格式
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { success: false, error: '无效的钱包地址格式' },
        { status: 400 }
      )
    }

    console.log(`🔍 查询用户链上USDT余额: ${address}`)

    // 创建Provider
    const provider = await createProvider()
    
    // 创建USDT合约实例
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider)
    
    // 获取USDT余额
    const balance = await usdtContract.balanceOf(address)
    
    // 转换为USDT单位（USDT有6位小数）
    const usdtBalance = ethers.formatUnits(balance, 6)
    
    // 获取当前区块号
    const blockNumber = await provider.getBlockNumber()
    
    console.log(`✅ 用户 ${address} 链上USDT余额: ${usdtBalance} USDT (区块: ${blockNumber})`)

    return NextResponse.json({
      success: true,
      data: {
        address,
        usdtBalance: usdtBalance, // 保持字符串格式，与前端期望一致
        blockNumber,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 查询链上USDT余额失败:', error)
    return NextResponse.json(
      { success: false, error: '查询链上余额失败: ' + error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}




