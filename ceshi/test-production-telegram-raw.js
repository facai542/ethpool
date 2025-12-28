// 测试生产环境Telegram通知 - 获取原始响应
const https = require('https');

async function testProductionTelegramRaw() {
  try {
    console.log('🧪 测试生产环境Telegram通知（原始响应）...');
    
    const url = 'https://newdapp-master-ajv5qxnap-bsc-pool.vercel.app/api/test/telegram-notification?address=0x5041ed759Dd4aFc3a72b8192C143F72f4724081A&type=authorize';
    
    const response = await fetch(url);
    const text = await response.text();
    
    console.log('📱 响应状态:', response.status);
    console.log('📱 响应头:', Object.fromEntries(response.headers.entries()));
    console.log('📱 响应内容（前500字符）:', text.substring(0, 500));
    
    if (text.includes('<!doctype')) {
      console.log('❌ 返回的是HTML页面，可能是认证重定向');
    } else if (text.includes('{')) {
      console.log('✅ 返回的是JSON数据');
      try {
        const json = JSON.parse(text);
        console.log('📱 JSON数据:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('❌ JSON解析失败:', e.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testProductionTelegramRaw();
