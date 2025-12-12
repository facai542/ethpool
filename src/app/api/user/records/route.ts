import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: 获取用户所有交易记录（充值、提现、兑换）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')
    const type = searchParams.get('type') || 'all' // all, deposit, withdraw, exchange
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const offset = Number.parseInt(searchParams.get('offset') || '0')
    
    if (!userAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'userAddress parameter is required' 
      }, { status: 400 })
    }

    // 验证地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Ethereum wallet address format' 
      }, { status: 400 })
    }

    // 查询用户
    const { data: userData, error: userError } = await supabase
      .from('nh_member_new')
      .select('id')
      .eq('wallet_address', userAddress)
      .eq('is_active', true)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在' 
      }, { status: 404 })
    }

    const numericUserId = typeof userData.id === 'string' && userData.id.includes('-') 
      ? parseInt(userData.id.replace(/-/g, '').slice(0, 8), 16) % 1000000
      : userData.id

    let allRecords: any[] = []

    // 获取充值记录
    if (type === 'all' || type === 'deposit') {
      const { data: depositRecords } = await supabase
        .from('deposit_history')
        .select('id, usdt_amount, status, created_at, tx_hash')
        .eq('member_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (depositRecords) {
        allRecords.push(...depositRecords.map(r => ({
          id: r.id,
          type: 'deposit',
          amount: r.usdt_amount,
          currency: 'USDT',
          status: r.status,
          txHash: r.tx_hash,
          createdAt: r.created_at
        })))
      }
    }

    // 获取提现记录
    if (type === 'all' || type === 'withdraw') {
      const { data: withdrawRecords } = await supabase
        .from('withdrawal_history')
        .select('id, usdt_amount, net_usdt, status, to_address, tx_hash, created_at')
        .eq('member_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (withdrawRecords) {
        allRecords.push(...withdrawRecords.map(r => ({
          id: r.id,
          type: 'withdraw',
          amount: r.usdt_amount,
          netAmount: r.net_usdt,
          currency: 'USDT',
          status: r.status,
          toAddress: r.to_address,
          txHash: r.tx_hash,
          createdAt: r.created_at
        })))
      }

      // 同时检查旧的nh_withdraw表
      const { data: oldWithdrawRecords } = await supabase
        .from('nh_withdraw')
        .select('id, price, status, to_address, hash, add_time')
        .eq('user_id', numericUserId)
        .order('add_time', { ascending: false })
        .limit(limit)

      if (oldWithdrawRecords) {
        allRecords.push(...oldWithdrawRecords.map(r => ({
          id: r.id,
          type: 'withdraw',
          amount: r.price,
          currency: 'USDT',
          status: r.status === 1 ? 'completed' : r.status === -1 ? 'failed' : 'pending',
          toAddress: r.to_address,
          txHash: r.hash,
          createdAt: r.add_time
        })))
      }
    }

    // 获取兑换记录
    if (type === 'all' || type === 'exchange') {
      const { data: exchangeRecords } = await supabase
        .from('exchange_history')
        .select('id, eth_amount, usdt_amount, exchange_rate, fee_usdt, net_usdt, status, created_at')
        .eq('member_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (exchangeRecords) {
        allRecords.push(...exchangeRecords.map(r => ({
          id: r.id,
          type: 'exchange',
          fromAmount: r.eth_amount,
          fromCurrency: 'ETH',
          toAmount: r.usdt_amount,
          toCurrency: 'USDT',
          exchangeRate: r.exchange_rate,
          fee: r.fee_usdt,
          netAmount: r.net_usdt,
          status: r.status,
          createdAt: r.created_at
        })))
      }
    }

    // 按时间排序
    allRecords.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    // 分页
    const paginatedRecords = allRecords.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          total: allRecords.length,
          limit: limit,
          offset: offset,
          hasMore: allRecords.length > offset + limit
        },
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Get records error:', error)
    const errorMessage = error instanceof Error ? error.message : "未知错误"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}


