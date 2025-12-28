/**
 * 检查wallet_transactions表结构
 */

// 加载环境变量
require('dotenv').config({ path: '../.env.local' })

const { createClient } = require('@supabase/supabase-js')

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTableStructure() {
  console.log('🔍 检查wallet_transactions表结构...\n')

  try {
    // 查询表结构
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ 查询表结构失败:', error)
      return
    }

    console.log('✅ 表结构查询成功')
    
    if (data && data.length > 0) {
      console.log('📋 wallet_transactions表字段:')
      const fields = Object.keys(data[0])
      fields.forEach((field, index) => {
        console.log(`   ${index + 1}. ${field}: ${typeof data[0][field]}`)
      })
      
      console.log('\n📄 示例数据:')
      console.log(JSON.stringify(data[0], null, 2))
    } else {
      console.log('⚠️ 表中没有数据，无法获取字段信息')
      
      // 尝试插入一条测试数据来获取字段信息
      console.log('\n🧪 尝试插入测试数据...')
      const { data: insertData, error: insertError } = await supabase
        .from('wallet_transactions')
        .insert({
          transaction_hash: '0xtest123',
          from_address: '0xtestfrom',
          to_address: '0xtestto',
          amount: '100',
          is_processed: false,
          created_at: new Date().toISOString()
        })
        .select()

      if (insertError) {
        console.error('❌ 插入测试数据失败:', insertError)
      } else {
        console.log('✅ 测试数据插入成功')
        console.log('📋 字段信息:')
        const fields = Object.keys(insertData[0])
        fields.forEach((field, index) => {
          console.log(`   ${index + 1}. ${field}`)
        })
        
        // 清理测试数据
        await supabase
          .from('wallet_transactions')
          .delete()
          .eq('transaction_hash', '0xtest123')
        console.log('🧹 测试数据已清理')
      }
    }

  } catch (error) {
    console.error('❌ 检查表结构过程中发生错误:', error)
  }
}

// 运行检查
checkTableStructure()
  .then(() => {
    console.log('\n🏁 表结构检查完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 表结构检查失败:', error)
    process.exit(1)
  })


