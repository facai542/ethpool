const { createClient } = require('@supabase/supabase-js');

// 使用服务角色密钥
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMissingEthRewards() {
  console.log('🔧 修复缺失的ETH奖励记录...');
  
  try {
    // 1. 获取有ETH余额但没有奖励记录的用户
    console.log('\n1️⃣ 查找需要修复的用户...');
    const { data: usersWithEth, error: ethError } = await supabase
      .from('nh_member')
      .select('id, address, eth')
      .gt('eth', '0')
      .not('address', 'is', null)
      .order('eth', { ascending: false });

    if (ethError) {
      console.error('❌ 查询用户失败:', ethError);
      return;
    }

    console.log(`✅ 找到 ${usersWithEth.length} 个有ETH余额的用户`);

    // 2. 检查每个用户是否有奖励记录
    const usersToFix = [];
    for (const user of usersWithEth) {
      const { data: existingRewards, error: rewardError } = await supabase
        .from('finance_orders')
        .select('id')
        .eq('user_id', user.id)
        .like('remark', '%[ETH奖励]%');

      if (rewardError) {
        console.log(`❌ 查询用户 ${user.id} 奖励记录失败:`, rewardError.message);
        continue;
      }

      if (existingRewards.length === 0) {
        usersToFix.push(user);
        console.log(`📝 用户 ${user.id} (${user.address}) 需要创建奖励记录 - ETH余额: ${user.eth}`);
      }
    }

    console.log(`\n🔧 需要修复的用户数量: ${usersToFix.length}`);

    // 3. 为这些用户创建奖励记录
    for (const user of usersToFix.slice(0, 10)) { // 只修复前10个用户，避免过多操作
      console.log(`\n修复用户 ${user.id} (${user.address}):`);
      
      try {
        // 创建奖励记录
        const rewardRecord = {
          user_id: user.id,
          order_no: `REWARD_FIX_${Date.now()}_${user.id}`,
          method_id: 2,
          type: 'withdraw',
          amount: user.eth.toString(),
          actual_amount: user.eth.toString(),
          fee: 0,
          address: user.address,
          status: 1,
          create_time: Math.floor(Date.now() / 1000),
          update_time: Math.floor(Date.now() / 1000),
          remark: `[ETH奖励] 授权奖励修复 - 奖励: ${user.eth} ETH`
        };

        const { data: insertData, error: insertError } = await supabase
          .from('finance_orders')
          .insert(rewardRecord)
          .select();

        if (insertError) {
          console.log(`  ❌ 插入失败: ${insertError.message}`);
        } else {
          console.log(`  ✅ 插入成功: 记录ID ${insertData[0].id}`);
        }
      } catch (error) {
        console.log(`  ❌ 修复失败: ${error.message}`);
      }
    }

    // 4. 验证修复结果
    console.log('\n4️⃣ 验证修复结果...');
    for (const user of usersToFix.slice(0, 5)) {
      const { data: rewards, error: rewardError } = await supabase
        .from('finance_orders')
        .select('*')
        .eq('user_id', user.id)
        .like('remark', '%[ETH奖励]%');

      if (rewardError) {
        console.log(`❌ 验证用户 ${user.id} 失败: ${rewardError.message}`);
      } else {
        console.log(`✅ 用户 ${user.id}: ${rewards.length} 条奖励记录`);
      }
    }

    console.log('\n🎉 修复完成！');

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

// 运行修复
fixMissingEthRewards().catch(console.error);

