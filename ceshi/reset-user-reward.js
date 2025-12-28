const fetch = require('node-fetch');

async function resetUserReward() {
  const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  
  console.log('🔧 重置用户奖励状态');
  console.log('📍 地址:', testAddress);
  console.log('⚠️ 这将重置用户的ETH奖励状态，允许重新获得奖励');
  
  try {
    // 这里需要调用一个重置API，或者直接操作数据库
    console.log('💡 要重置用户奖励状态，需要：');
    console.log('1. 将 has_received_eth_reward 设置为 false');
    console.log('2. 将 is_effective 设置为 0');
    console.log('3. 将 eth 余额重置为 0');
    
    console.log('\n或者使用一个全新的地址进行测试：');
    console.log('📍 新地址示例: 0x' + Math.random().toString(16).substr(2, 40).padEnd(40, '0'));
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
  }
}

resetUserReward();
