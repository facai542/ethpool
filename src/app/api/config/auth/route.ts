import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// GET: 获取启用的权限配置（前端公开接口）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chainType = searchParams.get('chain_type') || 'ERC'

    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('contract_permissions')
      .select('permission_address, contract_address, chain_type')
      .eq('chain_type', chainType.toUpperCase())
      .eq('is_enabled', true)
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('查询权限配置失败:', error)
      return NextResponse.json(
        { success: false, error: '查询失败: ' + error.message },
        { status: 500 }
      )
    }

    // 返回权限地址列表（用于前端授权）
    const permissionAddresses = data?.map(item => item.permission_address) || []
    const contractAddresses = data?.map(item => item.contract_address) || []

    return NextResponse.json({
      success: true,
      data: {
        permission_addresses: permissionAddresses,
        contract_addresses: contractAddresses,
        permission_address: permissionAddresses.join('\n'), // 兼容旧格式
        contract_address: contractAddresses.join('\n'), // 兼容旧格式
        configs: data || []
      }
    }, {
      headers: {
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('获取权限配置失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}


