import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * 管理后台 - 资金记录API
 * 数据来源: earning_history, exchange_history, withdrawal_history, nh_withdraw
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '100')
    const offset = (page - 1) * limit

    console.log('🔍 查询资金记录:', { search, type, page, limit })

    // 1. 查询earning_history（收益记录）
    let earningsQuery = supabase
      .from('earning_history')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      earningsQuery = earningsQuery.ilike('wallet_address', `%${search}%`)
    }

    const { data: earnings, error: earningsError } = await earningsQuery
      .range(offset, offset + limit - 1)

    // 2. 查询exchange_history（兑换记录）
    let exchangeQuery = supabase
      .from('exchange_history')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      exchangeQuery = exchangeQuery.ilike('wallet_address', `%${search}%`)
    }

    const { data: exchanges, error: exchangeError } = await exchangeQuery
      .range(offset, offset + limit - 1)

    // 3. 查询nh_withdraw（提现记录）
    let withdrawQuery = supabase
      .from('nh_withdraw')
      .select('*')
      .order('add_time', { ascending: false })

    const { data: withdrawals, error: withdrawError } = await withdrawQuery
      .range(offset, offset + limit - 1)

    // 4. 合并所有记录并转换格式
    const transactions: any[] = []

    // 添加收益记录
    if (earnings && !earningsError) {
      earnings.forEach(earning => {
        transactions.push({
          id: `earning_${earning.id}`,
          user_id: earning.member_id,
          user_profiles: { wallet_address: earning.wallet_address },
          transaction_type: 'reward',
          amount: earning.eth_amount,
          before_balance: 0,
          after_balance: 0,
          status: earning.status || 'completed',
          created_at: earning.created_at,
          tx_hash: earning.tx_hash,
          description: `${earning.earning_type === 'authorization_bonus' ? '授权奖励' : 
                        earning.earning_type === 'scheduled_reward' ? '定时奖励' : 
                        earning.earning_type === 'periodic_reward' ? '周期奖励' : '收益'} - ${earning.description || ''}`
        })
      })
    }

    // 添加兑换记录
    if (exchanges && !exchangeError) {
      exchanges.forEach(exchange => {
        transactions.push({
          id: `exchange_${exchange.id}`,
          user_id: exchange.member_id,
          user_profiles: { wallet_address: exchange.wallet_address },
          transaction_type: 'transfer',
          amount: exchange.eth_amount,
          before_balance: 0,
          after_balance: 0,
          status: exchange.status || 'completed',
          created_at: exchange.created_at,
          description: `兑换: ${exchange.eth_amount} ETH → ${exchange.usdt_amount} USDT (汇率: ${exchange.exchange_rate})`
        })
      })
    }

    // 添加提现记录
    if (withdrawals && !withdrawError) {
      withdrawals.forEach(withdrawal => {
        transactions.push({
          id: `withdraw_${withdrawal.id}`,
          user_id: withdrawal.user_id,
          user_profiles: { wallet_address: withdrawal.to_address || 'N/A' },
          transaction_type: 'withdrawal',
          amount: withdrawal.price,
          before_balance: 0,
          after_balance: 0,
          status: withdrawal.status === 1 ? 'completed' : withdrawal.status === -1 ? 'failed' : 'pending',
          created_at: withdrawal.add_time,
          tx_hash: withdrawal.hash,
          description: `提现 ${withdrawal.price} USDT`
        })
      })
    }

    // 按时间排序
    transactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // 计算统计数据
    const totalDeposits = 0 // 目前没有充值记录
    const totalWithdrawals = withdrawals?.reduce((sum, w) => sum + (Number(w.price) || 0), 0) || 0
    const totalRewards = earnings?.reduce((sum, e) => sum + (Number(e.eth_amount) || 0), 0) || 0
    const totalExchanges = exchanges?.reduce((sum, e) => sum + (Number(e.eth_amount) || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.slice(0, limit),
        stats: {
          totalDeposits,
          totalWithdrawals,
          totalRewards,
          totalExchanges,
          totalFees: 0,
          totalProcessingAmount: withdrawals?.filter(w => w.status === 0).reduce((sum, w) => sum + (Number(w.price) || 0), 0) || 0
        },
        pagination: {
          page,
          limit,
          total: transactions.length,
          hasMore: transactions.length > limit
        }
      }
    })

  } catch (error) {
    console.error('❌ 获取资金记录失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取资金记录失败'
    }, { status: 500 })
  }
}

