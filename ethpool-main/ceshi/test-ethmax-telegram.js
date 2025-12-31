// 测试ethmax.vercel.app的Telegram通知
const https = require('https');

async function testEthmaxTelegram() {
  try {
    console.log('🧪 测试ethmax.vercel.app的Telegram通知...');
    
    const url = 'https://ethmax.vercel.app/api/test/telegram-notification?address=0x5041ed759Dd4aFc3a72b8192C143F72f4724081A&type=authorize';
    
    const response = await fetch(url);
    const text = await response.text();
    
    console.log('📱 响应状态:', response.status);
    console.log('📱 响应头:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 200) {
      try {
        const json = JSON.parse(text);
        console.log('✅ 成功获取JSON响应:');
        console.log('📱 链上USDT余额:', json.data?.onChainBalance);
        console.log('📱 通知消息:', json.data?.message);
        console.log('📱 完整响应:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('❌ JSON解析失败:', e.message);
        console.log('📱 原始响应:', text.substring(0, 500));
      }
    } else {
      console.log('❌ 请求失败，状态码:', response.status);
      console.log('📱 响应内容:', text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testEthmaxTelegram();
