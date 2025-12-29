import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import ETH_NETWORK_CONFIG from '@/config/eth-network'

// 使用service role key绕过RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ETH网络配置 - 使用 Tenderly 虚拟测试网
const USDT_CONTRACT_ADDRESS = ETH_NETWORK_CONFIG.USDT_CONTRACT_ADDRESS
const ETH_RPC_URL = ETH_NETWORK_CONFIG.RPC_URL

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 开始获取所有授权用户的链上USDT余额...')

    // 1. 获取所有有效用户
    const { data: members, error: membersError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, usdt, eth, is_effective')
      .eq('is_effective', 1)
      .not('wallet_address', 'is', null)
      .order('id', { ascending: true })

    if (membersError) {
      console.error('❌ 获取用户列表失败:', membersError)
      return NextResponse.json(
        { success: false, message: '获取用户列表失败', error: membersError.message },
        { status: 500 }
      )
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有有效用户',
        data: { users: [], summary: { total: 0, success: 0, error: 0 } }
      })
    }

    console.log(`📊 找到 ${members.length} 个有效用户`)

    // 2. 获取最新区块号
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

    // 3. 批量获取USDT余额
    const balancePromises = members.map(async (member, index) => {
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
                data: `0x70a08231${member.wallet_address.slice(2).padStart(64, '0')}` // balanceOf(wallet_address)
              },
              blockNumber
            ],
            id: index + 2
          })
        })

        const balanceData = await balanceResponse.json()
        
        if (balanceData.error) {
          console.error(`❌ 获取地址 ${member.wallet_address} 余额失败:`, balanceData.error)
          return {
            ...member,
            onchain_usdt_balance: 0,
            error: balanceData.error.message,
            success: false
          }
        }

        // 解析余额 (ETH主网USDT使用6位小数)
        const balanceHex = balanceData.result
        const balanceWei = BigInt(balanceHex)
        const balance = Number(balanceWei) / Math.pow(10, 6)
        const balanceFormatted = parseFloat(balance.toFixed(6))

        return {
          ...member,
          onchain_usdt_balance: balanceFormatted,
          error: null,
          success: true
        }
      } catch (error) {
        console.error(`❌ 获取地址 ${member.wallet_address} 余额异常:`, error)
        return {
          ...member,
          onchain_usdt_balance: 0,
          error: error instanceof Error ? error.message : '未知错误',
          success: false
        }
      }
    })

    const results = await Promise.all(balancePromises)
    
    // 统计结果
    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    console.log(`✅ 批量获取完成: 成功 ${successCount} 个, 失败 ${errorCount} 个`)

    return NextResponse.json({
      success: true,
      message: '获取所有用户链上USDT余额成功',
      data: {
        users: results,
        summary: {
          total: members.length,
          success: successCount,
          error: errorCount
        },
        blockNumber: blockNumber,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 获取用户余额失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '获取用户余额失败', 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}
