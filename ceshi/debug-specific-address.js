const fetch = require('node-fetch');

async function debugSpecificAddress() {
  const testAddress = '0xF8E512333Ca2D6E070aE54A39E20702a41183DF4';
  
  console.log('🔍 调试特定地址问题');
  console.log('📍 测试地址:', testAddress);
  console.log('🌐 项目地址: https://ethmax.vercel.app');
  console.log('⏰ 测试时间:', new Date().toLocaleString());
  
  try {
    // 1. 检查用户当前状态
    console.log('\n1. 检查用户当前状态...');
    const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
    const userData = await userResponse.json();
    
    if (userData.success) {
      console.log('👤 用户当前状态:', {
        id: userData.data.id,
        eth: userData.data.eth,
        usdt: userData.data.usdt,
        cash: userData.data.cash,
        isAuthorized: userData.data.isAuthorized,
        hasReceivedEthReward: userData.data.has_received_eth_reward
      });
      
      console.log(`💰 账户余额详情:`);
      console.log(`  ETH: ${userData.data.eth}`);
      console.log(`  USDT: ${userData.data.usdt}`);
      console.log(`  Cash: ${userData.data.cash}`);
      console.log(`  总余额: ${userData.data.totalBalance}`);
    } else {
      console.log('❌ 无法获取用户信息:', userData);
    }
    
    // 2. 检查交易记录
    console.log('\n2. 检查交易记录...');
    const recordsResponse = await fetch(`https://ethmax.vercel.app/api/user/transactions?address=${testAddress}`);
    const recordsData = await recordsResponse.json();
    
    if (recordsData.success) {
      const transactions = recordsData.data.transactions || [];
      
      console.log('\n📋 所有交易记录:');
      transactions.forEach((tx, index) => {
        console.log(`交易 ${index + 1}:`, {
          type: tx.type,
          amount: tx.amount,
          token: tx.token,
          description: tx.description,
          remark: tx.remark,
          time: tx.time,
          status: tx.status
        });
      });
      
      // 分析兑换记录
      console.log('\n🔍 兑换记录分析:');
      const exchangeRecords = transactions.filter(tx => 
        tx.type === '兑换' || tx.type === '收益' || tx.type === 'ETH奖励'
      );
      
      exchangeRecords.forEach((record, index) => {
        console.log(`兑换记录 ${index + 1}:`, {
          type: record.type,
          amount: record.amount,
          description: record.description,
          remark: record.remark
        });
        
        // 检查是否有虚假的兑换记录
        if (record.type === '兑换' && !record.description?.includes('货币兑换')) {
          console.log(`  ❌ 发现虚假兑换记录！`);
        }
      });
      
      // 分析收益记录
      console.log('\n🔍 收益记录分析:');
      const earningsRecords = transactions.filter(tx => 
        tx.type === '收益' || tx.type === 'ETH奖励' || tx.type === 'Reward' || tx.type === '奖励'
      );
      
      earningsRecords.forEach((record, index) => {
        console.log(`收益记录 ${index + 1}:`, {
          type: record.type,
          amount: record.amount,
          description: record.description,
          remark: record.remark
        });
      });
      
      // 检查ETH奖励记录
      console.log('\n🔍 ETH奖励记录分析:');
      const ethRewardRecords = transactions.filter(tx => tx.type === 'ETH奖励');
      
      ethRewardRecords.forEach((record, index) => {
        console.log(`ETH奖励记录 ${index + 1}:`, {
          amount: record.amount,
          description: record.description,
          remark: record.remark
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
      
    } else {
      console.log('❌ 无法获取交易记录:', recordsData);
    }
    
    // 3. 检查ETH价格
    console.log('\n3. 检查ETH价格...');
    const priceResponse = await fetch('https://ethmax.vercel.app/api/test/eth-price');
    const priceData = await priceResponse.json();
    
    if (priceData.success) {
      console.log('💰 ETH价格数据:', JSON.stringify(priceData.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

debugSpecificAddress();
