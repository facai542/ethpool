import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    const offset = (page - 1) * limit

    console.log('📋 获取提现记录:', { page, limit, status, search })

    // 构建查询（修正字段名称，并关联代理信息）
    let query = supabase
      .from('nh_withdraw')
      .select(`
        id,
        user_id,
        agent_id,
        price,
        status,
        sh_type,
        hash,
        add_time,
        update_time,
        to_address,
        agent_nickname,
        user_remark
      `)
      .order('add_time', { ascending: false })

    // 状态筛选
    if (status && status !== 'all') {
      const statusMap: { [key: string]: number } = {
        'pending': 0,
        'completed': 1,
        'failed': -1
      }
      if (statusMap[status] !== undefined) {
        query = query.eq('status', statusMap[status])
      }
    }

    // 搜索筛选
    if (search) {
      query = query.eq('id', search)
    }

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: withdrawals, error: withdrawalsError } = await query

    if (withdrawalsError) {
      console.error('❌ 获取提现记录失败:', withdrawalsError)
      return NextResponse.json({ 
        success: false, 
        error: `获取提现记录失败: ${withdrawalsError.message}` 
      }, { status: 500 })
    }

    console.log('📊 查询结果:', { 
      withdrawalsCount: withdrawals?.length || 0, 
      withdrawals: withdrawals?.slice(0, 2) // 只显示前2条用于调试
    })

    // 获取总数
    let countQuery = supabase
      .from('nh_withdraw')
      .select('*', { count: 'exact', head: true })

    if (status && status !== 'all') {
      const statusMap: { [key: string]: number } = {
        'pending': 0,
        'completed': 1,
        'failed': -1
      }
      if (statusMap[status] !== undefined) {
        countQuery = countQuery.eq('status', statusMap[status])
      }
    }

    if (search) {
      countQuery = countQuery.eq('id', search)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('❌ 获取提现记录总数失败:', countError)
    }

    // 获取用户详细信息和代理信息
    const userInfoMap: Record<string, any> = {}
    const agentInfoMap: Record<number, any> = {}
    
    if (withdrawals && withdrawals.length > 0) {
      // 获取所有唯一的提现地址
      const addresses = [...new Set(withdrawals.map(w => w.to_address).filter(addr => addr))]
      
      // 获取所有唯一的代理ID
      const agentIds = [...new Set(withdrawals.map(w => w.agent_id).filter(id => id && id > 0))]
      
      // 查询代理信息
      if (agentIds.length > 0) {
        const { data: agents } = await supabase
          .from('nh_agents')
          .select('id, agent_name, agent_code, referral_code')
          .in('id', agentIds)
        
        if (agents) {
          for (const agent of agents) {
            agentInfoMap[agent.id] = {
              agent_name: agent.agent_name,
              agent_code: agent.agent_code,
              referral_code: agent.referral_code
            }
          }
        }
      }
      
      if (addresses.length > 0) {
        // 查询用户信息和推荐人信息
        const { data: users } = await supabase
          .from('nh_member_new')
          .select('wallet_address, referred_by, referral_code, telegram_user_id, agent_id')
          .in('wallet_address', addresses)
        
        if (users) {
          // 创建地址到用户信息的映射
          for (const user of users) {
            userInfoMap[user.wallet_address.toLowerCase()] = {
              wallet_address: user.wallet_address,
              referred_by: user.referred_by,
              referral_code: user.referral_code,
              telegram_user_id: user.telegram_user_id,
              agent_id: user.agent_id
            }
          }
          
          // 查询推荐人的钱包地址
          const referralCodes = users
            .map(u => u.referred_by)
            .filter(code => code != null && code !== '')
          
          if (referralCodes.length > 0) {
            const { data: referrers } = await supabase
              .from('nh_member_new')
              .select('referral_code, wallet_address')
              .in('referral_code', referralCodes)
            
            if (referrers) {
              // 创建推荐码到钱包地址的映射
              const referrerMap: Record<string, string> = {}
              referrers.forEach(ref => {
                referrerMap[ref.referral_code] = ref.wallet_address
              })
              
              // 更新userInfoMap，添加推荐人地址
              for (const addr in userInfoMap) {
                const referredBy = userInfoMap[addr].referred_by
                if (referredBy && referrerMap[referredBy]) {
                  userInfoMap[addr].referrer_address = referrerMap[referredBy]
                }
              }
            }
          }
        }
      }
    }

    // 转换数据格式，添加代理信息
    const formattedWithdrawals = withdrawals?.map(withdrawal => {
      const userAddress = withdrawal.to_address || '未知地址'
      const userInfo = userInfoMap[userAddress.toLowerCase()] || {}
      const agentInfo = agentInfoMap[withdrawal.agent_id] || {}
      
      return {
        id: withdrawal.id,
        user_id: withdrawal.user_id,
        user_address: userAddress,
        user_remark: withdrawal.user_remark || userInfo.telegram_user_id || '', // 用户备注（从订单或用户表读取）
        agent_id: withdrawal.agent_id || userInfo.agent_id || 0,
        agent_nickname: withdrawal.agent_nickname || agentInfo.agent_name || '', // 代理昵称（从订单或代理表读取）
        agent_code: agentInfo.agent_code || '',
        agent_address: userInfo.referrer_address || '', // 上级代理地址
        referred_by: userInfo.referred_by || '', // 推荐码
        amount: Number.parseFloat(withdrawal.price || '0'),
        status: withdrawal.status === 1 ? 'completed' : 
                withdrawal.status === -1 ? 'failed' : 'pending',
        created_at: withdrawal.add_time,
        updated_at: withdrawal.update_time,
        transaction_hash: withdrawal.hash || '',
        to_address: withdrawal.to_address || '',
        sh_type: withdrawal.sh_type
      }
    }) || []

    console.log(`✅ 获取提现记录成功: ${formattedWithdrawals.length} 条记录`)

    return NextResponse.json({
      success: true,
      data: {
        withdrawals: formattedWithdrawals,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasMore: (count || 0) > offset + limit
        }
      }
    })

  } catch (error) {
    console.error('❌ 获取提现记录API错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) || '服务器内部错误' 
    }, { status: 500 })
  }
}

// 更新提现状态
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { withdrawalId, status, transactionHash } = body

    if (!withdrawalId || status === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 })
    }

    console.log(`🔄 更新提现状态: ID=${withdrawalId}, Status=${status}`)

    // 1. 先获取提现记录信息
    const { data: withdrawalData, error: fetchError } = await supabase
      .from('nh_withdraw')
      .select('id, user_id, price, status, to_address')
      .eq('id', withdrawalId)
      .single()

    if (fetchError || !withdrawalData) {
      console.error('❌ 获取提现记录失败:', fetchError)
      return NextResponse.json({ 
        success: false, 
        error: '提现记录不存在' 
      }, { status: 404 })
    }

    const withdrawAmount = Number.parseFloat(withdrawalData.price || '0')
    console.log(`📋 提现记录: 金额=${withdrawAmount}, 当前状态=${withdrawalData.status}`)

    // 2. 如果是拒绝操作且当前状态是pending(0)，需要返回余额给用户
    if (status === 'failed' && withdrawalData.status === 0) {
      console.log('💰 拒绝提现，开始返回余额给用户...')
      
      // 通过to_address查找用户
      const { data: userData, error: userError } = await supabase
        .from('nh_member_new')
        .select('id, withdrawable_usdt, withdrawal_usdt, wallet_address')
        .eq('wallet_address', withdrawalData.to_address)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        console.error('❌ 未找到用户:', userError)
      } else {
        // 返回余额
        const currentAvailable = Number.parseFloat(userData.withdrawable_usdt || '0')
        const currentWithdrawal = Number.parseFloat(userData.withdrawal_usdt || '0')
        
        const newAvailable = currentAvailable + withdrawAmount
        const newWithdrawal = Math.max(0, currentWithdrawal - withdrawAmount)

        console.log(`💰 余额变化: 可提现 ${currentAvailable} -> ${newAvailable}, 已提现 ${currentWithdrawal} -> ${newWithdrawal}`)

        const { error: refundError } = await supabase
          .from('nh_member_new')
          .update({
            withdrawable_usdt: newAvailable.toString(),
            withdrawal_usdt: newWithdrawal.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id)

        if (refundError) {
          console.error('❌ 返回余额失败:', refundError)
          return NextResponse.json({ 
            success: false, 
            error: '返回余额失败' 
          }, { status: 500 })
        }

        console.log(`✅ 成功返回 ${withdrawAmount} USDT 到用户 ${userData.wallet_address}`)
      }
    }

    // 3. 更新提现状态
    const updateData: any = {
      status: status === 'completed' ? 1 : status === 'failed' ? -1 : 0
    }

    if (transactionHash) {
      updateData.hash = transactionHash
    }

    console.log('📝 更新提现状态:', updateData)

    const { error: updateError } = await supabase
      .from('nh_withdraw')
      .update(updateData)
      .eq('id', withdrawalId)

    if (updateError) {
      console.error('❌ 更新提现状态失败:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: '更新提现状态失败' 
      }, { status: 500 })
    }

    console.log(`✅ 提现状态更新成功: ID=${withdrawalId}, Status=${status}`)

    return NextResponse.json({
      success: true,
      message: status === 'failed' ? '提现已拒绝，余额已返回用户账户' : '提现状态更新成功'
    })

  } catch (error) {
    console.error('❌ 更新提现状态API错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) || '服务器内部错误' 
    }, { status: 500 })
  }
}
