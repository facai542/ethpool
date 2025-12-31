const fetch = require('node-fetch');

async function diagnoseEthReward() {
  console.log('🔍 ETH奖励诊断工具');
  console.log('⏰ 测试时间:', new Date().toLocaleString());
  
  // 测试不同的URL
  const urls = [
    'https://ethmax.vercel.app',
    'https://newdapp-master-btbwv5myy-bsc-pool.vercel.app',
    'https://newdapp-master-hqgpt9tk7-bsc-pool.vercel.app'
  ];
  
  for (const url of urls) {
    console.log(`\n🌐 测试URL: ${url}`);
    
    try {
      // 测试首页
      const homeResponse = await fetch(url);
      console.log(`  首页状态: ${homeResponse.status}`);
      
      // 测试API
      const apiResponse = await fetch(`${url}/api/user/info?address=0x1234567890123456789012345678901234567890`);
      console.log(`  API状态: ${apiResponse.status}`);
      
      if (apiResponse.status === 200) {
        const apiData = await apiResponse.json();
        console.log(`  API响应: ${JSON.stringify(apiData).substring(0, 100)}...`);
      } else {
        const errorText = await apiResponse.text();
        console.log(`  API错误: ${errorText.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`  ❌ 错误: ${error.message}`);
    }
  }
  
  // 测试数据库触发器
  console.log('\n🔍 检查数据库触发器...');
  try {
    const triggerResponse = await fetch('https://ethmax.vercel.app/api/test/eth-price');
    if (triggerResponse.ok) {
      const triggerData = await triggerResponse.json();
      console.log('✅ ETH价格API正常:', triggerData);
    } else {
      console.log('❌ ETH价格API异常');
    }
  } catch (error) {
    console.log('❌ ETH价格API错误:', error.message);
  }
  
  // 测试授权API
  console.log('\n🔍 测试授权API...');
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40).padEnd(40, '0');
  
  try {
    const authResponse = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: true,
        amount: '90000',
        txHash: '0xtest' + Math.random().toString(16).substr(2, 10),
        network: 'ethereum'
      })
    });
    
    const authData = await authResponse.json();
    console.log('📊 授权API响应:', JSON.stringify(authData, null, 2));
    
    if (authData.success) {
      console.log('✅ 授权API正常');
      
      // 等待并检查结果
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
      const userData = await userResponse.json();
      
      if (userData.success) {
        console.log('👤 用户信息:', {
          id: userData.data.id,
          eth: userData.data.eth,
          isAuthorized: userData.data.isAuthorized,
          hasReceivedEthReward: userData.data.has_received_eth_reward
        });
        
        if (userData.data.eth && parseFloat(userData.data.eth) > 0) {
          console.log('🎉 ETH奖励发放成功!');
        } else {
          console.log('❌ ETH奖励未发放');
        }
      }
    } else {
      console.log('❌ 授权API失败:', authData.error);
    }
    
  } catch (error) {
    console.log('❌ 授权测试失败:', error.message);
  }
}

diagnoseEthReward();
