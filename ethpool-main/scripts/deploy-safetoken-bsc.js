const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 SafeToken 合约到 BSC 主网...");

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

  // 设置代币参数
  const name = "Safe Token";
  const symbol = "SAFE";
  const decimals = 18;
  const initialSupply = 1000000; // 100万代币
  const initialHolder = "0x0000000000000000000000000000000000000000"; // 零地址表示部署者
  
  // 部署 SafeToken 合约
  console.log("\n📦 编译和部署 SafeToken 合约...");
  const SafeToken = await ethers.getContractFactory("contracts/SafeToken.sol:SafeToken");
  
  // 设置较低的gas价格
  const customGasPrice = 3000000000n; // 3 gwei
  
  // 估算部署费用
  const deployTransaction = await SafeToken.getDeployTransaction(
    name,
    symbol,
    decimals,
    initialSupply,
    initialHolder
  );
  const estimatedGas = await ethers.provider.estimateGas(deployTransaction);
  const estimatedCost = estimatedGas * customGasPrice;
  
  console.log("⛽ 预估部署费用:", ethers.formatEther(estimatedCost), "BNB");
  console.log("⛽ 使用Gas价格:", ethers.formatUnits(customGasPrice, "gwei"), "gwei");
  
  // 部署合约
  const safeToken = await SafeToken.deploy(
    name,
    symbol,
    decimals,
    initialSupply,
    initialHolder,
    {
      gasLimit: estimatedGas * 120n / 100n, // 增加20%的gas限制作为缓冲
      gasPrice: customGasPrice
    }
  );

  console.log("⏳ 等待交易确认...");
  await safeToken.waitForDeployment();

  console.log("✅ SafeToken 合约部署成功!");
  const contractAddress = await safeToken.getAddress();
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 BSCScan链接:", `https://bscscan.com/address/${contractAddress}`);

  // 验证部署
  console.log("\n🔍 验证合约部署状态...");
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("❌ 合约部署失败：合约代码为空");
  }
  console.log("✅ 合约代码验证成功");

  // 检查代币信息
  console.log("\n📊 代币信息:");
  console.log("📝 名称:", await safeToken.name());
  console.log("🔣 符号:", await safeToken.symbol());
  console.log("🔢 小数位:", await safeToken.decimals());
  console.log("💰 总供应量:", ethers.formatUnits(await safeToken.totalSupply(), decimals));
  
  // 检查所有者权限
  const owner = await safeToken.owner();
  console.log("👤 合约所有者:", owner);

  // 保存部署信息
  const deploymentTx = safeToken.deploymentTransaction();
  const deploymentInfo = {
    contractName: "SafeToken",
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    blockNumber: deploymentTx?.blockNumber || "pending",
    transactionHash: deploymentTx?.hash || "unknown",
    gasUsed: estimatedGas.toString(),
    deployedAt: new Date().toISOString(),
    tokenInfo: {
      name,
      symbol,
      decimals,
      initialSupply
    }
  };

  console.log("\n📄 部署信息:", JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🔍 验证合约命令:");
  console.log(`npx hardhat verify --network bsc ${contractAddress} "${name}" "${symbol}" ${decimals} ${initialSupply} ${initialHolder || deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 