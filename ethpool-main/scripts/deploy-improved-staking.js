const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 ImprovedEthStaking 合约...\n");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("📝 部署账户:", deployerAddress);
  
  // 检查部署账户余额
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH\n");

  // 合约参数配置
  const contractConfig = {
    // ETH主网USDT合约地址
    USDT_ADDRESS: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    // 资金池地址（可以是多签钱包或其他安全地址）
    TREASURY_ADDRESS: "0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a",
    // 管理员地址（可以添加多个）
    ADDITIONAL_ADMINS: [
      "0x40016e5d0024d0D6dA9C7b945Cce810BcE602279" // 当前管理员地址
    ]
  };

  console.log("🔧 合约配置参数:");
  console.log("   USDT合约地址:", contractConfig.USDT_ADDRESS);
  console.log("   资金池地址:", contractConfig.TREASURY_ADDRESS);
  console.log("   额外管理员:", contractConfig.ADDITIONAL_ADMINS);
  console.log("");

  try {
    // 获取合约工厂
    const ImprovedEthStaking = await ethers.getContractFactory("ImprovedEthStaking");
    
    // 估算部署Gas费用
    const deployData = ImprovedEthStaking.interface.encodeDeploy([
      contractConfig.USDT_ADDRESS,
      contractConfig.TREASURY_ADDRESS
    ]);
    
    const estimatedGas = await ethers.provider.estimateGas({
      data: deployData
    });
    
    console.log("⛽ 预估Gas用量:", estimatedGas.toString());
    
    // 获取当前Gas价格
    const feeData = await ethers.provider.getFeeData();
    console.log("📊 当前Gas价格:", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "Gwei");
    
    const estimatedCost = estimatedGas * (feeData.gasPrice || BigInt(0));
    console.log("💸 预估部署成本:", ethers.formatEther(estimatedCost), "ETH\n");

    // 部署合约
    console.log("🔨 正在部署合约...");
    const contract = await ImprovedEthStaking.deploy(
      contractConfig.USDT_ADDRESS,
      contractConfig.TREASURY_ADDRESS,
      {
        gasLimit: BigInt(3000000) // 设置足够的gas限制
      }
    );

    console.log("⏳ 等待合约部署确认...");
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ 合约部署成功!");
    console.log("📍 合约地址:", contractAddress);

    // 获取部署交易信息
    const deployTx = contract.deploymentTransaction();
    if (deployTx) {
      console.log("🔗 部署交易哈希:", deployTx.hash);
      console.log("⛽ 实际Gas使用:", deployTx.gasLimit?.toString());
    }

    console.log("\n🔧 进行初始配置...");

    // 添加额外管理员
    for (const adminAddress of contractConfig.ADDITIONAL_ADMINS) {
      try {
        console.log(`👤 添加管理员: ${adminAddress}`);
        const addAdminTx = await contract.addAdmin(adminAddress);
        await addAdminTx.wait();
        console.log("✅ 管理员添加成功");
      } catch (error) {
        console.log("⚠️  添加管理员失败:", error.message);
      }
    }

    // 验证合约配置
    console.log("\n🔍 验证合约配置...");
    
    const stakingToken = await contract.stakingToken();
    const treasuryAddress = await contract.treasuryAddress();
    const owner = await contract.owner();
    
    console.log("✅ 验证结果:");
    console.log("   质押代币地址:", stakingToken);
    console.log("   资金池地址:", treasuryAddress);
    console.log("   合约拥有者:", owner);
    console.log("   部署者是否为管理员:", await contract.isAdmin(deployerAddress));

    // 检查额外管理员权限
    for (const adminAddress of contractConfig.ADDITIONAL_ADMINS) {
      const isAdmin = await contract.isAdmin(adminAddress);
      console.log(`   ${adminAddress} 是否为管理员:`, isAdmin);
    }

    // 获取合约统计信息
    const stats = await contract.getContractStats();
    console.log("\n📊 合约统计:");
    console.log("   总质押金额:", ethers.formatUnits(stats._totalStaked, 6), "USDT");
    console.log("   总用户数:", stats._totalUsers.toString());
    console.log("   已收集金额:", ethers.formatUnits(stats._totalCollected, 6), "USDT");
    console.log("   合约状态:", stats._paused ? "已暂停" : "正常运行");

    // 生成部署报告
    const deploymentReport = {
      network: "ETH Mainnet",
      contractName: "ImprovedEthStaking",
      contractAddress: contractAddress,
      deploymentTx: deployTx?.hash,
      deployer: deployerAddress,
      stakingToken: stakingToken,
      treasuryAddress: treasuryAddress,
      admins: [deployerAddress, ...contractConfig.ADDITIONAL_ADMINS],
      deploymentTime: new Date().toISOString(),
      gasUsed: deployTx?.gasLimit?.toString(),
      estimatedCost: ethers.formatEther(estimatedCost)
    };

    console.log("\n📋 部署报告:");
    console.log(JSON.stringify(deploymentReport, null, 2));

    // 保存部署信息到文件
    const fs = require('fs');
    fs.writeFileSync(
      'deployment-improved-staking.json',
      JSON.stringify(deploymentReport, null, 2)
    );
    console.log("\n💾 部署信息已保存到 deployment-improved-staking.json");

    console.log("\n🎉 部署完成!");
    console.log("📝 接下来的步骤:");
    console.log("1. 验证合约代码（可选）");
    console.log("2. 更新前端配置文件");
    console.log("3. 更新管理后台API");
    console.log("4. 进行功能测试");
    
    console.log("\n🔗 Etherscan链接:");
    console.log(`https://etherscan.io/address/${contractAddress}`);

  } catch (error) {
    console.error("\n❌ 部署失败:");
    console.error(error);
    process.exit(1);
  }
}

// 捕获未处理的错误
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 执行部署
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

