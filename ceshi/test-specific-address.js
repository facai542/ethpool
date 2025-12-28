// 测试特定地址的链上USDT余额
const https = require('https');

async function testSpecificAddress() {
  try {
    console.log('🧪 测试特定地址的链上USDT余额...');
    
    const testAddress = '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141';
    console.log('📱 测试地址:', testAddress);
    
    const url = `https://ethmax.vercel.app/api/test/telegram-notification?address=${testAddress}&type=authorize`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    console.log('📱 响应状态:', response.status);
    
    if (result.success) {
      console.log('✅ 测试成功！');
      console.log('💰 链上USDT余额:', result.data.onChainBalance);
      console.log('\n📝 消息内容:');
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
testSpecificAddress();
