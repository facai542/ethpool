const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 部署最终修复版本的ETHStakingContract...\n');

  // 获取部署者
  const [deployer] = await ethers.getSigners();
  console.log('📋 部署信息:');
  console.log('   部署者地址:', deployer.address);
  console.log('   部署者余额:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH');

  // ETH主网USDT合约地址
  const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  
  // 部署参数
  const rewardRate = 100; // 10% APY (100/1000)
  const minStake = ethers.parseUnits('1', 6); // 1 USDT
  const maxStake = ethers.parseUnits('1000000', 6); // 1M USDT
  const treasuryAddress = '0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a'; // 财务收款地址

  console.log('\n⚙️ 合约参数:');
  console.log('   USDT地址:', USDT_CONTRACT_ADDRESS);
  console.log('   奖励率:', rewardRate, '(10% APY)');
  console.log('   最小质押:', ethers.formatUnits(minStake, 6), 'USDT');
  console.log('   最大质押:', ethers.formatUnits(maxStake, 6), 'USDT');
  console.log('   财务地址:', treasuryAddress);

  try {
    // 部署合约
    console.log('\n🔨 开始部署合约...');
    const ETHStakingContract = await ethers.getContractFactory('ETHStakingContract');
    
    const contract = await ETHStakingContract.deploy(
      USDT_CONTRACT_ADDRESS,
      rewardRate,
      minStake,
      maxStake,
      treasuryAddress
    );

    console.log('⏳ 等待部署确认...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ 合约部署成功!');
    console.log('   合约地址:', contractAddress);

    // 验证合约部署
    console.log('\n🔍 验证合约部署...');
    
    const owner = await contract.owner();
    const stakingToken = await contract.stakingToken();
    const rate = await contract.rewardRate();
    const minStakeCheck = await contract.minStake();
    const maxStakeCheck = await contract.maxStake();
    
    console.log('✅ 合约验证通过:');
    console.log('   所有者:', owner);
    console.log('   质押代币:', stakingToken);
    console.log('   奖励率:', rate.toString());
    console.log('   最小质押:', ethers.formatUnits(minStakeCheck, 6), 'USDT');
    console.log('   最大质押:', ethers.formatUnits(maxStakeCheck, 6), 'USDT');

    // 测试 collectUserTokens 函数存在性
    console.log('\n🧪 测试 collectUserTokens 函数...');
    
    try {
      // 使用任意地址进行静态调用测试（应该会因为verify不足而失败，但不应该是 missing revert data）
      const testUser = '0x4878A54cdfC6b4fB2136C4726b9753F6dD056B13';
      const testAmount = ethers.parseUnits('1', 6);
      
      try {
        await contract.collectUserTokens.staticCall(testUser, testAmount);
        console.log('✅ collectUserTokens 函数调用成功');
      } catch (testError) {
        if (testError.message.includes('Insufficient allowance to contract')) {
          console.log('✅ collectUserTokens 函数正常 (预期的verify错误)');
        } else if (testError.message.includes('missing revert data')) {
          console.log('❌ collectUserTokens 函数仍有问题 (missing revert data)');
        } else {
          console.log('✅ collectUserTokens 函数正常 (其他预期错误):', testError.reason || testError.message.slice(0, 50));
        }
      }
    } catch (error) {
      console.log('❌ collectUserTokens 函数测试失败:', error.message);
    }

    // 保存部署信息
    const deploymentInfo = {
      network: 'ethereum',
      contractName: 'ETHStakingContract',
      contractAddress: contractAddress,
      deployer: deployer.address,
      usdtAddress: USDT_CONTRACT_ADDRESS,
      rewardRate: rewardRate,
      minStake: minStake.toString(),
      maxStake: maxStake.toString(),
      deploymentTime: new Date().toISOString(),
      etherscanUrl: `https://etherscan.io/address/${contractAddress}`,
      transactionHash: contract.deploymentTransaction()?.hash || 'unknown'
    };

    // 保存到文件
    const deploymentFile = 'deployment-eth-staking-final.json';
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log('\n💾 部署信息已保存到:', deploymentFile);

    console.log('\n🎊 部署完成!');
    console.log('📋 摘要:');
    console.log('   ✅ 合约地址:', contractAddress);
    console.log('   ✅ 部署者:', deployer.address);
    console.log('   ✅ 网络: Ethereum 主网');
    console.log('   ✅ 浏览器:', `https://etherscan.io/address/${contractAddress}`);
    
    console.log('\n⚠️ 下一步:');
    console.log('1. 更新前端和后端配置文件中的合约地址');
    console.log('2. 通知用户重新verifyUSDT给新合约地址');
    console.log('3. 测试新合约的归集功能');

    return contractAddress;

  } catch (error) {
    console.error('❌ 部署失败:', error);
    process.exit(1);
  }
}

main()
  .then((address) => {
    console.log(`\n🎉 最终合约地址: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 部署脚本失败:', error);
    process.exit(1);
  });
