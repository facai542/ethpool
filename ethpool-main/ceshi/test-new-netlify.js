const https = require('https');

// 测试新的Netlify部署
const testUrl = 'https://fantastic-pithivier-9971ca.netlify.app';

console.log('🚀 测试新的Netlify部署...');
console.log(`URL: ${testUrl}`);

// 测试主页
console.log('\n📄 测试主页...');
https.get(`${testUrl}/`, (res) => {
  console.log(`主页状态: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✅ 主页加载成功');
  } else {
    console.log('❌ 主页加载失败');
  }
}).on('error', (err) => {
  console.log(`❌ 主页错误: ${err.message}`);
});

// 测试API端点
const testApi = (endpoint, name) => {
  console.log(`\n🔧 测试${name}...`);
  https.get(`${testUrl}${endpoint}`, (res) => {
    console.log(`${name}状态: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log(`✅ ${name}工作正常`);
    } else if (res.statusCode === 502) {
      console.log(`❌ ${name}返回502错误 - 可能是环境变量问题`);
    } else {
      console.log(`❌ ${name}返回错误状态: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.log(`❌ ${name}错误: ${err.message}`);
  });
};

// 测试各个API端点
testApi('/api/test/eth-price', 'ETH价格API');
testApi('/api/user/info', '用户信息API');
testApi('/api/blockchain/usdt-balance', 'USDT余额API');
testApi('/api/user/authorize', '授权API');

// 测试调试页面
console.log('\n🔍 测试调试页面...');
https.get(`${testUrl}/debug-static`, (res) => {
  console.log(`调试页面状态: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✅ 调试页面加载成功');
  } else {
    console.log('❌ 调试页面加载失败');
  }
}).on('error', (err) => {
  console.log(`❌ 调试页面错误: ${err.message}`);
});

console.log('\n📊 测试完成！');












