// 测试记录显示功能
const https = require('https');

async function testRecordsDisplay() {
  try {
    console.log('🧪 测试记录显示功能...');
    
    // 测试地址
    const testAddress = '0x5041ed759Dd4aFc3a72b8192C143F72f4724081A';
    
    // 1. 测试获取用户交易记录
    console.log('1️⃣ 测试获取用户交易记录...');
    const response = await fetch(`http://localhost:3000/api/user/transactions?address=${testAddress}&page=1&limit=100`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 获取交易记录成功');
      console.log('📊 总记录数:', result.data.transactions.length);
      
      // 分析记录类型
      const transactions = result.data.transactions || [];
      const exchangeRecords = transactions.filter(tx => 
        tx.type === '兑换' || tx.type === '收益' || tx.type === 'ETH奖励'
      );
      const withdrawRecords = transactions.filter(tx => 
        tx.type === 'Extract' || tx.type === 'Withdraw' || tx.type === '提现'
      );
      const earningsRecords = transactions.filter(tx => 
        tx.type === '收益' || tx.type === 'ETH奖励' || tx.type === 'Reward'
      );
      
      console.log('\n📝 记录分类统计:');
      console.log('  - 兑换记录:', exchangeRecords.length);
      console.log('  - 提现记录:', withdrawRecords.length);
      console.log('  - 收益记录:', earningsRecords.length);
      
      // 显示前5条兑换记录
      if (exchangeRecords.length > 0) {
        console.log('\n🔄 兑换记录详情 (前5条):');
        exchangeRecords.slice(0, 5).forEach((record, index) => {
          console.log(`  ${index + 1}. 时间: ${record.time}`);
          console.log(`     类型: ${record.type}`);
          console.log(`     金额: ${record.amount} ${record.token}`);
          console.log(`     状态: ${record.status}`);
          console.log(`     描述: ${record.description?.substring(0, 50)}...`);
          console.log('');
        });
      }
      
      // 显示前5条提现记录
      if (withdrawRecords.length > 0) {
        console.log('\n💰 提现记录详情 (前5条):');
        withdrawRecords.slice(0, 5).forEach((record, index) => {
          console.log(`  ${index + 1}. 时间: ${record.time}`);
          console.log(`     金额: ${record.amount} ${record.token}`);
          console.log(`     状态: ${record.status}`);
          console.log(`     哈希: ${record.hash}`);
          console.log('');
        });
      }
      
      // 显示前5条收益记录
      if (earningsRecords.length > 0) {
        console.log('\n🎁 收益记录详情 (前5条):');
        earningsRecords.slice(0, 5).forEach((record, index) => {
          console.log(`  ${index + 1}. 时间: ${record.time}`);
          console.log(`     类型: ${record.type}`);
          console.log(`     金额: ${record.amount} ${record.token}`);
          console.log(`     状态: ${record.status}`);
          console.log(`     描述: ${record.description?.substring(0, 50)}...`);
          console.log('');
        });
      }
      
      // 检查是否有ETH奖励记录
      const ethRewards = transactions.filter(tx => tx.type === 'ETH奖励');
      if (ethRewards.length > 0) {
        console.log('\n🎉 ETH奖励记录:');
        ethRewards.forEach((reward, index) => {
          console.log(`  ${index + 1}. 时间: ${reward.time}`);
          console.log(`     奖励: ${reward.amount} ETH`);
          console.log(`     状态: ${reward.status}`);
          console.log(`     描述: ${reward.description}`);
          console.log('');
        });
      }
      
    } else {
      console.log('❌ 获取交易记录失败:', result.error);
    }
    
    // 2. 测试手动刷新功能
    console.log('\n2️⃣ 测试手动刷新功能...');
    console.log('💡 在浏览器中访问 http://localhost:3000 并检查记录页面');
    console.log('💡 点击"刷新"按钮测试手动刷新功能');
    console.log('💡 检查是否有自动刷新（每30秒）');
    
    console.log('\n✅ 记录显示功能测试完成！');
    console.log('\n📋 检查要点:');
    console.log('  1. 兑换记录应该显示在"兑换记录"标签页');
    console.log('  2. 提现记录应该显示在"提现记录"标签页');
    console.log('  3. 收益记录应该显示在"收益记录"标签页');
    console.log('  4. ETH奖励应该同时显示在兑换记录和收益记录中');
    console.log('  5. 记录应该每30秒自动刷新');
    console.log('  6. 手动刷新按钮应该正常工作');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.log('💡 请确保本地开发服务器正在运行 (npm run dev)');
  }
}

// 运行测试
testRecordsDisplay();
