/**
 * 手动触发 Tokenview 地址清理
 * 用于测试和紧急清理
 */

const https = require('https');

const API_URL = 'https://ethmax.vercel.app/api/cron/cleanup-tokenview';
const CRON_SECRET = process.env.CRON_SECRET || 'default-secret-change-me';

console.log('🧹 手动触发 Tokenview 地址清理...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const options = {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(API_URL, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📡 响应状态: ${res.statusCode}\n`);
    
    try {
      const result = JSON.parse(data);
      
      if (result.success) {
        console.log('✅ 清理成功！\n');
        console.log('📊 统计信息：');
        console.log(`   - 总地址数: ${result.stats.total}`);
        console.log(`   - 活跃地址: ${result.stats.active}`);
        console.log(`   - 已移除: ${result.stats.removed}`);
        console.log(`   - 时间: ${result.stats.timestamp}\n`);
      } else {
        console.log('❌ 清理失败:', result.error, '\n');
      }
    } catch (err) {
      console.log('📄 响应内容:', data, '\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});

req.on('error', (err) => {
  console.error('❌ 请求失败:', err.message, '\n');
});

req.end();

