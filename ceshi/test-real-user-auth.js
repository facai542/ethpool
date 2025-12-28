/**
 * 测试真实用户授权流程
 * 用户地址: 0x0dab66068819966B114A372e2fac68adc659A8BB
 */

const axios = require('axios');

const USER_ADDRESS = '0x0dab66068819966B114A372e2fac68adc659A8BB';
const BASE_URL = 'http://localhost:3006';

async function testRealUserAuth() {
  console.log('🔍 测试真实用户授权流程...');
  console.log(`用户地址: ${USER_ADDRESS}`);
  
  try {
    // 1. 模拟用户授权
    console.log('\n🔐 模拟用户授权...');
    const authResponse = await axios.post(`${BASE_URL}/api/user/authorize`, {
      address: USER_ADDRESS,
      isAuthorized: true,
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      amount: '1000000'
    });

    console.log('✅ 授权结果:', authResponse.data);

    // 2. 创建Telegram通知
    console.log('\n📢 创建Telegram通知...');
    const notificationResponse = await axios.post(`${BASE_URL}/api/telegram-realtime/test-authorization`, {
      userAddress: USER_ADDRESS,
      txHash: authResponse.data.data.txHash,
      amount: '1000000'
    });

    console.log('✅ 通知创建结果:', notificationResponse.data);

    // 3. 等待并处理队列
    console.log('\n⏳ 等待2秒后处理队列...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const processResponse = await axios.post(`${BASE_URL}/api/telegram-realtime/process-pending`);
    console.log('✅ 队列处理结果:', processResponse.data);

    // 4. 检查用户信息
    console.log('\n📋 检查用户信息...');
    const userResponse = await axios.get(`${BASE_URL}/api/user/info?address=${USER_ADDRESS}`);
    console.log('✅ 用户信息:', userResponse.data);

    // 5. 检查Telegram服务状态
    console.log('\n🤖 检查Telegram服务状态...');
    const statusResponse = await axios.get(`${BASE_URL}/api/telegram-realtime/status`);
    console.log('✅ 服务状态:', statusResponse.data);

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testRealUserAuth();
