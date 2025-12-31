// 测试真实的授权流程
const https = require('https');

async function testRealAuthorizeFinal() {
  try {
    console.log('🧪 测试真实的授权流程...');
    
    const testAddress = '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141';
    console.log('📱 测试地址:', testAddress);
    
    // 模拟一个真实的授权请求
    const url = 'https://ethmax.vercel.app/api/user/authorize';
    const body = {
      address: testAddress,
      isAuthorized: true,
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      amount: '1000000'
    };
    
    console.log('📱 发送授权请求...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const text = await response.text();
    
    console.log('📱 响应状态:', response.status);
    
    if (response.status === 200) {
      try {
        const json = JSON.parse(text);
        console.log('✅ 授权成功:');
        console.log('📱 用户ID:', json.userId);
        console.log('📱 授权状态:', json.authorized);
        console.log('📱 消息:', json.message);
        
        // 等待几秒钟让通知处理
        console.log('\n⏳ 等待10秒让通知处理...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // 检查最新的通知记录
        console.log('📱 请检查Telegram群组是否收到新的通知消息');
        console.log('📱 如果收到通知，请检查钱包余额是否显示为 1.000000');
        
      } catch (e) {
        console.log('❌ JSON解析失败:', e.message);
        console.log('📱 原始响应:', text.substring(0, 500));
      }
    } else {
      console.log('❌ 授权失败，状态码:', response.status);
      console.log('📱 响应内容:', text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testRealAuthorizeFinal();
