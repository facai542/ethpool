const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 开始部署 ETH质押合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);

  // 检查余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");

  // 检查网络
  const network = await ethers.provider.getNetwork();
  console.log("🌐 当前网络:", network.name, "Chain ID:", network.chainId);

  // 部署参数
  const STAKING_TOKEN = process.env.STAKING_TOKEN_ADDRESS || "0x55d398326f99059fF775485246999027B3197955"; // USDT on BSC
  const REWARD_RATE = process.env.REWARD_RATE || 100; // 1% daily (100 basis points)
  const MIN_STAKE_AMOUNT = process.env.MIN_STAKE_AMOUNT || "10"; // 10 tokens
  const MAX_STAKE_AMOUNT = process.env.MAX_STAKE_AMOUNT || "10000"; // 10000 tokens

  console.log("\n📋 部署参数:");
  console.log("  质押代币地址:", STAKING_TOKEN);
  console.log("  奖励率:", REWARD_RATE, "基点 (", REWARD_RATE/100, "% 每日)");
  console.log("  最小质押数量:", MIN_STAKE_AMOUNT);
  console.log("  最大质押数量:", MAX_STAKE_AMOUNT);

  // 部署 ETHStakingContract
  console.log("\n📦 编译和部署 ETHStakingContract...");
  const ETHStakingContract = await ethers.getContractFactory("ETHStakingContract");
  
  // 设置较低的gas价格
  const customGasPrice = process.env.GAS_PRICE ? 
    ethers.parseUnits(process.env.GAS_PRICE, 'gwei') : 
    3000000000n; // 3 gwei
  
  // 估算部署费用
  const deployTransaction = await ETHStakingContract.getDeployTransaction(
    STAKING_TOKEN,
    REWARD_RATE,
    ethers.parseUnits(MIN_STAKE_AMOUNT, 18),
    ethers.parseUnits(MAX_STAKE_AMOUNT, 18)
  );
  
  const estimatedGas = await ethers.provider.estimateGas(deployTransaction);
  const estimatedCost = estimatedGas * customGasPrice;
  
  console.log("⛽ 预估部署费用:", ethers.formatEther(estimatedCost), "ETH");
  console.log("⛽ 使用Gas价格:", ethers.formatUnits(customGasPrice, "gwei"), "gwei");
  
  // 部署合约
  const stakingContract = await ETHStakingContract.deploy(
    STAKING_TOKEN,
    REWARD_RATE,
    ethers.parseUnits(MIN_STAKE_AMOUNT, 18),
    ethers.parseUnits(MAX_STAKE_AMOUNT, 18),
    {
      gasLimit: estimatedGas * 120n / 100n, // 增加20%的gas限制作为缓冲
      gasPrice: customGasPrice
    }
  );

  console.log("⏳ 等待交易确认...");
  await stakingContract.waitForDeployment();

  console.log("✅ ETH质押合约部署成功!");
  const contractAddress = await stakingContract.getAddress();
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 区块链浏览器链接:", `https://bscscan.com/address/${contractAddress}`);

  // 验证部署
  console.log("\n🔍 验证合约部署状态...");
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("❌ 合约部署失败：合约代码为空");
  }
  console.log("✅ 合约代码验证成功");

  // 验证合约参数
  console.log("\n🔍 验证合约参数...");
  const stakingToken = await stakingContract.stakingToken();
  const rewardRate = await stakingContract.rewardRate();
  const minStakeAmount = await stakingContract.minStakeAmount();
  const maxStakeAmount = await stakingContract.maxStakeAmount();
  const owner = await stakingContract.owner();

  console.log("💰 质押代币地址:", stakingToken);
  console.log("📊 奖励率:", rewardRate.toString(), "基点");
  console.log("📉 最小质押数量:", ethers.formatEther(minStakeAmount));
  console.log("📈 最大质押数量:", ethers.formatEther(maxStakeAmount));
  console.log("👤 合约所有者:", owner);

  // 保存部署信息
  const deploymentTx = stakingContract.deploymentTransaction();
  const deploymentInfo = {
    contractName: "ETHStakingContract",
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    blockNumber: deploymentTx?.blockNumber || "pending",
    transactionHash: deploymentTx?.hash || "unknown",
    gasUsed: estimatedGas.toString(),
    gasPrice: ethers.formatUnits(customGasPrice, "gwei"),
    deployedAt: new Date().toISOString(),
    parameters: {
      stakingToken: STAKING_TOKEN,
      rewardRate: REWARD_RATE,
      minStakeAmount: MIN_STAKE_AMOUNT,
      maxStakeAmount: MAX_STAKE_AMOUNT
    }
  };

  // 保存到文件
  const deploymentDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const fileName = `eth-staking-${network.chainId}-${Date.now()}.json`;
  const filePath = path.join(deploymentDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 部署信息已保存到:", filePath);
  console.log("\n📄 部署信息:", JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 部署完成! 请将以下地址添加到配置文件中:");
  console.log(`STAKING_CONTRACT: '${contractAddress}',`);
  console.log(`STAKING_TOKEN: '${STAKING_TOKEN}',`);

  // 生成验证命令
  console.log("\n🔍 合约验证命令:");
  console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${STAKING_TOKEN}" ${REWARD_RATE} "${ethers.parseUnits(MIN_STAKE_AMOUNT, 18)}" "${ethers.parseUnits(MAX_STAKE_AMOUNT, 18)}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });

