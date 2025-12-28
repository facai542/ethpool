/**
 * 调试用户授权问题
 * 用户地址: 0x0dab66068819966B114A372e2fac68adc659A8BB
 */

const axios = require('axios');

const USER_ADDRESS = '0x0dab66068819966B114A372e2fac68adc659A8BB';
const BASE_URL = 'http://localhost:3006';

async function checkUserStatus() {
  console.log('🔍 检查用户授权状态...');
  console.log(`用户地址: ${USER_ADDRESS}`);
  
  try {
    // 1. 检查用户信息
    console.log('\n📋 检查用户信息...');
    const userResponse = await axios.get(`${BASE_URL}/api/user/info?address=${USER_ADDRESS}`);
    
    if (userResponse.data.success) {
      const userData = userResponse.data.data;
      console.log('✅ 用户信息查询成功:');
      console.log(`   - 用户ID: ${userData.id}`);
      console.log(`   - 授权状态: ${userData.approval_status ? '已授权' : '未授权'}`);
      console.log(`   - 钱包地址: ${userData.wallet_address}`);
      console.log(`   - 总产出: ${userData.total_eth_received} ETH`);
      console.log(`   - 可兑换: ${userData.reward_eth_balance} ETH`);
      console.log(`   - 已兑换: ${userData.exchanged_usdt} USDT`);
      console.log(`   - 可提取: ${userData.withdrawable_usdt} USDT`);
      console.log(`   - 分红: ${userData.total_dividend} USDT`);
      console.log(`   - 创建时间: ${userData.created_at}`);
      console.log(`   - 更新时间: ${userData.updated_at}`);
    } else {
      console.log('❌ 用户信息查询失败:', userResponse.data);
    }
  } catch (error) {
    console.error('❌ 用户信息查询错误:', error.response?.data || error.message);
  }
}

async function checkTelegramService() {
  console.log('\n🤖 检查Telegram服务状态...');
  
  try {
    const statusResponse = await axios.get(`${BASE_URL}/api/telegram-realtime/status`);
    
    if (statusResponse.data.success) {
      const status = statusResponse.data.data;
      console.log('✅ Telegram服务状态:');
      console.log(`   - 服务运行: ${status.isRunning ? '是' : '否'}`);
      console.log(`   - 频道激活: ${status.channelActive ? '是' : '否'}`);
      console.log(`   - 时间戳: ${status.timestamp}`);
    } else {
      console.log('❌ Telegram服务状态查询失败');
    }
  } catch (error) {
    console.error('❌ Telegram服务状态查询错误:', error.response?.data || error.message);
  }
}

async function testAuthorization() {
  console.log('\n🔐 测试用户授权...');
  
  try {
    const authResponse = await axios.post(`${BASE_URL}/api/user/authorize`, {
      address: USER_ADDRESS,
      isAuthorized: true,
      txHash: '0xtest' + Date.now(),
      amount: '1000000'
    });

    console.log('✅ 授权测试结果:');
    console.log(JSON.stringify(authResponse.data, null, 2));
  } catch (error) {
    console.error('❌ 授权测试失败:', error.response?.data || error.message);
  }
}

async function testTelegramNotification() {
  console.log('\n📢 测试Telegram通知...');
  
  try {
    const notificationResponse = await axios.post(`${BASE_URL}/api/telegram-realtime/test-authorization`, {
      userAddress: USER_ADDRESS,
      txHash: '0xtest' + Date.now(),
      amount: '1000000'
    });

    console.log('✅ Telegram通知测试结果:');
    console.log(JSON.stringify(notificationResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Telegram通知测试失败:', error.response?.data || error.message);
  }
}

async function runDebug() {
  console.log('🚨 开始调试用户授权问题...\n');
  
  await checkUserStatus();
  await checkTelegramService();
  await testAuthorization();
  await testTelegramNotification();
  
  console.log('\n🔍 调试完成！');
}

runDebug();
