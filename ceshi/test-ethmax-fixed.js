const fetch = require('node-fetch');

async function testEthmaxFixed() {
  // 使用一个已经授权过的用户地址
  const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  
  console.log('🧪 测试ethmax.vercel.app - 检查重复授权是否还会发放ETH奖励');
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
        isAuthorized: userData.data.isAuthorized
      });
      
      const currentEth = parseFloat(userData.data.eth);
      
      // 执行授权
      console.log('2. 执行重复授权...');
      const response = await fetch('https://ethmax.vercel.app/api/user/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: testAddress,
          isAuthorized: true,
          amount: '15000',
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
          const newEth = parseFloat(userData2.data.eth);
          const ethIncrease = newEth - currentEth;
          
          console.log('👤 授权后用户信息:', {
            id: userData2.data.id,
            address: userData2.data.address,
            eth: userData2.data.eth,
            isAuthorized: userData2.data.isAuthorized
          });
          
          console.log(`💰 ETH变化: ${currentEth} -> ${newEth} (增加: ${ethIncrease})`);
          
          if (ethIncrease > 0) {
            console.log('❌ 问题：重复授权仍然发放了ETH奖励！');
            console.log('🔧 需要修复：只有首次授权才应该发放ETH奖励');
          } else {
            console.log('✅ 正确：重复授权没有发放ETH奖励');
          }
        }
      } else {
        console.log('❌ 授权失败:', result.error);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testEthmaxFixed();
