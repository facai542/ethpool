// 测试真实的授权通知
const https = require('https');

async function testRealAuthorize() {
  try {
    console.log('🧪 测试真实授权通知...');
    
    // 模拟一个真实的授权请求
    const url = 'https://ethmax.vercel.app/api/user/authorize';
    const body = {
      address: '0x5041ed759Dd4aFc3a72b8192C143F72f4724081A',
      isAuthorized: true,
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      amount: '1000000'
    };
    
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
testRealAuthorize();
