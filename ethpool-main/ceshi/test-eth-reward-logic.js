const { createClient } = require('@supabase/supabase-js')

// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://bfcpimnfgidhgigtgehs.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkZ2lndGdlaHMiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzE5OTQ0NzQ4LCJleHAiOjIwMzU1MjA3NDh9.8Q5QqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testEthRewardLogic() {
  console.log('🧪 测试ETH奖励逻辑...')
  
  try {
    // 1. 查找一个没有赠送过奖励的用户
    const { data: usersWithoutReward, error: findError } = await supabase
      .from('nh_member')
      .select('id, address, has_received_eth_reward, eth')
      .eq('has_received_eth_reward', false)
      .limit(1)
    
    if (findError) {
      console.error('❌ 查找用户失败:', findError)
      return
    }
    
    if (!usersWithoutReward || usersWithoutReward.length === 0) {
      console.log('ℹ️ 没有找到未赠送奖励的用户')
      
      // 查找一个已赠送奖励的用户
      const { data: usersWithReward, error: findRewardError } = await supabase
        .from('nh_member')
        .select('id, address, has_received_eth_reward, eth')
        .eq('has_received_eth_reward', true)
        .limit(1)
      
      if (findRewardError) {
        console.error('❌ 查找已奖励用户失败:', findRewardError)
        return
      }
      
      if (usersWithReward && usersWithReward.length > 0) {
        const user = usersWithReward[0]
        console.log('✅ 已赠送奖励的用户示例:')
        console.log(`  - 用户ID: ${user.id}`)
        console.log(`  - 地址: ${user.address}`)
        console.log(`  - 已赠送奖励: ${user.has_received_eth_reward}`)
        console.log(`  - ETH余额: ${user.eth}`)
      }
      return
    }
    
    const user = usersWithoutReward[0]
    console.log('✅ 找到未赠送奖励的用户:')
    console.log(`  - 用户ID: ${user.id}`)
    console.log(`  - 地址: ${user.address}`)
    console.log(`  - 已赠送奖励: ${user.has_received_eth_reward}`)
    console.log(`  - ETH余额: ${user.eth}`)
    
    // 2. 模拟授权请求
    console.log('\n🔄 模拟授权请求...')
    const response = await fetch('http://localhost:3000/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: user.address,
        isAuthorized: true,
        amount: '1000000',
        txHash: '0x' + Math.random().toString(16).substr(2, 64)
      })
    })
    
    const result = await response.json()
    console.log('📋 授权结果:', result.success ? '成功' : '失败')
    if (!result.success) {
      console.log('❌ 错误信息:', result.error)
    }
    
    // 3. 检查用户状态是否更新
    console.log('\n🔍 检查用户状态更新...')
    const { data: updatedUser, error: updateError } = await supabase
      .from('nh_member')
      .select('id, address, has_received_eth_reward, eth')
      .eq('id', user.id)
      .single()
    
    if (updateError) {
      console.error('❌ 查询更新后用户状态失败:', updateError)
    } else {
      console.log('✅ 更新后的用户状态:')
      console.log(`  - 用户ID: ${updatedUser.id}`)
      console.log(`  - 地址: ${updatedUser.address}`)
      console.log(`  - 已赠送奖励: ${updatedUser.has_received_eth_reward}`)
      console.log(`  - ETH余额: ${updatedUser.eth}`)
      
      if (updatedUser.has_received_eth_reward && updatedUser.eth !== user.eth) {
        console.log('🎉 奖励赠送成功！')
      } else {
        console.log('⚠️ 奖励赠送可能失败或用户已有奖励')
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testEthRewardLogic()
