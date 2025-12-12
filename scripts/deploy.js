const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 SupportXhsk 合约到 BSC 主网...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);

  // 检查余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "BNB");

  // 检查网络
  const network = await ethers.provider.getNetwork();
  console.log("🌐 当前网络:", network.name, "Chain ID:", network.chainId);
  
  // 注意：测试网部署时不检查链ID，主网部署时检查
  if (network.chainId !== 56n && network.chainId !== 97n) {
    console.log("⚠️ 警告：当前网络链ID:", network.chainId);
  }

  // 部署 SupportXhsk 合约
  console.log("\n📦 编译和部署 SupportXhsk 合约...");
  const SupportXhsk = await ethers.getContractFactory("contracts/SupportXhsk.sol:SupportXhsk");
  
  // 设置较低的gas价格
  const customGasPrice = 3000000000n; // 3 gwei
  
  // 估算部署费用
  const deployTransaction = await SupportXhsk.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas(deployTransaction);
  const estimatedCost = estimatedGas * customGasPrice;
  
  console.log("⛽ 预估部署费用:", ethers.formatEther(estimatedCost), "BNB");
  console.log("⛽ 使用Gas价格:", ethers.formatUnits(customGasPrice, "gwei"), "gwei");
  
  // 部署合约
  const supportXhsk = await SupportXhsk.deploy({
    gasLimit: estimatedGas * 120n / 100n, // 增加20%的gas限制作为缓冲
    gasPrice: customGasPrice
  });

  console.log("⏳ 等待交易确认...");
  await supportXhsk.waitForDeployment();

  console.log("✅ SupportXhsk 合约部署成功!");
  const contractAddress = await supportXhsk.getAddress();
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 BSCScan链接:", `https://bscscan.com/address/${contractAddress}`);

  // 验证部署
  console.log("\n🔍 验证合约部署状态...");
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("❌ 合约部署失败：合约代码为空");
  }
  console.log("✅ 合约代码验证成功");

  // 检查USDT合约地址
  const usdtAddress = await supportXhsk.USDT();
  console.log("💰 USDT合约地址:", usdtAddress);
  if (usdtAddress !== "0x55d398326f99059fF775485246999027B3197955") {
    console.warn("⚠️ 警告：USDT地址与预期不符");
  }

  // 检查管理员权限
  const owner = await supportXhsk.owner();
  const runner = await supportXhsk.runner();
  console.log("👤 合约所有者:", owner);
  console.log("🏃 运行者地址:", runner);

  // 保存部署信息
  const deploymentTx = supportXhsk.deploymentTransaction();
  const deploymentInfo = {
    contractName: "SupportXhsk",
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

  console.log("\n🎉 部署完成! 请将以下地址添加到 contracts.ts 配置文件:");
  console.log(`SUPPORT_CONTRACT: '${contractAddress}',`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 