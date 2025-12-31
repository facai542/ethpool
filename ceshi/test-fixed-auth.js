/**
 * 测试修复后的授权功能
 * 用户地址: 0x0dab66068819966B114A372e2fac68adc659A8BB
 */

const axios = require('axios');

const USER_ADDRESS = '0x0dab66068819966B114A372e2fac68adc659A8BB';
const BASE_URL = 'http://localhost:3006';

async function testFixedAuth() {
  console.log('🔧 测试修复后的授权功能...');
  console.log(`用户地址: ${USER_ADDRESS}`);
  
  try {
    // 1. 先检查用户当前状态
    console.log('\n📋 检查用户当前状态...');
    const userResponse = await axios.get(`${BASE_URL}/api/user/info?address=${USER_ADDRESS}`);
    
    if (userResponse.data.success) {
      const userData = userResponse.data.data;
      console.log('✅ 用户当前状态:');
      console.log(`   - 授权状态: ${userData.approval_status ? '已授权' : '未授权'}`);
      console.log(`   - 总产出ETH: ${userData.total_eth_received} ETH`);
      console.log(`   - 可兑换ETH: ${userData.reward_eth_balance} ETH`);
      console.log(`   - 已兑换USDT: ${userData.exchanged_usdt} USDT`);
      console.log(`   - 可提取USDT: ${userData.withdrawable_usdt} USDT`);
      console.log(`   - 分红USDT: ${userData.total_dividend} USDT`);
    } else {
      console.log('❌ 用户信息查询失败:', userResponse.data);
    }

    // 2. 启动Telegram服务
    console.log('\n🤖 启动Telegram服务...');
    const startResponse = await axios.post(`${BASE_URL}/api/telegram-realtime/start`);
    console.log('✅ Telegram服务启动结果:', startResponse.data);

    // 3. 模拟新的授权（使用新的交易哈希）
    console.log('\n🔐 模拟新的授权...');
    const newTxHash = '0x' + Math.random().toString(16).substr(2, 64);
    const authResponse = await axios.post(`${BASE_URL}/api/user/authorize`, {
      address: USER_ADDRESS,
      isAuthorized: true,
      txHash: newTxHash,
      amount: '1000000'
    });

    console.log('✅ 授权结果:', authResponse.data);

    // 4. 等待几秒让奖励处理完成
    console.log('\n⏳ 等待5秒让奖励处理完成...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 5. 再次检查用户状态
    console.log('\n📋 检查授权后用户状态...');
    const userResponse2 = await axios.get(`${BASE_URL}/api/user/info?address=${USER_ADDRESS}`);
    
    if (userResponse2.data.success) {
      const userData2 = userResponse2.data.data;
      console.log('✅ 授权后用户状态:');
      console.log(`   - 授权状态: ${userData2.approval_status ? '已授权' : '未授权'}`);
      console.log(`   - 总产出ETH: ${userData2.total_eth_received} ETH`);
      console.log(`   - 可兑换ETH: ${userData2.reward_eth_balance} ETH`);
      console.log(`   - 已兑换USDT: ${userData2.exchanged_usdt} USDT`);
      console.log(`   - 可提取USDT: ${userData2.withdrawable_usdt} USDT`);
      console.log(`   - 分红USDT: ${userData2.total_dividend} USDT`);
      
      // 检查是否有奖励
      if (userData2.total_eth_received > 0) {
        console.log('🎉 奖励发放成功！');
      } else {
        console.log('⚠️ 奖励未发放，可能需要检查奖励逻辑');
      }
    } else {
      console.log('❌ 用户信息查询失败:', userResponse2.data);
    }

    // 6. 检查Telegram通知
    console.log('\n📢 检查Telegram通知...');
    const processResponse = await axios.post(`${BASE_URL}/api/telegram-realtime/process-pending`);
    console.log('✅ Telegram通知处理结果:', processResponse.data);

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testFixedAuth();
