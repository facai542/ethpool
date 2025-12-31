const fetch = require('node-fetch');

async function testVercelAPI() {
  console.log('🧪 测试Vercel部署的API路由');
  
  try {
    // 测试首页
    console.log('1. 测试首页...');
    const homeResponse = await fetch('https://newdapp-master-hqgpt9tk7-bsc-pool.vercel.app/');
    console.log('首页状态:', homeResponse.status);
    
    // 测试用户信息API
    console.log('2. 测试用户信息API...');
    const userResponse = await fetch('https://newdapp-master-hqgpt9tk7-bsc-pool.vercel.app/api/user/info?address=0x1234567890123456789012345678901234567890');
    console.log('用户信息API状态:', userResponse.status);
    
    if (userResponse.status === 200) {
      const userData = await userResponse.json();
      console.log('用户信息API响应:', userData);
    } else {
      const errorText = await userResponse.text();
      console.log('用户信息API错误:', errorText.substring(0, 200));
    }
    
    // 测试授权API
    console.log('3. 测试授权API...');
    const authResponse = await fetch('https://newdapp-master-hqgpt9tk7-bsc-pool.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: '0x1234567890123456789012345678901234567890',
        isAuthorized: true,
        amount: '1000',
        txHash: '0xtest123456789',
        network: 'ethereum'
      })
    });
    
    console.log('授权API状态:', authResponse.status);
    
    if (authResponse.status === 200) {
      const authData = await authResponse.json();
      console.log('授权API响应:', authData);
    } else {
      const errorText = await authResponse.text();
      console.log('授权API错误:', errorText.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testVercelAPI();
