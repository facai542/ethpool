/**
 * 设置钱包监听功能所需的数据库表
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 检查钱包监听功能数据库表...')

    // 检查各个表是否存在
    const tables = [
      'monitored_addresses',
      'wallet_transactions', 
      'wallet_balances',
      'wallet_monitor_config'
    ]

    const results = []
    
    for (const tableName of tables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          console.log(`❌ 表 ${tableName} 不存在或无法访问:`, error instanceof Error ? error.message : "未知错误")
          results.push(`${tableName} - 不存在`)
        } else {
          console.log(`✅ 表 ${tableName} 存在`)
          results.push(`${tableName} - 存在`)
        }
      } catch (err) {
        console.log(`❌ 检查表 ${tableName} 时出错:`, err)
        results.push(`${tableName} - 检查失败`)
      }
    }

    return NextResponse.json({
      success: true,
      message: '钱包监听功能数据库表检查完成',
      tables: results,
      note: '如果表不存在，需要在Supabase控制台手动创建这些表'
    })

  } catch (error) {
    console.error('检查钱包监听功能失败:', error)
    return NextResponse.json({
      success: false,
      error: '检查钱包监听功能失败: ' + error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}
