import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 动态路由配置
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, walletType, connectedAt, userAgent, chainId } = body

    if (!address) {
      return NextResponse.json(
        { success: false, error: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    console.log('🔄 记录钱包连接:', { address, walletType })

    // 记录连接日志到数据库
    const { error: logError } = await supabase
      .from('wallet_connections')
      .insert({
        user_address: address,
        wallet_type: walletType || 'unknown',
        connected_at: connectedAt || new Date().toISOString(),
        user_agent: userAgent || '',
        chain_id: chainId || 56,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('⚠️ 记录连接日志失败（非致命错误）:', logError)
      // 不阻止主流程，只记录警告
    } else {
      console.log('✅ 钱包连接日志记录成功')
    }

    return NextResponse.json({
      success: true,
      message: '钱包连接记录成功',
      data: {
        address,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 钱包连接记录API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误: ' + error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
} 