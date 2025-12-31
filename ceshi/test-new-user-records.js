const fetch = require('node-fetch');

async function testNewUserRecords() {
  // 生成一个新的测试地址
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40);
  
  console.log('🔍 测试新用户授权后的记录显示');
  console.log('📍 测试地址:', testAddress);
  console.log('🌐 项目地址: https://ethmax.vercel.app');
  console.log('⏰ 测试时间:', new Date().toLocaleString());
  
  try {
    // 1. 先检查用户是否存在
    console.log('\n1. 检查用户是否存在...');
    const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
    const userData = await userResponse.json();
    
    if (userData.success) {
      console.log('❌ 用户已存在，使用其他地址');
      return;
    }
    
    // 2. 执行授权
    console.log('\n2. 执行授权...');
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
    
    // 3. 检查交易记录
    console.log('\n3. 检查交易记录...');
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
      
      console.log(`兑换记录数量: ${exchangeRecords.length}`);
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
        
        if (record.type === 'ETH奖励') {
          console.log(`  ✅ 这是ETH奖励记录，不是兑换记录`);
        }
      });
      
      // 检查是否有真正的兑换记录
      const realExchangeRecords = transactions.filter(tx => 
        tx.type === '兑换' && tx.description?.includes('货币兑换')
      );
      
      console.log(`\n真实兑换记录数量: ${realExchangeRecords.length}`);
      if (realExchangeRecords.length > 0) {
        console.log('❌ 发现不应该存在的兑换记录！');
      } else {
        console.log('✅ 没有虚假的兑换记录');
      }
      
    } else {
      console.log('❌ 无法获取交易记录:', recordsData);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testNewUserRecords();
