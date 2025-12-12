/**
 * 返回需要监听的地址列表
 * 供 Railway Transfer 监听服务调用
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // 查询所有已授权的用户地址
    // 注意：approved 是 integer 类型，1 表示已授权
    const { data: users, error } = await supabase
      .from('nh_member_new')
      .select('wallet_address')
      .eq('approved', 1)
      .eq('is_active', true)
    
    if (error) {
      console.error('查询用户地址失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    const addresses = users?.map(u => u.wallet_address) || []
    
    console.log(`📊 返回 ${addresses.length} 个监听地址`)
    
    return NextResponse.json({
      success: true,
      addresses: addresses,
      count: addresses.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('获取监听地址失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

