const { ethers } = require('ethers');

// 创建一个随机钱包并获取其地址
const wallet = ethers.Wallet.createRandom();
console.log('有效的测试地址:', wallet.address);
console.log('验证结果:', ethers.isAddress(wallet.address));


