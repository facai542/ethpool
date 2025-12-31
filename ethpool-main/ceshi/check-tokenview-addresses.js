/**
 * 检查 Tokenview 实际监听的地址
 */

const https = require('https');

const TOKENVIEW_API_KEY = 'fSpkcrSkEMrMOxY65gr0'; // 从用户之前提供的密钥
const COIN = 'eth'; // ETH 主网

// 获取 Tokenview 监听的地址列表
function getTokenviewAddresses(page = 1) {
  return new Promise((resolve, reject) => {
    const url = `https://services.tokenview.io/vipapi/monitor/address/list/${COIN}?page=${page}&apikey=${TOKENVIEW_API_KEY}`;
    
    console.log(`📡 正在查询 Tokenview 监听地址（第 ${page} 页）...`);
    console.log(`🔗 API URL: ${url}\n`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (err) {
          reject(new Error(`JSON 解析失败: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 主函数
(async () => {
  try {
    console.log('🔍 开始检查 Tokenview 监听地址配置\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const result = await getTokenviewAddresses(1);
    
    console.log('📊 Tokenview API 响应:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (result.code === 1) {
      // 成功
      const addresses = result.data || [];
      console.log(`✅ Tokenview 当前监听 ${addresses.length} 个地址\n`);
      
      if (addresses.length > 0) {
        console.log('📋 监听地址列表：\n');
        addresses.forEach((addr, index) => {
          console.log(`   ${index + 1}. ${addr}`);
        });
        console.log('\n');
      } else {
        console.log('⚠️  警告：Tokenview 没有监听任何地址！\n');
        console.log('❌ 这就是为什么没有收到交易通知的原因！\n');
      }
    } else {
      console.log(`❌ Tokenview API 返回错误：${result.msg || result.message || '未知错误'}\n`);
      
      // 可能的错误原因
      if (result.code === -1) {
        console.log('💡 可能原因：');
        console.log('   1. API Key 无效或已过期');
        console.log('   2. API 配额已用尽');
        console.log('   3. 需要升级到付费计划\n');
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔧 解决方案：\n');
    console.log('   1. 访问 Tokenview Dashboard:');
    console.log('      https://services.tokenview.io/en/dashboard\n');
    console.log('   2. 检查 "Monitor" 设置页面\n');
    console.log('   3. 确保已添加需要监听的地址\n');
    console.log('   4. 检查 Webhook URL 是否正确配置：');
    console.log('      https://ethmax.vercel.app/api/tokenview/webhook\n');
    console.log('   5. 使用 "Test" 功能发送测试通知\n');
    
  } catch (err) {
    console.log('❌ 查询失败:', err.message);
    console.log('\n💡 建议：');
    console.log('   1. 检查网络连接');
    console.log('   2. 确认 API Key 是否正确');
    console.log('   3. 访问 Tokenview Dashboard 手动检查\n');
  }
})();

