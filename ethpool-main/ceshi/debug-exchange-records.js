const fetch = require('node-fetch');

async function debugExchangeRecords() {
  const testAddress = '0xF8E512333Ca2D6E070aE54A39E20702a41183DF4';
  
  console.log('🔍 调试兑换记录问题');
  console.log('📍 测试地址:', testAddress);
  
  try {
    // 获取交易记录
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
        tx.type === '兑换' || tx.type === '收益' || tx.type === 'Exchange' || tx.type === 'Swap'
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
      
      // 检查是否有ETH奖励被错误显示为兑换记录
      const ethRewardInExchange = exchangeRecords.filter(tx => tx.type === 'ETH奖励');
      if (ethRewardInExchange.length > 0) {
        console.log('\n❌ 发现ETH奖励被错误显示为兑换记录:');
        ethRewardInExchange.forEach((record, index) => {
          console.log(`  ETH奖励 ${index + 1}:`, record);
        });
      }
      
      // 检查真正的兑换记录
      const realExchangeRecords = transactions.filter(tx => 
        (tx.type === '兑换' && tx.description && tx.description.includes('货币兑换')) ||
        (tx.type === '收益' && tx.description && tx.description.includes('货币兑换'))
      );
      
      console.log(`\n真实兑换记录数量: ${realExchangeRecords.length}`);
      realExchangeRecords.forEach((record, index) => {
        console.log(`真实兑换记录 ${index + 1}:`, {
          type: record.type,
          amount: record.amount,
          description: record.description
        });
      });
      
    } else {
      console.log('❌ 无法获取交易记录:', recordsData);
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

debugExchangeRecords();
