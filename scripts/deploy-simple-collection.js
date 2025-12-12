const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 开始部署 SimpleCollectionContract...");

  // 使用环境变量中的私钥
  const privateKey = process.env.ADMIN_PRIVATE_KEY || 'd41c083bf7923a6bc472d6ea2bc5b6e5a850d3ccae222dcc4efa33ff83697da2';
  const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("📝 部署账户:", wallet.address);

  // 检查余额
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");

  // 检查网络
  const network = await provider.getNetwork();
  console.log("🌐 当前网络:", network.name, "Chain ID:", network.chainId);

  // 部署参数
  const TOKEN_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // ETH USDT 合约地址

  console.log("\n📋 部署参数:");
  console.log("  代币地址:", TOKEN_ADDRESS);

  // 部署 SimpleCollectionContract
  console.log("\n📦 编译和部署 SimpleCollectionContract...");
  const SimpleCollectionContract = await ethers.getContractFactory("SimpleCollectionContract");
  
  // 设置较低的gas价格
  const customGasPrice = ethers.parseUnits('20', 'gwei'); // 20 gwei
  
  // 估算部署费用
  const deployTransaction = await SimpleCollectionContract.getDeployTransaction(TOKEN_ADDRESS);
  
  const estimatedGas = await provider.estimateGas(deployTransaction);
  const estimatedCost = estimatedGas * customGasPrice;
  
  console.log("⛽ 预估部署费用:", ethers.formatEther(estimatedCost), "ETH");
  console.log("⛽ 使用Gas价格:", ethers.formatUnits(customGasPrice, "gwei"), "gwei");
  
  // 部署合约
  const collectionContract = await SimpleCollectionContract.deploy(TOKEN_ADDRESS, {
    gasLimit: estimatedGas * 120n / 100n, // 增加20%的gas限制作为缓冲
    gasPrice: customGasPrice
  });

  console.log("⏳ 等待交易确认...");
  await collectionContract.waitForDeployment();

  console.log("✅ SimpleCollectionContract部署成功!");
  const contractAddress = await collectionContract.getAddress();
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 区块链浏览器链接:", `https://etherscan.io/address/${contractAddress}`);

  // 验证部署
  console.log("\n🔍 验证合约部署状态...");
  const code = await provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("❌ 合约部署失败：合约代码为空");
  }
  console.log("✅ 合约代码验证成功");

  // 验证合约参数
  console.log("\n🔍 验证合约参数...");
  const token = await collectionContract.token();
  const owner = await collectionContract.owner();

  console.log("💰 代币地址:", token);
  console.log("👤 合约所有者:", owner);

  // 保存部署信息
  const deploymentTx = collectionContract.deploymentTransaction();
  const deploymentInfo = {
    contractName: "SimpleCollectionContract",
    contractAddress: contractAddress,
    deployer: wallet.address,
    network: network.name,
    chainId: network.chainId.toString(),
    blockNumber: deploymentTx?.blockNumber || "pending",
    transactionHash: deploymentTx?.hash || "unknown",
    gasUsed: estimatedGas.toString(),
    gasPrice: ethers.formatUnits(customGasPrice, "gwei"),
    deployedAt: new Date().toISOString(),
    parameters: {
      token: TOKEN_ADDRESS
    }
  };

  // 保存到文件
  const deploymentDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const fileName = `simple-collection-${network.chainId}-${Date.now()}.json`;
  const filePath = path.join(deploymentDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 部署信息已保存到:", filePath);
  console.log("\n📄 部署信息:", JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 部署完成! 请将以下地址添加到配置文件中:");
  console.log(`COLLECTION_CONTRACT: '${contractAddress}',`);
  console.log(`USDT_CONTRACT: '${TOKEN_ADDRESS}',`);

  // 生成验证命令
  console.log("\n🔍 合约验证命令:");
  console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${TOKEN_ADDRESS}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
