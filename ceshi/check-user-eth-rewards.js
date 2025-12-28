const { createClient } = require('@supabase/supabase-js');

// 使用环境变量
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserEthRewards() {
  console.log('🔍 检查用户ETH奖励记录...');
  
  try {
    // 1. 获取所有有ETH余额的用户（这些用户应该都有ETH奖励）
    console.log('\n1️⃣ 获取有ETH余额的用户...');
    const { data: usersWithEth, error: ethError } = await supabase
      .from('nh_member')
      .select('id, address, eth')
      .gt('eth', '0')
      .order('eth', { ascending: false })
      .limit(10);

    if (ethError) {
      console.error('❌ 查询ETH用户失败:', ethError);
    } else {
      console.log('✅ 有ETH余额的用户:');
      usersWithEth.forEach((user, index) => {
        console.log(`${index + 1}. 用户ID: ${user.id}, 地址: ${user.address}, ETH余额: ${user.eth}`);
      });
    }

    // 2. 检查这些用户是否有ETH奖励记录
    console.log('\n2️⃣ 检查ETH奖励记录...');
    for (const user of usersWithEth.slice(0, 5)) { // 只检查前5个用户
      console.log(`\n检查用户 ${user.id} (${user.address}):`);
      
      // 查询finance_orders表中的ETH奖励记录
      const { data: rewardRecords, error: rewardError } = await supabase
        .from('finance_orders')
        .select('*')
        .eq('user_id', user.id)
        .like('remark', '%[ETH奖励]%');

      if (rewardError) {
        console.log(`  ❌ 查询奖励记录失败: ${rewardError.message}`);
      } else {
        console.log(`  📊 ETH奖励记录数量: ${rewardRecords.length}`);
        if (rewardRecords.length > 0) {
          rewardRecords.forEach((record, index) => {
            console.log(`    ${index + 1}. 金额: ${record.amount} ETH, 时间: ${new Date(record.create_time * 1000).toISOString()}, 备注: ${record.remark}`);
          });
        }
      }

      // 测试API响应
      console.log(`  🔗 测试API响应:`);
      try {
        const response = await fetch(`http://localhost:3000/api/user/transactions?address=${user.address}&page=1&limit=20`);
        const result = await response.json();
        
        if (result.success) {
          const ethRewards = result.data.transactions.filter(tx => tx.type === 'ETH奖励');
          const withdrawals = result.data.transactions.filter(tx => tx.type === 'Extract');
          console.log(`    ✅ API成功 - ETH奖励: ${ethRewards.length} 条, 提现: ${withdrawals.length} 条`);
          
          if (ethRewards.length > 0) {
            console.log(`    🎁 ETH奖励示例: ${ethRewards[0].amount} ${ethRewards[0].token}`);
          }
        } else {
          console.log(`    ❌ API失败: ${result.error}`);
        }
      } catch (apiError) {
        console.log(`    ❌ API调用失败: ${apiError.message}`);
      }
    }

    // 3. 检查是否有用户进行了授权但没有获得ETH奖励
    console.log('\n3️⃣ 检查授权用户但没有ETH奖励的情况...');
    const { data: authUsers, error: authError } = await supabase
      .from('nh_logs')
      .select('user_id, description, created_at')
      .eq('action', 'authorize')
      .order('created_at', { ascending: false })
      .limit(10);

    if (authError) {
      console.error('❌ 查询授权用户失败:', authError);
    } else {
      console.log('✅ 最近授权的用户:');
      for (const authUser of authUsers.slice(0, 5)) {
        // 检查这个用户是否有ETH奖励记录
        const { data: userRewards, error: userRewardError } = await supabase
          .from('finance_orders')
          .select('*')
          .eq('user_id', authUser.user_id)
          .like('remark', '%[ETH奖励]%');

        const { data: userInfo, error: userInfoError } = await supabase
          .from('nh_member')
          .select('address, eth')
          .eq('id', authUser.user_id)
          .single();

        if (userInfoError) {
          console.log(`  ❌ 用户 ${authUser.user_id}: 无法获取用户信息`);
        } else {
          console.log(`  👤 用户 ${authUser.user_id} (${userInfo.address}):`);
          console.log(`    - ETH余额: ${userInfo.eth}`);
          console.log(`    - ETH奖励记录: ${userRewards.length} 条`);
          console.log(`    - 授权时间: ${authUser.created_at}`);
          
          if (userRewards.length === 0 && parseFloat(userInfo.eth) > 0) {
            console.log(`    ⚠️  警告: 用户有ETH余额但没有奖励记录！`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

// 运行检查
checkUserEthRewards().catch(console.error);

