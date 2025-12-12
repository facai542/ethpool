import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取系统状态...')

    const status = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已配置' : '❌ 未配置',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已配置' : '❌ 未配置',
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? '✅ 已配置' : '❌ 未配置',
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ? '✅ 已配置' : '❌ 未配置',
        ETH_MAINNET_RPC_URL: process.env.ETH_MAINNET_RPC_URL ? '✅ 已配置' : '❌ 未配置',
        USDT_CONTRACT_ADDRESS: process.env.USDT_CONTRACT_ADDRESS ? '✅ 已配置' : '❌ 未配置',
        STAKING_CONTRACT_ADDRESS: process.env.STAKING_CONTRACT_ADDRESS ? '✅ 已配置' : '❌ 未配置',
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch
    }

    console.log('✅ 系统状态获取成功')

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('❌ 系统状态API错误:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '服务器内部错误: ' + (error instanceof Error ? error.message : '未知错误')
      },
      { status: 500 }
    )
  }
}
