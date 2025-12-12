/**
 * Tokenview 地址清理定时任务
 * 每天自动清理不活跃的监听地址
 * 
 * 部署到 Vercel Cron：
 * 1. 在 vercel.json 中配置 cron
 * 2. 或使用外部 cron 服务（如 cron-job.org）定期调用此端点
 */

import { NextRequest, NextResponse } from 'next/server'
import { cleanupInactiveAddresses } from '@/lib/tokenview-manager'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// 验证 Cron Secret（防止未授权访问）
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'default-secret-change-me'
  
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Tokenview 清理任务开始执行...')
    
    // 验证 Cron Secret
    if (!verifyCronSecret(request)) {
      console.log('❌ 未授权的访问尝试')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 执行清理
    const result = await cleanupInactiveAddresses()
    
    if (result.success) {
      console.log('✅ 清理任务完成')
      return NextResponse.json({
        success: true,
        message: 'Cleanup completed successfully',
        stats: {
          total: result.total,
          active: result.active,
          removed: result.removed,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      console.log('❌ 清理任务失败:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ 清理任务异常:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST 方法（用于手动触发）
export async function POST(request: NextRequest) {
  return GET(request)
}

