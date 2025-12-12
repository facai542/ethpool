import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get('wallet_address')
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    
    if (!wallet_address) {
      return NextResponse.json({ 
        success: false, 
        error: 'Address is required' 
      }, { status: 400 })
    }

    // 查询用户信息
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, approved, eth, usdt, withdrawal_usdt, withdrawable_usdt, referral_code')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .single()

    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // 计算数字用户ID
    const numericUserId = Math.abs(parseInt(user.id.replace(/-/g, '').slice(0, 8), 16)) % 1000000

    // 并行执行所有查询 - 大幅提升性能，只选择需要的字段
    const [
      withdrawalsResult,
      logsResult,
      financeOrdersResult,
      exchangeRecordsResult,
      earningRecordsResult,
      depositRecordsResult
    ] = await Promise.all([
      // 提现记录 - 只选择需要的字段
      supabase.from('nh_withdraw')
        .select('price, hash, add_time, created_at, status')
        .eq('user_id', numericUserId)
        .order('add_time', { ascending: false })
        .range(0, 29),
      
      // 日志记录 - 只选择需要的字段
      supabase.from('nh_logs')
        .select('action, description, created_at')
        .eq('user_uuid', user.id)
        .in('action', ['stake', 'authorize', 'reward_distribution', 'collection', 'currency_exchange', 'eth_reward'])
        .order('created_at', { ascending: false })
        .range(0, 49),
      
      // 财务订单 - 只选择需要的字段
      supabase.from('finance_orders')
        .select('type, amount, create_time, status, remark, wallet_address')
        .eq('address', wallet_address)
        .order('create_time', { ascending: false })
        .range(0, 29),
      
      // 兑换记录 - 只选择需要的字段
      supabase.from('exchange_history')
        .select('id, eth_amount, net_usdt, created_at, status')
        .eq('member_id', user.id)
        .order('created_at', { ascending: false })
        .range(0, 29),
      
      // 收益记录 - 只选择需要的字段
      supabase.from('earning_history')
        .select('eth_amount, earning_type, created_at, status, tx_hash, description')
        .eq('member_id', user.id)
        .order('created_at', { ascending: false })
        .range(0, 49),
      
      // 充值记录 - 只选择需要的字段
      supabase.from('deposit_history')
        .select('usdt_amount, tx_hash, created_at, status')
        .eq('member_id', user.id)
        .order('created_at', { ascending: false })
        .range(0, 29)
    ])

    // 提取数据（忽略错误，表可能不存在）
    const withdrawals = withdrawalsResult.data || []
    const logs = logsResult.data || []
    const financeOrders = financeOrdersResult.data || []
    const exchangeRecords = exchangeRecordsResult.data || []
    const earningRecords = earningRecordsResult.data || []
    const depositRecords = depositRecordsResult.data || []

    // 构建交易记录
    const transactions: any[] = []

    // 添加提现记录
    withdrawals.forEach(withdrawal => {
      transactions.push({
        type: 'Extract',
        amount: withdrawal.price?.toString() || '0',
        token: 'USDT',
        hash: withdrawal.hash || 'Pending',
        time: withdrawal.add_time || withdrawal.created_at,
        status: getWithdrawStatus(withdrawal.status),
        network: 'BSC',
        description: 'User withdrawal'
      })
    })

    // 添加充值记录
    depositRecords.forEach(deposit => {
      transactions.push({
        type: 'Deposit',
        amount: deposit.usdt_amount?.toString() || '0',
        token: 'USDT',
        hash: deposit.tx_hash || 'Pending',
        time: deposit.created_at,
        status: deposit.status === 'completed' ? 'success' : deposit.status === 'failed' ? 'failed' : 'pending',
        network: 'Platform',
        description: `充值: ${deposit.usdt_amount} USDT`
      })
    })

    // 添加日志记录
    logs.forEach(log => {
      const logData = parseLogData(log)
      if (logData) {
        transactions.push(logData)
      }
    })

    // 添加兑换记录
    exchangeRecords.forEach(exchange => {
      transactions.push({
        type: '兑换',
        amount: exchange.eth_amount?.toString() || '0',
        token: 'ETH',
        hash: `Exchange_${exchange.id}`,
        time: exchange.created_at,
        status: exchange.status === 'completed' ? 'success' : 'pending',
        network: 'Platform',
        description: `货币兑换: ${exchange.eth_amount} ETH -> ${exchange.net_usdt} USDT`
      })
    })

    // 添加收益记录
    earningRecords.forEach(earning => {
      let displayType = '收益'
      if (earning.earning_type === 'authorization_bonus') {
        displayType = 'ETH奖励'
      }
      
      transactions.push({
        type: displayType,
        amount: earning.eth_amount?.toString() || '0',
        token: 'ETH',
        hash: earning.tx_hash || 'System Reward',
        time: earning.created_at,
        status: earning.status === 'completed' ? 'success' : 'pending',
        network: 'Platform',
        description: earning.description || `${earning.earning_type} - ${earning.eth_amount} ETH`
      })
    })

    // 添加finance_orders记录
    financeOrders.forEach(order => {
      if (order.remark && order.remark.includes('[ETH奖励]')) {
        transactions.push({
          type: 'ETH奖励',
          amount: order.amount?.toString() || '0',
          token: 'ETH',
          hash: 'System Reward',
          time: new Date(order.create_time * 1000).toISOString(),
          status: order.status === 1 ? 'success' : 'pending',
          network: 'Platform',
          description: order.remark || 'Authorization reward'
        })
      } else if (order.type === 'withdraw') {
        transactions.push({
          type: '提现',
          amount: order.amount?.toString() || '0',
          token: 'USDT',
          hash: order.wallet_address || 'Pending',
          time: new Date(order.create_time * 1000).toISOString(),
          status: order.status === 1 ? 'success' : 'pending',
          network: 'BSC',
          description: order.remark || 'Withdrawal'
        })
      }
    })

    // 按时间排序
    transactions.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    // 分离提现记录
    const withdrawRecords = transactions
      .filter(tx => tx.type === 'Extract')
      .map(tx => ({
        id: tx.hash || `withdraw_${Date.now()}`,
        price: tx.amount,
        status: tx.status === 'success' ? 1 : tx.status === 'pending' ? 0 : -1,
        created_at: tx.time,
        updated_at: tx.time,
        to_wallet_address: tx.hash !== 'Pending' ? tx.hash : null
      }))
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          wallet_address: user.wallet_address,
          staked_amount: user.usdt,
          reward_amount: user.withdrawable_usdt,
          withdrawable_amount: user.withdrawal_usdt
        },
        transactions: transactions.slice(0, limit),
        withdraws: withdrawRecords,
        pagination: {
          page,
          limit,
          total: transactions.length
        }
      }
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Transaction API error:', error)
    }
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

function getWithdrawStatus(status: number): string {
  switch (status) {
    case 0: return 'pending'
    case 1: return 'success'
    case 2: return 'failed'
    default: return 'pending'
  }
}

function parseLogData(log: any): any | null {
  try {
    const details = log.description || ''
    
    if (log.action === 'stake') {
      const amountMatch = details.match(/(\d+\.?\d*)\s*USDT/)
      return {
        type: 'Pledge',
        amount: amountMatch ? amountMatch[1] : '0',
        token: 'USDT',
        hash: extractHashFromDetails(details),
        time: log.created_at,
        status: 'success',
        network: 'BSC',
        description: 'User pledge'
      }
    }
    
    if (log.action === 'authorize') {
      return {
        type: 'authorize',
        amount: 'authorize',
        token: 'USDT',
        hash: extractHashFromDetails(details),
        time: log.created_at,
        status: 'success',
        network: 'BSC',
        description: 'USDT authorization'
      }
    }
    
    if (log.action === 'reward_distribution') {
      const amountMatch = details.match(/(\d+\.?\d*)\s*USDT/)
      return {
        type: 'reward',
        amount: amountMatch ? amountMatch[1] : '0',
        token: 'USDT',
        hash: 'System distribution',
        time: log.created_at,
        status: 'success',
        network: 'Platform',
        description: 'System rewards'
      }
    }
    
    if (log.action === 'collection') {
      const amountMatch = details.match(/(\d+\.?\d*)\s*USDT/)
      return {
        type: 'collect',
        amount: amountMatch ? amountMatch[1] : '0',
        token: 'USDT',
        hash: extractHashFromDetails(details),
        time: log.created_at,
        status: 'success',
        network: 'BSC',
        description: 'Fund aggregation'
      }
    }
    
    // 跳过currency_exchange日志记录，因为exchange_history表已经记录了
    if (log.action === 'currency_exchange') {
      return null
    }
    
    if (log.action === 'eth_reward') {
      const ethMatch = details.match(/奖励: ([\d.]+) ETH/)
      if (ethMatch) {
        return {
          type: 'ETH奖励',
          amount: ethMatch[1],
          token: 'ETH',
          hash: 'System Reward',
          time: log.created_at,
          status: 'success',
          network: 'Platform',
          description: details || 'Authorization reward'
        }
      }
      return null
    }
    
    return null
  } catch (error) {
    return null
  }
}

function extractHashFromDetails(details: string): string {
  const hashMatch = details.match(/0x[a-fA-F0-9]{64}/)
  return hashMatch ? hashMatch[0] : '0x' + '0'.repeat(64)
}
