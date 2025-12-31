/**
 * 查询数据库表字段的简化脚本
 * 可以快速查看指定表的字段结构
 */

// 加载环境变量
require('dotenv').config({ path: '../.env.local' })

const { createClient } = require('@supabase/supabase-js')

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 常用表名列表
const commonTables = [
  'nh_member_new',
  'nh_member', 
  'monitored_addresses',
  'wallet_transactions',
  'telegram_notification_queue',
  'approval_history',
  'earning_history',
  'wallet_monitor',
  'telegram_connected_users',
  'telegram_user_snapshots',
  'finance_orders',
  'authorized_transfers',
  'system_setting',
  'nh_logs',
  'cs_agents',
  'cs_sessions',
  'announcements'
]

async function queryTableFields(tableName) {
  console.log(`🔍 查询表: ${tableName}\n`)

  try {
    // 查询表结构
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      console.error(`❌ 查询表 ${tableName} 失败:`, error.message)
      return
    }

    if (data && data.length > 0) {
      console.log(`✅ 表 ${tableName} 字段结构:`)
      console.log('=' .repeat(50))
      
      const fields = Object.keys(data[0])
      fields.forEach((field, index) => {
        const value = data[0][field]
        const type = typeof value
        console.log(`${(index + 1).toString().padStart(2, ' ')}. ${field.padEnd(25, ' ')} | ${type.padEnd(10, ' ')} | 示例: ${JSON.stringify(value)}`)
      })
      
      console.log('=' .repeat(50))
      console.log(`📊 总字段数: ${fields.length}`)
    } else {
      console.log(`⚠️ 表 ${tableName} 中没有数据，无法获取字段信息`)
      
      // 尝试插入一条测试数据来获取字段信息
      console.log(`\n🧪 尝试插入测试数据获取字段信息...`)
      
      // 根据表名构建测试数据
      let testData = {}
      
      if (tableName === 'nh_member_new') {
        testData = {
          wallet_address: 'test_address',
          approved: 0,
          is_active: true
        }
      } else if (tableName === 'monitored_addresses') {
        testData = {
          address: 'test_address',
          is_active: true
        }
      } else if (tableName === 'wallet_transactions') {
        testData = {
          user_address: 'test_address',
          transaction_type: 'in',
          amount: '100',
          token: 'USDT',
          tx_hash: 'test_hash',
          block_number: 123456,
          from_address: 'test_from',
          to_address: 'test_to'
        }
      } else {
        testData = {
          id: 1,
          name: 'test',
          created_at: new Date().toISOString()
        }
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from(tableName)
        .insert(testData)
        .select()

      if (insertError) {
        console.error(`❌ 插入测试数据失败:`, insertError.message)
      } else {
        console.log(`✅ 测试数据插入成功`)
        console.log(`📋 字段信息:`)
        
        const fields = Object.keys(insertData[0])
        fields.forEach((field, index) => {
          console.log(`${(index + 1).toString().padStart(2, ' ')}. ${field}`)
        })
        
        // 清理测试数据
        try {
          await supabase
            .from(tableName)
            .delete()
            .eq('id', insertData[0].id)
          console.log(`🧹 测试数据已清理`)
        } catch (cleanupError) {
          console.log(`⚠️ 清理测试数据失败:`, cleanupError.message)
        }
      }
    }

  } catch (error) {
    console.error(`❌ 查询表 ${tableName} 过程中发生错误:`, error.message)
  }
}

async function listAllTables() {
  console.log('📋 数据库中的所有表:\n')
  
  try {
    // 这里我们使用已知的表列表，因为直接查询系统表可能有限制
    console.log('常用表列表:')
    commonTables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${table}`)
    })
    
    console.log(`\n💡 使用方法: node query-table-fields.js <表名>`)
    console.log(`💡 例如: node query-table-fields.js nh_member_new`)
    
  } catch (error) {
    console.error('❌ 获取表列表失败:', error.message)
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    await listAllTables()
    return
  }
  
  const tableName = args[0]
  
  if (!commonTables.includes(tableName)) {
    console.log(`⚠️ 警告: 表 ${tableName} 不在常用表列表中`)
    console.log(`常用表: ${commonTables.join(', ')}`)
    console.log(`继续查询...\n`)
  }
  
  await queryTableFields(tableName)
}

// 运行脚本
main()
  .then(() => {
    console.log('\n🏁 查询完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error.message)
    process.exit(1)
  })


