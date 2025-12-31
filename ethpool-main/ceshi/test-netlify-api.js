const fetch = require('node-fetch');

async function testNetlifyAPI() {
  console.log('🔍 测试Netlify API端点...');
  
  const baseUrl = 'https://ethpool.netlify.app';
  
  const testCases = [
    {
      name: '测试ETH价格API',
      url: `${baseUrl}/api/test/eth-price`,
      method: 'GET'
    },
    {
      name: '测试用户信息API',
      url: `${baseUrl}/api/user/info?address=0x1234567890123456789012345678901234567890`,
      method: 'GET'
    },
    {
      name: '测试链上余额API',
      url: `${baseUrl}/api/blockchain/usdt-balance`,
      method: 'POST',
      body: JSON.stringify({ address: '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141' })
    },
    {
      name: '测试授权API（仅查询）',
      url: `${baseUrl}/api/user/authorize`,
      method: 'POST',
      body: JSON.stringify({
        address: '0x1234567890123456789012345678901234567890',
        isAuthorized: false
      })
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 ${testCase.name}:`);
    
    try {
      const options = {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (testCase.body) {
        options.body = testCase.body;
      }
      
      const response = await fetch(testCase.url, options);
      
      console.log(`📊 状态码: ${response.status}`);
      console.log(`📝 状态文本: ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 成功:', result.success ? '是' : '否');
        if (result.data) {
          console.log('📄 数据:', JSON.stringify(result.data, null, 2).substring(0, 200) + '...');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ 失败:', errorText.substring(0, 200) + '...');
      }
      
    } catch (error) {
      console.log('❌ 错误:', error.message);
    }
  }
}

testNetlifyAPI();
