// 测试手动奖励功能
const https = require('https');

async function testManualRewards() {
  try {
    console.log('🧪 测试手动奖励功能...');
    
    // 1. 测试获取所有用户余额
    console.log('1️⃣ 测试获取所有用户链上余额...');
    const balanceResponse = await fetch('http://localhost:3000/api/admin/get-all-user-balances');
    const balanceResult = await balanceResponse.json();
    
    if (balanceResult.success) {
      console.log('✅ 获取用户余额成功');
      console.log('📊 总用户数:', balanceResult.data.summary.total);
      console.log('📊 成功:', balanceResult.data.summary.success);
      console.log('📊 失败:', balanceResult.data.summary.error);
      
      // 显示前5个用户的余额
      if (balanceResult.data.users && balanceResult.data.users.length > 0) {
        console.log('\n📝 前5个用户余额:');
        balanceResult.data.users.slice(0, 5).forEach((user, index) => {
          console.log(`  ${index + 1}. 用户 ${user.id}: ${user.address.slice(0, 10)}...`);
          console.log(`     链上余额: ${user.onchain_usdt_balance || 0} USDT`);
          console.log(`     数据库余额: ${user.usdt || 0} USDT`);
          console.log(`     当前ETH: ${user.eth || 0} ETH`);
          console.log(`     状态: ${user.success ? '成功' : '失败'}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ 获取用户余额失败:', balanceResult.message);
      return;
    }
    
    // 2. 测试手动发送奖励
    console.log('2️⃣ 测试手动发送奖励...');
    const userIds = balanceResult.data.users
      .filter(user => user.success && user.onchain_usdt_balance > 0)
      .slice(0, 3) // 只测试前3个用户
      .map(user => user.id);
    
    if (userIds.length === 0) {
      console.log('❌ 没有找到有效的用户进行测试');
      return;
    }
    
    console.log('📊 测试用户ID:', userIds);
    
    const rewardResponse = await fetch('http://localhost:3000/api/admin/manual-send-rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userIds: userIds,
        customRewards: [] // 使用自动计算奖励
      })
    });
    
    const rewardResult = await rewardResponse.json();
    
    if (rewardResult.success) {
      console.log('✅ 手动发送奖励成功');
      console.log('📊 影响用户数:', rewardResult.data.affectedUsers);
      
      if (rewardResult.data.rewards && rewardResult.data.rewards.length > 0) {
        console.log('\n📝 奖励详情:');
        rewardResult.data.rewards.forEach((reward, index) => {
          console.log(`  ${index + 1}. 用户 ${reward.userId}: ${reward.address}`);
          console.log(`     奖励: ${reward.rewardEth} ETH`);
          console.log(`     新余额: ${reward.newEthBalance} ETH`);
          console.log(`     类型: ${reward.type}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ 手动发送奖励失败:', rewardResult.message);
    }
    
    // 3. 测试自定义奖励
    console.log('3️⃣ 测试自定义奖励...');
    const customRewardResponse = await fetch('http://localhost:3000/api/admin/manual-send-rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userIds: [userIds[0]], // 只测试第一个用户
        customRewards: [{
          userId: userIds[0],
          ethAmount: 0.001, // 增加0.001 ETH
          type: 'add',
          reason: '测试自定义奖励'
        }]
      })
    });
    
    const customRewardResult = await customRewardResponse.json();
    
    if (customRewardResult.success) {
      console.log('✅ 自定义奖励发送成功');
      console.log('📊 影响用户数:', customRewardResult.data.affectedUsers);
    } else {
      console.log('❌ 自定义奖励发送失败:', customRewardResult.message);
    }
    
    console.log('\n✅ 手动奖励功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.log('💡 请确保本地开发服务器正在运行 (npm run dev)');
  }
}

// 运行测试
testManualRewards();
