import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { addCorsHeaders } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 测试简单API...')
    
    // 简单查询用户表
    const { data: users, count, error } = await supabase
      .from('nh_member_new')
      .select('id, auth_wallet_address, approved, status, is_active', { count: 'exact' })
      .eq('is_active', 0)
      .limit(5)
    
    console.log('📊 查询结果:', { users: users?.length, count, error })
    
    if (error) {
      console.error('❌ 查询失败:', error)
      const response = NextResponse.json({ 
        success: false, 
        error: '查询失败',
        details: error.message 
      }, { status: 500 })
      return addCorsHeaders(response)
    }
    
    const response = NextResponse.json({
      success: true,
      data: {
        users: users || [],
        count: count || 0
      }
    })
    
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('❌ API异常:', error)
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}













