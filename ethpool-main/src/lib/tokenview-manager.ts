/**
 * Tokenview 地址管理器
 * 实施地址优先级策略，自动管理监听地址上限
 */

import { addAddressToTokenview, removeAddressFromTokenview, getTokenviewMonitoredAddresses } from './tokenview'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tokenview 免费计划上限
const TOKENVIEW_FREE_LIMIT = 10

/**
 * 智能添加地址到 Tokenview
 * 如果达到上限，自动移除最不活跃的地址
 */
export async function smartAddAddressToTokenview(address: string): Promise<boolean> {
  try {
    console.log('🧠 智能添加地址到 Tokenview:', address)
    
    // 1. 尝试直接添加
    const added = await addAddressToTokenview(address)
    
    if (added) {
      console.log('✅ 地址直接添加成功')
      return true
    }
    
    // 2. 如果失败（可能达到上限），获取当前监听列表
    console.log('⚠️ 直接添加失败，检查是否达到上限...')
    
    const currentAddresses = await getTokenviewMonitoredAddresses()
    
    if (currentAddresses.length >= TOKENVIEW_FREE_LIMIT) {
      console.log(`⚠️ 已达到上限 (${currentAddresses.length}/${TOKENVIEW_FREE_LIMIT})`)
      
      // 3. 查找最不活跃的地址
      const leastActiveAddress = await findLeastActiveAddress(currentAddresses)
      
      if (leastActiveAddress) {
        console.log(`🗑️ 移除不活跃地址: ${leastActiveAddress}`)
        
        // 4. 移除不活跃地址
        const removed = await removeAddressFromTokenview(leastActiveAddress)
        
        if (removed) {
          console.log('✅ 不活跃地址已移除')
          
          // 5. 再次尝试添加新地址
          const retryAdded = await addAddressToTokenview(address)
          
          if (retryAdded) {
            console.log('✅ 新地址添加成功（通过替换）')
            return true
          }
        }
      }
    }
    
    console.log('❌ 智能添加失败')
    return false
    
  } catch (error) {
    console.error('❌ 智能添加异常:', error)
    return false
  }
}

/**
 * 查找最不活跃的地址
 * 优先级：
 * 1. 最久没有交易的地址
 * 2. 不在数据库监听列表中的地址
 */
async function findLeastActiveAddress(addresses: string[]): Promise<string | null> {
  try {
    console.log('🔍 查找最不活跃的地址...')
    
    // 查询每个地址的最后交易时间
    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('user_address, created_at')
      .in('user_address', addresses)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ 查询交易记录失败:', error)
      return addresses[0] // 默认返回第一个
    }
    
    // 构建每个地址的最后交易时间映射
    const lastTransactionMap = new Map<string, Date>()
    
    transactions?.forEach(tx => {
      const addr = tx.user_address.toLowerCase()
      if (!lastTransactionMap.has(addr)) {
        lastTransactionMap.set(addr, new Date(tx.created_at))
      }
    })
    
    // 查找最久没有交易的地址
    let oldestAddress: string | null = null
    let oldestTime = new Date()
    
    addresses.forEach(addr => {
      const lowerAddr = addr.toLowerCase()
      const lastTime = lastTransactionMap.get(lowerAddr)
      
      if (!lastTime) {
        // 从未有过交易记录，优先移除
        oldestAddress = addr
        oldestTime = new Date(0) // 设置为最早时间
      } else if (lastTime < oldestTime) {
        oldestAddress = addr
        oldestTime = lastTime
      }
    })
    
    if (oldestAddress) {
      const daysSinceLastTx = Math.floor((Date.now() - oldestTime.getTime()) / (1000 * 60 * 60 * 24))
      console.log(`📊 最不活跃地址: ${oldestAddress} (最后交易: ${daysSinceLastTx} 天前)`)
    }
    
    return oldestAddress
    
  } catch (error) {
    console.error('❌ 查找不活跃地址异常:', error)
    return addresses[0] // 默认返回第一个
  }
}

/**
 * 清理所有不活跃的地址
 * 建议：通过 cron job 定期执行（如每天一次）
 */
export async function cleanupInactiveAddresses() {
  try {
    console.log('🧹 开始清理不活跃的 Tokenview 监听地址...')
    
    const currentAddresses = await getTokenviewMonitoredAddresses()
    console.log(`📊 当前监听地址数: ${currentAddresses.length}`)
    
    const INACTIVE_DAYS = 7 // 7天没有交易视为不活跃
    const now = Date.now()
    const cutoffDate = new Date(now - INACTIVE_DAYS * 24 * 60 * 60 * 1000)
    
    // 查询每个地址的最后交易时间
    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('user_address, created_at')
      .in('user_address', currentAddresses)
      .gte('created_at', cutoffDate.toISOString())
    
    const activeAddresses = new Set<string>()
    transactions?.forEach(tx => {
      activeAddresses.add(tx.user_address.toLowerCase())
    })
    
    const inactiveAddresses = currentAddresses.filter(
      addr => !activeAddresses.has(addr.toLowerCase())
    )
    
    console.log(`📊 活跃地址: ${activeAddresses.size}`)
    console.log(`📊 不活跃地址: ${inactiveAddresses.length}`)
    
    // 移除不活跃地址
    for (const addr of inactiveAddresses) {
      console.log(`🗑️ 移除不活跃地址: ${addr}`)
      await removeAddressFromTokenview(addr)
      
      // 避免 API 限流
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('✅ 清理完成')
    
    return {
      success: true,
      total: currentAddresses.length,
      active: activeAddresses.size,
      removed: inactiveAddresses.length
    }
    
  } catch (error) {
    console.error('❌ 清理异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

