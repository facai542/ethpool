// 测试本地奖励系统
const https = require('https');

async function testLocalRewards() {
  try {
    console.log('🧪 测试本地奖励系统...');
    
    // 测试本地API
    const response = await fetch('http://localhost:3000/api/admin/distribute-advanced-rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    console.log('📱 响应状态:', response.status);
    console.log('📱 响应内容:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ 本地奖励系统测试成功');
      console.log('📊 影响用户数:', result.data.affectedUsers);
      
      if (result.data.rewards && result.data.rewards.length > 0) {
        console.log('\n📝 奖励详情:');
        result.data.rewards.forEach((reward, index) => {
          console.log(`  ${index + 1}. 用户: ${reward.user_address}`);
          console.log(`     链上余额: ${reward.onchain_balance} USDT`);
          console.log(`     单次奖励: ${reward.single_reward_usdt} USDT`);
          console.log(`     ETH奖励: ${reward.reward_eth} ETH`);
          console.log(`     等级: ${reward.tier_description}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ 本地奖励系统测试失败:', result.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.log('💡 请确保本地开发服务器正在运行 (npm run dev)');
  }
}

// 运行测试
testLocalRewards();
