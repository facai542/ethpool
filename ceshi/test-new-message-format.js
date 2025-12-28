// 测试新的消息格式
const https = require('https');

async function testNewMessageFormat() {
  try {
    console.log('🧪 测试新的消息格式...');
    
    const url = 'https://ethmax.vercel.app/api/test/telegram-notification?address=0x5041ed759Dd4aFc3a72b8192C143F72f4724081A&type=authorize';
    
    const response = await fetch(url);
    const result = await response.json();
    
    console.log('📱 响应状态:', response.status);
    
    if (result.success) {
      console.log('✅ 测试成功！');
      console.log('💰 链上USDT余额:', result.data.onChainBalance);
      console.log('\n📝 新的消息格式:');
      console.log('='.repeat(50));
      console.log(result.data.message);
      console.log('='.repeat(50));
    } else {
      console.log('❌ 测试失败:', result.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testNewMessageFormat();
