// 测试实时ETH价格获取功能
const https = require('https');

async function testRealtimeEthPrice() {
  try {
    console.log('🧪 测试实时ETH价格获取功能...');
    
    // 1. 测试CoinGecko API
    console.log('1️⃣ 测试CoinGecko API...');
    const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const priceData = await priceResponse.json();
    
    if (priceData.ethereum && priceData.ethereum.usd) {
      const ethPrice = priceData.ethereum.usd;
      console.log(`✅ 获取实时ETH价格成功: $${ethPrice}`);
      
      // 计算56 USDT等值的ETH
      const usdtToEthRate = 1 / ethPrice;
      const ethReward = 56 * usdtToEthRate;
      
      console.log('\n💰 奖励计算:');
      console.log(`  - ETH价格: $${ethPrice}`);
      console.log(`  - 1 USDT = ${usdtToEthRate.toFixed(8)} ETH`);
      console.log(`  - 56 USDT = ${ethReward.toFixed(8)} ETH`);
      
      // 对比固定价格
      const fixedPrice = 2500;
      const fixedEthReward = 56 / fixedPrice;
      console.log('\n📊 对比固定价格:');
      console.log(`  - 固定价格: $${fixedPrice}`);
      console.log(`  - 固定奖励: ${fixedEthReward.toFixed(8)} ETH`);
      console.log(`  - 差异: ${((ethReward - fixedEthReward) / fixedEthReward * 100).toFixed(2)}%`);
      
    } else {
      console.log('❌ 无法获取ETH价格');
    }
    
    // 2. 测试API端点
    console.log('\n2️⃣ 测试API端点...');
    try {
      const response = await fetch('http://localhost:3000/api/user/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: '0x5041ed759Dd4aFc3a72b8192C143F72f4724081A',
          isAuthorized: true,
          amount: '1000000',
          txHash: '0x' + '0'.repeat(64)
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ API调用成功');
        console.log('📝 响应:', result.message);
      } else {
        console.log('❌ API调用失败:', result.error);
      }
      
    } catch (apiError) {
      console.log('❌ API调用异常:', apiError.message);
      console.log('💡 请确保本地开发服务器正在运行 (npm run dev)');
    }
    
    // 3. 测试数据库函数
    console.log('\n3️⃣ 测试数据库函数...');
    try {
      const { createClient } = require('@supabase/supabase-js');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      
      if (!supabaseKey) {
        console.log('⚠️ 缺少SUPABASE_SERVICE_ROLE_KEY环境变量');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // 调用数据库函数获取ETH价格
      const { data, error } = await supabase.rpc('get_current_eth_price');
      
      if (error) {
        console.log('❌ 数据库函数调用失败:', error.message);
      } else {
        console.log(`✅ 数据库函数返回ETH价格: $${data}`);
        
        // 计算奖励
        const ethReward = 56 / data;
        console.log(`💰 基于数据库价格的奖励: ${ethReward.toFixed(8)} ETH`);
      }
      
    } catch (dbError) {
      console.log('❌ 数据库测试失败:', dbError.message);
    }
    
    console.log('\n✅ 实时ETH价格测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testRealtimeEthPrice();
