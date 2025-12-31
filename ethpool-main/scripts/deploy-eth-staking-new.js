const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 开始部署ETH质押合约...");

  // 使用环境变量中的私钥创建钱包
  const privateKey = process.env.PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY || "d41c083bf7923a6bc472d6ea2bc5b6e5a850d3ccae222dcc4efa33ff83697da2";
  console.log("🔑 使用私钥:", privateKey.substring(0, 10) + "...");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL || "https://eth.llamarpc.com");
  const deployer = new ethers.Wallet(privateKey, provider);
  
  console.log("📝 部署者地址:", deployer.address);

  // 检查部署者余额
  const balance = await provider.getBalance(deployer.address);
  console.log("💰 部署者ETH余额:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("❌ 部署者ETH余额不足，至少需要0.01 ETH");
  }

  // USDT合约地址 (ETH主网)
  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  
  // 合约参数
  const REWARD_RATE = 100; // 1% 每日奖励率 (100基点)
  const MIN_STAKE = ethers.parseUnits("1", 6); // 1 USDT (6位小数)
  const MAX_STAKE = ethers.parseUnits("1000000", 6); // 1,000,000 USDT

  console.log("📋 合约参数:");
  console.log("  USDT地址:", USDT_ADDRESS);
  console.log("  奖励率:", REWARD_RATE, "基点 (1%)");
  console.log("  最小质押:", ethers.formatUnits(MIN_STAKE, 6), "USDT");
  console.log("  最大质押:", ethers.formatUnits(MAX_STAKE, 6), "USDT");

  // 部署合约
  console.log("⏳ 正在部署合约...");
  const ETHStakingContract = await ethers.getContractFactory("ETHStakingContract", deployer);
  
  const stakingContract = await ETHStakingContract.deploy(
    USDT_ADDRESS,
    REWARD_RATE,
    MIN_STAKE,
    MAX_STAKE,
    {
      gasLimit: 3000000 // 增加gas限制
    }
  );

  console.log("⏳ 等待合约部署确认...");
  await stakingContract.waitForDeployment();

  const contractAddress = await stakingContract.getAddress();
  console.log("✅ 合约部署成功!");
  console.log("📍 合约地址:", contractAddress);
  console.log("👤 合约所有者:", await stakingContract.owner());

  // 验证合约信息
  console.log("\n🔍 验证合约信息:");
  const stats = await stakingContract.getContractStats();
  console.log("  总质押量:", ethers.formatUnits(stats[0], 6), "USDT");
  console.log("  奖励率:", stats[1].toString(), "基点");
  console.log("  最小质押:", ethers.formatUnits(stats[2], 6), "USDT");
  console.log("  最大质押:", ethers.formatUnits(stats[3], 6), "USDT");
  console.log("  合约余额:", ethers.formatUnits(stats[4], 6), "USDT");

  console.log("\n📝 部署信息:");
  console.log("  网络: ETH主网");
  console.log("  部署者:", deployer.address);
  console.log("  合约地址:", contractAddress);
  console.log("  交易哈希: 请查看上面的部署交易");

  console.log("\n🔗 在Etherscan查看合约:");
  console.log(`https://etherscan.io/address/${contractAddress}`);

  // 保存部署信息
  const deploymentInfo = {
    network: "ethereum",
    contractAddress: contractAddress,
    deployer: deployer.address,
    usdtAddress: USDT_ADDRESS,
    rewardRate: REWARD_RATE,
    minStake: MIN_STAKE.toString(),
    maxStake: MAX_STAKE.toString(),
    deploymentTime: new Date().toISOString(),
    etherscanUrl: `https://etherscan.io/address/${contractAddress}`
  };

  require('fs').writeFileSync(
    'deployment-eth-staking.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 部署信息已保存到 deployment-eth-staking.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
