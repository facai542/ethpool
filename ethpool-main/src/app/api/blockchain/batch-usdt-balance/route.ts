import { NextRequest, NextResponse } from 'next/server'

// ETH主网USDT合约地址
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const ETH_RPC_URL = 'https://ethereum.publicnode.com'

export async function POST(request: NextRequest) {
  try {
    const { addresses } = await request.json()
    
    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { success: false, message: '请提供地址数组' },
        { status: 400 }
      )
    }

    console.log(`🔍 批量获取 ${addresses.length} 个地址的链上USDT余额...`)

    // 1. 获取最新区块号
    const blockResponse = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    })

    const blockData = await blockResponse.json()
    const blockNumber = blockData.result

    // 2. 批量获取USDT余额
    const balancePromises = addresses.map(async (address, index) => {
      try {
        const balanceResponse = await fetch(ETH_RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: USDT_CONTRACT_ADDRESS,
                data: `0x70a08231${address.slice(2).padStart(64, '0')}` // balanceOf(address)
              },
              blockNumber
            ],
            id: index + 2
          })
        })

        const balanceData = await balanceResponse.json()
        
        if (balanceData.error) {
          console.error(`❌ 获取地址 ${address} 余额失败:`, balanceData.error)
          return { address, balance: 0, error: balanceData.error.message }
        }

        // 解析余额 (ETH主网USDT使用6位小数)
        const balanceHex = balanceData.result
        const balanceWei = BigInt(balanceHex)
        const balance = Number(balanceWei) / Math.pow(10, 6)
        const balanceFormatted = parseFloat(balance.toFixed(6))

        return { address, balance: balanceFormatted, error: null }
      } catch (error) {
        console.error(`❌ 获取地址 ${address} 余额异常:`, error)
        return { 
          address, 
          balance: 0, 
          error: error instanceof Error ? error.message : '未知错误' 
        }
      }
    })

    const results = await Promise.all(balancePromises)
    
    // 统计结果
    const successCount = results.filter(r => !r.error).length
    const errorCount = results.filter(r => r.error).length

    console.log(`✅ 批量获取完成: 成功 ${successCount} 个, 失败 ${errorCount} 个`)

    return NextResponse.json({
      success: true,
      message: '批量获取链上USDT余额成功',
      data: {
        results,
        summary: {
          total: addresses.length,
          success: successCount,
          error: errorCount
        }
      }
    })

  } catch (error) {
    console.error('❌ 批量获取链上USDT余额失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '批量获取链上USDT余额失败', 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}
