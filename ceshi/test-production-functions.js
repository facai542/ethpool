const https = require('https');

// 测试生产环境功能
const testUrl = 'https://ethmax.vercel.app';

console.log('🚀 测试生产环境功能...');
console.log(`URL: ${testUrl}`);

// 测试授权API
const testAuthorize = async () => {
  console.log('\n🔧 测试授权API...');
  
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40);
  
  const postData = JSON.stringify({
    address: testAddress,
    isAuthorized: true
  });

  const options = {
    hostname: 'ethmax.vercel.app',
    port: 443,
    path: '/api/user/authorize',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`授权API状态: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('授权API响应:', result);
          
          if (res.statusCode === 200) {
            console.log('✅ 授权API工作正常');
            if (result.success && result.data && result.data.eth > 0) {
              console.log('✅ ETH奖励发放成功:', result.data.eth);
            } else {
              console.log('❌ ETH奖励未发放');
            }
          } else {
            console.log('❌ 授权API返回错误');
          }
        } catch (e) {
          console.log('❌ 授权API响应解析失败:', e.message);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log('❌ 授权API请求失败:', e.message);
      resolve();
    });

    req.write(postData);
    req.end();
  });
};

// 测试Telegram通知API
const testTelegramNotification = async () => {
  console.log('\n📱 测试Telegram通知API...');
  
  const options = {
    hostname: 'ethmax.vercel.app',
    port: 443,
    path: '/api/test/telegram-notification?type=authorize&address=0x1234567890123456789012345678901234567890',
    method: 'GET'
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`Telegram通知API状态: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Telegram通知API响应:', result);
          
          if (res.statusCode === 200) {
            console.log('✅ Telegram通知API工作正常');
          } else {
            console.log('❌ Telegram通知API返回错误');
          }
        } catch (e) {
          console.log('❌ Telegram通知API响应解析失败:', e.message);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log('❌ Telegram通知API请求失败:', e.message);
      resolve();
    });

    req.end();
  });
};

// 测试ETH价格API
const testEthPrice = async () => {
  console.log('\n💰 测试ETH价格API...');
  
  const options = {
    hostname: 'ethmax.vercel.app',
    port: 443,
    path: '/api/test/eth-price',
    method: 'GET'
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`ETH价格API状态: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('ETH价格API响应:', result);
          
          if (res.statusCode === 200) {
            console.log('✅ ETH价格API工作正常');
          } else {
            console.log('❌ ETH价格API返回错误');
          }
        } catch (e) {
          console.log('❌ ETH价格API响应解析失败:', e.message);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log('❌ ETH价格API请求失败:', e.message);
      resolve();
    });

    req.end();
  });
};

// 运行所有测试
const runTests = async () => {
  await testEthPrice();
  await testTelegramNotification();
  await testAuthorize();
  
  console.log('\n📊 测试完成！');
};

runTests().catch(console.error);












