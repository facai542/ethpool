import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const wallet_address = searchParams.get('wallet_address')

  if (!wallet_address) {
    return NextResponse.json({ error: '钱包地址不能为空' }, { status: 400 })
  }

  try {
    // 从数据库获取用户信息 - 移除不存在的eth_balance字段
    const { data: userData, error: userError } = await supabase
      .from('nh_member_new')
      .select('usdt, updated_at, eth')
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .single()

    if (userError) {
      console.error('Database error:', userError)
      // 如果用户不存在，返回默认值
      return NextResponse.json({
        success: true,
        data: {
          wallet_address: wallet_address,
          ethBalance: '0.00',
          usdtBalance: '0.00',
          lastUpdated: new Date().toISOString(),
          updatedBy: 'system'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet_address: wallet_address,
        ethBalance: userData.eth || '0.00',
        usdtBalance: userData.usdt || '0.00',
        lastUpdated: userData.updated_at || new Date().toISOString(),
        updatedBy: 'system'
      }
    })
  } catch (error) {
    console.error('获取ETH余额失败:', error)
    return NextResponse.json({ 
      error: '获取ETH余额失败',
      success: false
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { wallet_address, ethBalance, usdtBalance, adminId } = await request.json()

    if (!wallet_address || (ethBalance === undefined && usdtBalance === undefined)) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    // 构建更新数据
    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString()
    }

    if (ethBalance !== undefined) {
      updateData.eth = ethBalance.toString()
    }
    if (usdtBalance !== undefined) {
      updateData.usdt = usdtBalance.toString()
    }

    // 更新用户余额
    const { data: updatedUser, error: updateError } = await supabase
      .from('nh_member_new')
      .update(updateData)
      .eq('wallet_address', wallet_address)
      .eq('is_active', true)
      .select('eth, usdt, updated_at')
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ 
        error: '更新余额失败: ' + updateError.message,
        success: false
      }, { status: 500 })
    }

    // 记录操作日志
    try {
      const { error: logError } = await supabase
        .from('admin_operation_logs')
        .insert({
          admin_id: adminId || 'admin',
          operation: 'update_balance',
          description: `更新用户 ${wallet_address} 的余额`,
          details: JSON.stringify({
            wallet_address,
            ethBalance: ethBalance !== undefined ? ethBalance.toString() : null,
            usdtBalance: usdtBalance !== undefined ? usdtBalance.toString() : null
          }),
          created_at: new Date().toISOString()
        })

      if (logError) {
        console.error('Failed to log operation:', logError)
      }
    } catch (logErr) {
      console.error('日志记录失败:', logErr)
      // 不影响主要功能
    }

    return NextResponse.json({
      success: true,
      message: '余额更新成功',
      data: {
        wallet_address: wallet_address,
        ethBalance: updatedUser.eth || '0.00',
        usdtBalance: updatedUser.usdt || '0.00',
        lastUpdated: updatedUser.updated_at,
        updatedBy: adminId || 'admin'
      }
    })
  } catch (error) {
    console.error('更新ETH余额失败:', error)
    return NextResponse.json({ 
      error: '更新ETH余额失败',
      success: false
    }, { status: 500 })
  }
} 