import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addCorsHeaders } from '@/lib/utils'

// 动态路由配置
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, walletAddress, usdtBalance } = body

    if (!userId && !walletAddress) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID或钱包地址参数' },
        { status: 400 }
      )
    }

    if (usdtBalance === undefined || usdtBalance === null) {
      return NextResponse.json(
        { success: false, error: '缺少USDT余额参数' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase配置缺失' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const balanceNum = Number.parseFloat(String(usdtBalance))
    if (isNaN(balanceNum)) {
      return NextResponse.json(
        { success: false, error: '无效的余额值' },
        { status: 400 }
      )
    }

    const updateData: any = {
      onchain_usdt_balance: balanceNum,
      balance_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    let updateQuery
    if (userId) {
      // 使用用户ID更新
      updateQuery = supabase
        .from('nh_member_new')
        .update(updateData)
        .eq('id', userId)
    } else {
      // 使用钱包地址更新
      updateQuery = supabase
        .from('nh_member_new')
        .update(updateData)
        .eq('wallet_address', walletAddress)
        .eq('is_active', true)
    }

    const { data: updateResult, error: updateError } = await updateQuery

    if (updateError) {
      console.error('❌ 更新链上余额失败:', updateError)
      const response = NextResponse.json({
        success: false,
        error: '更新链上余额失败: ' + updateError.message
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    console.log(`✅ 链上USDT余额已更新到数据库: ${balanceNum} USDT`, {
      userId,
      walletAddress,
      updatedRows: updateResult
    })

    const response = NextResponse.json({
      success: true,
      message: '链上余额已更新',
      data: {
        onchain_usdt_balance: balanceNum,
        balance_updated_at: updateData.balance_updated_at
      }
    })

    return addCorsHeaders(response)

  } catch (error) {
    console.error('❌ 更新链上余额异常:', error)
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误: ' + (error instanceof Error ? error.message : '未知错误')
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

