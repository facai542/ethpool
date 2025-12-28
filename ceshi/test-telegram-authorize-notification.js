const fetch = require('node-fetch');

async function testTelegramNotification() {
  const testAddress = '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141';
  
  console.log('🔔 测试Telegram授权通知功能...');
  console.log(`📍 测试地址: ${testAddress}`);
  
  try {
    // 测试Telegram通知API
    const response = await fetch('https://ethmax.vercel.app/api/test/telegram-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'authorize',
        address: testAddress,
        userId: 275,
        authAddress: testAddress
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Telegram通知测试结果:');
    console.log('📊 状态:', result.success ? '成功' : '失败');
    
    if (result.data) {
      console.log('📝 消息内容:');
      console.log(result.data.message);
      console.log('💰 链上USDT余额:', result.data.onChainBalance);
    }
    
    if (result.error) {
      console.log('❌ 错误:', result.error);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testTelegramNotification();
