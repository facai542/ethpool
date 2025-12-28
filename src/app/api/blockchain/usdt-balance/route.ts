import { NextRequest, NextResponse } from 'next/server'

// 动态路由配置
export const dynamic = 'force-dynamic'

// ETH网络配置
const ETH_RPC_URL = 'https://ethereum.publicnode.com'
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const USDT_DECIMALS = 6

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address) {
      return NextResponse.json(
        { error: '缺少地址参数' },
        { status: 400 }
      )
    }

    console.log('🔍 查询链上USDT余额:', address)

    // 构建RPC请求
    const rpcRequest = {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: USDT_CONTRACT_ADDRESS,
          data: `0x70a08231${address.slice(2).padStart(64, '0')}` // balanceOf(address)
        },
        'latest'
      ],
      id: 1
    }

    // 调用ETH RPC
    const response = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcRequest)
    })

    if (!response.ok) {
      throw new Error(`RPC调用失败: ${response.status}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(`RPC错误: ${result.error.message}`)
    }

    // 解析余额
    const balanceHex = result.result
    const balanceWei = BigInt(balanceHex)
    const balance = Number(balanceWei) / Math.pow(10, USDT_DECIMALS)

    console.log('✅ 链上USDT余额查询成功:', balance)

    return NextResponse.json({
      success: true,
      data: {
        address,
        balance: balance.toFixed(6),
        balanceWei: balanceWei.toString(),
        decimals: USDT_DECIMALS,
        contract: USDT_CONTRACT_ADDRESS
      }
    })

  } catch (error) {
    console.error('❌ 查询链上USDT余额失败:', error)
    return NextResponse.json(
      { error: '查询链上USDT余额失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}