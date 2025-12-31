const https = require('https');

// 测试特定用户的奖励状态
const testUrl = 'https://ethmax.vercel.app';

console.log('🔍 测试特定用户奖励状态...');

// 测试授权API并检查奖励状态
const testUserReward = async () => {
  console.log('\n🔧 测试用户授权和奖励...');
  
  // 使用一个固定的测试地址
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
          console.log('授权API响应:', JSON.stringify(result, null, 2));
          
          if (res.statusCode === 200) {
            console.log('✅ 授权API工作正常');
            
            // 检查是否有ETH奖励
            if (result.data && result.data.eth !== undefined) {
              console.log(`💰 ETH余额: ${result.data.eth}`);
              if (result.data.eth > 0) {
                console.log('✅ ETH奖励已发放');
              } else {
                console.log('❌ ETH奖励未发放');
              }
            } else {
              console.log('❌ 响应中没有ETH字段');
            }
            
            // 检查用户ID
            if (result.data && result.data.userId) {
              console.log(`👤 用户ID: ${result.data.userId}`);
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

// 测试用户信息API
const testUserInfo = async (address) => {
  console.log('\n👤 测试用户信息API...');
  
  const options = {
    hostname: 'ethmax.vercel.app',
    port: 443,
    path: `/api/user/info?address=${address}`,
    method: 'GET'
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`用户信息API状态: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('用户信息API响应:', JSON.stringify(result, null, 2));
          
          if (res.statusCode === 200) {
            console.log('✅ 用户信息API工作正常');
            
            if (result.data && result.data.eth !== undefined) {
              console.log(`💰 ETH余额: ${result.data.eth}`);
              if (result.data.eth > 0) {
                console.log('✅ 用户有ETH余额');
              } else {
                console.log('❌ 用户ETH余额为0');
              }
            }
          } else {
            console.log('❌ 用户信息API返回错误');
          }
        } catch (e) {
          console.log('❌ 用户信息API响应解析失败:', e.message);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log('❌ 用户信息API请求失败:', e.message);
      resolve();
    });

    req.end();
  });
};

// 运行测试
const runTests = async () => {
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40);
  console.log(`测试地址: ${testAddress}`);
  
  await testUserReward();
  await testUserInfo(testAddress);
  
  console.log('\n📊 测试完成！');
};

runTests().catch(console.error);












