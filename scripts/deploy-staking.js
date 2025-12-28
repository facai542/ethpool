const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 StakingContract 合约到 ETH 主网...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);

  // 检查余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");

  // 检查网络
  const network = await ethers.provider.getNetwork();
  console.log("🌐 当前网络:", network.name, "Chain ID:", network.chainId);
  
  if (network.chainId !== 1n) {
    console.log("⚠️ 警告：当前网络链ID:", network.chainId);
  }

  // USDT合约地址 (ETH主网)
  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  
  // 部署 StakingContract 合约
  console.log("\n📦 编译和部署 StakingContract 合约...");
  const StakingContract = await ethers.getContractFactory("StakingContract");
  
  // 设置较低的gas价格
  const customGasPrice = 20000000000n; // 20 gwei
  
  // 估算部署费用
  const deployTransaction = await StakingContract.getDeployTransaction(USDT_ADDRESS);
  let estimatedGas;
  try {
    estimatedGas = await ethers.provider.estimateGas(deployTransaction);
  } catch (error) {
    console.log("⚠️ Gas估算失败，使用默认值:", error.message);
    estimatedGas = 2000000n; // 使用2M gas作为默认值
  }
  const estimatedCost = estimatedGas * customGasPrice;
  
  console.log("⛽ 预估部署费用:", ethers.formatEther(estimatedCost), "ETH");
  console.log("⛽ 使用Gas价格:", ethers.formatUnits(customGasPrice, "gwei"), "gwei");
  
  // 部署合约
  const gasLimit = estimatedGas * 120n / 100n; // 增加20%的gas限制作为缓冲
  console.log("⛽ 使用Gas限制:", gasLimit.toString());
  
  const stakingContract = await StakingContract.deploy(USDT_ADDRESS, {
    gasLimit: gasLimit,
    gasPrice: customGasPrice
  });

  console.log("⏳ 等待交易确认...");
  await stakingContract.waitForDeployment();

  console.log("✅ StakingContract 合约部署成功!");
  const contractAddress = await stakingContract.getAddress();
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 Etherscan链接:", `https://etherscan.io/address/${contractAddress}`);

  // 验证部署
  console.log("\n🔍 验证合约部署状态...");
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("❌ 合约部署失败：合约代码为空");
  }
  console.log("✅ 合约代码验证成功");

  // 检查USDT合约地址
  const usdtAddress = await stakingContract.stakingToken();
  console.log("💰 USDT合约地址:", usdtAddress);
  if (usdtAddress !== USDT_ADDRESS) {
    console.warn("⚠️ 警告：USDT地址与预期不符");
  }

  // 检查管理员权限
  const owner = await stakingContract.owner();
  console.log("👤 合约所有者:", owner);

  // 保存部署信息
  const deploymentTx = stakingContract.deploymentTransaction();
  const deploymentInfo = {
    contractName: "StakingContract",
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    blockNumber: deploymentTx?.blockNumber || "pending",
    transactionHash: deploymentTx?.hash || "unknown",
    gasUsed: estimatedGas.toString(),
    deployedAt: new Date().toISOString()
  };

  console.log("\n📄 部署信息:", JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 部署完成! 请将以下地址添加到配置文件:");
  console.log(`ETH_STAKING_CONTRACT: '${contractAddress}',`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
