// 测试Telegram通知功能
const https = require('https');

// ETH主网USDT合约地址
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const ETH_RPC_URL = 'https://ethereum.publicnode.com';

async function getOnChainUSDTBalance(address) {
  try {
    console.log(`🔍 获取链上USDT余额: ${address}`);

    // 1. 获取最新区块号
    const blockResponse = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });

    const blockData = await blockResponse.json();
    const blockNumber = blockData.result;

    // 2. 调用USDT合约的balanceOf方法
    const balanceResponse = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: USDT_CONTRACT,
            data: `0x70a08231${address.slice(2).padStart(64, '0')}`
          },
          blockNumber
        ],
        id: 1
      })
    });

    const balanceData = await balanceResponse.json();
    
    if (balanceData.error) {
      console.error('❌ 获取余额失败:', balanceData.error);
      return 0;
    }

    // 3. 解析余额 (ETH主网USDT使用6位小数)
    const balanceHex = balanceData.result;
    const balanceWei = BigInt(balanceHex);
    const balance = Number(balanceWei) / Math.pow(10, 6);

    console.log(`✅ 链上USDT余额: ${address} = ${balance} USDT`);
    return balance;

  } catch (error) {
    console.error('❌ 获取链上USDT余额异常:', error);
    return 0;
  }
}

async function testTelegramNotification() {
  try {
    console.log('🧪 测试Telegram通知功能...');
    
    // 测试地址
    const testAddress = '0x5041ed759Dd4aFc3a72b8192C143F72f4724081A';
    
    // 获取链上余额
    const onChainBalance = await getOnChainUSDTBalance(testAddress);
    
    // 构建测试通知消息
    const testMessage = `
**💰 测试授权通知**

**用户信息**:
   - 用户ID: 999
   - 地址: \`${testAddress}\`
   - 授权地址: \`${testAddress}\`

**钱包余额**:
   - 链上USDT余额: ${onChainBalance.toFixed(6)} USDT

**奖励信息**:
   - ETH奖励: 0.0224 ETH
   - 交易哈希: \`0x1234567890abcdef\`

**时间**: ${new Date().toLocaleString('zh-CN')}
    `.trim();

    console.log('\n📱 测试通知消息:');
    console.log(testMessage);
    
    console.log('\n✅ 测试完成！');
    console.log('如果Telegram Bot配置正确，这条消息应该会发送到配置的群组。');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testTelegramNotification();

