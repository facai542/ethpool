const fetch = require('node-fetch');

async function checkVercelLogs() {
  console.log('🔍 检查Vercel部署状态...');
  
  try {
    // 测试一个简单的API端点
    const response = await fetch('https://ethmax.vercel.app/api/test/eth-price', {
      method: 'GET'
    });

    console.log('📊 状态码:', response.status);
    console.log('📝 状态文本:', response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API响应:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ 错误响应:', errorText);
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkVercelLogs();
