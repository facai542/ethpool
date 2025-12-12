import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 验证请求来源（防止恶意调用）
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      console.log('❌ 未授权的定时任务请求')
      return NextResponse.json(
        { success: false, message: '未授权' },
        { status: 401 }
      )
    }

    console.log('⏰ 定时奖励发放任务开始执行...')
    console.log('🕐 执行时间:', new Date().toISOString())

    // 调用数据库函数执行奖励发放
    const { data, error } = await supabase.rpc('distribute_advanced_rewards')

    if (error) {
      console.error('❌ 定时奖励发放失败:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: '定时奖励发放失败', 
          error: error.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ 定时奖励发放成功，影响用户数:', data?.length || 0)

    // 记录执行日志
    const { error: logError } = await supabase
      .from('cron_execution_logs')
      .insert({
        task_name: 'distribute_advanced_rewards',
        status: 'success',
        affected_records: data?.length || 0,
        execution_time: new Date().toISOString(),
        details: JSON.stringify({
          rewards: data || [],
          timestamp: new Date().toISOString()
        })
      })

    if (logError) {
      console.warn('⚠️ 记录执行日志失败:', logError)
    }

    return NextResponse.json({
      success: true,
      message: '定时奖励发放成功',
      data: {
        executionTime: new Date().toISOString(),
        affectedUsers: data?.length || 0,
        rewards: data || []
      }
    })

  } catch (error) {
    console.error('❌ 定时奖励发放异常:', error)

    // 记录错误日志
    try {
      await supabase
        .from('cron_execution_logs')
        .insert({
          task_name: 'distribute_advanced_rewards',
          status: 'error',
          affected_records: 0,
          execution_time: new Date().toISOString(),
          details: JSON.stringify({
            error: error instanceof Error ? error.message : '未知错误',
            timestamp: new Date().toISOString()
          })
        })
    } catch (logError) {
      console.warn('⚠️ 记录错误日志失败:', logError)
    }

    return NextResponse.json(
      { 
        success: false, 
        message: '定时奖励发放异常', 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}

// 支持POST请求（用于外部定时服务调用）
export async function POST(request: NextRequest) {
  return GET(request)
}
