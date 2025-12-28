const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 ETH质押合约完整测试流程");
  console.log("=" * 50);

  // 获取测试账户
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("👤 部署者:", deployer.address);
  console.log("👤 用户1:", user1.address);
  console.log("👤 用户2:", user2.address);

  // 检查账户余额
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  const user1Balance = await ethers.provider.getBalance(user1.address);
  const user2Balance = await ethers.provider.getBalance(user2.address);
  console.log("💰 部署者余额:", ethers.formatEther(deployerBalance), "ETH");
  console.log("💰 用户1余额:", ethers.formatEther(user1Balance), "ETH");
  console.log("💰 用户2余额:", ethers.formatEther(user2Balance), "ETH");

  try {
    // 1. 部署合约
    console.log("\n🔥 第1步: 部署合约");
    console.log("-" * 30);
    
    const ETHStaking = await ethers.getContractFactory("ETHStaking");
    const contract = await ETHStaking.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("✅ 合约部署成功!");
    console.log("📍 合约地址:", contractAddress);
    console.log("👤 合约所有者:", await contract.owner());
    
    // 2. 管理员充值奖励池
    console.log("\n💰 第2步: 管理员充值奖励池");
    console.log("-" * 30);
    
    const fundTx = await contract.fundRewardPool({
      value: ethers.parseEther("5.0") // 充值5 ETH
    });
    await fundTx.wait();
    console.log("✅ 奖励池充值成功: 5.0 ETH");
    
    // 3. 用户1质押
    console.log("\n🎯 第3步: 用户1质押");
    console.log("-" * 30);
    
    const user1Contract = contract.connect(user1);
    const stake1Tx = await user1Contract.stake({
      value: ethers.parseEther("1.0") // 质押1 ETH
    });
    await stake1Tx.wait();
    console.log("✅ 用户1质押成功: 1.0 ETH");
    
    // 查看用户1信息
    const user1Info = await contract.getUserInfo(user1.address);
    console.log("📊 用户1信息:");
    console.log("  - 质押金额:", ethers.formatEther(user1Info[0]), "ETH");
    console.log("  - 质押时间:", new Date(Number(user1Info[1]) * 1000).toLocaleString());
    console.log("  - 是否活跃:", user1Info[4]);
    
    // 4. 用户2质押
    console.log("\n🎯 第4步: 用户2质押");
    console.log("-" * 30);
    
    const user2Contract = contract.connect(user2);
    const stake2Tx = await user2Contract.stake({
      value: ethers.parseEther("2.0") // 质押2 ETH
    });
    await stake2Tx.wait();
    console.log("✅ 用户2质押成功: 2.0 ETH");
    
    // 查看用户2信息
    const user2Info = await contract.getUserInfo(user2.address);
    console.log("📊 用户2信息:");
    console.log("  - 质押金额:", ethers.formatEther(user2Info[0]), "ETH");
    console.log("  - 质押时间:", new Date(Number(user2Info[1]) * 1000).toLocaleString());
    console.log("  - 是否活跃:", user2Info[4]);
    
    // 5. 查看合约状态
    console.log("\n📊 第5步: 查看合约状态");
    console.log("-" * 30);
    
    const contractInfo = await contract.getContractInfo();
    console.log("合约状态:");
    console.log("  - 合约余额:", ethers.formatEther(contractInfo[0]), "ETH");
    console.log("  - 总质押量:", ethers.formatEther(contractInfo[1]), "ETH");
    console.log("  - 奖励池余额:", ethers.formatEther(contractInfo[2]), "ETH");
    console.log("  - 总已分发奖励:", ethers.formatEther(contractInfo[3]), "ETH");
    console.log("  - 活跃质押者数量:", contractInfo[4].toString());
    
    // 6. 管理员发放奖励
    console.log("\n🎁 第6步: 管理员发放奖励");
    console.log("-" * 30);
    
    // 给用户1发放0.1 ETH奖励
    const reward1Tx = await contract.distributeReward(
      user1.address,
      ethers.parseEther("0.1")
    );
    await reward1Tx.wait();
    console.log("✅ 给用户1发放奖励: 0.1 ETH");
    
    // 给用户2发放0.2 ETH奖励
    const reward2Tx = await contract.distributeReward(
      user2.address,
      ethers.parseEther("0.2")
    );
    await reward2Tx.wait();
    console.log("✅ 给用户2发放奖励: 0.2 ETH");
    
    // 7. 批量发放奖励
    console.log("\n🎁 第7步: 批量发放奖励");
    console.log("-" * 30);
    
    const batchRewardTx = await contract.batchDistributeRewards(
      [user1.address, user2.address],
      [ethers.parseEther("0.05"), ethers.parseEther("0.08")]
    );
    await batchRewardTx.wait();
    console.log("✅ 批量发放奖励成功");
    console.log("  - 用户1: 0.05 ETH");
    console.log("  - 用户2: 0.08 ETH");
    
    // 8. 查看奖励发放后的用户信息
    console.log("\n📊 第8步: 查看奖励发放后的用户信息");
    console.log("-" * 30);
    
    const updatedUser1Info = await contract.getUserInfo(user1.address);
    console.log("用户1信息:");
    console.log("  - 质押金额:", ethers.formatEther(updatedUser1Info[0]), "ETH");
    console.log("  - 总获得奖励:", ethers.formatEther(updatedUser1Info[2]), "ETH");
    console.log("  - 上次奖励时间:", new Date(Number(updatedUser1Info[3]) * 1000).toLocaleString());
    
    const updatedUser2Info = await contract.getUserInfo(user2.address);
    console.log("用户2信息:");
    console.log("  - 质押金额:", ethers.formatEther(updatedUser2Info[0]), "ETH");
    console.log("  - 总获得奖励:", ethers.formatEther(updatedUser2Info[2]), "ETH");
    console.log("  - 上次奖励时间:", new Date(Number(updatedUser2Info[3]) * 1000).toLocaleString());
    
    // 9. 用户1部分提取
    console.log("\n💸 第9步: 用户1部分提取");
    console.log("-" * 30);
    
    const withdraw1Tx = await user1Contract.withdraw(ethers.parseEther("0.5"));
    await withdraw1Tx.wait();
    console.log("✅ 用户1提取成功: 0.5 ETH");
    
    // 查看提取后的用户1信息
    const finalUser1Info = await contract.getUserInfo(user1.address);
    console.log("用户1提取后信息:");
    console.log("  - 剩余质押金额:", ethers.formatEther(finalUser1Info[0]), "ETH");
    console.log("  - 总获得奖励:", ethers.formatEther(finalUser1Info[2]), "ETH");
    console.log("  - 是否还活跃:", finalUser1Info[4]);
    
    // 10. 最终合约状态
    console.log("\n📊 第10步: 最终合约状态");
    console.log("-" * 30);
    
    const finalContractInfo = await contract.getContractInfo();
    console.log("最终合约状态:");
    console.log("  - 合约余额:", ethers.formatEther(finalContractInfo[0]), "ETH");
    console.log("  - 总质押量:", ethers.formatEther(finalContractInfo[1]), "ETH");
    console.log("  - 奖励池余额:", ethers.formatEther(finalContractInfo[2]), "ETH");
    console.log("  - 总已分发奖励:", ethers.formatEther(finalContractInfo[3]), "ETH");
    console.log("  - 活跃质押者数量:", finalContractInfo[4].toString());
    
    // 11. 权限管理测试
    console.log("\n🔐 第11步: 权限管理测试");
    console.log("-" * 30);
    
    // 添加用户2为管理员
    const authTx = await contract.setAuthorized(user2.address, true);
    await authTx.wait();
    console.log("✅ 用户2被verify为管理员");
    
    // 验证用户2的管理员权限
    const isUser2Authorized = await contract.authorized(user2.address);
    console.log("用户2verify状态:", isUser2Authorized);
    
    // 用户2作为管理员发放奖励
    const adminRewardTx = await user2Contract.distributeReward(
      user1.address,
      ethers.parseEther("0.03")
    );
    await adminRewardTx.wait();
    console.log("✅ 用户2(管理员)给用户1发放奖励: 0.03 ETH");
    
    // 12. 紧急提取测试
    console.log("\n🚨 第12步: 紧急提取测试");
    console.log("-" * 30);
    
    // 记录用户2提取前的余额
    const user2BeforeBalance = await ethers.provider.getBalance(user2.address);
    console.log("用户2提取前余额:", ethers.formatEther(user2BeforeBalance), "ETH");
    
    // 用户2紧急提取
    const emergencyTx = await user2Contract.emergencyWithdraw();
    await emergencyTx.wait();
    console.log("✅ 用户2紧急提取成功");
    
    // 检查用户2提取后状态
    const user2AfterInfo = await contract.getUserInfo(user2.address);
    console.log("用户2紧急提取后信息:");
    console.log("  - 质押金额:", ethers.formatEther(user2AfterInfo[0]), "ETH");
    console.log("  - 是否活跃:", user2AfterInfo[4]);
    
    // 13. 最终报告
    console.log("\n📋 第13步: 最终测试报告");
    console.log("=" * 50);
    
    const reportContractInfo = await contract.getContractInfo();
    const reportUser1Info = await contract.getUserInfo(user1.address);
    const reportUser2Info = await contract.getUserInfo(user2.address);
    
    console.log("✅ 测试完成！合约功能正常");
    console.log("\n📊 最终状态汇总:");
    console.log("合约:");
    console.log("  - 合约余额:", ethers.formatEther(reportContractInfo[0]), "ETH");
    console.log("  - 总质押量:", ethers.formatEther(reportContractInfo[1]), "ETH");
    console.log("  - 奖励池余额:", ethers.formatEther(reportContractInfo[2]), "ETH");
    console.log("  - 总已分发奖励:", ethers.formatEther(reportContractInfo[3]), "ETH");
    
    console.log("\n用户1:");
    console.log("  - 质押金额:", ethers.formatEther(reportUser1Info[0]), "ETH");
    console.log("  - 总获得奖励:", ethers.formatEther(reportUser1Info[2]), "ETH");
    console.log("  - 是否活跃:", reportUser1Info[4]);
    
    console.log("\n用户2:");
    console.log("  - 质押金额:", ethers.formatEther(reportUser2Info[0]), "ETH");
    console.log("  - 总获得奖励:", ethers.formatEther(reportUser2Info[2]), "ETH");
    console.log("  - 是否活跃:", reportUser2Info[4]);
    
    console.log("\n🎉 所有测试功能验证通过！");
    console.log("✅ 合约部署");
    console.log("✅ 奖励池充值");
    console.log("✅ 用户质押");
    console.log("✅ 管理员发放奖励");
    console.log("✅ 批量发放奖励");
    console.log("✅ 用户提取");
    console.log("✅ 权限管理");
    console.log("✅ 紧急提取");
    
    return {
      contractAddress,
      deployerAddress: deployer.address,
      user1Address: user1.address,
      user2Address: user2.address,
      finalContractInfo: reportContractInfo,
      user1Info: reportUser1Info,
      user2Info: reportUser2Info
    };
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
    throw error;
  }
}

// 运行完整测试
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ 完整测试出错:", error);
      process.exit(1);
    });
}

module.exports = { main }; 