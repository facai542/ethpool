/**
 * 批量同步数据库中的监听地址到 Tokenview
 */

const https = require('https');

const TOKENVIEW_API_KEY = 'fSpkcrSkEMrMOxY65gr0';
const COIN = 'eth';

// 从数据库获取的最近 5 个需要监听的地址
const ADDRESSES_TO_ADD = [
  '0x53E11C36D67a50Dda49147a0F548A49794126F46',
  '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141',
  '0xC41F066F91aBC6F266316B5E38D299c506DA2CcA',
  '0x18646Ab43d5c5E9333348Affd977103541B0BeBB',
  '0x8aA253b75EC226CfCffE92809061060D9e3DB6c4'
];

// 添加单个地址到 Tokenview
function addAddressToTokenview(address) {
  return new Promise((resolve, reject) => {
    const lowerAddress = address.toLowerCase();
    const url = `https://services.tokenview.io/vipapi/monitor/address/add/${COIN}/${lowerAddress}?apikey=${TOKENVIEW_API_KEY}`;
    
    console.log(`📤 添加地址: ${lowerAddress}`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.code === 1 && result.msg === 'success') {
            console.log(`   ✅ 成功添加: ${lowerAddress}`);
            resolve({ success: true, address: lowerAddress });
          } else if (result.code === 50045) {
            // 地址已存在
            console.log(`   ℹ️  已存在: ${lowerAddress}`);
            resolve({ success: true, address: lowerAddress, existing: true });
          } else if (result.code === 50046) {
            // 达到监听地址上限
            console.log(`   ⚠️  达到上限: ${result.msg}`);
            resolve({ success: false, address: lowerAddress, limit: true, message: result.msg });
          } else {
            console.log(`   ❌ 添加失败: ${result.msg || result.message}`);
            resolve({ success: false, address: lowerAddress, message: result.msg });
          }
        } catch (err) {
          console.log(`   ❌ JSON 解析失败: ${data}`);
          reject(err);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ 网络错误: ${err.message}`);
      reject(err);
    });
  });
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主函数
(async () => {
  console.log('🔄 开始批量同步地址到 Tokenview\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📊 待添加地址数量: ${ADDRESSES_TO_ADD.length}\n`);
  
  const results = {
    success: [],
    existing: [],
    failed: [],
    limit: false
  };
  
  for (let i = 0; i < ADDRESSES_TO_ADD.length; i++) {
    const address = ADDRESSES_TO_ADD[i];
    
    try {
      const result = await addAddressToTokenview(address);
      
      if (result.limit) {
        results.limit = true;
        results.failed.push(address);
        console.log('\n⚠️  达到 Tokenview 监听地址上限！');
        break;
      } else if (result.existing) {
        results.existing.push(address);
      } else if (result.success) {
        results.success.push(address);
      } else {
        results.failed.push(address);
      }
      
      // 避免 API 限流，每次请求间隔 500ms
      if (i < ADDRESSES_TO_ADD.length - 1) {
        await delay(500);
      }
    } catch (err) {
      console.log(`   ❌ 处理异常: ${err.message}`);
      results.failed.push(address);
    }
    
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 同步结果汇总:\n');
  console.log(`   ✅ 成功添加: ${results.success.length} 个`);
  console.log(`   ℹ️  已存在: ${results.existing.length} 个`);
  console.log(`   ❌ 添加失败: ${results.failed.length} 个`);
  
  if (results.limit) {
    console.log('\n⚠️  重要提示：');
    console.log('   Tokenview 免费计划可能有监听地址数量限制');
    console.log('   当前可能只能监听 6-10 个地址');
    console.log('   如需监听更多地址，请考虑：');
    console.log('   1. 升级 Tokenview 付费计划');
    console.log('   2. 使用 Moralis Streams 作为替代方案');
    console.log('   3. 优先监听活跃用户的地址\n');
  }
  
  console.log('\n💡 建议：');
  console.log('   1. 在 Vercel 环境变量中配置 TOKENVIEW_API_KEY');
  console.log('   2. 确保 addAddressToTokenview 函数在授权时被调用');
  console.log('   3. 实施地址优先级策略（如只监听近期活跃的地址）\n');
  
})();

