import { ethers } from 'ethers'
import ETH_NETWORK_CONFIG from '@/config/eth-network'
import { createClient } from '@supabase/supabase-js'

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

// 多个RPC节点，提高可靠性
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

/**
 * 查询链上USDT余额
 * @param address 钱包地址
 * @returns USDT余额（字符串格式）
 */
export async function getChainUSDTBalance(address: string): Promise<string> {
  try {
    // 验证地址格式
    if (!ethers.isAddress(address)) {
      throw new Error('无效的钱包地址格式')
    }

    console.log(`🔍 查询链上USDT余额: ${address}`)

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

    return usdtBalance
  } catch (error) {
    console.error('❌ 查询链上USDT余额失败:', error)
    throw error
  }
}

/**
 * 查询并保存链上USDT余额到数据库
 * @param walletAddress 钱包地址
 * @param userId 用户ID（可选，如果提供则直接更新，否则通过钱包地址查找）
 * @returns 更新后的USDT余额
 */
export async function queryAndSaveChainBalance(
  walletAddress: string,
  userId?: string
): Promise<string> {
  try {
    console.log(`💰 开始查询并保存链上USDT余额: ${walletAddress}`, { userId })
    
    // 查询链上余额
    const usdtBalance = await getChainUSDTBalance(walletAddress)
    const balanceNum = Number.parseFloat(usdtBalance)
    
    console.log(`📊 查询到的链上USDT余额: ${usdtBalance} (数值: ${balanceNum})`)
    
    // 保存到数据库
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.warn('⚠️ Supabase配置缺失，跳过保存余额到数据库')
      return usdtBalance
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    
    // 确保余额值正确（即使是0也要保存）
    const updateData: any = {
      onchain_usdt_balance: isNaN(balanceNum) ? 0 : balanceNum,
      balance_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log(`💾 准备更新数据库，数据:`, {
      ...updateData,
      original_balance_string: usdtBalance,
      parsed_balance_number: balanceNum,
      is_nan: isNaN(balanceNum)
    })

    let updateQuery
    if (userId) {
      // 如果提供了用户ID，直接更新
      console.log(`🔍 使用用户ID更新: ${userId}`)
      updateQuery = supabase
        .from('nh_member_new')
        .update(updateData)
        .eq('id', userId)
    } else {
      // 通过钱包地址查找并更新
      console.log(`🔍 使用钱包地址更新: ${walletAddress}`)
      updateQuery = supabase
        .from('nh_member_new')
        .update(updateData)
        .eq('wallet_address', walletAddress)
        .eq('is_active', true)
    }

    const { data: updateData_result, error: updateError } = await updateQuery

    if (updateError) {
      console.error('❌ 保存链上USDT余额到数据库失败:', {
        error: updateError,
        walletAddress,
        userId,
        balance: usdtBalance
      })
      // 不抛出错误，只记录日志，因为余额查询成功但保存失败不应该影响主流程
    } else {
      console.log(`✅ 链上USDT余额已保存到数据库: ${usdtBalance} USDT`, {
        walletAddress,
        userId,
        updatedRows: updateData_result
      })
      
      // 验证更新是否成功
      const { data: verifyData, error: verifyError } = await supabase
        .from('nh_member_new')
        .select('onchain_usdt_balance, balance_updated_at')
        .eq(userId ? 'id' : 'wallet_address', userId || walletAddress)
        .single()
      
      if (!verifyError && verifyData) {
        console.log(`🔍 验证更新结果:`, {
          saved_balance: verifyData.onchain_usdt_balance,
          balance_updated_at: verifyData.balance_updated_at,
          expected_balance: balanceNum
        })
        
        // 如果保存的余额与期望的不一致，记录警告
        const savedBalance = Number.parseFloat(String(verifyData.onchain_usdt_balance || 0))
        if (Math.abs(savedBalance - balanceNum) > 0.000001) {
          console.warn('⚠️ 保存的余额与期望值不一致:', {
            expected: balanceNum,
            saved: savedBalance,
            difference: Math.abs(savedBalance - balanceNum)
          })
        }
      } else {
        console.warn('⚠️ 验证更新结果失败:', verifyError)
      }
    }

    return usdtBalance
  } catch (error) {
    console.error('❌ 查询并保存链上余额失败:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      walletAddress,
      userId
    })
    // 不抛出错误，只记录日志，避免影响主流程
    return '0'
  }
}

