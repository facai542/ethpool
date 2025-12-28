// 测试Telegram消息内容
const https = require('https');

async function testTelegramMessageContent() {
  try {
    console.log('🧪 测试Telegram消息内容...');
    
    // 测试授权通知
    const authorizeUrl = 'https://ethmax.vercel.app/api/test/telegram-notification?address=0x5041ed759Dd4aFc3a72b8192C143F72f4724081A&type=authorize';
    
    console.log('📱 测试授权通知...');
    const authResponse = await fetch(authorizeUrl);
    const authResult = await authResponse.json();
    
    if (authResult.success) {
      console.log('✅ 授权通知测试成功');
      console.log('💰 链上USDT余额:', authResult.data.onChainBalance);
      console.log('📝 消息内容:');
      console.log(authResult.data.message);
      console.log('\n' + '='.repeat(50) + '\n');
    } else {
      console.log('❌ 授权通知测试失败:', authResult.message);
    }
    
    // 测试奖励发放通知
    const rewardUrl = 'https://ethmax.vercel.app/api/test/telegram-notification?address=0x5041ed759Dd4aFc3a72b8192C143F72f4724081A&type=reward';
    
    console.log('📱 测试奖励发放通知...');
    const rewardResponse = await fetch(rewardUrl);
    const rewardResult = await rewardResponse.json();
    
    if (rewardResult.success) {
      console.log('✅ 奖励发放通知测试成功');
      console.log('💰 链上USDT余额:', rewardResult.data.onChainBalance);
      console.log('📝 消息内容:');
      console.log(rewardResult.data.message);
    } else {
      console.log('❌ 奖励发放通知测试失败:', rewardResult.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testTelegramMessageContent();
