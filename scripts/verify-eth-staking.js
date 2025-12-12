const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 开始验证 ETH质押合约...");

  // 获取合约地址
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    console.error("❌ 请提供合约地址");
    console.log("使用方法: npx hardhat run scripts/verify-eth-staking.js --network <network> <contract_address>");
    process.exit(1);
  }

  // 获取网络
  const network = await ethers.provider.getNetwork();
  console.log("🌐 当前网络:", network.name, "Chain ID:", network.chainId);

  // 验证合约代码
  console.log("\n🔍 检查合约代码...");
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    console.error("❌ 合约地址无效或合约未部署");
    process.exit(1);
  }
  console.log("✅ 合约代码存在");

  // 验证合约参数
  console.log("\n🔍 验证合约参数...");
  try {
    const ETHStakingContract = await ethers.getContractFactory("ETHStakingContract");
    const contract = ETHStakingContract.attach(contractAddress);

    const stakingToken = await contract.stakingToken();
    const rewardRate = await contract.rewardRate();
    const minStakeAmount = await contract.minStakeAmount();
    const maxStakeAmount = await contract.maxStakeAmount();
    const owner = await contract.owner();

    console.log("✅ 合约参数验证成功:");
    console.log("  质押代币地址:", stakingToken);
    console.log("  奖励率:", rewardRate.toString(), "基点");
    console.log("  最小质押数量:", ethers.formatEther(minStakeAmount));
    console.log("  最大质押数量:", ethers.formatEther(maxStakeAmount));
    console.log("  合约所有者:", owner);

    // 测试基本功能
    console.log("\n🧪 测试合约功能...");
    
    // 检查总质押量
    const totalStaked = await contract.totalStaked();
    console.log("  总质押量:", ethers.formatEther(totalStaked));

    // 检查合约统计信息
    const stats = await contract.getContractStats();
    console.log("  合约统计:");
    console.log("    总质押量:", ethers.formatEther(stats[0]));
    console.log("    奖励率:", stats[1].toString());
    console.log("    最小质押量:", ethers.formatEther(stats[2]));
    console.log("    最大质押量:", ethers.formatEther(stats[3]));
    console.log("    合约余额:", ethers.formatEther(stats[4]));

    console.log("\n✅ 合约验证完成！");
    console.log("📍 合约地址:", contractAddress);
    
    // 生成区块链浏览器链接
    let explorerUrl = "";
    switch (network.chainId.toString()) {
      case "1":
        explorerUrl = `https://etherscan.io/address/${contractAddress}`;
        break;
      case "56":
        explorerUrl = `https://bscscan.com/address/${contractAddress}`;
        break;
      case "137":
        explorerUrl = `https://polygonscan.com/address/${contractAddress}`;
        break;
      default:
        explorerUrl = `Chain ID: ${network.chainId}`;
    }
    
    console.log("🔗 区块链浏览器:", explorerUrl);

  } catch (error) {
    console.error("❌ 合约验证失败:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 验证失败:", error);
    process.exit(1);
  });


