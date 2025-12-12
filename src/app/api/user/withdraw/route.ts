import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ADMIN_CONFIG } from '@/config/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, amount, withdrawAddress, currency = 'USDT' } = body
    
    if (!userAddress || !amount || !withdrawAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Required fields: userAddress, amount, withdrawAddress' 
      }, { status: 400 })
    }

    const currencyUpper = currency.toUpperCase()
    
    // 验证币种
    if (!['USDT', 'ETH'].includes(currencyUpper)) {
      return NextResponse.json({ 
        success: false, 
        error: `不支持的提现币种: ${currency}，目前仅支持 USDT 和 ETH` 
      }, { status: 400 })
    }

    // 验证地址格式
    if (!/^0x[a-fA-F0-9]+$/.test(userAddress) || !/^0x[a-fA-F0-9]{40}$/.test(withdrawAddress)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Ethereum wallet_address format' 
      }, { status: 400 })
    }

    // 验证提现金额
    const withdrawAmount = Number.parseFloat(amount.toString())
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid withdraw amount' 
      }, { status: 400 })
    }

    // 1. 检查用户是否存在 - 使用与用户信息API相同的查询逻辑
    // 只查询确定存在的字段，避免数据库列不存在的错误
    const { data: userDataList, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, eth, usdt, withdrawal_usdt, withdrawable_usdt, is_active, approved, withdraw_forbidden, agent_id, telegram_user_id, wallet_address')
      .eq('wallet_address', userAddress)
      .eq('is_active', true)  // 与用户信息API保持一致
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (userError) {
      console.error('❌ 查询用户失败:', userError)
      return NextResponse.json({ 
        success: false, 
        error: `查询用户失败: ${userError.message}` 
      }, { status: 500 })
    }

    if (!userDataList || userDataList.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在或未激活，请先完成注册和激活' 
      }, { status: 404 })
    }

    const userData = userDataList[0]

    // 2. 检查用户是否被禁止提现
    if (userData.withdraw_forbidden) {
      return NextResponse.json({ 
        success: false, 
        error: '您的账户已被限制提现，请联系客服' 
      }, { status: 403 })
    }

    // 3. 获取用户的代理信息（用于填充提现订单的agent_nickname）
    let agentNickname = '默认代理'
    if (userData.agent_id && userData.agent_id > 0) {
      const { data: agentData } = await supabase
        .from('nh_agents')
        .select('agent_code, agent_name')
        .eq('id', userData.agent_id)
        .single()
      
      if (agentData) {
        agentNickname = `${agentData.agent_name} (${agentData.agent_code})`
      }
    }
    
    const userRemark = userData.telegram_user_id || '无备注'

    // 4. 检查用户可提现余额
    // ETH 提现使用 eth 字段，USDT 提现使用 withdrawable_usdt 字段
    const availableBalance = currencyUpper === 'ETH' 
      ? Number.parseFloat(userData.eth || '0')
      : Number.parseFloat(userData.withdrawable_usdt || '0')

    if (availableBalance < withdrawAmount) {
      return NextResponse.json({ 
        success: false, 
        error: `可提现余额不足: ${availableBalance} ${currencyUpper} < ${withdrawAmount} ${currencyUpper}` 
      }, { status: 400 })
    }

    // 5. 检查是否有未处理的提现申请
    // 生成数字ID用于查询nh_withdraw表
    const numericUserId = typeof userData.id === 'string' && userData.id.includes('-') 
      ? parseInt(userData.id.replace(/-/g, '').slice(0, 8), 16) % 1000000
      : userData.id
    
    const { data: pendingWithdraw, error: pendingError } = await supabase
      .from('nh_withdraw')
      .select('id, status')
      .eq('user_id', numericUserId)
      .eq('status', 0) // 0：未审核/审核中
      .maybeSingle()

    if (pendingError && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ 查询待处理提现申请时出错:', pendingError)
    }

    if (!pendingError && pendingWithdraw) {
      return NextResponse.json({ 
        success: false, 
        error: '您有未处理的提现申请，请等待处理完成' 
      }, { status: 400 })
    }

    // 6. 创建提现申请（包含代理昵称和用户备注）
    const currentTime = new Date().toISOString()
    const withdrawRequest = {
      agent_id: userData.agent_id || 0,
      user_id: numericUserId, // 使用数字ID
      price: withdrawAmount,
      status: 0, // 0：未审核/审核中
      sh_type: 1, // 1：自动 2：手动
      hash: '',
      add_time: currentTime,
      update_time: currentTime,
      to_address: withdrawAddress, // 使用正确的字段名
      agent_nickname: agentNickname,  // 填充代理昵称
      user_remark: userRemark  // 填充用户备注
    }

    const { data: withdrawData, error: withdrawError } = await supabase
      .from('nh_withdraw')
      .insert([withdrawRequest])
      .select()
      .single()

    if (withdrawError) {
      console.error('❌ 创建提现申请失败:', withdrawError)
      return NextResponse.json({ 
        success: false, 
        error: `创建提现申请失败: ${withdrawError.message}` 
      }, { status: 500 })
    }

    // 7. 立即扣除用户可提现余额（冻结模式）
    const newAvailableBalance = availableBalance - withdrawAmount
    
    // 更新nh_member_new表
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (currencyUpper === 'ETH') {
      // ETH 提现直接扣除 eth 字段
      updateData.eth = newAvailableBalance.toString()
    } else {
      const newWithdrawalTotal = (parseFloat(userData.withdrawal_usdt || '0') + withdrawAmount).toString()
      updateData.withdrawable_usdt = newAvailableBalance.toString()
      updateData.withdrawal_usdt = newWithdrawalTotal
    }
    
    const { error: balanceError } = await supabase
      .from('nh_member_new')
      .update(updateData)
      .eq('id', userData.id)

    if (balanceError) {
      console.error('❌ 扣除用户余额失败:', balanceError)
      // 如果扣除余额失败，删除刚创建的提现记录
      await supabase
        .from('nh_withdraw')
        .delete()
        .eq('id', withdrawData.id)
      
      return NextResponse.json({ 
        success: false, 
        error: `扣除余额失败，提现申请取消: ${balanceError.message}` 
      }, { status: 500 })
    }
    
    // 8. 记录提现交易到finance_orders表
    const { error: financeOrderError } = await supabase
      .from('finance_orders')
      .insert({
        user_id: numericUserId,
        user_uuid: userData.id,
        order_no: `WITHDRAW_${Date.now()}`,
        method_id: 4, // 提现方法ID
        type: 'withdraw',
        amount: withdrawAmount.toString(),
        actual_amount: withdrawAmount.toString(),
        fee: 0,
        address: userAddress,
        status: 0, // 待审核
        create_time: Math.floor(Date.now() / 1000),
        update_time: Math.floor(Date.now() / 1000),
        remark: `提现申请 - 金额: ${withdrawAmount} ${currencyUpper}, 提现地址: ${withdrawAddress}`
      })

    if (financeOrderError) {
      console.error('记录提现交易到finance_orders失败:', financeOrderError)
    }

    return NextResponse.json({
      success: true,
      data: {
        withdrawId: withdrawData.id,
        userAddress: userAddress,
        withdrawAddress: withdrawAddress,
        amount: withdrawAmount,
        currency: currencyUpper,
        status: 'pending',
        requestTime: withdrawData.created_at || currentTime,
        message: {
          en: 'Withdrawal request submitted, please wait for admin approval',
          de: 'Auszahlungsantrag eingereicht, bitte warten Sie auf die Admin-Genehmigung',
          es: 'Solicitud de retiro enviada, por favor espere la aprobación del administrador',
          fr: 'Demande de retrait soumise, veuillez attendre l\'approbation de l\'administrateur',
          it: 'Richiesta di prelievo inviata, attendere l\'approvazione dell\'amministratore',
          ru: 'Заявка на вывод подана, пожалуйста, дождитесь одобрения администратора',
          zh: '提現申請已提交，請等待管理員審核'
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Withdraw request error:', error)
    
    // 记录错误日志
    const errorMessage = error instanceof Error ? error.message : "未知错误"
    console.error('❌ 提现申请失败:', errorMessage)
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET: 查询用户提现记录
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
        error: 'Invalid Ethereum wallet_address format' 
      }, { status: 400 })
    }

    // 先根据地址查找用户ID - 使用与用户信息API相同的查询逻辑
    const { data: userDataList, error: userError } = await supabase
      .from('nh_member_new')
      .select('id')
      .eq('wallet_address', userAddress)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (userError) {
      console.error('❌ 查询用户失败:', userError)
      return NextResponse.json({ 
        success: false, 
        error: '查询用户失败' 
      }, { status: 500 })
    }

    if (!userDataList || userDataList.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在' 
      }, { status: 404 })
    }

    const userData = userDataList[0]

    // 生成数字ID用于查询nh_withdraw表
    const numericUserId = typeof userData.id === 'string' && userData.id.includes('-') 
      ? parseInt(userData.id.replace(/-/g, '').slice(0, 8), 16) % 1000000
      : userData.id

    // 查询用户提现记录
    const { data: withdrawRecords, error: withdrawError } = await supabase
      .from('nh_withdraw')
      .select('*')
      .eq('user_id', numericUserId)
      .order('add_time', { ascending: false })
      .range(offset, offset + limit - 1)

    if (withdrawError) {
      console.error('❌ 查询提现记录失败:', withdrawError)
      return NextResponse.json({ 
        success: false, 
        error: '查询提现记录失败' 
      }, { status: 500 })
    }

    // 统计信息
    const { count: totalCount } = await supabase
      .from('nh_withdraw')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', numericUserId)

    const result = {
      records: withdrawRecords || [],
      pagination: {
        total: totalCount || 0,
        limit: limit,
        offset: offset,
        hasMore: (totalCount || 0) > offset + limit
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('❌ Get withdraw records error:', error)
    const errorMessage = error instanceof Error ? error.message : "未知错误"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
