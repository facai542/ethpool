/**
 * 直接测试Telegram服务
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3006';
const USER_ADDRESS = '0x0dab66068819966B114A372e2fac68adc659A8BB';

async function testTelegramDirect() {
  console.log('🔧 直接测试Telegram服务...');
  
  try {
    // 1. 检查服务状态
    console.log('\n📊 检查服务状态...');
    const statusResponse = await axios.get(`${BASE_URL}/api/telegram-realtime/status`);
    console.log('服务状态:', statusResponse.data);
    
    // 2. 尝试启动服务
    console.log('\n🚀 启动服务...');
    const startResponse = await axios.post(`${BASE_URL}/api/telegram-realtime/start`);
    console.log('启动结果:', startResponse.data);
    
    // 3. 再次检查状态
    console.log('\n📊 再次检查状态...');
    const statusResponse2 = await axios.get(`${BASE_URL}/api/telegram-realtime/status`);
    console.log('启动后状态:', statusResponse2.data);
    
    // 4. 测试通知创建
    console.log('\n📢 测试通知创建...');
    const notificationResponse = await axios.post(`${BASE_URL}/api/telegram-realtime/test-authorization`, {
      userAddress: USER_ADDRESS,
      txHash: '0xtest' + Date.now(),
      amount: '1000000'
    });
    console.log('通知创建结果:', notificationResponse.data);
    
    // 5. 等待几秒后检查队列
    console.log('\n⏳ 等待3秒后检查队列...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const processResponse = await axios.post(`${BASE_URL}/api/telegram-realtime/process-pending`);
    console.log('处理队列结果:', processResponse.data);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testTelegramDirect();
