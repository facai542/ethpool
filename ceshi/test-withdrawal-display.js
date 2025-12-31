const { createClient } = require('@supabase/supabase-js');

// 使用环境变量
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithdrawalDisplay() {
  console.log('🔍 测试提现记录显示功能...');
  
  try {
    // 1. 检查最新的提现记录
    console.log('\n1️⃣ 检查最新的提现记录...');
    const { data: withdrawals, error: withdrawError } = await supabase
      .from('nh_withdraw')
      .select('*')
      .order('add_time', { ascending: false })
      .limit(5);

    if (withdrawError) {
      console.error('❌ 查询提现记录失败:', withdrawError);
    } else {
      console.log('✅ 提现记录:', withdrawals);
    }

    // 2. 检查用户268的提现记录
    console.log('\n2️⃣ 检查用户268的提现记录...');
    const { data: userWithdrawals, error: userWithdrawError } = await supabase
      .from('nh_withdraw')
      .select('*')
      .eq('user_id', 268)
      .order('add_time', { ascending: false });

    if (userWithdrawError) {
      console.error('❌ 查询用户提现记录失败:', userWithdrawError);
    } else {
      console.log('✅ 用户268提现记录:', userWithdrawals);
    }

    // 3. 测试交易记录API
    console.log('\n3️⃣ 测试交易记录API...');
    const testAddress = '0xFE863Ae25C3d620c481a81a873aD18866e4f0bB4'; // 用户268的地址
    
    try {
      const response = await fetch(`http://localhost:3000/api/user/transactions?address=${testAddress}&page=1&limit=20`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 交易记录API响应成功');
        console.log('📊 交易记录数量:', result.data.transactions.length);
        
        // 检查是否包含提现记录
        const withdrawalRecords = result.data.transactions.filter(tx => tx.type === 'Extract');
        const ethRewards = result.data.transactions.filter(tx => tx.type === 'ETH奖励');
        
        console.log('💰 提现记录数量:', withdrawalRecords.length);
        console.log('🎁 ETH奖励记录数量:', ethRewards.length);
        
        if (withdrawalRecords.length > 0) {
          console.log('✅ 提现记录示例:', withdrawalRecords[0]);
        }
        
        if (ethRewards.length > 0) {
          console.log('✅ ETH奖励记录示例:', ethRewards[0]);
        }
        
        // 显示所有交易记录
        console.log('\n📋 所有交易记录:');
        result.data.transactions.forEach((tx, index) => {
          console.log(`${index + 1}. ${tx.type} - ${tx.amount} ${tx.token} - ${tx.status}`);
        });
      } else {
        console.error('❌ 交易记录API响应失败:', result.error);
      }
    } catch (apiError) {
      console.error('❌ 调用交易记录API失败:', apiError.message);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testWithdrawalDisplay().catch(console.error);

