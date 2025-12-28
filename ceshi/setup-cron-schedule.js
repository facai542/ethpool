// 设置定时任务调度
const https = require('https');

async function setupCronSchedule() {
  try {
    console.log('🚀 设置定时任务调度...');
    
    // 1. 测试基于链上余额的奖励发放
    console.log('1️⃣ 测试基于链上余额的奖励发放...');
    const testResponse = await fetch('http://localhost:3000/api/admin/distribute-rewards-with-onchain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const testResult = await testResponse.json();
    
    if (testResult.success) {
      console.log('✅ 基于链上余额的奖励发放测试成功');
      console.log('📊 影响用户数:', testResult.data.affectedUsers);
    } else {
      console.log('❌ 基于链上余额的奖励发放测试失败:', testResult.message);
      return;
    }
    
    // 2. 显示定时任务设置说明
    console.log('\n2️⃣ 定时任务设置说明:');
    console.log('📅 建议使用以下服务设置定时任务:');
    console.log('   - Vercel Cron Jobs (推荐)');
    console.log('   - GitHub Actions');
    console.log('   - 外部定时服务 (如 cron-job.org)');
    console.log('');
    console.log('⏰ 定时任务配置:');
    console.log('   - 频率: 每6小时执行一次');
    console.log('   - URL: https://ethmax.vercel.app/api/admin/distribute-rewards-with-onchain');
    console.log('   - 方法: POST');
    console.log('   - 认证: 无需认证 (内部API)');
    console.log('');
    console.log('🕐 建议执行时间:');
    console.log('   - 00:00 UTC (北京时间 08:00)');
    console.log('   - 06:00 UTC (北京时间 14:00)');
    console.log('   - 12:00 UTC (北京时间 20:00)');
    console.log('   - 18:00 UTC (北京时间 02:00)');
    
    // 3. 显示奖励等级配置
    console.log('\n3️⃣ 奖励等级配置:');
    console.log('   - 1-4,999 USDT: 2% (每日4次，每次 0.5%)');
    console.log('   - 5,000-9,999 USDT: 2.5% (每日4次，每次 0.625%)');
    console.log('   - 10,000-99,999 USDT: 3% (每日4次，每次 0.75%)');
    console.log('   - 100,000-199,999 USDT: 4% (每日4次，每次 1%)');
    console.log('   - 200,000+ USDT: 5% (每日4次，每次 1.25%)');
    
    // 4. 显示测试结果示例
    console.log('\n4️⃣ 测试结果示例:');
    if (testResult.data.rewards && testResult.data.rewards.length > 0) {
      testResult.data.rewards.slice(0, 3).forEach((reward, index) => {
        console.log(`   ${index + 1}. 用户: ${reward.user_address.slice(0, 10)}...`);
        console.log(`      链上余额: ${reward.onchain_balance} USDT`);
        console.log(`      单次奖励: ${reward.single_reward_usdt} USDT`);
        console.log(`      ETH奖励: ${reward.reward_eth} ETH`);
        console.log(`      等级: ${reward.tier_description}`);
        console.log('');
      });
    }
    
    console.log('\n✅ 定时任务调度设置完成！');
    console.log('💡 请将以下URL添加到你的定时任务服务中:');
    console.log('   https://ethmax.vercel.app/api/admin/distribute-rewards-with-onchain');
    
  } catch (error) {
    console.error('❌ 设置失败:', error);
  }
}

// 运行设置
setupCronSchedule();
