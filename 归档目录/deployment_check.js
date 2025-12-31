const fetch = require('node-fetch');

// 检查生产环境部署状态
async function checkDeploymentStatus() {
  console.log('🔍 检查生产环境部署状态...');
  console.log('='.repeat(60));
  
  // 检查关键API端点
  const endpoints = [
    {
      name: '主页',
      url: 'https://ethmax.vercel.app/',
      method: 'GET'
    },
    {
      name: '用户信息 (旧参数)',
      url: 'https://ethmax.vercel.app/api/user/info?address=0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5',
      method: 'GET'
    },
    {
      name: '用户信息 (新参数)',
      url: 'https://ethmax.vercel.app/api/user/info?wallet_address=0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5',
      method: 'GET'
    },
    {
      name: '授权API',
      url: 'https://ethmax.vercel.app/api/user/authorize',
      method: 'POST',
      body: {
        address: '0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5',
        txHash: '0x1234567890abcdef',
        authAmount: '1000000'
      }
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const options = {
        method: endpoint.method,
        headers: endpoint.body ? { 'Content-Type': 'application/json' } : {}
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(endpoint.url, options);
      const responseText = await response.text();
      
      console.log(`\n${endpoint.name}:`);
      console.log(`  状态: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`  ✅ 正常`);
        if (endpoint.name.includes('用户信息')) {
          try {
            const data = JSON.parse(responseText);
            console.log(`  用户状态: ${data.data?.approved ? '已授权' : '未授权'}`);
            console.log(`  用户ID: ${data.data?.id || 'N/A'}`);
          } catch (e) {
            console.log(`  响应: ${responseText.substring(0, 100)}...`);
          }
        }
      } else {
        console.log(`  ❌ 错误: ${responseText.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`\n${endpoint.name}:`);
      console.log(`  ❌ 网络错误: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 部署状态总结:');
  console.log('1. 如果新参数不工作，说明需要重新部署');
  console.log('2. 如果授权API返回pid错误，说明数据库修复未部署');
  console.log('3. 如果所有API都正常，说明修复已生效');
  console.log('='.repeat(60));
}

// 检查本地环境状态
async function checkLocalStatus() {
  console.log('\n🏠 检查本地环境状态...');
  
  try {
    const response = await fetch('http://localhost:3001/api/user/info?wallet_address=0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 本地环境正常');
      console.log(`  用户状态: ${data.data?.approved ? '已授权' : '未授权'}`);
      console.log(`  用户ID: ${data.data?.id || 'N/A'}`);
    } else {
      console.log('❌ 本地环境异常:', data.error);
    }
  } catch (error) {
    console.log('❌ 本地环境无法访问:', error.message);
  }
}

// 主函数
async function main() {
  await checkDeploymentStatus();
  await checkLocalStatus();
  
  console.log('\n🚀 建议的下一步操作:');
  console.log('1. 如果生产环境有问题，需要重新部署修复后的代码');
  console.log('2. 确保所有环境变量正确配置');
  console.log('3. 验证数据库修复已生效');
  console.log('4. 测试完整的用户授权流程');
}

main().catch(console.error);
