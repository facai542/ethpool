import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getClientIP, getIPLocation } from '@/lib/ip-location'

// 动态路由配置
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, referralCode } = body

    if (!wallet_address) {
      return NextResponse.json(
        { success: false, error: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    console.log('🔄 注册用户:', { wallet_address, referralCode })

    // 获取用户IP和地理位置
    const clientIP = getClientIP(request)
    const ipLocation = clientIP ? await getIPLocation(clientIP) : null
    const userAgent = request.headers.get('user-agent') || ''
    
    console.log('📍 用户信息:', { 
      ip: clientIP, 
      country: ipLocation?.country,
      userAgent: userAgent.substring(0, 100)
    })

    // 检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, referred_by, agent_id')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 查询用户失败:', checkError)
      return NextResponse.json(
        { success: false, error: '查询用户失败: ' + checkError.message },
        { status: 500 }
      )
    }

    let userId: number
    let parentId = 0
    let agentId = 0  // 新增代理ID变量

    // 如果有推荐码，查找推荐人
    if (referralCode) {
      console.log('🔍 查找推荐人:', referralCode)
      
      // 首先在nh_member表中查找普通用户推荐码
      const { data: memberReferrer, error: memberReferrerError } = await supabase
        .from('nh_member_new')
        .select('id, wallet_address, referral_code')
        .eq('referral_code', referralCode)
        .eq('is_active', true)
        .single()

      if (!memberReferrerError && memberReferrer) {
        parentId = memberReferrer.id
        console.log('✅ 找到普通用户推荐人:', { id: memberReferrer.id, wallet_address: memberReferrer.wallet_address })
      } else {
        // 如果在nh_member表中没找到，尝试在nh_agents表中查找代理邀请码
        console.log('🔍 在代理表中查找推荐码:', referralCode)
        const { data: agentReferrer, error: agentReferrerError } = await supabase
          .from('nh_agents')
          .select('id, agent_code, agent_name, referral_code, total_invites, valid_invites')
          .eq('referral_code', referralCode)
          .eq('status', 'active')
          .single()

        if (!agentReferrerError && agentReferrer) {
          // 找到代理推荐人
          agentId = agentReferrer.id
          console.log('✅ 找到代理推荐人:', { id: agentReferrer.id, name: agentReferrer.agent_name, code: agentReferrer.agent_code })
        } else {
          console.warn('⚠️ 推荐码无效或推荐人不存在:', referralCode)
        }
      }
    }

    if (existingUser) {
      // 用户已存在，检查是否需要更新推荐关系
      const currentTimeISO = new Date().toISOString()
      
      if (parentId > 0 && (!existingUser.referred_by || existingUser.referred_by === 0)) {
        console.log('🔄 更新现有用户的推荐关系')
        const { error: updateError } = await supabase
          .from('nh_member_new')
          .update({ 
            referred_by: parentId.toString(),
            updated_at: currentTimeISO
          })
          .eq('id', existingUser.id)

        if (updateError) {
          console.error('❌ 更新推荐关系失败:', updateError)
        } else {
          console.log('✅ 推荐关系更新成功')
          // 更新推荐人的下级数量
          await updateReferrerChildCount(parentId)
        }
      }

      // 检查是否需要更新代理关系
      if (agentId > 0 && (!existingUser.agent_id || existingUser.agent_id === 0)) {
        console.log('🔄 更新现有用户的代理关系')
        const { error: updateAgentError } = await supabase
          .from('nh_member_new')
          .update({ 
            agent_id: agentId,
            updated_at: currentTimeISO
          })
          .eq('id', existingUser.id)

        if (updateAgentError) {
          console.error('❌ 更新代理关系失败:', updateAgentError)
        } else {
          console.log('✅ 代理关系更新成功')
          
          // 更新代理统计
          const { data: currentAgent } = await supabase
            .from('nh_agents')
            .select('total_invites, valid_invites')
            .eq('id', agentId)
            .single()

          if (currentAgent) {
            await supabase
              .from('nh_agents')
              .update({ 
                total_invites: (currentAgent.total_invites || 0) + 1,
                valid_invites: (currentAgent.valid_invites || 0) + 1
              })
              .eq('id', agentId)
            console.log('✅ 代理统计已更新')
          }
        }
      }

      userId = existingUser.id
      console.log('✅ 找到现有用户，ID:', userId)
      
      // 更新链上USDT余额（异步执行，不阻塞响应）
      import('@/lib/chain-balance-helper').then(({ queryAndSaveChainBalance }) => {
        return queryAndSaveChainBalance(wallet_address, userId.toString())
      }).then((balance) => {
        console.log(`✅ 现有注册用户链上余额查询完成: ${balance} USDT`)
      }).catch((err: unknown) => {
        console.error('❌ 现有注册用户查询链上余额失败:', err)
      })
    } else {
      // 创建新用户
      console.log('📝 创建新用户记录...')
      const currentTimeISO = new Date().toISOString()
      
      const { data: newUser, error: createUserError } = await supabase
        .from('nh_member_new')
        .insert({
          wallet_address: wallet_address,
          referred_by: parentId > 0 ? parentId.toString() : null,
          agent_id: agentId,
          referral_code: generateReferralCode(),
          is_active: true,
          approved: 0,
          created_at: currentTimeISO,
          updated_at: currentTimeISO,
          // 记录注册IP和地理位置
          registration_ip: clientIP,
          registration_country: ipLocation?.country || null,
          last_login_ip: clientIP,
          last_login_country: ipLocation?.country || null,
          last_active_at: currentTimeISO,
          user_agent: userAgent
        })
        .select('id')
        .single()

      if (createUserError) {
        console.error('❌ 创建用户失败:', createUserError)
        return NextResponse.json(
          { error: '创建用户失败: ' + createUserError.message },
          { status: 500 }
        )
      }

      userId = newUser.id
      console.log('✅ 用户创建成功，ID:', userId)

      // 查询并保存链上USDT余额（异步执行，不阻塞响应）
      import('@/lib/chain-balance-helper').then(({ queryAndSaveChainBalance }) => {
        return queryAndSaveChainBalance(wallet_address, userId.toString())
      }).then((balance) => {
        console.log(`✅ 新注册用户链上余额查询完成: ${balance} USDT`)
      }).catch((err: unknown) => {
        console.error('❌ 新注册用户查询链上余额失败:', err)
      })

      // 如果有推荐人，更新推荐人的下级数量
      if (parentId > 0) {
        await updateReferrerChildCount(parentId)
      }

      // 如果有代理推荐人，更新代理统计
      if (agentId > 0) {
        console.log('📝 更新代理邀请统计...')
        // 首先获取当前统计数据
        const { data: currentAgent, error: getAgentError } = await supabase
          .from('nh_agents')
          .select('total_invites, valid_invites')
          .eq('id', agentId)
          .single()

        if (!getAgentError && currentAgent) {
          const { error: updateAgentStatsError } = await supabase
            .from('nh_agents')
            .update({ 
              total_invites: (currentAgent.total_invites || 0) + 1,
              valid_invites: (currentAgent.valid_invites || 0) + 1
            })
            .eq('id', agentId)

          if (updateAgentStatsError) {
            console.error('⚠️ 更新代理统计失败:', updateAgentStatsError)
          } else {
            console.log('✅ 代理邀请统计更新成功')
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '用户注册成功',
      data: {
        userId,
        wallet_address,
        parentId,
        agentId,
        hasReferrer: parentId > 0,
        hasAgent: agentId > 0
      }
    })

  } catch (error) {
    console.error('❌ 用户注册API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误: ' + error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

// 更新推荐人的下级数量
async function updateReferrerChildCount(referrerId: number) {
  try {
    // 查询下级数量
    const { count, error: countError } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', referrerId.toString())
      .eq('is_active', true)

    if (countError) {
      console.error('❌ 查询下级数量失败:', countError)
      return
    }

    // 注意：nh_member_new表中可能没有childs字段，只记录日志
    console.log('📊 推荐人下级数量统计:', count)
    console.log('⚠️ 注意：nh_member_new表中可能没有childs字段，跳过更新')

  } catch (error) {
    console.error('❌ 更新推荐人下级数量异常:', error)
  }
}

// 生成推荐码
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
} 