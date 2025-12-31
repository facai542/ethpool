const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 ImprovedEthStaking 合约部署演示\n");
  
  // 检查网络
  const network = await ethers.provider.getNetwork();
  console.log("📡 当前网络:", {
    name: network.name,
    chainId: network.chainId.toString()
  });
  
  // 获取部署账户（如果是本地网络，使用第一个账户）
  const [deployer] = await ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);
  
  // 检查余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.log("❌ 账户余额为零，无法部署合约");
    console.log("💡 解决方案:");
    console.log("   1. 如果是本地测试：运行 'npx hardhat node' 启动本地网络");
    console.log("   2. 如果是测试网：获取测试ETH");
    console.log("   3. 如果是主网：确保账户有足够ETH支付Gas费");
    return;
  }
  
  console.log("\n🔧 合约参数配置:");
  const contractConfig = {
    USDT_ADDRESS: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    TREASURY_ADDRESS: "0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a",
    ADMIN_ADDRESS: "0x40016e5d0024d0D6dA9C7b945Cce810BcE602279"
  };
  
  Object.entries(contractConfig).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  try {
    console.log("\n🔨 开始部署合约...");
    
    // 获取合约工厂
    const ImprovedEthStaking = await ethers.getContractFactory("ImprovedEthStaking");
    
    // 部署合约
    const contract = await ImprovedEthStaking.deploy(
      contractConfig.USDT_ADDRESS,
      contractConfig.TREASURY_ADDRESS
    );
    
    console.log("⏳ 等待部署确认...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("✅ 合约部署成功!");
    console.log("📍 合约地址:", contractAddress);
    
    // 添加管理员
    console.log("\n🔧 配置合约...");
    try {
      const addAdminTx = await contract.addAdmin(contractConfig.ADMIN_ADDRESS);
      await addAdminTx.wait();
      console.log("✅ 管理员添加成功:", contractConfig.ADMIN_ADDRESS);
    } catch (error) {
      console.log("⚠️  添加管理员失败 (可能已存在):", error.message);
    }
    
    // 验证配置
    console.log("\n🔍 验证合约配置:");
    const stakingToken = await contract.stakingToken();
    const treasuryAddress = await contract.treasuryAddress();
    const owner = await contract.owner();
    const isAdminConfigured = await contract.isAdmin(contractConfig.ADMIN_ADDRESS);
    
    console.log("✅ 配置验证结果:");
    console.log(`   质押代币: ${stakingToken}`);
    console.log(`   资金池地址: ${treasuryAddress}`);
    console.log(`   合约拥有者: ${owner}`);
    console.log(`   管理员权限: ${isAdminConfigured ? '已配置' : '未配置'}`);
    
    // 合约统计
    const stats = await contract.getContractStats();
    console.log("\n📊 合约统计:");
    console.log(`   总质押: ${ethers.formatUnits(stats._totalStaked, 6)} USDT`);
    console.log(`   总用户: ${stats._totalUsers}`);
    console.log(`   已收集: ${ethers.formatUnits(stats._totalCollected, 6)} USDT`);
    console.log(`   状态: ${stats._paused ? '已暂停' : '正常运行'}`);
    
    // 生成集成配置
    console.log("\n📋 前端集成配置:");
    console.log("将以下配置更新到 src/lib/contracts.ts:");
    console.log("```typescript");
    console.log("STAKING_CONTRACT: '" + contractAddress + "',");
    console.log("ADMIN_ADDRESS: '" + contractConfig.ADMIN_ADDRESS + "'");
    console.log("```");
    
    // 保存部署信息
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      contractAddress: contractAddress,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      config: contractConfig
    };
    
    console.log("\n💾 部署信息:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    if (network.chainId === 1n) {
      console.log("\n🔗 Etherscan链接:");
      console.log(`https://etherscan.io/address/${contractAddress}`);
    }
    
    console.log("\n🎉 部署完成!");
    console.log("📝 下一步:");
    console.log("1. 更新前端合约配置");
    console.log("2. 更新后端API");
    console.log("3. 进行功能测试");
    
  } catch (error) {
    console.error("\n❌ 部署失败:");
    console.error("错误信息:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 解决建议:");
      console.log("- 确保部署账户有足够ETH支付Gas费");
      console.log("- 当前Gas费较高时，可等待Gas费降低");
    }
    
    if (error.message.includes("network")) {
      console.log("\n💡 解决建议:");
      console.log("- 检查网络连接");
      console.log("- 验证RPC节点URL");
      console.log("- 尝试使用其他RPC提供商");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


