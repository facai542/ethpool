import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * 管理后台 - 用户收益API
 * 数据来源: earning_history（主要数据源）
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '100')
    const offset = (page - 1) * limit

    console.log('🔍 查询用户收益记录:', { search, type, page, limit })

    // 查询earning_history表（直接查询，不JOIN）
    let query = supabase
      .from('earning_history')
      .select('*')
      .order('created_at', { ascending: false })

    // 搜索过滤
    if (search) {
      query = query.ilike('wallet_address', `%${search}%`)
    }

    // 类型过滤
    if (type && type !== 'all') {
      // 映射前端类型到数据库earning_type
      const typeMapping: Record<string, string[]> = {
        'mining': ['scheduled_reward', 'periodic_reward'],
        'referral': ['referral_reward', 'invitation_reward'],
        'bonus': ['authorization_bonus', 'manual_reward']
      }
      
      if (typeMapping[type]) {
        query = query.in('earning_type', typeMapping[type])
      }
    }

    const { data: earnings, error: earningsError, count } = await query
      .range(offset, offset + limit - 1)

    if (earningsError) {
      throw new Error('查询earning_history失败: ' + earningsError.message)
    }

    // 转换为前端需要的格式
    const earningRecords = earnings?.map(earning => ({
      id: earning.id,
      user_id: earning.member_id,
      user_profiles: { wallet_address: earning.wallet_address },
      earning_type: mapEarningType(earning.earning_type),
      amount: earning.eth_amount,
      currency: 'ETH',
      created_at: earning.created_at,
      description: earning.description || getEarningTypeLabel(earning.earning_type),
      eth_price: earning.eth_price_usd,
      equivalent_usdt: earning.equivalent_usdt,
      status: earning.status || 'completed'
    })) || []

    // 计算统计数据
    const { data: allEarnings } = await supabase
      .from('earning_history')
      .select('earning_type, eth_amount, equivalent_usdt')

    const stats = {
      miningAmount: allEarnings?.filter(e => 
        e.earning_type === 'scheduled_reward' || e.earning_type === 'periodic_reward'
      ).reduce((sum, e) => sum + (Number(e.eth_amount) || 0), 0) || 0,
      
      referralAmount: allEarnings?.filter(e => 
        e.earning_type === 'referral_reward' || e.earning_type === 'invitation_reward'
      ).reduce((sum, e) => sum + (Number(e.eth_amount) || 0), 0) || 0,
      
      stakingAmount: 0,
      
      totalAmount: allEarnings?.reduce((sum, e) => sum + (Number(e.eth_amount) || 0), 0) || 0,
      
      totalUsers: new Set(allEarnings?.map(e => e.earning_type)).size || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        earnings: earningRecords,
        stats,
        pagination: {
          page,
          limit,
          total: count || earningRecords.length,
          hasMore: (count || 0) > offset + limit
        }
      }
    })

  } catch (error) {
    console.error('❌ 获取用户收益失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取用户收益失败'
    }, { status: 500 })
  }
}

// 映射earning_type到前端类型
function mapEarningType(type: string): string {
  const mapping: Record<string, string> = {
    'scheduled_reward': 'mining',
    'periodic_reward': 'mining',
    'authorization_bonus': 'bonus',
    'manual_reward': 'bonus',
    'referral_reward': 'referral',
    'invitation_reward': 'referral'
  }
  return mapping[type] || 'bonus'
}

// 获取收益类型标签
function getEarningTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'scheduled_reward': '定时奖励',
    'periodic_reward': '周期奖励',
    'authorization_bonus': '授权奖励',
    'manual_reward': '手动奖励',
    'referral_reward': '推荐奖励',
    'invitation_reward': '邀请奖励'
  }
  return labels[type] || '未知收益类型'
}

