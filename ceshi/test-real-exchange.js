const fetch = require('node-fetch');

async function testRealExchange() {
  // 生成一个新的测试地址
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40);
  
  console.log('🔍 测试真实兑换记录显示');
  console.log('📍 测试地址:', testAddress);
  
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
    
    // 3. 模拟一个真实的兑换记录（通过直接插入数据库）
    console.log('\n3. 模拟真实兑换记录...');
    const exchangeResponse = await fetch('https://ethmax.vercel.app/api/user/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        fromToken: 'ETH',
        toToken: 'USDT',
        amount: '0.01'
      })
    });
    
    const exchangeData = await exchangeResponse.json();
    console.log('兑换结果:', exchangeData);
    
    // 4. 检查交易记录
    console.log('\n4. 检查交易记录...');
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
        tx.type === '兑换' || 
        tx.type === 'Exchange' || 
        tx.type === 'Swap' ||
        (tx.type === '收益' && tx.description && tx.description.includes('货币兑换:'))
      );
      
      console.log(`兑换记录数量: ${exchangeRecords.length}`);
      exchangeRecords.forEach((record, index) => {
        console.log(`兑换记录 ${index + 1}:`, {
          type: record.type,
          amount: record.amount,
          description: record.description,
          remark: record.remark
        });
        
        // 检查是否是真正的兑换记录
        if (record.type === '收益' && record.description && record.description.includes('货币兑换:')) {
          console.log(`  ✅ 这是真正的兑换记录`);
        } else if (record.type === '兑换') {
          console.log(`  ✅ 这是兑换记录`);
        } else {
          console.log(`  ❌ 这不是兑换记录，不应该显示在兑换记录中`);
        }
      });
      
      // 检查收益记录
      console.log('\n🔍 收益记录分析:');
      const earningsRecords = transactions.filter(tx => 
        tx.type === '收益' || tx.type === 'ETH奖励' || tx.type === 'Reward' || tx.type === '奖励'
      );
      
      console.log(`收益记录数量: ${earningsRecords.length}`);
      earningsRecords.forEach((record, index) => {
        console.log(`收益记录 ${index + 1}:`, {
          type: record.type,
          amount: record.amount,
          description: record.description,
          remark: record.remark
        });
      });
      
    } else {
      console.log('❌ 无法获取交易记录:', recordsData);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testRealExchange();
