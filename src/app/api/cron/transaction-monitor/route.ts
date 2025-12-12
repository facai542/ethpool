import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ETH主网配置
const ETH_RPC_URL = process.env.ETH_MAINNET_RPC_URL || 'https://ethereum.publicnode.com'
const USDT_CONTRACT = process.env.USDT_CONTRACT_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7'

/**
 * 获取最新区块号
 */
async function getLatestBlockNumber(): Promise<number> {
  try {
    const response = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    })

    const data = await response.json()
    return parseInt(data.result, 16)
  } catch (error) {
    console.error('❌ 获取最新区块号失败:', error)
    return 0
  }
}

/**
 * 获取区块中的交易
 */
async function getBlockTransactions(blockNumber: number): Promise<any[]> {
  try {
    const response = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [`0x${blockNumber.toString(16)}`, true],
        id: 1
      })
    })

    const data = await response.json()
    return data.result?.transactions || []
  } catch (error) {
    console.error('❌ 获取区块交易失败:', error)
    return []
  }
}

/**
 * 检查交易是否涉及USDT
 */
async function isUSDTTransaction(tx: any): Promise<boolean> {
  return tx.to && tx.to.toLowerCase() === USDT_CONTRACT.toLowerCase()
}

/**
 * 解析USDT交易
 */
async function parseUSDTTransaction(tx: any, blockNumber: number): Promise<any> {
  try {
    // 获取交易收据
    const receiptResponse = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [tx.hash],
        id: 1
      })
    })

    const receiptData = await receiptResponse.json()
    const receipt = receiptData.result

    if (!receipt || receipt.status !== '0x1') {
      return null // 交易失败
    }

    // 解析Transfer事件
    const transferEvent = receipt.logs.find((log: any) => 
      log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer事件签名
    )

    if (!transferEvent) {
      return null
    }

    // 解析事件数据
    const fromAddress = '0x' + transferEvent.topics[1].slice(26)
    const toAddress = '0x' + transferEvent.topics[2].slice(26)
    const valueHex = transferEvent.data
    const value = BigInt(valueHex) / BigInt(10 ** 6) // USDT使用6位小数

    return {
      tx_hash: tx.hash,
      block_number: blockNumber,
      from_wallet_address: fromAddress,
      to_wallet_address: toAddress,
      value: Number(value),
      token_wallet_address: USDT_CONTRACT,
      token_symbol: 'USDT',
      token_decimals: 6,
      gas_used: parseInt(receipt.gasUsed, 16),
      gas_price: parseInt(tx.gasPrice, 16),
      transaction_fee: (parseInt(receipt.gasUsed, 16) * parseInt(tx.gasPrice, 16)) / Math.pow(10, 18),
      status: 'success'
    }
  } catch (error) {
    console.error('❌ 解析USDT交易失败:', error)
    return null
  }
}

/**
 * 检查钱包是否在监听列表中
 */
async function isWalletMonitored(walletAddress: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('transaction_monitor')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_active', true)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('❌ 检查钱包监听状态失败:', error)
    return false
  }
}

/**
 * 创建交易通知
 */
async function createTransactionNotification(transaction: any, walletAddress: string): Promise<void> {
  try {
    const isIncoming = transaction.to_wallet_address.toLowerCase() === walletAddress.toLowerCase()
    const notificationType = isIncoming ? 'incoming' : 'outgoing'

    // 插入交易记录
    await supabase
      .from('transaction_records')
      .insert([transaction])

    // 插入通知记录
    await supabase
      .from('transaction_notifications')
      .insert([{
        wallet_wallet_address: walletAddress,
        tx_hash: transaction.tx_hash,
        notification_type: notificationType,
        amount: transaction.value,
        token_symbol: transaction.token_symbol,
        from_wallet_address: transaction.from_wallet_address,
        to_wallet_address: transaction.to_wallet_address,
        block_number: transaction.block_number
      }])

    console.log(`✅ 创建交易通知: ${walletAddress} - ${notificationType} ${transaction.value} USDT`)
  } catch (error) {
    console.error('❌ 创建交易通知失败:', error)
  }
}

/**
 * 获取链上USDT余额
 */
async function getOnChainUSDTBalance(wallet_address: string): Promise<number> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://ethmax.vercel.app'}/api/blockchain/wallet-balance?wallet_address=${wallet_address}`)
    const data = await response.json()
    
    if (data.success) {
      return data.data.usdt_balance || 0
    } else {
      console.error('❌ 获取链上USDT余额失败:', data.error)
      return 0
    }
  } catch (error) {
    console.error('❌ 获取链上USDT余额异常:', error)
    return 0
  }
}

/**
 * 获取用户信息
 */
async function getUserInfo(walletAddress: string): Promise<any> {
  try {
    const { data: userData, error } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, approved, referral_code, created_at')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ 获取用户信息失败:', error)
      return null
    }

    return userData
  } catch (error) {
    console.error('❌ 获取用户信息异常:', error)
    return null
  }
}

/**
 * 发送Telegram通知
 */
async function sendTelegramNotification(notification: any): Promise<void> {
  try {
    // 获取链上USDT余额
    const onChainBalance = await getOnChainUSDTBalance(notification.wallet_address)
    
    // 获取用户信息
    const userInfo = await getUserInfo(notification.wallet_address)
    
    const isIncoming = notification.notification_type === 'incoming'
    const amount = Math.abs(notification.amount)
    const sign = isIncoming ? '+' : '-'
    const emoji = isIncoming ? '🟢' : '🔴'
    const action = isIncoming ? '转入' : '转出'
    
    const message = `${emoji}${isIncoming ? '收入' : '支出'}USDT 提醒       ${sign}${amount} USDT

钱包余额：${onChainBalance.toFixed(6)}
顶层代理：默认代理
代理昵称：暂未设置
用户编号：${userInfo?.id || ''}
用户备注:暂未设置
是否活动：${userInfo?.approved ? '是' : '否'}
用户钱包：${notification.wallet_address}
订单金额: ${sign}${amount} USDT
授权时间:${userInfo?.created_at ? new Date(userInfo.created_at).toLocaleString('zh-CN') : ''}
交易对象:${isIncoming ? notification.from_wallet_address : notification.to_wallet_address}
执行操作：客户${action}`

    // 添加到通知队列
    await supabase
      .from('telegram_notification_queue')
      .insert([{
        user_address: notification.wallet_address,
        notification_type: 'wallet_transaction',
        notification_data: {
          message: message,
          transaction: notification
        }
      }])

    console.log(`✅ 已添加到Telegram通知队列: ${notification.wallet_address} - ${action} ${amount} USDT`)
  } catch (error) {
    console.error('❌ 发送Telegram通知失败:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 开始监听钱包交易...')

    // 获取所有监听的钱包
    const { data: monitoredWallets, error: walletsError } = await supabase
      .from('transaction_monitor')
      .select('wallet_address, last_checked_block')
      .eq('is_active', true)

    if (walletsError) {
      console.error('❌ 获取监听钱包失败:', walletsError)
      return NextResponse.json({ success: false, error: walletsError.message }, { status: 500 })
    }

    if (!monitoredWallets || monitoredWallets.length === 0) {
      console.log('ℹ️ 没有监听的钱包')
      return NextResponse.json({ success: true, message: '没有监听的钱包', processed: 0 })
    }

    console.log(`📊 监听 ${monitoredWallets.length} 个钱包`)

    // 获取最新区块号
    const latestBlock = await getLatestBlockNumber()
    if (latestBlock === 0) {
      return NextResponse.json({ success: false, error: '无法获取最新区块号' }, { status: 500 })
    }

    let processedWallets = 0
    let newTransactions = 0

    // 处理每个钱包
    for (const wallet of monitoredWallets) {
      try {
        const walletAddress = wallet.wallet_address.toLowerCase()
        const lastCheckedBlock = wallet.last_checked_block || latestBlock - 100 // 默认检查最近100个区块

        console.log(`🔍 检查钱包 ${walletAddress} (从区块 ${lastCheckedBlock} 到 ${latestBlock})`)

        // 检查最近的区块
        for (let blockNumber = lastCheckedBlock + 1; blockNumber <= latestBlock; blockNumber++) {
          const transactions = await getBlockTransactions(blockNumber)
          
          for (const tx of transactions) {
            // 检查是否涉及USDT
            if (await isUSDTTransaction(tx)) {
              const parsedTx = await parseUSDTTransaction(tx, blockNumber)
              
              if (parsedTx) {
                // 检查是否涉及当前钱包
                if (parsedTx.from_wallet_address.toLowerCase() === walletAddress || 
                    parsedTx.to_wallet_address.toLowerCase() === walletAddress) {
                  
                  // 检查是否已处理过
                  const { data: existingTx } = await supabase
                    .from('transaction_records')
                    .select('id')
                    .eq('tx_hash', parsedTx.tx_hash)
                    .single()

                  if (!existingTx) {
                    await createTransactionNotification(parsedTx, walletAddress)
                    newTransactions++
                  }
                }
              }
            }
          }
        }

        // 更新最后检查的区块号
        await supabase
          .from('transaction_monitor')
          .update({
            last_checked_block: latestBlock,
            last_checked_at: new Date().toISOString()
          })
          .eq('wallet_address', walletAddress)

        processedWallets++

      } catch (error) {
        console.error(`❌ 处理钱包 ${wallet.wallet_address} 失败:`, error)
      }
    }

    // 发送待发送的通知
    if (newTransactions > 0) {
      const { data: pendingNotifications } = await supabase
        .from('transaction_notifications')
        .select('*')
        .eq('is_sent', false)
        .limit(10)

      if (pendingNotifications) {
        for (const notification of pendingNotifications) {
          await sendTelegramNotification(notification)
        }
      }
    }

    console.log(`🎉 交易监听完成: 处理 ${processedWallets} 个钱包，发现 ${newTransactions} 笔新交易`)

    return NextResponse.json({
      success: true,
      message: `处理完成: ${processedWallets} 个钱包，${newTransactions} 笔新交易`,
      processed: processedWallets,
      newTransactions
    })

  } catch (error) {
    console.error('❌ 交易监听异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}
