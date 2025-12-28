const { createClient } = require('@supabase/supabase-js');

// 使用环境变量
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEthRewardDisplay() {
  console.log('🔍 测试ETH奖励显示功能...');
  
  try {
    // 1. 检查是否有用户有ETH奖励记录
    console.log('\n1️⃣ 检查ETH奖励记录...');
    const { data: rewardData, error: rewardError } = await supabase
      .from('finance_orders')
      .select('*')
      .eq('type', '4') // 4表示奖励交易
      .order('create_time', { ascending: false })
      .limit(5);

    if (rewardError) {
      console.error('❌ 查询ETH奖励记录失败:', rewardError);
    } else {
      console.log('✅ ETH奖励记录:', rewardData);
    }

    // 2. 检查授权交易记录
    console.log('\n2️⃣ 检查授权交易记录...');
    const { data: authData, error: authError } = await supabase
      .from('finance_orders')
      .select('*')
      .eq('type', '3') // 3表示授权交易
      .order('create_time', { ascending: false })
      .limit(5);

    if (authError) {
      console.error('❌ 查询授权交易记录失败:', authError);
    } else {
      console.log('✅ 授权交易记录:', authData);
    }

    // 3. 测试交易记录API
    console.log('\n3️⃣ 测试交易记录API...');
    const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // 使用一个测试地址
    
    try {
      const response = await fetch(`http://localhost:3000/api/user/transactions?address=${testAddress}&page=1&limit=20`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 交易记录API响应成功');
        console.log('📊 交易记录数量:', result.data.transactions.length);
        
        // 检查是否包含ETH奖励和授权记录
        const ethRewards = result.data.transactions.filter(tx => tx.type === 'ETH奖励');
        const authRecords = result.data.transactions.filter(tx => tx.type === '授权');
        
        console.log('🎁 ETH奖励记录数量:', ethRewards.length);
        console.log('🔐 授权记录数量:', authRecords.length);
        
        if (ethRewards.length > 0) {
          console.log('✅ ETH奖励记录示例:', ethRewards[0]);
        }
        
        if (authRecords.length > 0) {
          console.log('✅ 授权记录示例:', authRecords[0]);
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
testEthRewardDisplay().catch(console.error);
