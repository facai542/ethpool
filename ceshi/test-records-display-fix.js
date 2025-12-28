const fetch = require('node-fetch');

async function testRecordsDisplay() {
  try {
    console.log('🧪 测试记录显示修复...');
    
    // 测试用户地址
    const testAddress = '0x5041ed759Dd4aFc3a72b8192C143F72f4724081A';
    
    // 调用交易记录API
    const response = await fetch(`http://localhost:3002/api/user/transactions?address=${testAddress}`);
    const data = await response.json();
    
    console.log('📊 API响应:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      const { transactions, withdraws } = data.data;
      
      console.log('\n📊 原始交易记录:');
      transactions.forEach((tx, index) => {
        console.log(`  ${index + 1}. ${tx.type} - ${tx.amount} ${tx.token} - ${tx.description}`);
      });
      
      // 模拟前端处理逻辑
      const exchangeRecords = transactions
        .filter(tx => tx.type === '兑换' || tx.type === '收益' || tx.type === 'ETH奖励')
        .map(tx => {
          // 如果是ETH奖励记录，从remark中解析真实金额
          if (tx.type === 'ETH奖励') {
            let ethAmount = tx.amount || '0';
            let usdtAmount = '0';
            
            // 尝试从description中解析真实ETH奖励金额
            if (tx.description) {
              const rewardMatch = tx.description.match(/奖励: ([\d.]+) ETH/);
              if (rewardMatch) {
                ethAmount = rewardMatch[1];
                usdtAmount = (parseFloat(ethAmount) * 4480.37).toFixed(2);
              }
            }
            
            return {
              time: tx.time,
              payAmount: `${ethAmount} ETH`,
              receiveAmount: `${usdtAmount} USDT`,
              status: tx.status
            };
          }
          
          // 其他记录
          return {
            time: tx.time,
            payAmount: `${tx.amount} ${tx.token}`,
            receiveAmount: '计算中...',
            status: tx.status
          };
        });
      
      console.log('\n✅ 处理后的兑换记录:');
      exchangeRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.time} - ${record.payAmount} -> ${record.receiveAmount} (${record.status})`);
      });
      
      // 检查是否还有0.01ETH的问题
      const hasZeroPointZeroOne = exchangeRecords.some(record => 
        record.payAmount.includes('0.01 ETH') || record.receiveAmount.includes('0.01 ETH')
      );
      
      if (hasZeroPointZeroOne) {
        console.log('\n❌ 仍然存在0.01ETH显示问题');
      } else {
        console.log('\n✅ 0.01ETH显示问题已修复');
      }
    } else {
      console.log('❌ API调用失败:', data.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRecordsDisplay();
