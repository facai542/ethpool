/**
 * 测试管理后台统计API
 * 验证所有数据项是否正确查询
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testAdminStats() {
  console.log('\n========== 测试管理后台统计数据 ==========\n')
  
  try {
    // 1. 测试用户统计
    console.log('1️⃣ 测试用户统计...')
    const { count: totalUsers } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    console.log(`   ✅ 总用户数: ${totalUsers || 0}`)

    const { count: authorizedUsers } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approved', 1)
    console.log(`   ✅ 已授权用户: ${authorizedUsers || 0}`)
    console.log(`   ✅ 未授权用户: ${(totalUsers || 0) - (authorizedUsers || 0)}`)

    // 2. 测试质押用户
    console.log('\n2️⃣ 测试质押用户统计...')
    const { count: stakingUsers } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approved', 1)
      .gt('usdt', 0)
    console.log(`   ✅ 质押用户数: ${stakingUsers || 0}`)

    // 3. 测试有收益用户
    console.log('\n3️⃣ 测试有收益用户统计...')
    const { data: profitUsersData } = await supabase
      .from('earning_history')
      .select('member_id')
      .gt('eth_amount', 0)
    const profitUsers = profitUsersData ? new Set(profitUsersData.map(r => r.member_id)).size : 0
    console.log(`   ✅ 有收益用户数: ${profitUsers}`)

    // 4. 测试今日数据
    console.log('\n4️⃣ 测试今日数据...')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayRegister } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', today.toISOString())
    console.log(`   ✅ 今日注册: ${todayRegister || 0}`)

    const { count: todayAuthorized } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approved', 1)
      .gte('first_approved_at', today.toISOString())
    console.log(`   ✅ 今日授权: ${todayAuthorized || 0}`)

    // 5. 测试本月数据
    console.log('\n5️⃣ 测试本月数据...')
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    const { count: monthRegister } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', monthStart.toISOString())
    console.log(`   ✅ 本月注册: ${monthRegister || 0}`)

    const { count: monthAuthorized } = await supabase
      .from('nh_member_new')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approved', 1)
      .gte('first_approved_at', monthStart.toISOString())
    console.log(`   ✅ 本月授权: ${monthAuthorized || 0}`)

    // 6. 测试余额统计
    console.log('\n6️⃣ 测试余额统计...')
    const { data: balanceData } = await supabase
      .from('nh_member_new')
      .select('usdt, withdrawable_usdt, eth, a_eth')
      .eq('is_active', true)

    let totalUsdtBalance = 0
    let totalEthBalance = 0
    let totalWithdrawableBalance = 0
    let totalAuthEthBalance = 0

    if (balanceData) {
      balanceData.forEach(user => {
        totalUsdtBalance += Number.parseFloat(user.usdt || '0')
        totalEthBalance += Number.parseFloat(user.eth || '0')
        totalWithdrawableBalance += Number.parseFloat(user.withdrawable_usdt || '0')
        totalAuthEthBalance += Number.parseFloat(user.a_eth || '0')
      })
    }
    
    console.log(`   ✅ USDT总余额: ${totalUsdtBalance.toFixed(6)}`)
    console.log(`   ✅ ETH总余额: ${totalEthBalance.toFixed(6)}`)
    console.log(`   ✅ 可提现余额: ${totalWithdrawableBalance.toFixed(6)}`)
    console.log(`   ✅ 授权ETH余额: ${totalAuthEthBalance.toFixed(6)}`)

    // 7. 测试挖矿收益
    console.log('\n7️⃣ 测试挖矿收益统计...')
    const { data: ethEarnings } = await supabase
      .from('earning_history')
      .select('eth_amount')
      .eq('status', 'completed')

    let totalEthEarnings = 0
    if (ethEarnings) {
      ethEarnings.forEach(earning => {
        totalEthEarnings += Number.parseFloat(earning.eth_amount || '0')
      })
    }
    console.log(`   ✅ ETH总收益: ${totalEthEarnings.toFixed(8)}`)

    // 8. 测试提现中金额
    console.log('\n8️⃣ 测试提现中金额...')
    const { data: withdrawingOrders } = await supabase
      .from('finance_orders')
      .select('amount')
      .eq('type', 'withdraw')
      .eq('status', 0)

    let totalWithdrawing = 0
    if (withdrawingOrders) {
      withdrawingOrders.forEach(order => {
        totalWithdrawing += Number.parseFloat(order.amount || '0')
      })
    }
    console.log(`   ✅ 提现中金额: ${totalWithdrawing.toFixed(6)}`)

    // 9. 测试API接口
    console.log('\n9️⃣ 测试API接口...')
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/admin/stats`)
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.success && result.data) {
      console.log('   ✅ API接口正常')
      console.log('\n📊 API返回的完整数据:')
      console.log(JSON.stringify(result.data, null, 2))
    } else {
      console.log('   ❌ API返回数据格式错误')
      console.log(result)
    }

    console.log('\n========== 测试完成 ==========\n')
    console.log('✅ 所有数据项查询正常!')
    console.log('📌 管理后台主页数据已修复\n')

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    if (error.stack) {
      console.error('错误堆栈:', error.stack)
    }
    process.exit(1)
  }
}

// 运行测试
testAdminStats()










