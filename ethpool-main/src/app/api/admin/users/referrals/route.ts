import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * 管理后台 - 归集记录API（推荐关系记录）
 * 数据来源: nh_member_new (referred_by字段表示邀请关系)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '100')
    const offset = (page - 1) * limit

    console.log('🔍 查询归集记录（推荐关系）:', { search, page, limit })

    // 查询所有有推荐关系的用户
    let query = supabase
      .from('nh_member_new')
      .select('id, wallet_address, referred_by, referral_code, approved, created_at, updated_at')
      .not('referred_by', 'is', null)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`wallet_address.ilike.%${search}%,referred_by.ilike.%${search}%`)
    }

    const { data: members, error: membersError, count } = await query
      .range(offset, offset + limit - 1)

    if (membersError) {
      throw new Error('查询推荐关系失败: ' + membersError.message)
    }

    // 为每个被推荐用户查找推荐人信息
    const referralRelations = await Promise.all((members || []).map(async (member) => {
      if (!member.referred_by) return null

      // 查找推荐人
      const { data: referrer } = await supabase
        .from('nh_member_new')
        .select('wallet_address')
        .eq('referral_code', member.referred_by)
        .single()

      return {
        id: member.id,
        referrer_address: referrer?.wallet_address || 'Unknown',
        referrer_name: null,
        referee_address: member.wallet_address,
        referee_name: null,
        level: 1,
        commission_rate: 10,
        total_commission: 0,
        status: member.approved === 1 ? 'active' : 'inactive',
        created_at: member.created_at,
        updated_at: member.updated_at
      }
    }))

    // 过滤掉null值
    const filteredRelations = referralRelations.filter(r => r !== null)

    // 计算统计数据
    const totalReferrals = filteredRelations.length
    const activeRelations = filteredRelations.filter(r => r?.status === 'active').length
    const totalCommission = filteredRelations.reduce((sum, r) => sum + (r?.total_commission || 0), 0)

    return NextResponse.json({
      success: true,
      data: filteredRelations,
      stats: {
        totalReferrals,
        activeRelations,
        totalCommission
      },
      pagination: {
        page,
        limit,
        total: count || filteredRelations.length,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('❌ 获取归集记录失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取归集记录失败'
    }, { status: 500 })
  }
}


