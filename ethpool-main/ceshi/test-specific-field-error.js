const fetch = require('node-fetch');

async function testSpecificFieldError() {
  console.log('🔍 测试具体字段错误...');
  
  try {
    // 测试不同的参数组合
    const testCases = [
      {
        name: '测试1: 新用户授权',
        body: {
          address: '0x1234567890123456789012345678901234567890',
          isAuthorized: true,
          amount: '1000000'
        }
      },
      {
        name: '测试2: 现有用户授权',
        body: {
          address: '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141',
          isAuthorized: true,
          amount: '1000000'
        }
      },
      {
        name: '测试3: 仅查询不更新',
        body: {
          address: '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141',
          isAuthorized: false
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 ${testCase.name}:`);
      
      const response = await fetch('https://ethmax.vercel.app/api/user/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.body)
      });
      
      const result = await response.text();
      console.log(`📊 状态: ${response.status}`);
      
      if (response.ok) {
        console.log('✅ 成功');
        try {
          const data = JSON.parse(result);
          console.log('📝 响应:', data);
        } catch (e) {
          console.log('📝 原始响应:', result);
        }
      } else {
        console.log('❌ 失败');
        console.log('📝 错误:', result);
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testSpecificFieldError();
