import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// 兑换配置 - 支持ETH兑换USDC
const EXCHANGE_CONFIG = {
  // 兑换汇率
  RATES: {
    'ETH_TO_USDC': 4480.37,   // ETH to USDC
    'USDC_TO_ETH': 1 / 4480.37  // USDC to ETH
  },
  // 手续费（百分比）
  FEES: {
    'ETH_TO_USDC': 0.005,     // 0.5%
    'USDC_TO_ETH': 0.005      // 0.5%
  },
  // 最小兑换金额
  MIN_AMOUNTS: {
    'ETH': 0.001,              // 最小0.001 ETH
    'USDC': 1                  // 最小1 USDC
  }
}

// GET: 获取兑换汇率
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')?.toUpperCase()
    const to = searchParams.get('to')?.toUpperCase()
    const amount = Number.parseFloat(searchParams.get('amount') || '0')

    if (!from || !to) {
      return NextResponse.json({
        success: true,
        data: {
          rates: EXCHANGE_CONFIG.RATES,
          fees: EXCHANGE_CONFIG.FEES,
          minAmounts: EXCHANGE_CONFIG.MIN_AMOUNTS,
          supportedCurrencies: ['ETH', 'USDC'],
          supportedPairs: ['ETH_TO_USDC', 'USDC_TO_ETH']
        }
      })
    }

    const exchangeKey = `${from}_TO_${to}`
    const rate = EXCHANGE_CONFIG.RATES[exchangeKey as keyof typeof EXCHANGE_CONFIG.RATES]
    const fee = EXCHANGE_CONFIG.FEES[exchangeKey as keyof typeof EXCHANGE_CONFIG.FEES]
    const minAmount = EXCHANGE_CONFIG.MIN_AMOUNTS[from as keyof typeof EXCHANGE_CONFIG.MIN_AMOUNTS]

    if (!rate) {
      return NextResponse.json({ 
        success: false, 
        error: `不支持的兑换对: ${from} -> ${to}，支持的兑换对: ETH <-> USDC` 
      }, { status: 400 })
    }

    let result: unknown = {
      from,
      to,
      rate,
      fee: fee || 0,
      minAmount: minAmount || 0
    }

    if (amount > 0) {
      const feeAmount = amount * (fee || 0)
      const netAmount = amount - feeAmount
      const exchangedAmount = netAmount * rate
      
      result = {
        ...result,
        amount,
        feeAmount,
        netAmount,
        exchangedAmount,
        canExchange: amount >= (minAmount || 0)
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('❌ Get exchange rate error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) || 'Unknown error' 
    }, { status: 500 })
  }
}

// POST: 执行货币兑换
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, userId, from, to, amount } = body
    
    if (!userAddress && !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userAddress or userId is required' 
      }, { status: 400 })
    }

    if (!from || !to || !amount) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数: from, to, amount' 
      }, { status: 400 })
    }

    const fromCurrency = from.toUpperCase()
    const toCurrency = to.toUpperCase()
    const exchangeKey = `${fromCurrency}_TO_${toCurrency}`

    // 查询用户信息 - 优先使用nh_member_new表
    let userData: any = null
    
    if (userAddress) {
      // 先查询nh_member_new表 - 只选择必要的字段
      const { data: newUser, error: newUserError } = await supabase
        .from('nh_member_new')
        .select('id, wallet_address, eth, usdt, withdrawable_usdt, withdrawal_usdt, a_eth, is_active')
        .eq('wallet_address', userAddress)
        .eq('is_active', true)
        .single()
      
      if (newUser && !newUserError) {
        // 使用新表数据，转换为旧表格式以保持兼容性
        userData = {
          id: newUser.id,
          wallet_address: newUser.wallet_address,
          eth: newUser.eth || '0',
          usdt: newUser.usdt || '0',
          withdrawable_usdt: newUser.withdrawable_usdt || '0',
          withdrawal_usdt: newUser.withdrawal_usdt || '0',
          is_active: 0
        }
      } else {
        // 回退到旧表查询
        // 尝试旧表查询 - 只选择必要的字段
        const { data: userData1, error: error1 } = await supabase
          .from('nh_member')
          .select('id, wallet_address, eth, usdt, withdrawable_usdt, withdrawal_usdt, is_active')
          .eq('wallet_address', userAddress)
          .eq('is_active', 1)
          .single()
        
        if (userData1) {
          userData = userData1
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('用户查询失败:', error1)
          }
          return NextResponse.json({ 
            success: false, 
            error: `用户不存在，地址: ${userAddress}` 
          }, { status: 404 })
        }
      }
    } else {
      // 通过ID查询 - 只选择必要的字段
      const { data: userDataById, error: userErrorById } = await supabase
        .from('nh_member_new')
        .select('id, wallet_address, eth, usdt, withdrawable_usdt, withdrawal_usdt, a_eth, is_active')
        .eq('id', userId)
        .eq('is_active', 0)
        .single()
      
      if (userErrorById || !userDataById) {
        console.error('用户查询失败:', userErrorById)
        return NextResponse.json({ 
          success: false, 
          error: `用户不存在，ID: ${userId}` 
        }, { status: 404 })
      }
      userData = userDataById
    }

    // 检查兑换对是否支持
    const rate = EXCHANGE_CONFIG.RATES[exchangeKey as keyof typeof EXCHANGE_CONFIG.RATES]
    const fee = EXCHANGE_CONFIG.FEES[exchangeKey as keyof typeof EXCHANGE_CONFIG.FEES] || 0
    const minAmount = EXCHANGE_CONFIG.MIN_AMOUNTS[fromCurrency as keyof typeof EXCHANGE_CONFIG.MIN_AMOUNTS] || 0

    if (!rate) {
      return NextResponse.json({ 
        success: false, 
        error: `不支持的兑换对: ${fromCurrency} -> ${toCurrency}` 
      }, { status: 400 })
    }

    // 检查最小兑换金额
    if (amount < minAmount) {
      return NextResponse.json({ 
        success: false, 
        error: `兑换金额不足，最少需要 ${minAmount} ${fromCurrency}` 
      }, { status: 400 })
    }

    // 获取用户当前余额
    const getBalance = (currency: string) => {
      switch (currency) {
        case 'ETH':
          // 兑换功能检查可兑换的ETH余额（eth字段）
          return Number.parseFloat(userData.eth || '0')
        case 'USDT':
        case 'USDC':
          return Number.parseFloat(userData.usdt || '0')
        case 'CASH':
          return Number.parseFloat(userData.withdrawable_usdt || '0')
        case 'CNY':
          return Number.parseFloat(userData.cny_balance || '0')
        case 'USD':
          return Number.parseFloat(userData.usd_balance || '0')
        default:
          return 0
      }
    }

    const currentBalance = getBalance(fromCurrency)
    
    // 检查余额是否足够
    if (currentBalance < amount) {
      return NextResponse.json({ 
        success: false, 
        error: `${fromCurrency} 余额不足，当前余额: ${currentBalance}` 
      }, { status: 400 })
    }

    // 计算兑换
    const feeAmount = amount * fee
    const netAmount = amount - feeAmount
    const exchangedAmount = netAmount * rate

    // 更新用户余额
    const currentTime = new Date()
    const toBalance = getBalance(toCurrency)
    
    const updateData: unknown = {
      updated_at: currentTime.toISOString()
    }

    // 扣除源货币
    switch (fromCurrency) {
      case 'ETH':
        updateData.eth = (currentBalance - amount).toString()
        break
      case 'USDT':
      case 'USDC':
        updateData.usdt = (currentBalance - amount).toString()
        break
      case 'CNY':
        updateData.cny_balance = (currentBalance - amount).toString()
        break
      case 'USD':
        updateData.usd_balance = (currentBalance - amount).toString()
        break
    }

    // 增加目标货币
    switch (toCurrency) {
      case 'ETH':
        updateData.eth = (getBalance('ETH') + exchangedAmount).toString()
        break
      case 'USDT':
      case 'USDC':
        updateData.usdt = (getBalance('USDC') + exchangedAmount).toString()
        // 兑换USDC时，同时更新可提现余额(withdrawable_usdt字段)
        updateData.withdrawable_usdt = (getBalance('CASH') + exchangedAmount).toString()
        break
      case 'CNY':
        updateData.cny_balance = (getBalance('CNY') + exchangedAmount).toString()
        break
      case 'USD':
        updateData.usd_balance = (getBalance('USD') + exchangedAmount).toString()
        break
    }

    // 根据用户来源选择更新表
    let updateError: any = null
    
    if (userData.id && typeof userData.id === 'string' && userData.id.includes('-')) {
      // UUID格式，更新nh_member_new表
      const currentAeth = Number.parseFloat(userData.a_eth || '0')  // 总产量，保持不变
      const currentEth = Number.parseFloat(userData.eth || '0')     // 可兑换余额
      const currentUsdt = Number.parseFloat(userData.usdt || '0')
      const currentWithdrawableUsdt = Number.parseFloat(userData.withdrawable_usdt || '0')
      
      let newAeth = currentAeth      // 总产量保持不变，不修改
      let newEth = currentEth        // 可兑换余额
      let newUsdt = currentUsdt
      let newWithdrawableUsdt = currentWithdrawableUsdt
      
      // 处理ETH兑换USDC
      if (fromCurrency === 'ETH' && toCurrency === 'USDC') {
        // 检查是否有足够的可兑换ETH余额
        if (currentEth < amount) {
          return NextResponse.json({ 
            success: false, 
            error: `可兑换ETH余额不足，当前余额: ${currentEth} ETH，需要: ${amount} ETH` 
          }, { status: 400 })
        }
        
        newEth = currentEth - amount  // 从可兑换ETH余额中扣除
        newUsdt = currentUsdt + exchangedAmount  // 添加到已兑换USDC
        newWithdrawableUsdt = currentWithdrawableUsdt + exchangedAmount  // 添加到可提取USDC
      }
      
      // 处理USDC兑换ETH
      if (fromCurrency === 'USDC' && toCurrency === 'ETH') {
        // 检查是否有足够的USDC余额
        if (currentUsdt < amount) {
          return NextResponse.json({ 
            success: false, 
            error: `USDC余额不足，当前余额: ${currentUsdt} USDC，需要: ${amount} USDC` 
          }, { status: 400 })
        }
        
        newUsdt = currentUsdt - amount  // 从USDC余额中扣除
        newEth = currentEth + exchangedAmount  // 添加到可兑换ETH余额
        // 注意：USDC兑换ETH时，不增加可提现余额
      }
      
      const { error: newUpdateError } = await supabase
        .from('nh_member_new')
        .update({
          a_eth: newAeth.toString(),  // 总产量保持不变
          eth: newEth.toString(),     // 更新可兑换ETH余额
          usdt: newUsdt.toString(),   // 更新已兑换USDC
          withdrawable_usdt: newWithdrawableUsdt.toString(),  // 更新可提取USDC
          updated_at: currentTime.toISOString()
        })
        .eq('id', userData.id)
      
      updateError = newUpdateError
    } else {
      // 数字ID，更新nh_member表
      const { error: oldUpdateError } = await supabase
        .from('nh_member_new')
        .update(updateData)
        .eq('id', userData.id)
      
      updateError = oldUpdateError
    }

    if (updateError) {
      console.error('❌ 更新用户余额失败:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: '更新用户余额失败' 
      }, { status: 500 })
    }

    // 记录兑换历史到exchange_history表
    const exchangeRecord = {
      member_id: userData.id, // 使用UUID
      wallet_address: userData.wallet_address,
      from_currency: fromCurrency, // 源货币类型
      to_currency: toCurrency, // 目标货币类型
      eth_amount: fromCurrency === 'ETH' ? amount : (toCurrency === 'ETH' ? exchangedAmount : 0),
      usdt_amount: (fromCurrency === 'USDT' || fromCurrency === 'USDC') ? amount : ((toCurrency === 'USDT' || toCurrency === 'USDC') ? exchangedAmount : 0),
      exchange_rate: rate,
      fee_percentage: fee * 100, // 转换为百分比
      fee_usdt: feeAmount,
      net_usdt: exchangedAmount,
      status: 'completed',
      created_at: currentTime.toISOString()
    }

    const { error: recordError } = await supabase
      .from('exchange_history')
      .insert([exchangeRecord])

    if (recordError) {
      console.error('❌ 记录兑换历史失败:', recordError)
    }

    // 记录兑换交易到finance_orders表（用于收益记录显示）
    const numericUserId = typeof userData.id === 'string' && userData.id.includes('-') ? 
      Math.abs(parseInt(userData.id.replace(/-/g, '').slice(0, 8), 16)) % 1000000 : 
      userData.id

    const { error: financeOrderError } = await supabase
      .from('finance_orders')
      .insert({
        user_id: numericUserId,
        user_uuid: userData.id,
        order_no: `EXCHANGE_${Date.now()}`,
        method_id: 3, // 兑换方法ID
        type: 'withdraw', // 使用withdraw类型（表约束要求）
        amount: exchangedAmount.toString(),
        actual_amount: exchangedAmount.toString(),
        fee: feeAmount,
        address: userData.wallet_address,
        status: 1, // 已完成
        create_time: Math.floor(currentTime.getTime() / 1000),
        update_time: Math.floor(currentTime.getTime() / 1000),
        remark: `货币兑换: ${amount} ${fromCurrency} -> ${exchangedAmount.toFixed(8)} ${toCurrency} (汇率: ${rate}, 手续费: ${(fee * 100).toFixed(2)}%)`
      })

    if (financeOrderError && process.env.NODE_ENV === 'development') {
      console.error('❌ 记录兑换交易到finance_orders失败:', financeOrderError)
    }

    // 记录操作日志（使用之前声明的numericUserId）
    const { error: logError } = await supabase
      .from('nh_logs')
      .insert([
        {
          user_id: numericUserId,
          user_uuid: typeof userData.id === 'string' && userData.id.includes('-') ? userData.id : null,
          action: 'currency_exchange',
          description: `货币兑换: ${amount} ${fromCurrency} -> ${exchangedAmount.toFixed(8)} ${toCurrency} (汇率: ${rate}, 手续费: ${(fee * 100).toFixed(2)}%)`,
          created_at: currentTime.toISOString()
        }
      ])

    if (logError && process.env.NODE_ENV === 'development') {
      console.error('❌ 记录操作日志失败:', logError)
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: userData.id,
        userAddress: userData.wallet_address,
        exchange: {
          from: fromCurrency,
          to: toCurrency,
          fromAmount: amount,
          toAmount: exchangedAmount,
          rate: rate,
          fee: fee,
          feeAmount: feeAmount
        },
        balances: {
          [fromCurrency.toLowerCase()]: (currentBalance - amount),
          [toCurrency.toLowerCase()]: (toBalance + exchangedAmount)
        },
        message: {
          en: 'Exchange successful',
          de: 'Tausch erfolgreich',
          es: 'Intercambio exitoso',
          fr: 'Échange réussi',
          it: 'Scambio riuscito',
          ru: 'Обмен успешен',
          zh: '兌換成功'
        },
        timestamp: currentTime.toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Currency exchange error:', error)
    
    // 记录错误日志
    try {
      // 为错误日志生成数字ID
      const numericUserId = typeof userData?.id === 'string' && userData.id.includes('-') ? 
        Math.abs(parseInt(userData.id.replace(/-/g, '').slice(0, 8), 16)) % 1000000 : 
        userData?.id || 'unknown'

      await supabase
        .from('nh_logs')
        .insert([
          {
            user_id: numericUserId,
            user_uuid: typeof userData?.id === 'string' && userData.id.includes('-') ? userData.id : null,
            action: 'currency_exchange_error',
            details: `货币兑换失败: ${error instanceof Error ? error.message : String(error) || 'Unknown error'}`,
            created_at: new Date().toISOString()
          }
        ])
    } catch (logError) {
      console.error('记录错误日志失败:', logError)
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 