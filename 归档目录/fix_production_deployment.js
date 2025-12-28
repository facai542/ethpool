const fetch = require('node-fetch');

// 生产环境修复脚本
async function fixProductionIssues() {
  console.log('🔧 开始修复生产环境问题...');
  
  // 检查当前生产环境状态
  console.log('\n📊 检查当前生产环境状态:');
  
  const testCases = [
    {
      name: '用户信息API (新参数)',
      url: 'https://ethmax.vercel.app/api/user/info?wallet_address=0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5',
      method: 'GET'
    },
    {
      name: '用户信息API (旧参数)',
      url: 'https://ethmax.vercel.app/api/user/info?address=0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5',
      method: 'GET'
    },
    {
      name: '授权API测试',
      url: 'https://ethmax.vercel.app/api/user/authorize',
      method: 'POST',
      body: {
        address: '0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5',
        txHash: '0x1234567890abcdef',
        authAmount: '1000000'
      }
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const options = {
        method: testCase.method,
        headers: testCase.body ? { 'Content-Type': 'application/json' } : {}
      };
      
      if (testCase.body) {
        options.body = JSON.stringify(testCase.body);
      }
      
      const response = await fetch(testCase.url, options);
      const responseText = await response.text();
      
      console.log(`\n${testCase.name}:`);
      console.log(`  状态: ${response.status} ${response.statusText}`);
      console.log(`  响应: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      
    } catch (error) {
      console.log(`\n${testCase.name}:`);
      console.log(`  错误: ${error.message}`);
    }
  }
  
  console.log('\n🔍 问题分析:');
  console.log('1. 如果新参数返回400，说明生产环境还在使用旧代码');
  console.log('2. 如果旧参数工作，说明需要更新前端调用');
  console.log('3. 如果授权API返回pid错误，说明数据库修复未部署');
  
  console.log('\n💡 建议的修复步骤:');
  console.log('1. 重新部署修复后的代码到Vercel');
  console.log('2. 确保所有API使用正确的参数名');
  console.log('3. 验证数据库字段修复已生效');
  console.log('4. 测试完整的授权流程');
}

// 创建生产环境测试用户
async function createTestUser() {
  console.log('\n👤 创建测试用户...');
  
  try {
    // 使用旧参数名尝试创建用户
    const response = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: '0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5',
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        authAmount: '1000000'
      })
    });
    
    const result = await response.text();
    console.log(`状态: ${response.status}`);
    console.log(`响应: ${result}`);
    
    if (response.ok) {
      console.log('✅ 测试用户创建成功');
    } else {
      console.log('❌ 测试用户创建失败');
    }
    
  } catch (error) {
    console.log(`❌ 创建测试用户时出错: ${error.message}`);
  }
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('🔧 生产环境问题诊断和修复');
  console.log('='.repeat(60));
  
  await fixProductionIssues();
  await createTestUser();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 诊断完成');
  console.log('='.repeat(60));
}

main().catch(console.error);
