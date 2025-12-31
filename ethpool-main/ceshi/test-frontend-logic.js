const fetch = require('node-fetch');

async function testFrontendLogic() {
  const testAddress = '0xF8E512333Ca2D6E070aE54A39E20702a41183DF4';
  
  console.log('🔍 测试前端逻辑修复');
  console.log('📍 测试地址:', testAddress);
  
  try {
    // 获取交易记录
    const recordsResponse = await fetch(`https://ethmax.vercel.app/api/user/transactions?address=${testAddress}`);
    const recordsData = await recordsResponse.json();
    
    if (recordsData.success) {
      const transactions = recordsData.data.transactions || [];
      
      console.log('\n📋 原始交易记录:');
      transactions.forEach((tx, index) => {
        console.log(`交易 ${index + 1}:`, {
          type: tx.type,
          amount: tx.amount,
          token: tx.token,
          description: tx.description
        });
      });
      
      // 模拟前端修复后的逻辑
      console.log('\n🔧 模拟前端修复后的逻辑:');
      
      // 兑换记录 - 不包含ETH奖励
      const exchangeRecords = transactions
        .filter((tx) => tx.type === '兑换' || tx.type === '收益' || tx.type === 'Exchange' || tx.type === 'Swap')
        .map((tx) => ({
          type: tx.type,
          amount: tx.amount,
          token: tx.token,
          description: tx.description
        }));
      
      console.log('兑换记录 (修复后):', exchangeRecords);
      
      // 收益记录 - 包含ETH奖励
      const earningsRecords = transactions
        .filter((tx) => tx.type === '收益' || tx.type === 'ETH奖励' || tx.type === 'Reward' || tx.type === '奖励')
        .map((tx) => ({
          type: tx.type,
          amount: tx.amount,
          token: tx.token,
          description: tx.description
        }));
      
      console.log('收益记录 (修复后):', earningsRecords);
      
      // 检查结果
      console.log('\n✅ 修复结果:');
      console.log(`兑换记录数量: ${exchangeRecords.length}`);
      console.log(`收益记录数量: ${earningsRecords.length}`);
      
      if (exchangeRecords.length === 0) {
        console.log('✅ 兑换记录正确：没有虚假的兑换记录');
      } else {
        console.log('❌ 兑换记录错误：仍有虚假的兑换记录');
      }
      
      if (earningsRecords.length > 0) {
        console.log('✅ 收益记录正确：ETH奖励显示在收益记录中');
      } else {
        console.log('❌ 收益记录错误：没有收益记录');
      }
      
    } else {
      console.log('❌ 无法获取交易记录:', recordsData);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testFrontendLogic();
