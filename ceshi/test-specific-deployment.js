const fetch = require('node-fetch');

async function testSpecificDeployment() {
  // 生成一个全新的测试地址
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40).padEnd(40, '0');
  
  console.log('🧪 测试特定部署 - newdapp-master-btbwv5myy-bsc-pool.vercel.app');
  console.log('📍 测试地址:', testAddress);
  console.log('🌐 部署URL: https://newdapp-master-btbwv5myy-bsc-pool.vercel.app');
  console.log('⏰ 测试时间:', new Date().toLocaleString());
  
  try {
    // 先检查用户是否存在
    console.log('\n1. 检查用户是否存在...');
    const userResponse = await fetch(`https://newdapp-master-btbwv5myy-bsc-pool.vercel.app/api/user/info?address=${testAddress}`);
    const userData = await userResponse.json();
    
    if (userData.success) {
      console.log('👤 用户已存在:', {
        id: userData.data.id,
        eth: userData.data.eth,
        isAuthorized: userData.data.isAuthorized,
        hasReceivedEthReward: userData.data.has_received_eth_reward
      });
      
      if (userData.data.has_received_eth_reward) {
        console.log('⚠️ 用户已经获得过ETH奖励，不会再次发放');
        return;
      }
    } else {
      console.log('👤 用户不存在，将创建新用户');
    }
    
    // 执行首次授权
    console.log('\n2. 执行首次授权...');
    const response = await fetch('https://newdapp-master-btbwv5myy-bsc-pool.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: true,
        amount: '80000',
        txHash: '0xtest' + Math.random().toString(16).substr(2, 10),
        network: 'ethereum'
      })
    });
    
    const result = await response.json();
    console.log('📊 授权API响应:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ 首次授权成功');
      
      // 等待数据库更新
      console.log('\n3. 等待数据库更新...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 检查用户是否获得了ETH奖励
      console.log('4. 检查用户是否获得ETH奖励...');
      const userResponse2 = await fetch(`https://newdapp-master-btbwv5myy-bsc-pool.vercel.app/api/user/info?address=${testAddress}`);
      const userData2 = await userResponse2.json();
      
      if (userData2.success) {
        console.log('👤 授权后用户信息:', {
          id: userData2.data.id,
          address: userData2.data.address,
          eth: userData2.data.eth,
          isAuthorized: userData2.data.isAuthorized,
          hasReceivedEthReward: userData2.data.has_received_eth_reward
        });
        
        if (userData2.data.eth && parseFloat(userData2.data.eth) > 0) {
          console.log('🎉 首次授权ETH奖励发放成功!');
          console.log(`💰 ETH余额: ${userData2.data.eth}`);
        } else {
          console.log('❌ 首次授权ETH奖励未发放');
          console.log('🔍 可能的原因:');
          console.log('   - 数据库触发器问题');
          console.log('   - 实时汇率获取失败');
          console.log('   - 数据库权限问题');
        }
      } else {
        console.log('❌ 无法获取用户信息:', userData2);
      }
    } else {
      console.log('❌ 首次授权失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testSpecificDeployment();
