import { type NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// ETH 主网配置
const ETH_RPC_URL = 'https://eth.llamarpc.com' // 使用免费的公共 RPC
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT 合约地址
const STAKING_CONTRACT_ADDRESS = '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218' // 修复后的质押合约地址
const USDT_DECIMALS = 6

// 查询 ETH 余额
async function getETHBalance(address: string): Promise<string> {
  try {
    const response = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      })
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    // 将 wei 转换为 ETH
    const wei = Number.parseInt(data.result, 16)
    const eth = wei / Math.pow(10, 18)
    return eth.toFixed(6)
  } catch (error) {
    console.error('查询ETH余额失败:', error)
    return '0.000000'
  }
}

// 查询 USDT 余额
async function getUSDTBalance(address: string): Promise<string> {
  try {
    // 确保地址格式正确：去除0x，转小写，然后在左侧补0到64位
    const cleanAddress = address.toLowerCase().replace('0x', '').padStart(64, '0')
    
    // 调用 USDT 合约的 balanceOf 方法
    const response = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: USDT_CONTRACT_ADDRESS,
          data: `0x70a08231${cleanAddress}` // balanceOf(address)
        }, 'latest'],
        id: 1
      })
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    // 将结果转换为 USDT 数量
    const balance = Number.parseInt(data.result, 16)
    const usdt = balance / Math.pow(10, USDT_DECIMALS)
    return usdt.toFixed(6)
  } catch (error) {
    console.error('查询USDT余额失败:', error)
    return '0.000000'
  }
}

// 查询 USDT 授权额度
async function getUSDTAllowance(address: string, spender: string): Promise<string> {
  try {
    // 确保地址格式正确：去除0x，转小写，然后在左侧补0到64位
    const cleanAddress = address.toLowerCase().replace('0x', '').padStart(64, '0')
    const cleanSpender = spender.toLowerCase().replace('0x', '').padStart(64, '0')
    
    // 调用 USDT 合约的 allowance 方法
    const response = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: USDT_CONTRACT_ADDRESS,
          data: `0xdd62ed3e${cleanAddress}${cleanSpender}` // allowance(owner, spender)
        }, 'latest'],
        id: 1
      })
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    // 将结果转换为 USDT 数量
    const allowance = Number.parseInt(data.result, 16)
    const usdt = allowance / Math.pow(10, USDT_DECIMALS)
    return usdt.toFixed(6)
  } catch (error) {
    console.error('查询USDTverify额度失败:', error)
    return '0.000000'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, spenderAddress } = body

    if (!userAddress) {
      const response = NextResponse.json({
        success: false,
        error: '缺少用户地址参数'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 如果没有指定授权对象，默认使用质押合约地址
    const targetSpender = spenderAddress || STAKING_CONTRACT_ADDRESS

    // 验证地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      const response = NextResponse.json({
        success: false,
        error: '无效的以太坊地址格式'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 验证授权对象地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(targetSpender)) {
      const response = NextResponse.json({
        success: false,
        error: '无效的授权对象地址格式'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    console.log(`🔍 查询ETH链地址 ${userAddress} 对 ${targetSpender} 的授权额度`)

    // 并行查询所有余额
    const [ethBalance, usdtBalance, usdtAllowance] = await Promise.all([
      getETHBalance(userAddress),
      getUSDTBalance(userAddress),
      getUSDTAllowance(userAddress, targetSpender) // 查询对指定授权对象的授权额度
    ])

    // 查询用户对质押合约的授权额度
    const stakingAllowance = await getUSDTAllowance(userAddress, STAKING_CONTRACT_ADDRESS)
    
    const response = NextResponse.json({
      success: true,
      data: {
        userAddress: userAddress,
        ethBalance: ethBalance,
        usdtBalance: usdtBalance,
        allowance: usdtAllowance,
        spenderAddress: targetSpender,
        stakingContractAddress: STAKING_CONTRACT_ADDRESS,
        stakingAllowance: stakingAllowance,
        usdtContractAddress: USDT_CONTRACT_ADDRESS,
        message: usdtAllowance === '0.000000' ? `用户未对授权对象 ${targetSpender} 进行USDT授权，需要用户手动授权USDT额度` : `用户已对授权对象 ${targetSpender} 进行USDT授权`,
        stakingMessage: stakingAllowance === '0.000000' ? `用户未对质押合约 ${STAKING_CONTRACT_ADDRESS} 进行USDT授权` : `用户已对质押合约 ${STAKING_CONTRACT_ADDRESS} 进行USDT授权，额度: ${stakingAllowance} USDT`,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('查询ETH链余额失败:', error)
    const response = NextResponse.json({
      success: false,
      error: '查询ETH链余额失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}
