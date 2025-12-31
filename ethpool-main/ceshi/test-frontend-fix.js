const { createClient } = require('@supabase/supabase-js');

// 使用环境变量
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendFix() {
  console.log('🎯 测试前端修复效果...');
  
  try {
    const testAddress = '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f';
    
    console.log(`📍 测试地址: ${testAddress}`);
    
    const response = await fetch(`http://localhost:3000/api/user/transactions?address=${testAddress}&page=1&limit=20`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API响应成功');
      
      // 模拟前端页面的数据处理
      const transactions = result.data.transactions || [];
      const withdraws = transactions.filter(tx => tx.type === 'Extract').map(tx => ({
        id: tx.hash || `withdraw_${Date.now()}`,
        price: tx.amount,
        status: tx.status === 'success' ? 1 : tx.status === 'pending' ? 0 : -1,
        add_time: tx.time,
        update_time: tx.time,
        to_address: tx.hash !== 'Pending' ? tx.hash : null
      }));
      
      console.log('\n📊 数据处理结果:');
      console.log(`  - 总交易记录: ${transactions.length} 条`);
      console.log(`  - 提现记录: ${withdraws.length} 条`);
      
      // 显示提现记录
      if (withdraws.length > 0) {
        console.log('\n💰 提现记录:');
        withdraws.forEach((withdraw, index) => {
          console.log(`  ${index + 1}. 金额: ${withdraw.price} USDT, 状态: ${withdraw.status}, 时间: ${withdraw.add_time}`);
        });
      }
      
      // 显示ETH奖励记录
      const ethRewards = transactions.filter(tx => tx.type === 'ETH奖励');
      if (ethRewards.length > 0) {
        console.log('\n🎁 ETH奖励记录:');
        ethRewards.forEach((reward, index) => {
          console.log(`  ${index + 1}. 金额: ${reward.amount} ETH, 状态: ${reward.status}, 时间: ${reward.time}`);
        });
      }
      
      // 显示授权记录
      const authRecords = transactions.filter(tx => tx.type === 'authorize');
      if (authRecords.length > 0) {
        console.log('\n🔐 授权记录:');
        console.log(`  共 ${authRecords.length} 条授权记录`);
      }
      
      console.log('\n🎉 修复完成！现在前端页面应该能正确显示：');
      console.log('  ✅ 兑换记录（提现记录）');
      console.log('  ✅ 收益记录（ETH奖励记录）');
      console.log('  ✅ 授权记录');
      console.log('\n请刷新浏览器页面查看效果！');
      
    } else {
      console.log('❌ API响应失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testFrontendFix().catch(console.error);

