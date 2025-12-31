const fetch = require('node-fetch');

async function debugFilterLogic() {
  const testAddress = '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f';
  
  console.log('🔍 调试过滤逻辑');
  console.log('📍 测试地址:', testAddress);
  
  try {
    // 获取交易记录
    const recordsResponse = await fetch(`https://ethmax.vercel.app/api/user/transactions?address=${testAddress}`);
    const recordsData = await recordsResponse.json();
    
    if (recordsData.success) {
      const transactions = recordsData.data.transactions || [];
      
      // 找到定时奖励记录
      const timedRewardRecord = transactions.find(tx => 
        tx.type === '兑换' && tx.description && tx.description.includes('定时奖励')
      );
      
      if (timedRewardRecord) {
        console.log('\n🔍 定时奖励记录详情:');
        console.log('记录:', timedRewardRecord);
        
        // 测试过滤条件
        console.log('\n🧪 测试过滤条件:');
        console.log('tx.type === "兑换":', timedRewardRecord.type === '兑换');
        console.log('tx.description && tx.description.includes("货币兑换"):', 
          timedRewardRecord.description && timedRewardRecord.description.includes('货币兑换'));
        console.log('!tx.description.includes("定时奖励"):', 
          !timedRewardRecord.description.includes('定时奖励'));
        
        const condition1 = timedRewardRecord.type === '兑换' && 
          timedRewardRecord.description && 
          timedRewardRecord.description.includes('货币兑换') && 
          !timedRewardRecord.description.includes('定时奖励');
        
        console.log('完整条件1 (应该为false):', condition1);
        
        const condition2 = timedRewardRecord.type === 'Exchange';
        console.log('条件2 (Exchange):', condition2);
        
        const condition3 = timedRewardRecord.type === 'Swap';
        console.log('条件3 (Swap):', condition3);
        
        const condition4 = timedRewardRecord.type === '收益' && 
          timedRewardRecord.description && 
          timedRewardRecord.description.includes('货币兑换:');
        console.log('条件4 (收益+货币兑换):', condition4);
        
        const shouldInclude = condition1 || condition2 || condition3 || condition4;
        console.log('应该包含在兑换记录中:', shouldInclude);
      }
      
    } else {
      console.log('❌ 无法获取交易记录:', recordsData);
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

debugFilterLogic();
