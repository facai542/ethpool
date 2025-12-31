const fetch = require('node-fetch');

async function testUserAddress() {
  // 请替换为你实际使用的地址
  const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // 你可以替换为你的地址
  
  console.log('🧪 测试ethmax.vercel.app - 检查用户地址');
  console.log('📍 测试地址:', testAddress);
  console.log('🌐 项目地址: https://ethmax.vercel.app');
  console.log('⏰ 测试时间:', new Date().toLocaleString());
  
  try {
    // 先检查用户当前状态
    console.log('\n1. 检查用户当前状态...');
    const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
    const userData = await userResponse.json();
    
    if (userData.success) {
      console.log('👤 用户当前状态:', {
        id: userData.data.id,
        eth: userData.data.eth,
        isAuthorized: userData.data.isAuthorized,
        hasReceivedEthReward: userData.data.has_received_eth_reward
      });
      
      const currentEth = parseFloat(userData.data.eth);
      
      // 执行授权
      console.log('\n2. 执行授权...');
      const response = await fetch('https://ethmax.vercel.app/api/user/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: testAddress,
          isAuthorized: true,
          amount: '60000',
          txHash: '0xtest' + Math.random().toString(16).substr(2, 10),
          network: 'ethereum'
        })
      });
      
      const result = await response.json();
      console.log('📊 授权API响应:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ 授权成功');
        
        // 等待数据库更新
        console.log('\n3. 等待数据库更新...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 检查用户是否获得了ETH奖励
        console.log('4. 检查用户是否获得ETH奖励...');
        const userResponse2 = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
        const userData2 = await userResponse2.json();
        
        if (userData2.success) {
          const newEth = parseFloat(userData2.data.eth);
          const ethIncrease = newEth - currentEth;
          
          console.log('👤 授权后用户信息:', {
            id: userData2.data.id,
            address: userData2.data.address,
            eth: userData2.data.eth,
            isAuthorized: userData2.data.isAuthorized,
            hasReceivedEthReward: userData2.data.has_received_eth_reward
          });
          
          console.log(`💰 ETH变化: ${currentEth} -> ${newEth} (增加: ${ethIncrease})`);
          
          if (ethIncrease > 0) {
            console.log('🎉 ETH奖励发放成功!');
            console.log(`💰 获得奖励: ${ethIncrease} ETH`);
          } else {
            console.log('❌ ETH奖励未发放');
            console.log('🔍 可能的原因:');
            console.log('   - 用户已经获得过奖励 (has_received_eth_reward = true)');
            console.log('   - 数据库触发器问题');
            console.log('   - 实时汇率获取失败');
          }
        } else {
          console.log('❌ 无法获取用户信息:', userData2);
        }
      } else {
        console.log('❌ 授权失败:', result.error);
      }
    } else {
      console.log('❌ 无法获取用户信息:', userData);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testUserAddress();
