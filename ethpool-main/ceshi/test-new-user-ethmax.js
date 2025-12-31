const fetch = require('node-fetch');

async function testNewUserEthmax() {
  // 生成一个新的测试地址
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40).padEnd(40, '0');
  
  console.log('🧪 测试ethmax.vercel.app - 新用户首次授权');
  console.log('📍 测试地址:', testAddress);
  console.log('🌐 项目地址: https://ethmax.vercel.app');
  
  try {
    // 先检查用户是否存在
    console.log('1. 检查用户是否存在...');
    const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
    const userData = await userResponse.json();
    
    if (userData.success) {
      console.log('👤 用户已存在:', userData.data);
    } else {
      console.log('👤 用户不存在，将创建新用户');
    }
    
    // 执行首次授权
    console.log('2. 执行首次授权...');
    const response = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: true,
        amount: '8000',
        txHash: '0xtest' + Math.random().toString(16).substr(2, 10),
        network: 'ethereum'
      })
    });
    
    const result = await response.json();
    console.log('📊 授权API响应:', result);
    
    if (result.success) {
      console.log('✅ 首次授权成功');
      
      // 等待数据库更新
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 检查用户是否获得了ETH奖励
      console.log('3. 检查用户是否获得ETH奖励...');
      const userResponse2 = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
      const userData2 = await userResponse2.json();
      
      if (userData2.success) {
        console.log('👤 授权后用户信息:', {
          id: userData2.data.id,
          address: userData2.data.address,
          eth: userData2.data.eth,
          isAuthorized: userData2.data.isAuthorized
        });
        
        if (userData2.data.eth && parseFloat(userData2.data.eth) > 0) {
          console.log('🎉 首次授权ETH奖励发放成功!');
          console.log(`💰 ETH余额: ${userData2.data.eth}`);
        } else {
          console.log('❌ 首次授权ETH奖励未发放');
        }
      }
    } else {
      console.log('❌ 首次授权失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testNewUserEthmax();
