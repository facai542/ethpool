const fetch = require('node-fetch');

async function testEthmaxAuthorize() {
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40).padEnd(40, '0');
  
  console.log('🧪 测试ethmax.vercel.app的授权API - 检查ETH奖励发放');
  console.log('📍 测试地址:', testAddress);
  console.log('🌐 项目地址: https://ethmax.vercel.app');
  
  try {
    const response = await fetch('https://ethmax.vercel.app/api/user/authorize', {
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
    console.log('📊 ethmax授权API响应:', result);
    
    if (result.success) {
      console.log('✅ ethmax授权成功');
      
      // 等待一下让数据库更新
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 检查用户是否获得了ETH奖励
      const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
      const userData = await userResponse.json();
      
      console.log('👤 ethmax用户信息:', userData);
      
      if (userData.data && userData.data.eth && parseFloat(userData.data.eth) > 0) {
        console.log('🎉 ethmax ETH奖励发放成功!');
        console.log(`💰 ETH余额: ${userData.data.eth}`);
      } else {
        console.log('❌ ethmax ETH奖励未发放');
        console.log('🔍 用户数据:', userData);
      }
    } else {
      console.log('❌ ethmax授权失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ ethmax测试失败:', error);
  }
}

testEthmaxAuthorize();
