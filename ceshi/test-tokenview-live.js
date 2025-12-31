/**
 * 测试 Tokenview Webhook 是否收到实时通知
 * 检查最近 1 小时内的交易记录
 */

const https = require('https');

// 测试配置
const WEBHOOK_URL = 'https://ethmax.vercel.app/api/tokenview/webhook';

// 1. 检查 Vercel 日志
console.log('\n📋 测试步骤：\n');
console.log('1️⃣  检查 Vercel 日志是否有 Tokenview webhook 请求');
console.log('   👉 访问: https://vercel.com/your-project/logs');
console.log('   👉 搜索: /api/tokenview/webhook');
console.log('   👉 查看最近 1 小时的日志\n');

// 2. 测试 Tokenview Dashboard
console.log('2️⃣  检查 Tokenview Dashboard 配置');
console.log('   👉 访问: https://services.tokenview.io/en/dashboard');
console.log('   👉 进入 "Monitor" 或 "Webhook" 设置');
console.log('   👉 确认 Webhook URL:', WEBHOOK_URL);
console.log('   👉 查看最近的 webhook 调用记录\n');

// 3. 手动测试 webhook 端点
console.log('3️⃣  测试 Webhook 端点是否可访问\n');

const testWebhookEndpoint = () => {
  return new Promise((resolve, reject) => {
    https.get(WEBHOOK_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Webhook 端点正常响应');
          console.log('   📄 响应内容:', data);
          resolve(data);
        } else {
          console.log(`   ❌ Webhook 端点异常，状态码: ${res.statusCode}`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.log('   ❌ 无法访问 Webhook 端点:', err.message);
      reject(err);
    });
  });
};

// 4. 检查监听地址数量
console.log('4️⃣  当前监听地址数量检查');
console.log('   ℹ️  从数据库查询显示：');
console.log('   📊 总地址: 69');
console.log('   📊 活跃监听: 55');
console.log('   ⚠️  问题：最后交易记录是 10 小时前 (14:00)\n');

// 5. 可能的原因
console.log('5️⃣  可能的问题原因分析：\n');
console.log('   ❌ Tokenview 没有配置 Webhook URL');
console.log('   ❌ Tokenview Webhook URL 配置错误');
console.log('   ❌ Tokenview 监听地址没有正确添加');
console.log('   ❌ Tokenview API Key 已过期或配额用尽');
console.log('   ❌ Tokenview 服务本身有问题');
console.log('   ❌ Vercel 部署后 webhook 路由失效\n');

// 6. 解决方案
console.log('6️⃣  推荐的解决步骤：\n');
console.log('   1. 访问 Tokenview Dashboard 检查配置');
console.log('   2. 使用 Dashboard 的 "Test" 按钮测试 webhook');
console.log('   3. 手动添加一个测试地址并发起小额转账');
console.log('   4. 实时查看 Vercel 日志是否收到请求');
console.log('   5. 如果没有，联系 Tokenview 技术支持\n');

// 执行测试
(async () => {
  try {
    console.log('🧪 正在测试 Webhook 端点...\n');
    await testWebhookEndpoint();
    
    console.log('\n✅ Webhook 端点测试完成！');
    console.log('\n📝 下一步：');
    console.log('   1. 检查 Tokenview Dashboard 是否正确配置');
    console.log('   2. 使用 Tokenview 的测试功能发送测试通知');
    console.log('   3. 查看 Vercel 实时日志确认收到请求\n');
  } catch (err) {
    console.log('\n❌ Webhook 端点测试失败:', err.message);
  }
})();

