const { createClient } = require('@supabase/supabase-js');

// 使用环境变量
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserRecords() {
  console.log('🔍 调试用户记录显示问题...');
  
  try {
    // 1. 获取所有有提现记录的用户
    console.log('\n1️⃣ 获取有提现记录的用户...');
    const { data: usersWithWithdrawals, error: usersError } = await supabase
      .from('nh_withdraw')
      .select(`
        user_id,
        price,
        status,
        add_time,
        nh_member!inner(address, eth)
      `)
      .order('add_time', { ascending: false })
      .limit(10);

    if (usersError) {
      console.error('❌ 查询用户提现记录失败:', usersError);
    } else {
      console.log('✅ 有提现记录的用户:');
      usersWithWithdrawals.forEach((record, index) => {
        console.log(`${index + 1}. 用户ID: ${record.user_id}, 地址: ${record.nh_member.address}, 提现金额: ${record.price} USDT, 状态: ${record.status}, 时间: ${record.add_time}`);
      });
    }

    // 2. 获取所有有ETH奖励记录的用户
    console.log('\n2️⃣ 获取有ETH奖励记录的用户...');
    const { data: usersWithRewards, error: rewardsError } = await supabase
      .from('finance_orders')
      .select(`
        user_id,
        amount,
        remark,
        create_time,
        nh_member!inner(address, eth)
      `)
      .like('remark', '%[ETH奖励]%')
      .order('create_time', { ascending: false })
      .limit(10);

    if (rewardsError) {
      console.error('❌ 查询用户奖励记录失败:', rewardsError);
    } else {
      console.log('✅ 有ETH奖励记录的用户:');
      usersWithRewards.forEach((record, index) => {
        console.log(`${index + 1}. 用户ID: ${record.user_id}, 地址: ${record.nh_member.address}, 奖励金额: ${record.amount} ETH, 时间: ${new Date(record.create_time * 1000).toISOString()}`);
      });
    }

    // 3. 测试几个用户的交易记录API
    console.log('\n3️⃣ 测试用户交易记录API...');
    const testAddresses = [
      '0xFE863Ae25C3d620c481a81a873aD18866e4f0bB4', // 用户268 - 有提现记录
      '0x0c941bac7648c', // 用户270 - 有ETH奖励记录
      '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f'  // 用户181 - 有提现记录
    ];

    for (const testAddress of testAddresses) {
      console.log(`\n测试地址: ${testAddress}`);
      try {
        const response = await fetch(`http://localhost:3000/api/user/transactions?address=${testAddress}&page=1&limit=20`);
        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ API响应成功 - 交易记录数量: ${result.data.transactions.length}`);
          
          const withdrawalRecords = result.data.transactions.filter(tx => tx.type === 'Extract');
          const ethRewards = result.data.transactions.filter(tx => tx.type === 'ETH奖励');
          const authRecords = result.data.transactions.filter(tx => tx.type === '授权');
          
          console.log(`   - 提现记录: ${withdrawalRecords.length} 条`);
          console.log(`   - ETH奖励记录: ${ethRewards.length} 条`);
          console.log(`   - 授权记录: ${authRecords.length} 条`);
          
          if (result.data.transactions.length > 0) {
            console.log('   - 最新记录:', result.data.transactions[0]);
          }
        } else {
          console.log(`❌ API响应失败: ${result.error}`);
        }
      } catch (apiError) {
        console.log(`❌ API调用失败: ${apiError.message}`);
      }
    }

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

// 运行调试
debugUserRecords().catch(console.error);

