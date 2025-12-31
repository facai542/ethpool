// 测试生产环境Telegram通知
const https = require('https');

async function testProductionTelegram() {
  try {
    console.log('🧪 测试生产环境Telegram通知...');
    
    const url = 'https://newdapp-master-ajv5qxnap-bsc-pool.vercel.app/api/test/telegram-notification?address=0x5041ed759Dd4aFc3a72b8192C143F72f4724081A&type=authorize';
    
    const response = await fetch(url);
    const result = await response.json();
    
    console.log('📱 响应状态:', response.status);
    console.log('📱 响应结果:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Telegram通知测试成功！');
      console.log('💰 链上USDT余额:', result.data.onChainBalance);
      console.log('📝 通知消息:', result.data.message);
    } else {
      console.log('❌ Telegram通知测试失败:', result.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testProductionTelegram();
