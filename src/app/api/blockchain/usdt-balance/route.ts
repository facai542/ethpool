import { NextRequest, NextResponse } from 'next/server'
import ETH_NETWORK_CONFIG from '@/config/eth-network'

// 动态路由配置
export const dynamic = 'force-dynamic'

// ETH网络配置 - 以太坊主网
const ETH_RPC_URL = ETH_NETWORK_CONFIG.RPC_URL
const USDT_CONTRACT_ADDRESS = ETH_NETWORK_CONFIG.USDT_CONTRACT_ADDRESS
const USDT_DECIMALS = ETH_NETWORK_CONFIG.USDT_DECIMALS

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