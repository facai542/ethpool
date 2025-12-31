import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: 获取所有收益等级
export async function GET(request: NextRequest) {
  try {
    const { data: tiers, error } = await supabase
      .from('reward_tiers')
      .select('*')
      .order('min_balance', { ascending: true })

    if (error) {
      throw error
    }

    // 计算统计数据
    const totalTiers = tiers?.length || 0
    const activeTiers = tiers?.filter(t => t.is_active).length || 0
    const avgRate = tiers && tiers.length > 0
      ? tiers.reduce((sum, t) => sum + t.daily_rate, 0) / tiers.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        tiers: tiers || [],
        stats: {
          totalTiers,
          activeTiers,
          avgRate
        }
      }
    })
  } catch (error) {
    console.error('获取收益等级失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取收益等级失败'
      },
      { status: 500 }
    )
  }
}

// POST: 创建新的收益等级
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tier_name, min_balance, max_balance, daily_rate, description, is_active } = body

    // 验证必填字段
    if (!tier_name || min_balance === undefined || max_balance === undefined || daily_rate === undefined) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 验证数值范围
    if (min_balance < 0 || max_balance < min_balance) {
      return NextResponse.json(
        { success: false, error: '余额范围无效' },
        { status: 400 }
      )
    }

    if (daily_rate < 0 || daily_rate > 100) {
      return NextResponse.json(
        { success: false, error: '收益率必须在0-100%之间' },
        { status: 400 }
      )
    }

    // 检查余额范围是否与现有等级冲突
    const { data: existingTiers } = await supabase
      .from('reward_tiers')
      .select('id, min_balance, max_balance, tier_name')
      .eq('is_active', true)

    if (existingTiers) {
      for (const tier of existingTiers) {
        const overlap = 
          (min_balance >= tier.min_balance && min_balance <= tier.max_balance) ||
          (max_balance >= tier.min_balance && max_balance <= tier.max_balance) ||
          (min_balance <= tier.min_balance && max_balance >= tier.max_balance)
        
        if (overlap) {
          return NextResponse.json(
            { 
              success: false, 
              error: `余额范围与现有等级"${tier.tier_name}"冲突` 
            },
            { status: 400 }
          )
        }
      }
    }

    // 创建新等级
    const { data, error } = await supabase
      .from('reward_tiers')
      .insert({
        tier_name,
        min_balance,
        max_balance,
        daily_rate: daily_rate / 100, // 转换百分比为小数
        description: description || null,
        is_active: is_active !== undefined ? is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: '创建成功',
      data
    })
  } catch (error) {
    console.error('创建收益等级失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '创建收益等级失败'
      },
      { status: 500 }
    )
  }
}

// PUT: 更新收益等级
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, tier_name, min_balance, max_balance, daily_rate, description, is_active } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少等级ID' },
        { status: 400 }
      )
    }

    // 构建更新数据
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (tier_name !== undefined) updateData.tier_name = tier_name
    if (min_balance !== undefined) updateData.min_balance = min_balance
    if (max_balance !== undefined) updateData.max_balance = max_balance
    if (daily_rate !== undefined) updateData.daily_rate = daily_rate / 100
    if (description !== undefined) updateData.description = description
    if (is_active !== undefined) updateData.is_active = is_active

    // 如果更新余额范围，检查冲突
    if (min_balance !== undefined || max_balance !== undefined) {
      const { data: currentTier } = await supabase
        .from('reward_tiers')
        .select('min_balance, max_balance')
        .eq('id', id)
        .single()

      if (currentTier) {
        const newMinBalance = min_balance !== undefined ? min_balance : currentTier.min_balance
        const newMaxBalance = max_balance !== undefined ? max_balance : currentTier.max_balance

        if (newMinBalance < 0 || newMaxBalance < newMinBalance) {
          return NextResponse.json(
            { success: false, error: '余额范围无效' },
            { status: 400 }
          )
        }

        // 检查与其他等级的冲突
        const { data: otherTiers } = await supabase
          .from('reward_tiers')
          .select('id, min_balance, max_balance, tier_name')
          .eq('is_active', true)
          .neq('id', id)

        if (otherTiers) {
          for (const tier of otherTiers) {
            const overlap = 
              (newMinBalance >= tier.min_balance && newMinBalance <= tier.max_balance) ||
              (newMaxBalance >= tier.min_balance && newMaxBalance <= tier.max_balance) ||
              (newMinBalance <= tier.min_balance && newMaxBalance >= tier.max_balance)
            
            if (overlap) {
              return NextResponse.json(
                { 
                  success: false, 
                  error: `余额范围与现有等级"${tier.tier_name}"冲突` 
                },
                { status: 400 }
              )
            }
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('reward_tiers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data
    })
  } catch (error) {
    console.error('更新收益等级失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新收益等级失败'
      },
      { status: 500 }
    )
  }
}

// DELETE: 删除收益等级
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少等级ID' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('reward_tiers')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除收益等级失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除收益等级失败'
      },
      { status: 500 }
    )
  }
}










