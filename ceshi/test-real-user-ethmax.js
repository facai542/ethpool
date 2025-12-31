const fetch = require('node-fetch');

async function testRealUserEthmax() {
  // 使用一个真实的测试地址
  const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  
  console.log('🧪 测试ethmax.vercel.app真实用户授权 - 检查ETH奖励发放');
  console.log('📍 测试地址:', testAddress);
  console.log('🌐 项目地址: https://ethmax.vercel.app');
  
  try {
    // 先检查用户当前状态
    console.log('1. 检查用户当前状态...');
    const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
    const userData = await userResponse.json();
    
    if (userData.success) {
      console.log('👤 用户当前信息:', {
        id: userData.data.id,
        address: userData.data.address,
        eth: userData.data.eth,
        isAuthorized: userData.data.isAuthorized,
        hasReceivedEthReward: userData.data.has_received_eth_reward
      });
    }
    
    // 执行授权
    console.log('2. 执行授权...');
    const response = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: true,
        amount: '10000',
        txHash: '0xtest' + Math.random().toString(16).substr(2, 10),
        network: 'ethereum'
      })
    });
    
    const result = await response.json();
    console.log('📊 授权API响应:', result);
    
    if (result.success) {
      console.log('✅ 授权成功');
      
      // 等待数据库更新
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 再次检查用户状态
      console.log('3. 检查授权后用户状态...');
      const userResponse2 = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
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
          console.log('🎉 ETH奖励发放成功!');
          console.log(`💰 ETH余额: ${userData2.data.eth}`);
        } else {
          console.log('❌ ETH奖励未发放');
        }
      }
    } else {
      console.log('❌ 授权失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testRealUserEthmax();
