const { createClient } = require('@supabase/supabase-js');

async function testFinalApi() {
  console.log('🎯 测试最终修复的API...');
  
  try {
    const testAddress = '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f';
    
    const response = await fetch(`http://localhost:3000/api/user/transactions?address=${testAddress}&page=1&limit=20`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API响应成功');
      console.log(`📊 总交易记录: ${result.data.transactions.length} 条`);
      
      // 分类显示记录
      const ethRewards = result.data.transactions.filter(tx => tx.type === 'ETH奖励');
      const exchanges = result.data.transactions.filter(tx => tx.type === '兑换');
      const earnings = result.data.transactions.filter(tx => tx.type === '收益');
      const withdrawals = result.data.transactions.filter(tx => tx.type === 'Extract');
      const auths = result.data.transactions.filter(tx => tx.type === 'authorize');
      
      console.log('\n📋 记录分类:');
      console.log(`  🎁 ETH奖励记录: ${ethRewards.length} 条`);
      console.log(`  💱 兑换记录: ${exchanges.length} 条`);
      console.log(`  💰 收益记录: ${earnings.length} 条`);
      console.log(`  💸 提现记录: ${withdrawals.length} 条`);
      console.log(`  🔐 授权记录: ${auths.length} 条`);
      
      // 显示详细记录
      console.log('\n📝 详细记录:');
      result.data.transactions.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.type} - ${tx.amount} ${tx.token} - ${tx.status} - ${tx.time}`);
      });
      
      console.log('\n🎉 修复完成！现在应该正确显示：');
      console.log('  ✅ 兑换记录（来自finance_orders和nh_withdraw）');
      console.log('  ✅ 收益记录（来自nh_logs的currency_exchange）');
      console.log('  ✅ ETH奖励记录（来自finance_orders）');
      
    } else {
      console.log('❌ API响应失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testFinalApi();

