// 设置定时奖励发放的脚本
const https = require('https');

async function setupCronRewards() {
  try {
    console.log('🚀 设置定时奖励发放系统...');
    
    // 1. 测试奖励发放API
    console.log('1️⃣ 测试奖励发放API...');
    const testResponse = await fetch('https://ethmax.vercel.app/api/admin/distribute-advanced-rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const testResult = await testResponse.json();
    
    if (testResult.success) {
      console.log('✅ 奖励发放API测试成功');
      console.log('📊 影响用户数:', testResult.data.affectedUsers);
    } else {
      console.log('❌ 奖励发放API测试失败:', testResult.message);
      return;
    }
    
    // 2. 测试定时任务API
    console.log('\n2️⃣ 测试定时任务API...');
    const cronResponse = await fetch('https://ethmax.vercel.app/api/cron/distribute-rewards', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + (process.env.CRON_SECRET_TOKEN || 'test-token')
      }
    });
    
    const cronResult = await cronResponse.json();
    
    if (cronResult.success) {
      console.log('✅ 定时任务API测试成功');
    } else {
      console.log('❌ 定时任务API测试失败:', cronResult.message);
    }
    
    // 3. 显示设置说明
    console.log('\n3️⃣ 定时任务设置说明:');
    console.log('📅 建议使用以下服务设置定时任务:');
    console.log('   - Vercel Cron Jobs (推荐)');
    console.log('   - GitHub Actions');
    console.log('   - 外部定时服务 (如 cron-job.org)');
    console.log('');
    console.log('⏰ 定时任务配置:');
    console.log('   - 频率: 每6小时执行一次');
    console.log('   - URL: https://ethmax.vercel.app/api/cron/distribute-rewards');
    console.log('   - 方法: GET 或 POST');
    console.log('   - 认证: Bearer Token (设置 CRON_SECRET_TOKEN 环境变量)');
    console.log('');
    console.log('🕐 建议执行时间:');
    console.log('   - 00:00 UTC (北京时间 08:00)');
    console.log('   - 06:00 UTC (北京时间 14:00)');
    console.log('   - 12:00 UTC (北京时间 20:00)');
    console.log('   - 18:00 UTC (北京时间 02:00)');
    
    // 4. 显示奖励等级配置
    console.log('\n4️⃣ 奖励等级配置:');
    console.log('   - 1-4,999 USDT: 2% (每日4次，每次 0.5%)');
    console.log('   - 5,000-9,999 USDT: 2.5% (每日4次，每次 0.625%)');
    console.log('   - 10,000-99,999 USDT: 3% (每日4次，每次 0.75%)');
    console.log('   - 100,000-199,999 USDT: 4% (每日4次，每次 1%)');
    console.log('   - 200,000+ USDT: 5% (每日4次，每次 1.25%)');
    
    console.log('\n✅ 定时奖励发放系统设置完成！');
    
  } catch (error) {
    console.error('❌ 设置失败:', error);
  }
}

// 运行设置
setupCronRewards();
