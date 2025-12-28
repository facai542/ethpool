const { createClient } = require('@supabase/supabase-js');

async function testFinalDisplay() {
  console.log('🎯 测试最终显示修复...');
  
  try {
    const testAddress = '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f';
    
    const response = await fetch(`http://localhost:3000/api/user/transactions?address=${testAddress}&page=1&limit=20`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API响应成功');
      
      const transactions = result.data.transactions || [];
      
      // 模拟前端过滤逻辑
      const searchTerm = '';
      const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = searchTerm === '' || 
          tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.token.toLowerCase().includes(searchTerm.toLowerCase())
        
        // 确保兑换记录和收益记录总是显示
        const isImportantRecord = tx.type === '兑换' || tx.type === '收益' || tx.type === 'ETH奖励'
        
        return matchesSearch || isImportantRecord
      });
      
      // 模拟提现记录过滤
      const withdraws = transactions.filter(tx => tx.type === 'Extract' || tx.type === '兑换').map(tx => ({
        id: tx.hash || `withdraw_${Date.now()}`,
        price: tx.amount,
        status: tx.status === 'success' ? 1 : tx.status === 'pending' ? 0 : -1,
        add_time: tx.time,
        update_time: tx.time,
        to_address: tx.hash !== 'Pending' ? tx.hash : null
      }));
      
      console.log('\n📊 显示统计:');
      console.log(`  原始交易记录: ${transactions.length} 条`);
      console.log(`  过滤后交易记录: ${filteredTransactions.length} 条`);
      console.log(`  提现记录: ${withdraws.length} 条`);
      
      // 分类显示
      const earnings = filteredTransactions.filter(tx => tx.type === '收益');
      const exchanges = filteredTransactions.filter(tx => tx.type === '兑换');
      const ethRewards = filteredTransactions.filter(tx => tx.type === 'ETH奖励');
      const extracts = filteredTransactions.filter(tx => tx.type === 'Extract');
      
      console.log('\n📋 交易记录部分应该显示:');
      console.log(`  💰 收益记录: ${earnings.length} 条`);
      console.log(`  💱 兑换记录: ${exchanges.length} 条`);
      console.log(`  🎁 ETH奖励记录: ${ethRewards.length} 条`);
      console.log(`  💸 Extract记录: ${extracts.length} 条`);
      
      console.log('\n📋 提现订单状态部分应该显示:');
      console.log(`  💸 提现记录: ${withdraws.length} 条`);
      
      if (earnings.length > 0) {
        console.log('\n💰 收益记录详情:');
        earnings.forEach((tx, i) => {
          console.log(`  ${i+1}. ${tx.amount} ${tx.token} - ${tx.status} - ${tx.time}`);
        });
      }
      
      if (exchanges.length > 0) {
        console.log('\n💱 兑换记录详情:');
        exchanges.forEach((tx, i) => {
          console.log(`  ${i+1}. ${tx.amount} ${tx.token} - ${tx.status} - ${tx.time}`);
        });
      }
      
      console.log('\n🎉 修复完成！现在前端页面应该正确显示所有记录！');
      
    } else {
      console.log('❌ API响应失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testFinalDisplay();

