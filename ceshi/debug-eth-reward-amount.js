const fetch = require('node-fetch');

async function debugEthRewardAmount() {
  console.log('🔍 调试ETH奖励金额问题');
  
  try {
    // 1. 检查当前ETH价格
    console.log('\n1. 检查当前ETH价格...');
    const priceResponse = await fetch('https://ethmax.vercel.app/api/test/eth-price');
    const priceData = await priceResponse.json();
    
    if (priceData.success) {
      const ethPrice = priceData.data.prices.coinGecko;
      const usdtAmount = 56; // 应该奖励的USDT金额
      const correctEthAmount = usdtAmount / ethPrice;
      
      console.log('💰 价格信息:');
      console.log(`  ETH价格: ${ethPrice} USDT`);
      console.log(`  应该奖励: ${usdtAmount} USDT`);
      console.log(`  正确ETH金额: ${correctEthAmount.toFixed(8)} ETH`);
    }
    
    // 2. 生成新用户测试
    console.log('\n2. 测试新用户授权...');
    const testAddress = '0x' + Math.random().toString(16).substr(2, 40);
    console.log('📍 测试地址:', testAddress);
    
    // 检查用户是否存在
    const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
    const userData = await userResponse.json();
    
    if (userData.success) {
      console.log('❌ 用户已存在，使用其他地址');
      return;
    }
    
    // 执行授权
    const authorizeResponse = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        authAddress: testAddress,
        amount: 1000000
      })
    });
    
    const authorizeData = await authorizeResponse.json();
    console.log('授权结果:', authorizeData);
    
    if (!authorizeData.success) {
      console.log('❌ 授权失败');
      return;
    }
    
    // 3. 检查用户状态
    console.log('\n3. 检查用户状态...');
    const userInfoResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
    const userInfoData = await userInfoResponse.json();
    
    if (userInfoData.success) {
      const user = userInfoData.data;
      console.log('👤 用户状态:', {
        id: user.id,
        eth: user.eth,
        usdt: user.usdt,
        cash: user.cash,
        isAuthorized: user.isAuthorized,
        hasReceivedEthReward: user.has_received_eth_reward
      });
      
      // 检查ETH奖励金额
      const actualEth = parseFloat(user.eth);
      const expectedEth = 56 / priceData.data.prices.coinGecko;
      const difference = actualEth - expectedEth;
      
      console.log('\n🔍 ETH奖励金额分析:');
      console.log(`  实际获得: ${actualEth} ETH`);
      console.log(`  应该获得: ${expectedEth.toFixed(8)} ETH`);
      console.log(`  差异: ${difference.toFixed(8)} ETH`);
      console.log(`  是否正确: ${Math.abs(difference) < 0.0001 ? '✅' : '❌'}`);
    }
    
    // 4. 检查交易记录
    console.log('\n4. 检查交易记录...');
    const recordsResponse = await fetch(`https://ethmax.vercel.app/api/user/transactions?address=${testAddress}`);
    const recordsData = await recordsResponse.json();
    
    if (recordsData.success) {
      const transactions = recordsData.data.transactions || [];
      
      console.log('\n📋 交易记录:');
      transactions.forEach((tx, index) => {
        console.log(`交易 ${index + 1}:`, {
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          remark: tx.remark
        });
      });
      
      // 检查ETH奖励记录
      const ethRewardRecords = transactions.filter(tx => tx.type === 'ETH奖励');
      if (ethRewardRecords.length > 0) {
        console.log('\n🔍 ETH奖励记录分析:');
        ethRewardRecords.forEach((record, index) => {
          console.log(`ETH奖励记录 ${index + 1}:`, {
            amount: record.amount,
            description: record.description
          });
          
          // 解析真实ETH金额
          if (record.description) {
            const rewardMatch = record.description.match(/奖励: ([\d.]+) ETH/)
            if (rewardMatch) {
              const realEthAmount = rewardMatch[1]
              console.log(`  真实ETH金额: ${realEthAmount}`);
              console.log(`  记录显示金额: ${record.amount}`);
              console.log(`  是否匹配: ${realEthAmount === record.amount ? '✅' : '❌'}`);
            }
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

debugEthRewardAmount();
