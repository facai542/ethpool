const { ethers } = require('ethers');

// USDT合约地址和ABI
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const ETH_RPC_URL = 'https://ethereum.publicnode.com';

// USDT合约ABI（只需要balanceOf函数）
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];

async function getRealChainBalance(address) {
  try {
    console.log(`🔍 查询地址: ${address}`);
    
    // 连接以太坊网络
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    
    // 创建USDT合约实例
    const usdtContract = new ethers.Contract(USDT_CONTRACT, USDT_ABI, provider);
    
    // 查询USDT余额
    const balance = await usdtContract.balanceOf(address);
    
    // USDT使用6位小数
    const usdtBalance = ethers.formatUnits(balance, 6);
    
    // 查询ETH余额
    const ethBalance = await provider.getBalance(address);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);
    
    console.log(`\n📊 链上真实余额:`);
    console.log(`📍 地址: ${address}`);
    console.log(`💰 USDT余额: ${parseFloat(usdtBalance).toFixed(6)} USDT`);
    console.log(`⛽ ETH余额: ${parseFloat(ethBalanceFormatted).toFixed(6)} ETH`);
    
    return {
      address: address,
      usdtBalance: parseFloat(usdtBalance).toFixed(6),
      ethBalance: parseFloat(ethBalanceFormatted).toFixed(6),
      usdtBalanceRaw: balance.toString(),
      ethBalanceRaw: ethBalance.toString()
    };
    
  } catch (error) {
    console.error(`❌ 查询链上余额失败:`, error.message);
    return null;
  }
}

// 主函数
async function main() {
  const address = '0xbDa6620688a7B3D574FF7C234090Dc2e51Fc7077';
  
  console.log('🚀 开始查询链上真实余额...\n');
  
  const result = await getRealChainBalance(address);
  
  if (result) {
    console.log('\n✅ 查询完成!');
    console.log(`\n📋 对比数据:`);
    console.log(`数据库USDT: 52.924997876800006 USDT`);
    console.log(`链上USDT:   ${result.usdtBalance} USDT`);
    console.log(`数据库ETH:  0.0000006572703064831875 ETH`);
    console.log(`链上ETH:    ${result.ethBalance} ETH`);
  } else {
    console.log('\n❌ 查询失败!');
  }
}

// 运行脚本
main().catch(console.error);