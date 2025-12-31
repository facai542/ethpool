const fetch = require('node-fetch');

async function checkAuthStatus() {
  console.log('🔍 检查授权状态');
  
  try {
    // 检查几个测试地址的授权状态
    const testAddresses = [
      '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141',
      '0xF8E512333Ca2D6E070aE54A39E20702a41183DF4',
      '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f'
    ];
    
    for (const address of testAddresses) {
      console.log(`\n📍 检查地址: ${address}`);
      
      // 获取用户信息
      const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${address}`);
      const userData = await userResponse.json();
      
      if (userData.success) {
        const user = userData.data;
        console.log('👤 用户状态:', {
          id: user.id,
          isAuthorized: user.isAuthorized,
          isEffective: user.isEffective,
          hasReceivedEthReward: user.has_received_eth_reward,
          eth: user.eth,
          usdt: user.usdt
        });
        
        // 检查授权状态
        if (user.isAuthorized) {
          console.log('✅ 用户已授权');
        } else {
          console.log('❌ 用户未授权');
        }
      } else {
        console.log('❌ 无法获取用户信息:', userData);
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkAuthStatus();
