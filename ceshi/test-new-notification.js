// 测试新的通知
const https = require('https');

async function testNewNotification() {
  try {
    console.log('🧪 测试新的通知...');
    
    const address = '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141';
    
    // 直接调用Telegram通知API
    const url = `https://ethmax.vercel.app/api/test/telegram-notification?address=${address}&type=authorize`;
    
    console.log('📱 调用API:', url);
    
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
      
      // 检查钱包余额是否正确
      if (result.data.onChainBalance === 1) {
        console.log('✅ 链上余额正确: 1 USDT');
      } else {
        console.log('❌ 链上余额错误:', result.data.onChainBalance);
      }
      
    } else {
      console.log('❌ 测试失败:', result.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testNewNotification();
