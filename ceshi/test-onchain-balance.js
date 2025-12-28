// 测试链上USDT余额获取
const https = require('https');

// ETH主网USDT合约地址
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

// 测试地址（一个已知有USDT余额的地址）
const TEST_ADDRESS = '0x5041ed759Dd4aFc3a72b8192C143F72f4724081A';

async function getETHBlockNumber() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    });

    const options = {
      hostname: 'ethereum.publicnode.com',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result.result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function getUSDTBalance(address, blockNumber) {
  return new Promise((resolve, reject) => {
    // 准备balanceOf调用数据
    const addressPadded = address.slice(2).padStart(64, '0');
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: USDT_CONTRACT,
          data: `0x70a08231${addressPadded}`
        },
        blockNumber
      ],
      id: 1
    });

    const options = {
      hostname: 'ethereum.publicnode.com',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result.result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testOnChainBalance() {
  try {
    console.log('🔍 测试链上USDT余额获取...');
    console.log('测试地址:', TEST_ADDRESS);
    console.log('USDT合约:', USDT_CONTRACT);
    
    // 1. 获取最新区块号
    console.log('\n1. 获取最新区块号...');
    const blockNumber = await getETHBlockNumber();
    console.log('区块号:', blockNumber);
    
    // 2. 获取USDT余额
    console.log('\n2. 获取USDT余额...');
    const balanceHex = await getUSDTBalance(TEST_ADDRESS, blockNumber);
    console.log('余额(十六进制):', balanceHex);
    
    if (balanceHex && balanceHex !== '0x') {
      // 转换十六进制为数值
      const balanceWei = BigInt(balanceHex);
      const balance = Number(balanceWei) / Math.pow(10, 6); // ETH主网USDT使用6位小数
      console.log('余额(USDT):', balance.toFixed(6));
      
      if (balance > 0) {
        console.log('✅ 链上余额获取成功！');
      } else {
        console.log('⚠️ 地址USDT余额为0');
      }
    } else {
      console.log('❌ 余额查询失败');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testOnChainBalance();

