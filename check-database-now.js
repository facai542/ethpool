const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://lnhqduavjfpqtfgmkzlg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuaHFkdWF2amZwcXRmZ21remxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTEyNjU4NCwiZXhwIjoyMDUwNzAyNTg0fQ.MqbXCVGa98sXJJxgJhJHkDLhbSE0KCe7RrT9dqxAhH8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('📊 检查数据库状态...\n')
  
  // 检查 wallet_transactions
  const { data: transactions, error: txError } = await supabase
    .from('wallet_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (txError) {
    console.error('❌ 查询 wallet_transactions 失败:', txError)
  } else {
    console.log(`📝 wallet_transactions 表最新 5 条记录:`)
    console.log(`   总数: ${transactions.length} 条`)
    transactions.forEach((tx, i) => {
      console.log(`   ${i+1}. ${tx.transaction_type} | ${tx.amount} USDT | ${tx.created_at}`)
      console.log(`      哈希: ${tx.tx_hash}`)
      console.log(`      地址: ${tx.user_address}`)
    })
  }
  
  console.log('\n' + '='.repeat(60) + '\n')
  
  // 检查 wallet_monitor
  const { data: monitors, error: monError } = await supabase
    .from('wallet_monitor')
    .select('*')
  
  if (monError) {
    console.error('❌ 查询 wallet_monitor 失败:', monError)
  } else {
    console.log(`🔍 wallet_monitor 表监控地址:`)
    console.log(`   总数: ${monitors.length} 条`)
    monitors.forEach((m, i) => {
      console.log(`   ${i+1}. ${m.address} (${m.is_active ? '✅ 活跃' : '❌ 未激活'})`)
    })
  }
}

checkDatabase().catch(console.error)

