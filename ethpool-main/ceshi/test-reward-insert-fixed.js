const { createClient } = require('@supabase/supabase-js');

// 使用服务角色密钥
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRewardInsertFixed() {
  console.log('🔍 测试修复后的奖励插入...');
  
  try {
    // 1. 插入一条ETH奖励记录
    console.log('\n1️⃣ 插入ETH奖励记录...');
    const rewardRecord = {
      user_id: 270,
      order_no: `REWARD_${Date.now()}`,
      method_id: 2,
      type: 'withdraw', // 使用withdraw类型
      amount: '0.01302326',
      actual_amount: '0.01302326',
      fee: 0,
      address: '0x0c941bac7648c',
      status: 1,
      create_time: Math.floor(Date.now() / 1000),
      update_time: Math.floor(Date.now() / 1000),
      remark: '[ETH奖励] 授权奖励 - 授权额度: 1000000 USDT, 奖励: 0.01302326 ETH'
    };

    console.log('📝 插入数据:', rewardRecord);

    const { data: insertData, error: insertError } = await supabase
      .from('finance_orders')
      .insert(rewardRecord)
      .select();

    if (insertError) {
      console.error('❌ 插入失败:', insertError);
    } else {
      console.log('✅ 插入成功:', insertData);
    }

    // 2. 测试交易记录API
    console.log('\n2️⃣ 测试交易记录API...');
    const testAddress = '0x0c941bac7648c';
    
    try {
      const response = await fetch(`http://localhost:3000/api/user/transactions?address=${testAddress}&page=1&limit=20`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 交易记录API响应成功');
        console.log('📊 交易记录数量:', result.data.transactions.length);
        
        // 检查是否包含ETH奖励记录
        const ethRewards = result.data.transactions.filter(tx => tx.type === 'ETH奖励');
        const authRecords = result.data.transactions.filter(tx => tx.type === '授权');
        const withdrawRecords = result.data.transactions.filter(tx => tx.type === '提现');
        
        console.log('🎁 ETH奖励记录数量:', ethRewards.length);
        console.log('🔐 授权记录数量:', authRecords.length);
        console.log('💰 提现记录数量:', withdrawRecords.length);
        
        if (ethRewards.length > 0) {
          console.log('✅ ETH奖励记录示例:', ethRewards[0]);
        }
        
        if (authRecords.length > 0) {
          console.log('✅ 授权记录示例:', authRecords[0]);
        }
        
        if (withdrawRecords.length > 0) {
          console.log('✅ 提现记录示例:', withdrawRecords[0]);
        }
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
testRewardInsertFixed().catch(console.error);

