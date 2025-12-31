const fetch = require('node-fetch');

async function testNewUserAuthorize() {
  // 使用一个全新的地址
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40).padEnd(40, '0');
  
  console.log('🧪 测试新用户授权 - 检查ETH奖励发放');
  console.log('📍 测试地址:', testAddress);
  
  try {
    const response = await fetch('http://localhost:3000/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: true,
        amount: '5000',
        txHash: '0xtest' + Math.random().toString(16).substr(2, 10),
        network: 'ethereum'
      })
    });
    
    const result = await response.json();
    console.log('📊 授权API响应:', result);
    
    if (result.success) {
      console.log('✅ 授权成功');
      
      // 等待一下让数据库更新
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 检查用户是否获得了ETH奖励
      const userResponse = await fetch(`http://localhost:3000/api/user/info?address=${testAddress}`);
      const userData = await userResponse.json();
      
      console.log('👤 用户信息:', userData);
      
      if (userData.data && userData.data.eth && parseFloat(userData.data.eth) > 0) {
        console.log('🎉 ETH奖励发放成功!');
        console.log(`💰 ETH余额: ${userData.data.eth}`);
        console.log(`🔍 是否已赠送奖励: ${userData.data.has_received_eth_reward || '未知'}`);
      } else {
        console.log('❌ ETH奖励未发放');
        console.log('🔍 用户数据:', userData);
      }
    } else {
      console.log('❌ 授权失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testNewUserAuthorize();
