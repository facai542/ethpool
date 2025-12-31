// 测试ETH价格API
const https = require('https');

async function testEthPriceAPI() {
  try {
    console.log('🧪 测试ETH价格API...');
    
    // 测试价格API
    const response = await fetch('http://localhost:3000/api/test/eth-price');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API调用成功');
      console.log('📊 价格数据:');
      console.log(`  - CoinGecko价格: $${result.data.prices.coinGecko}`);
      console.log(`  - 数据库价格: $${result.data.prices.database}`);
      console.log(`  - 固定价格: $${result.data.prices.fixed}`);
      
      console.log('\n💰 奖励计算:');
      console.log(`  - CoinGecko奖励: ${result.data.rewards.coinGecko} ETH`);
      console.log(`  - 数据库奖励: ${result.data.rewards.database} ETH`);
      console.log(`  - 固定奖励: ${result.data.rewards.fixed} ETH`);
      
      console.log('\n📈 差异对比:');
      console.log(`  - CoinGecko vs 固定: ${result.data.differences.coinGeckoVsFixed}`);
      console.log(`  - 数据库 vs 固定: ${result.data.differences.dbVsFixed}`);
      
    } else {
      console.log('❌ API调用失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('💡 请确保开发服务器正在运行 (npm run dev)');
  }
}

// 运行测试
testEthPriceAPI();
