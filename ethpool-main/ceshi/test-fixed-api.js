const { createClient } = require('@supabase/supabase-js');

async function testFixedApi() {
  console.log('🎯 测试修复后的API...');
  
  try {
    const testAddress = '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f';
    
    const response = await fetch(`http://localhost:3000/api/user/transactions?address=${testAddress}&page=1&limit=20`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API响应成功');
      console.log(`📊 交易记录数量: ${result.data.transactions.length}`);
      console.log(`💰 提现记录数量: ${result.data.withdraws.length}`);
      
      // 显示所有交易记录
      console.log('\n📋 所有交易记录:');
      result.data.transactions.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.type} - ${tx.amount} ${tx.token} - ${tx.status}`);
      });
      
      // 显示提现记录
      if (result.data.withdraws.length > 0) {
        console.log('\n💰 提现记录:');
        result.data.withdraws.forEach((w, index) => {
          console.log(`${index + 1}. 金额: ${w.price} USDT, 状态: ${w.status}`);
        });
      }
      
      console.log('\n🎉 修复成功！现在应该能看到所有记录了！');
      
    } else {
      console.log('❌ API响应失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testFixedApi();

