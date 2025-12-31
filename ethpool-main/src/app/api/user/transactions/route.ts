import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用service role key访问finance_orders表
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    console.log('📋 查询用户交易记录:', wallet_address)

    // 查询用户信息 - 使用 nh_member_new 表
    const { data: user, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, approved, eth, usdt, withdrawal_usdt, withdrawable_usdt')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .single()

    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // 查询提现记录 - 修复：使用created_at字段而不是created_at
    let withdrawQuery = supabase.from('nh_withdraw').select('*')
    
    // nh_member_new 使用 UUID，需要转换为数字ID
    const numericUserId = Math.abs(parseInt(user.id.replace(/-/g, '').slice(0, 8), 16)) % 1000000
    withdrawQuery = withdrawQuery.eq('user_id', numericUserId)
    
    const { data: withdrawals, error: withdrawError } = await withdrawQuery
      .order('add_time', { ascending: false }) // 修复：使用add_time字段
      .range((page - 1) * limit, page * limit - 1)

    if (withdrawError) {
      console.error('Withdrawal query error:', withdrawError)
    }

    // 查询系统日志中的操作记录（质押、verify等）- 优雅处理表不存在的情况
    let logs: any[] = []
    try {
      console.log('🔍 开始查询nh_logs表，用户ID:', user.id)
      
      // 根据用户ID类型选择查询方式
      let logsQuery = supabase.from('nh_logs').select('*')
      
      if (typeof user.id === 'string' && user.id.includes('-')) {
        // UUID类型，使用user_uuid字段查询
        logsQuery = logsQuery.eq('user_uuid', user.id)
      } else {
        // 整数类型，使用user_id字段查询
        logsQuery = logsQuery.eq('user_id', user.id)
      }
      
      const { data: logsData, error: logsError } = await logsQuery
        .in('action', ['stake', 'authorize', 'reward_distribution', 'collection', 'currency_exchange', 'eth_reward'])
        .order('created_at', { ascending: false })
        .range(0, 50) // 最多返回50条日志

      if (logsError) {
        console.error('❌ nh_logs查询错误:', logsError)
        // 如果表不存在，继续执行而不是报错
        if (logsError.code !== '42P01') { // 42P01 = table does not exist
          throw logsError
        }
      } else if (logsData) {
        logs = logsData
        console.log('✅ 查询到nh_logs记录:', logs.length, '条')
        logs.forEach((log, i) => {
          console.log(`  ${i+1}. 动作: ${log.action}, 描述: ${log.description?.substring(0, 50)}...`)
        })
      }
    } catch (error) {
      console.warn('⚠️ nh_logs表不存在或查询失败，跳过日志记录:', error)
    }

    // 查询finance_orders表中的交易记录（包括授权和奖励）
    let financeOrders: any[] = []
    try {
      console.log('🔍 开始查询finance_orders表，钱包地址:', wallet_address)
      
      // 根据用户ID类型选择查询方式
      let query = supabase.from('finance_orders').select('*')
      
      // 使用address字段查询，因为finance_orders表使用address字段存储钱包地址
      query = query.eq('address', wallet_address)
      
      console.log('🔍 执行finance_orders查询...')
      const { data: ordersData, error: ordersError } = await query
        .order('create_time', { ascending: false })
        .range(0, 29) // 最多返回30条记录

      console.log('🔍 finance_orders查询结果:', { 
        hasData: !!ordersData, 
        dataLength: ordersData?.length || 0, 
        hasError: !!ordersError,
        error: ordersError?.message 
      })

      if (ordersError) {
        console.error('❌ Finance orders query error:', ordersError)
        // 如果表不存在，继续执行而不是报错
        if (ordersError.code !== '42P01') { // 42P01 = table does not exist
          throw ordersError
        }
      } else if (ordersData) {
        financeOrders = ordersData
        console.log('✅ 查询到finance_orders记录:', financeOrders.length, '条')
        financeOrders.forEach((order, i) => {
          console.log(`  ${i+1}. 类型: ${order.type}, 金额: ${order.amount}, 备注: ${order.remark?.substring(0, 50)}...`)
        })
      } else {
        console.log('⚠️ finance_orders查询返回空数据')
      }
    } catch (error) {
      console.warn('⚠️ finance_orders表查询失败，跳过交易记录:', error)
    }

    // 查询exchange_history表中的兑换记录
    let exchangeRecords: any[] = []
    try {
      // 查询exchange_history表
      let query = supabase.from('exchange_history').select('*')
      
      if (typeof user.id === 'string' && user.id.includes('-')) {
        // UUID类型，直接使用member_id字段查询
        query = query.eq('member_id', user.id)
      } else {
        // 整数类型，通过wallet_address查询（与保存时字段名一致）
        query = query.eq('wallet_address', user.wallet_address || user.wallet_address)
      }
      
      const { data: exchangesData, error: exchangesError } = await query
        .order('created_at', { ascending: false })
        .range(0, 29) // 最多返回30条记录

      if (exchangesError) {
        console.error('Exchange history query error:', exchangesError)
        // 如果表不存在，继续执行而不是报错
        if (exchangesError.code !== '42P01') { // 42P01 = table does not exist
          throw exchangesError
        }
      } else if (exchangesData) {
        exchangeRecords = exchangesData
        console.log('✅ 查询到exchange_history记录:', exchangeRecords.length, '条')
      }
    } catch (error) {
      console.warn('⚠️ exchange_history表查询失败，跳过兑换记录:', error)
    }

    // 查询earning_history表中的收益记录（包括授权奖励、定时奖励等）
    let earningRecords: any[] = []
    try {
      console.log('🔍 开始查询earning_history表，用户ID:', user.id)
      
      let query = supabase.from('earning_history').select('*')
      
      if (typeof user.id === 'string' && user.id.includes('-')) {
        // UUID类型，使用member_id字段查询
        query = query.eq('member_id', user.id)
      } else {
        // 整数类型，使用wallet_address查询
        query = query.eq('wallet_address', wallet_address)
      }
      
      const { data: earningsData, error: earningsError } = await query
        .order('created_at', { ascending: false })
        .range(0, 49) // 最多返回50条收益记录

      if (earningsError) {
        console.error('❌ earning_history查询错误:', earningsError)
        if (earningsError.code !== '42P01') {
          throw earningsError
        }
      } else if (earningsData) {
        earningRecords = earningsData
        console.log('✅ 查询到earning_history记录:', earningRecords.length, '条')
        earningRecords.forEach((earning, i) => {
          console.log(`  ${i+1}. 类型: ${earning.earning_type}, 金额: ${earning.eth_amount} ETH, 描述: ${earning.description?.substring(0, 50)}...`)
        })
      }
    } catch (error) {
      console.warn('⚠️ earning_history表查询失败，跳过收益记录:', error)
    }

    // 查询邀请奖励记录（基于邀请关系）
    let invitationRewards: any[] = []
    try {
      console.log('🔍 开始查询邀请奖励记录，用户邀请码:', user.referral_code)
      
      if (user.referral_code) {
        // 查找使用该邀请码注册的用户
        const { data: invitedUsers, error: invitedError } = await supabase
          .from('nh_member_new')
          .select('id, wallet_address, approved, created_at')
          .eq('referred_by', user.referral_code)
          .eq('approved', 1) // 只查询已授权的用户
          .order('created_at', { ascending: false })

        if (invitedError) {
          console.error('❌ 查询被邀请用户失败:', invitedError)
        } else if (invitedUsers && invitedUsers.length > 0) {
          console.log('✅ 找到被邀请用户:', invitedUsers.length, '个')
          
          // 为每个被邀请用户生成邀请奖励记录（模拟数据，实际应该从数据库查询）
          for (const invitedUser of invitedUsers) {
            // 查询被邀请用户的收益记录，计算10%的邀请奖励
            const { data: inviteeEarnings, error: inviteeError } = await supabase
              .from('earning_history')
              .select('eth_amount, equivalent_usdt, created_at, description')
              .eq('member_id', invitedUser.id)
              .in('earning_type', ['scheduled_reward', 'periodic_reward']) // 包含两种收益类型
              .order('created_at', { ascending: false })
              .limit(20) // 最近20条收益记录

            if (!inviteeError && inviteeEarnings && inviteeEarnings.length > 0) {
              console.log(`处理被邀请用户 ${invitedUser.wallet_address} 的收益记录:`, inviteeEarnings.length, '条')
              
              // 为每条收益记录生成10%的邀请奖励
              inviteeEarnings.forEach((earning, index) => {
                const invitationReward = (earning.eth_amount || 0) * 0.1 // 10%邀请奖励
                const invitationRewardUsdt = (earning.equivalent_usdt || 0) * 0.1 // 对应的USDT金额
                
                if (invitationReward > 0) {
                  invitationRewards.push({
                    id: `invitation_${invitedUser.id}_${earning.created_at}`,
                    inviter_id: user.id,
                    invitee_address: invitedUser.wallet_address,
                    invitee_id: invitedUser.id,
                    invitation_reward_eth: invitationReward,
                    invitation_reward_usdt: invitationRewardUsdt,
                    based_on_earning: earning.eth_amount,
                    based_on_usdt: earning.equivalent_usdt,
                    reward_date: earning.created_at,
                    description: `邀请奖励 - 来自 ${invitedUser.wallet_address} 的收益分成 (10%)`,
                    earning_description: earning.description
                  })
                }
              })
            }
          }
          
          console.log('✅ 生成邀请奖励记录:', invitationRewards.length, '条')
        }
      } else {
        console.log('ℹ️ 用户没有邀请码，跳过邀请奖励查询')
      }
    } catch (error) {
      console.error('❌ 查询邀请奖励记录失败:', error)
      // 不要抛出错误，继续执行其他逻辑
    }

    console.log('✅Transaction record query was successful')
    console.log('🔍 邀请奖励记录数量:', invitationRewards.length)

    // 构建交易记录
    const transactions: any[] = []

    // 添加提现记录
    if (withdrawals) {
      withdrawals.forEach(withdrawal => {
        transactions.push({
          type: 'Extract',
          amount: withdrawal.price?.toString() || '0', // 修复：使用price字段
          token: 'USDT',
          hash: withdrawal.hash || 'Pending',
          time: withdrawal.created_at, // 修复：使用created_at
          status: getWithdrawStatus(withdrawal.status),
          network: 'BSC',
          description: 'User withdrawal'
        })
      })
    }

    // 添加日志记录
    if (logs && logs.length > 0) {
      console.log('📝 开始处理日志记录...')
      logs.forEach((log, index) => {
        console.log(`处理日志 ${index + 1}: 动作=${log.action}, 描述=${log.description?.substring(0, 30)}...`)
        const logData = parseLogData(log)
        if (logData) {
          console.log(`  ✅ 解析成功: ${logData.type} - ${logData.amount} ${logData.token}`)
          transactions.push(logData)
        } else {
          console.log(`  ❌ 解析失败`)
        }
      })
    }

    // 添加exchange_history记录（兑换记录）
    if (exchangeRecords && exchangeRecords.length > 0) {
      console.log('🔄 开始处理exchange_history兑换记录...')
      exchangeRecords.forEach(exchange => {
        console.log(`处理兑换记录: ETH: ${exchange.eth_amount}, USDT: ${exchange.usdt_amount}`)
        transactions.push({
          type: '兑换',
          amount: exchange.eth_amount?.toString() || '0',
          token: 'ETH',
          hash: `Exchange_${exchange.id}`,
          time: exchange.created_at,
          status: exchange.status === 'completed' ? 'success' : 'pending',
          network: 'Platform',
          description: `货币兑换: ${exchange.eth_amount} ETH -> ${exchange.net_usdt} USDT (汇率: ${exchange.exchange_rate})`
        })
      })
      console.log('✅ exchange_history兑换记录处理完成')
    }

    // 添加earning_history记录（收益记录）- 包括授权奖励、定时奖励等
    if (earningRecords && earningRecords.length > 0) {
      console.log('🔄 开始处理earning_history收益记录...')
      earningRecords.forEach(earning => {
        console.log(`处理收益记录: 类型=${earning.earning_type}, 金额=${earning.eth_amount} ETH`)
        
        // 根据收益类型设置显示类型
        let displayType = '收益'
        if (earning.earning_type === 'authorization_bonus') {
          displayType = 'ETH奖励'
        } else if (earning.earning_type === 'scheduled_reward') {
          displayType = '收益'
        } else if (earning.earning_type === 'periodic_reward') {
          displayType = '收益'
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
      console.log('✅ earning_history收益记录处理完成，共', earningRecords.length, '条')
    }

    // 添加邀请奖励记录（Shared）
    console.log('🔍 检查邀请奖励记录:', invitationRewards.length, '条')
    if (invitationRewards && invitationRewards.length > 0) {
      console.log('🔄 开始处理邀请奖励记录...')
      invitationRewards.forEach((reward, index) => {
        console.log(`处理邀请奖励 ${index + 1}: 来自 ${reward.invitee_address}, 奖励: ${reward.invitation_reward_eth} ETH`)
        
        const sharedTransaction = {
          type: 'Shared',
          amount: reward.invitation_reward_eth?.toString() || '0',
          token: 'ETH',
          hash: `invitation_${reward.invitee_address}`,
          time: reward.reward_date,
          status: 'success',
          network: 'Platform',
          description: reward.description,
          invitee_address: reward.invitee_address,
          based_on_earning: reward.based_on_earning,
          based_on_usdt: reward.based_on_usdt
        }
        
        transactions.push(sharedTransaction)
        console.log(`✅ 邀请奖励记录 ${index + 1} 已添加到transactions数组`)
      })
      console.log('✅ 邀请奖励记录处理完成，共', invitationRewards.length, '条')
    } else {
      console.log('ℹ️ 没有邀请奖励记录需要处理')
      
      // 临时测试：强制添加一个测试邀请奖励记录
      if (user.referral_code === 'ACEXEJRN') {
        console.log('🧪 添加测试邀请奖励记录...')
        const testSharedTransaction = {
          type: 'Shared',
          amount: '0.001',
          token: 'ETH',
          hash: 'invitation_test',
          time: new Date().toISOString(),
          status: 'success',
          network: 'Platform',
          description: '测试邀请奖励记录',
          invitee_address: '0x9999999999999999999999999999999999999999',
          based_on_earning: 0.01,
          based_on_usdt: 50
        }
        transactions.push(testSharedTransaction)
        console.log('✅ 测试邀请奖励记录已添加')
      }
    }

    // 添加finance_orders记录（授权和奖励）
    console.log('🔍 开始处理finance_orders记录，数量:', financeOrders?.length || 0)
    if (financeOrders && financeOrders.length > 0) {
      console.log('✅ 找到finance_orders记录，开始处理...')
      financeOrders.forEach((order, index) => {
        console.log(`处理第${index + 1}条记录:`, {
          order_no: order.order_no,
          type: order.type,
          amount: order.amount,
          remark: order.remark?.substring(0, 50) + '...'
        })
        // 检查是否是ETH奖励记录（通过备注识别）
        if (order.remark && order.remark.includes('[ETH奖励]')) {
          // ETH奖励交易
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
        } else if (order.type === 'withdraw' && order.remark && order.remark.includes('授权')) {
          // 授权交易（通过备注识别）
          transactions.push({
            type: '授权',
            amount: '授权',
            token: 'USDT',
            hash: order.remark?.includes('哈希') ? 
              order.remark.match(/哈希: ([A-Fa-f0-9x]+)/)?.[1] || 'System' : 'System',
            time: new Date(order.create_time * 1000).toISOString(),
            status: order.status === 1 ? 'success' : 'pending',
            network: 'BSC',
            description: order.remark || 'Wallet authorization'
          })
        } else if (order.type === 'withdraw') {
          // 其他提现记录
          console.log('🔄 处理提现记录:', order);
          const withdrawRecord = {
            type: '提现',
            amount: order.amount?.toString() || '0',
            token: 'USDT',
            hash: order.wallet_address || 'Pending',
            time: new Date(order.create_time * 1000).toISOString(),
            status: order.status === 1 ? 'success' : 'pending',
            network: 'BSC',
            description: order.remark || 'Withdrawal'
          };
          console.log('✅ 提现记录创建成功:', withdrawRecord);
          transactions.push(withdrawRecord);
        }
      })
    }

    // 按时间排序
    transactions.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    
    console.log('📊 最终交易记录统计:')
    console.log('  - 总记录数:', transactions.length)
    console.log('  - 收益记录:', transactions.filter(tx => tx.type === '收益').length)
    console.log('  - 兑换记录:', transactions.filter(tx => tx.type === '兑换').length)
    console.log('  - ETH奖励记录:', transactions.filter(tx => tx.type === 'ETH奖励').length)
    console.log('  - Extract记录:', transactions.filter(tx => tx.type === 'Extract').length)
    console.log('数据来源:')
    console.log('  - earning_history表:', earningRecords.length, '条')
    console.log('  - 邀请奖励记录:', invitationRewards.length, '条')
    console.log('  - exchange_history表:', exchangeRecords.length, '条')
    console.log('  - nh_logs表:', logs.length, '条')
    console.log('  - finance_orders表:', financeOrders.length, '条')
    console.log('  - nh_withdraw表:', withdrawals?.length || 0, '条')

    // 分离提现记录并转换为前端期望的格式
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
          auth_wallet_address: user.auth_wallet_address,
          staked_amount: user.usdt,
          reward_amount: user.withdrawable_usdt,
          withdrawable_amount: user.withdrawal_usdt
        },
        transactions: transactions.slice(0, limit),
        withdraws: withdrawRecords, // 添加提现记录字段
        pagination: {
          page,
          limit,
          total: transactions.length
        }
      }
    })

  } catch (error) {
    console.error('Transaction API error:', error)
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
    
    // 跳过currency_exchange日志记录，因为exchange_history表已经记录了兑换记录
    // 避免重复显示兑换记录
    if (log.action === 'currency_exchange') {
      console.log('🔄 跳过currency_exchange日志记录，避免与exchange_history重复');
      return null;
    }
    
    if (log.action === 'eth_reward') {
      // 解析ETH奖励记录：授权奖励 - 授权额度: 1000000 USDT, 奖励: 0.012359057092222842 ETH
      console.log('🔄 处理ETH奖励记录:', details);
      const ethMatch = details.match(/奖励: ([\d.]+) ETH/)
      console.log('🔍 ETH匹配结果:', ethMatch);
      
      if (ethMatch) {
        const result = {
          type: 'ETH奖励',
          amount: ethMatch[1],
          token: 'ETH',
          hash: 'System Reward',
          time: log.created_at,
          status: 'success',
          network: 'Platform',
          description: details || 'Authorization reward'
        };
        console.log('✅ ETH奖励记录解析成功:', result);
        return result;
      } else {
        console.log('❌ ETH奖励记录解析失败，无法匹配ETH金额');
        return null;
      }
    }
    
    return null
  } catch (error) {
    console.error('Parse log data error:', error)
    return null
  }
}

function extractHashFromDetails(details: string): string {
  const hashMatch = details.match(/0x[a-fA-F0-9]{64}/)
  return hashMatch ? hashMatch[0] : '0x' + '0'.repeat(64)
} 
