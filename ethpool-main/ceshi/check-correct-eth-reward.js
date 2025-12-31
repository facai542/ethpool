const fetch = require('node-fetch');

async function checkCorrectEthReward() {
  console.log('🔍 检查正确的ETH奖励计算');
  
  try {
    // 获取当前ETH价格
    const priceResponse = await fetch('https://ethmax.vercel.app/api/test/eth-price');
    const priceData = await priceResponse.json();
    
    if (priceData.success) {
      const ethPrice = priceData.data.prices.coinGecko;
      const usdtAmount = 56; // 应该奖励的USDT金额
      const correctEthAmount = usdtAmount / ethPrice;
      
      console.log('💰 价格信息:');
      console.log(`  ETH价格: ${ethPrice} USDT`);
      console.log(`  应该奖励: ${usdtAmount} USDT`);
      console.log(`  正确ETH金额: ${correctEthAmount.toFixed(8)} ETH`);
      
      // 检查用户当前余额
      const testAddress = '0xF8E512333Ca2D6E070aE54A39E20702a41183DF4';
      const userResponse = await fetch(`https://ethmax.vercel.app/api/user/info?address=${testAddress}`);
      const userData = await userResponse.json();
      
      if (userData.success) {
        const currentEth = parseFloat(userData.data.eth);
        const currentValue = currentEth * ethPrice;
        
        console.log('\n👤 用户当前状态:');
        console.log(`  当前ETH余额: ${currentEth} ETH`);
        console.log(`  当前价值: ${currentValue.toFixed(2)} USDT`);
        console.log(`  应该获得: ${correctEthAmount.toFixed(8)} ETH (${usdtAmount} USDT)`);
        console.log(`  实际获得: ${currentEth} ETH (${currentValue.toFixed(2)} USDT)`);
        console.log(`  多给了: ${(currentEth - correctEthAmount).toFixed(8)} ETH`);
        console.log(`  多给了价值: ${(currentValue - usdtAmount).toFixed(2)} USDT`);
        
        // 计算应该的余额
        const shouldBeEth = correctEthAmount;
        const shouldBeValue = shouldBeEth * ethPrice;
        
        console.log('\n✅ 正确的状态应该是:');
        console.log(`  ETH余额: ${shouldBeEth.toFixed(8)} ETH`);
        console.log(`  价值: ${shouldBeValue.toFixed(2)} USDT`);
      }
    }
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkCorrectEthReward();
