const fetch = require('node-fetch');

async function debugEthIssues() {
  // 生成一个全新的测试地址
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40).padEnd(40, '0');
  
  console.log('🔍 调试ETH奖励问题');
  console.log('📍 测试地址:', testAddress);
  console.log('🌐 项目地址: https://ethmax.vercel.app');
  console.log('⏰ 测试时间:', new Date().toLocaleString());
  
  try {
    // 1. 检查ETH价格和奖励计算
    console.log('\n1. 检查ETH价格和奖励计算...');
    const priceResponse = await fetch('https://ethmax.vercel.app/api/test/eth-price');
    const priceData = await priceResponse.json();
    console.log('💰 ETH价格数据:', JSON.stringify(priceData, null, 2));
    
    // 2. 执行授权
    console.log('\n2. 执行授权...');
    const authResponse = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: true,
        amount: '100000',
        txHash: '0xtest' + Math.random().toString(16).substr(2, 10),
        network: 'ethereum'
      })
    });
    
    const authData = await authResponse.json();
    console.log('📊 授权API响应:', JSON.stringify(authData, null, 2));
    
    if (authData.success) {
      console.log('✅ 授权成功');
      
      // 等待数据库更新
      console.log('\n3. 等待数据库更新...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 3. 检查用户信息
      console.log('4. 检查用户信息...');
      const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
      const userData = await userResponse.json();
      
      if (userData.success) {
        console.log('👤 用户信息:', {
          id: userData.data.id,
          eth: userData.data.eth,
          isAuthorized: userData.data.isAuthorized,
          hasReceivedEthReward: userData.data.has_received_eth_reward
        });
        
        // 4. 检查交易记录
        console.log('\n5. 检查交易记录...');
        const recordsResponse = await fetch(`https://ethmax.vercel.app/api/user/transactions?address=${testAddress}`);
        const recordsData = await recordsResponse.json();
        
        if (recordsData.success) {
          console.log('📋 交易记录:', JSON.stringify(recordsData, null, 2));
          
          // 分析记录
          const transactions = recordsData.transactions || [];
          const exchangeRecords = transactions.filter(tx => 
            tx.type === '兑换' || tx.type === '收益' || tx.type === 'ETH奖励'
          );
          
          console.log('\n🔍 兑换/收益记录分析:');
          exchangeRecords.forEach((record, index) => {
            console.log(`记录 ${index + 1}:`, {
              type: record.type,
              amount: record.amount,
              description: record.description,
              remark: record.remark,
              time: record.time
            });
          });
          
          // 检查是否有0.01ETH的问题
          const problematicRecords = exchangeRecords.filter(record => 
            record.amount === '0.01' || record.amount === 0.01
          );
          
          if (problematicRecords.length > 0) {
            console.log('\n❌ 发现0.01ETH问题记录:');
            problematicRecords.forEach((record, index) => {
              console.log(`问题记录 ${index + 1}:`, record);
            });
          } else {
            console.log('\n✅ 没有发现0.01ETH问题记录');
          }
        } else {
          console.log('❌ 无法获取交易记录:', recordsData);
        }
      } else {
        console.log('❌ 无法获取用户信息:', userData);
      }
    } else {
      console.log('❌ 授权失败:', authData.error);
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

debugEthIssues();
