import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 动态路由配置
export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: 查询钱包监听状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')

    console.log('📊 查询钱包监听状态...')

    // 查询活跃监听的钱包
    const { data: wallets, error: walletsError } = await supabase
      .from('wallet_monitor')
      .select(`
        *,
        nh_member_new!wallet_monitor_member_id_fkey (
          id,
          wallet_address,
          approved,
          a_eth,
          usdt,
          last_reward_at,
          reward_count_today
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (walletsError) {
      console.error('❌ 查询钱包监听失败:', walletsError)
      return NextResponse.json({
        success: false,
        error: '查询钱包监听失败: ' + walletsError.message
      }, { status: 500 })
    }

    // 查询统计信息
    const { data: stats, error: statsError } = await supabase
      .from('wallet_monitor')
      .select('id', { count: 'exact' })
      .eq('is_active', true)

    if (statsError) {
      console.error('❌ 查询统计信息失败:', statsError)
    }

    // 查询今日奖励发放统计
    const { data: todayRewards, error: rewardsError } = await supabase
      .from('scheduled_rewards_new')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date().toISOString().split('T')[0])

    if (rewardsError) {
      console.error('❌ 查询今日奖励失败:', rewardsError)
    }

    // 查询最近的执行日志
    const { data: logs, error: logsError } = await supabase
      .from('cron_execution_logs_new')
      .select('*')
      .eq('task_name', 'wallet_balance_reward_distribution')
      .order('execution_time', { ascending: false })
      .limit(5)

    if (logsError) {
      console.error('❌ 查询执行日志失败:', logsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        wallets: wallets || [],
        stats: {
          totalWallets: stats?.length || 0,
          todayRewards: todayRewards?.length || 0,
          recentLogs: logs || []
        },
        pagination: {
          page,
          limit,
          total: stats?.length || 0,
          totalPages: Math.ceil((stats?.length || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('❌ 查询钱包监听状态失败:', error)
    return NextResponse.json({
      success: false,
      error: '查询钱包监听状态失败: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
  }
}

// POST: 添加钱包到监听列表
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, memberId } = body

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: '缺少钱包地址参数'
      }, { status: 400 })
    }

    console.log('➕ 添加钱包到监听列表:', walletAddress)

    // 检查钱包是否已经在监听列表中
    const { data: existingWallet, error: checkError } = await supabase
      .from('wallet_monitor')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 检查钱包监听状态失败:', checkError)
      return NextResponse.json({
        success: false,
        error: '检查钱包监听状态失败: ' + checkError.message
      }, { status: 500 })
    }

    if (existingWallet) {
      return NextResponse.json({
        success: false,
        error: '钱包已在监听列表中'
      }, { status: 400 })
    }

    // 添加钱包到监听列表
    const { data: newWallet, error: insertError } = await supabase
      .from('wallet_monitor')
      .insert({
        member_id: memberId || null,
        wallet_address: walletAddress,
        is_active: true,
        monitor_transactions: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ 添加钱包到监听列表失败:', insertError)
      return NextResponse.json({
        success: false,
        error: '添加钱包到监听列表失败: ' + insertError.message
      }, { status: 500 })
    }

    console.log('✅ 钱包已添加到监听列表:', newWallet.id)

    return NextResponse.json({
      success: true,
      message: '钱包已添加到监听列表',
      data: newWallet
    })

  } catch (error) {
    console.error('❌ 添加钱包到监听列表失败:', error)
    return NextResponse.json({
      success: false,
      error: '添加钱包到监听列表失败: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
  }
}

// PUT: 更新钱包监听状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, isActive, monitorTransactions } = body

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: '缺少钱包地址参数'
      }, { status: 400 })
    }

    console.log('🔄 更新钱包监听状态:', walletAddress, { isActive, monitorTransactions })

    // 更新钱包监听状态
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallet_monitor')
      .update({
        is_active: isActive,
        monitor_transactions: monitorTransactions,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single()

    if (updateError) {
      console.error('❌ 更新钱包监听状态失败:', updateError)
      return NextResponse.json({
        success: false,
        error: '更新钱包监听状态失败: ' + updateError.message
      }, { status: 500 })
    }

    if (!updatedWallet) {
      return NextResponse.json({
        success: false,
        error: '钱包不存在'
      }, { status: 404 })
    }

    console.log('✅ 钱包监听状态已更新:', updatedWallet.id)

    return NextResponse.json({
      success: true,
      message: '钱包监听状态已更新',
      data: updatedWallet
    })

  } catch (error) {
    console.error('❌ 更新钱包监听状态失败:', error)
    return NextResponse.json({
      success: false,
      error: '更新钱包监听状态失败: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
  }
}

// DELETE: 从监听列表中移除钱包
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet_address')

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: '缺少钱包地址参数'
      }, { status: 400 })
    }

    console.log('🗑️ 从监听列表中移除钱包:', walletAddress)

    // 从监听列表中移除钱包
    const { error: deleteError } = await supabase
      .from('wallet_monitor')
      .delete()
      .eq('wallet_address', walletAddress)

    if (deleteError) {
      console.error('❌ 从监听列表中移除钱包失败:', deleteError)
      return NextResponse.json({
        success: false,
        error: '从监听列表中移除钱包失败: ' + deleteError.message
      }, { status: 500 })
    }

    console.log('✅ 钱包已从监听列表中移除')

    return NextResponse.json({
      success: true,
      message: '钱包已从监听列表中移除'
    })

  } catch (error) {
    console.error('❌ 从监听列表中移除钱包失败:', error)
    return NextResponse.json({
      success: false,
      error: '从监听列表中移除钱包失败: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
  }
}
