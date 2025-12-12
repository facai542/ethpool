import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST: 创建充值申请
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, amount, txHash } = body
    
    if (!userAddress || !amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Required fields: userAddress, amount' 
      }, { status: 400 })
    }

    // 验证地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Ethereum wallet address format' 
      }, { status: 400 })
    }

    // 验证充值金额
    const depositAmount = Number.parseFloat(amount.toString())
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid deposit amount' 
      }, { status: 400 })
    }

    // 最小充值金额
    const MIN_DEPOSIT = 10
    if (depositAmount < MIN_DEPOSIT) {
      return NextResponse.json({ 
        success: false, 
        error: `Minimum deposit amount is ${MIN_DEPOSIT} USDT` 
      }, { status: 400 })
    }

    // 1. 检查用户是否存在
    const { data: userData, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, usdt, withdrawable_usdt, is_active')
      .eq('wallet_address', userAddress)
      .eq('is_active', true)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在或未注册' 
      }, { status: 404 })
    }

    // 2. 创建充值记录
    const currentTime = new Date().toISOString()
    const depositRecord = {
      member_id: userData.id,
      wallet_address: userAddress,
      usdt_amount: depositAmount,
      from_address: null,
      tx_hash: txHash || null,
      status: 'pending', // pending, completed, failed
      admin_approved: false,
      created_at: currentTime
    }

    const { data: depositData, error: depositError } = await supabase
      .from('deposit_history')
      .insert([depositRecord])
      .select()
      .single()

    if (depositError) {
      console.error('❌ 创建充值记录失败:', depositError)
      return NextResponse.json({ 
        success: false, 
        error: '创建充值记录失败' 
      }, { status: 500 })
    }

    // 3. 记录到finance_orders表
    const numericUserId = typeof userData.id === 'string' && userData.id.includes('-') 
      ? parseInt(userData.id.replace(/-/g, '').slice(0, 8), 16) % 1000000
      : userData.id

    const { error: financeOrderError } = await supabase
      .from('finance_orders')
      .insert({
        user_id: numericUserId,
        user_uuid: userData.id,
        order_no: `DEPOSIT_${Date.now()}`,
        method_id: 1, // 充值方法ID
        type: 'recharge',
        amount: depositAmount.toString(),
        actual_amount: depositAmount.toString(),
        fee: 0,
        address: userAddress,
        status: 0, // 待处理
        create_time: Math.floor(Date.now() / 1000),
        update_time: Math.floor(Date.now() / 1000),
        remark: `充值申请 - 金额: ${depositAmount} USDT`
      })

    if (financeOrderError && process.env.NODE_ENV === 'development') {
      console.error('记录充值交易到finance_orders失败:', financeOrderError)
    }

    return NextResponse.json({
      success: true,
      data: {
        depositId: depositData.id,
        userAddress: userAddress,
        amount: depositAmount,
        currency: 'USDT',
        status: 'pending',
        requestTime: depositData.created_at,
        message: {
          en: 'Deposit request submitted, please wait for confirmation',
          de: 'Einzahlungsantrag eingereicht, bitte warten Sie auf die Bestätigung',
          es: 'Solicitud de depósito enviada, por favor espere la confirmación',
          fr: 'Demande de dépôt soumise, veuillez attendre la confirmation',
          it: 'Richiesta di deposito inviata, attendere la conferma',
          ru: 'Заявка на депозит подана, пожалуйста, дождитесь подтверждения',
          zh: '充值申請已提交，請等待確認'
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Deposit request error:', error)
    const errorMessage = error instanceof Error ? error.message : "未知错误"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET: 查询用户充值记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')
    const limit = Number.parseInt(searchParams.get('limit') || '10')
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

    // 查询充值记录
    const { data: depositRecords, error: depositError } = await supabase
      .from('deposit_history')
      .select('*')
      .eq('member_id', userData.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (depositError) {
      console.error('❌ 查询充值记录失败:', depositError)
      return NextResponse.json({ 
        success: false, 
        error: '查询充值记录失败' 
      }, { status: 500 })
    }

    // 统计信息
    const { count: totalCount } = await supabase
      .from('deposit_history')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userData.id)

    return NextResponse.json({
      success: true,
      data: {
        records: depositRecords || [],
        pagination: {
          total: totalCount || 0,
          limit: limit,
          offset: offset,
          hasMore: (totalCount || 0) > offset + limit
        },
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Get deposit records error:', error)
    const errorMessage = error instanceof Error ? error.message : "未知错误"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

