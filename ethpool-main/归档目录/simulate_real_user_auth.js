const fetch = require('node-fetch');

// 生产环境配置
const PRODUCTION_URL = 'https://ethmax.vercel.app';
const TEST_WALLET = '0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5';

// 模拟真实用户授权流程
async function simulateRealUserAuth() {
  console.log('🎭 模拟真实用户授权流程');
  console.log('='.repeat(60));
  console.log(`🌐 生产环境: ${PRODUCTION_URL}`);
  console.log(`👤 测试钱包: ${TEST_WALLET}`);
  console.log('');

  try {
    // 步骤1: 检查用户当前状态
    console.log('📋 步骤1: 检查用户当前状态...');
    const userInfoResponse = await fetch(`${PRODUCTION_URL}/api/user/info?address=${TEST_WALLET}`);
    
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      console.log('✅ 用户信息获取成功:');
      console.log(`   - 用户ID: ${userInfo.data?.id || 'N/A'}`);
      console.log(`   - 授权状态: ${userInfo.data?.approved ? '已授权' : '未授权'}`);
      console.log(`   - ETH余额: ${userInfo.data?.eth || 0}`);
      console.log(`   - USDT余额: ${userInfo.data?.usdt || 0}`);
      console.log(`   - 可提现余额: ${userInfo.data?.withdrawable_usdt || 0}`);
    } else {
      const errorText = await userInfoResponse.text();
      console.log('❌ 用户信息获取失败:', errorText);
    }
    console.log('');

    // 步骤2: 创建用户会话
    console.log('🔐 步骤2: 创建用户会话...');
    const sessionResponse = await fetch(`${PRODUCTION_URL}/api/user/session/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: TEST_WALLET,
        walletType: 'metamask',
        networkId: 56,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '127.0.0.1'
      })
    });
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('✅ 会话创建成功:');
      console.log(`   - 会话ID: ${sessionData.data?.sessionId || 'N/A'}`);
      console.log(`   - 过期时间: ${sessionData.data?.expiresAt || 'N/A'}`);
    } else {
      const errorText = await sessionResponse.text();
      console.log('❌ 会话创建失败:', errorText);
    }
    console.log('');

    // 步骤3: 模拟授权操作
    console.log('🔑 步骤3: 模拟授权操作...');
    const authResponse = await fetch(`${PRODUCTION_URL}/api/user/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: TEST_WALLET,
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        authAmount: '1000000'
      })
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ 授权操作成功:');
      console.log(`   - 用户ID: ${authData.data?.userId || 'N/A'}`);
      console.log(`   - 授权金额: ${authData.data?.authAmount || 'N/A'}`);
      console.log(`   - 交易哈希: ${authData.data?.txHash || 'N/A'}`);
      console.log(`   - 授权状态: ${authData.data?.verification?.approved ? '已授权' : '未授权'}`);
    } else {
      const errorText = await authResponse.text();
      console.log('❌ 授权操作失败:', errorText);
    }
    console.log('');

    // 步骤4: 检查授权后的状态
    console.log('📊 步骤4: 检查授权后的状态...');
    const finalUserResponse = await fetch(`${PRODUCTION_URL}/api/user/info?address=${TEST_WALLET}`);
    
    if (finalUserResponse.ok) {
      const finalUserInfo = await finalUserResponse.json();
      console.log('✅ 最终用户状态:');
      console.log(`   - 授权状态: ${finalUserInfo.data?.approved ? '已授权' : '未授权'}`);
      console.log(`   - ETH余额: ${finalUserInfo.data?.eth || 0}`);
      console.log(`   - USDT余额: ${finalUserInfo.data?.usdt || 0}`);
      console.log(`   - 可提现余额: ${finalUserInfo.data?.withdrawable_usdt || 0}`);
      console.log(`   - 总ETH奖励: ${finalUserInfo.data?.a_eth || 0}`);
      console.log(`   - 推荐码: ${finalUserInfo.data?.referral_code || 'N/A'}`);
    } else {
      const errorText = await finalUserResponse.text();
      console.log('❌ 最终状态查询失败:', errorText);
    }

  } catch (error) {
    console.error('❌ 模拟过程中发生错误:', error.message);
  }
}

// 检查生产环境API状态
async function checkProductionAPIStatus() {
  console.log('🏥 检查生产环境API状态...');
  
  const apiTests = [
    {
      name: '用户信息API (旧参数)',
      url: `${PRODUCTION_URL}/api/user/info?address=${TEST_WALLET}`,
      method: 'GET'
    },
    {
      name: '用户信息API (新参数)',
      url: `${PRODUCTION_URL}/api/user/info?wallet_address=${TEST_WALLET}`,
      method: 'GET'
    },
    {
      name: '授权API',
      url: `${PRODUCTION_URL}/api/user/authorize`,
      method: 'POST',
      body: {
        address: TEST_WALLET,
        txHash: '0x1234567890abcdef',
        authAmount: '1000000'
      }
    },
    {
      name: '会话创建API',
      url: `${PRODUCTION_URL}/api/user/session/create`,
      method: 'POST',
      body: {
        walletAddress: TEST_WALLET,
        walletType: 'metamask',
        networkId: 56
      }
    },
    {
      name: '管理后台统计API',
      url: `${PRODUCTION_URL}/api/admin/stats`,
      method: 'GET'
    }
  ];
  
  for (const test of apiTests) {
    try {
      const options = {
        method: test.method,
        headers: test.body ? { 'Content-Type': 'application/json' } : {}
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(test.url, options);
      const responseText = await response.text();
      
      console.log(`\n${test.name}:`);
      console.log(`  状态: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`  ✅ 成功`);
        try {
          const data = JSON.parse(responseText);
          if (data.success !== undefined) {
            console.log(`  响应: success=${data.success}`);
          }
        } catch (e) {
          console.log(`  响应: ${responseText.substring(0, 100)}...`);
        }
      } else {
        console.log(`  ❌ 失败: ${responseText.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`\n${test.name}:`);
      console.log(`  ❌ 错误: ${error.message}`);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 生产环境真实用户授权模拟');
  console.log('='.repeat(60));
  console.log('');
  
  await checkProductionAPIStatus();
  console.log('');
  console.log('-'.repeat(60));
  console.log('');
  
  await simulateRealUserAuth();
  
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ 模拟完成');
  console.log('='.repeat(60));
}

main().catch(console.error);
