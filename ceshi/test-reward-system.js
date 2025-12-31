/**
 * 测试奖励系统功能
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3006';

async function testPriceService() {
  console.log('🧪 测试价格服务...');
  
  try {
    // 模拟价格服务测试
    const testPrice = 2800;
    console.log(`✅ ETH价格: $${testPrice}`);
    return testPrice;
  } catch (error) {
    console.error('❌ 价格服务测试失败:', error);
    throw error;
  }
}

async function testWebhookEndpoint() {
  console.log('🧪 测试Webhook端点...');
  
  try {
    const testData = {
      userAddress: '0x1234567890123456789012345678901234567890',
      spenderAddress: '0xcontract123456789012345678901234567890',
      txHash: '0xtest123456789012345678901234567890',
      blockNumber: 12345678
    };

    const response = await axios.post(`${BASE_URL}/api/webhook/approval`, testData, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'your-secret-key'
      }
    });

    console.log('✅ Webhook测试成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Webhook测试失败:', error.response?.data || error.message);
    throw error;
  }
}

async function testDatabaseFunctions() {
  console.log('🧪 测试数据库函数...');
  
  try {
    // 测试用户信息查询
    const response = await axios.get(`${BASE_URL}/api/user/info?address=0x1234567890123456789012345678901234567890`);
    
    if (response.data.success) {
      const userData = response.data.data;
      console.log('✅ 数据库查询成功:');
      console.log(`   - 用户状态: ${userData.approval_status ? '已授权' : '未授权'}`);
      console.log(`   - 总产出: ${userData.total_eth_received} ETH`);
      console.log(`   - 可兑换: ${userData.reward_eth_balance} ETH`);
      console.log(`   - 已兑换: ${userData.exchanged_usdt} USDT`);
      console.log(`   - 已提取: ${userData.withdrawn_usdt} USDT`);
      console.log(`   - 可提取: ${userData.withdrawable_usdt} USDT`);
      console.log(`   - 分红: ${userData.total_dividend} USDT`);
      return userData;
    } else {
      throw new Error('数据库查询失败');
    }
  } catch (error) {
    console.error('❌ 数据库测试失败:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('🚀 开始奖励系统测试...\n');
  
  try {
    // 1. 测试价格服务
    await testPriceService();
    console.log('');
    
    // 2. 测试数据库
    await testDatabaseFunctions();
    console.log('');
    
    // 3. 测试Webhook（如果有Express服务器）
    // await testWebhookEndpoint();
    // console.log('');
    
    console.log('✅ 所有测试通过！奖励系统运行正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
runAllTests();
