// 验证SafeToken合约的脚本
const hre = require("hardhat");

async function main() {
  console.log("🔍 开始验证SafeToken合约...");
  
  // 合约地址和参数
  const contractAddress = "0xbBd71C0258D22cCfa4Df8C884bBA02a64eA14e06";
  const name = "Safe Token";
  const symbol = "SAFE";
  const decimals = 18;
  const initialSupply = 1000000;
  const initialHolder = "0x0000000000000000000000000000000000000000";
  
  console.log("📝 合约地址:", contractAddress);
  console.log("📝 合约参数:");
  console.log(`  - 名称: ${name}`);
  console.log(`  - 符号: ${symbol}`);
  console.log(`  - 小数位: ${decimals}`);
  console.log(`  - 初始供应量: ${initialSupply}`);
  console.log(`  - 初始持有者: ${initialHolder}`);
  
  try {
    console.log("\n🔄 正在验证合约...");
    
    // 使用hardhat的verify:verify任务验证合约
    await hre.run("verify:verify", {
      address: contractAddress,
      contract: "contracts/SafeToken.sol:SafeToken",
      constructorArguments: [
        name,
        symbol,
        decimals,
        initialSupply,
        initialHolder
      ],
    });
    
    console.log("✅ 合约验证成功!");
    console.log("🔗 BSCScan链接: https://bscscan.com/address/" + contractAddress + "#code");
  } catch (error) {
    console.error("❌ 验证失败:", error.message);
    
    // 检查是否是已验证的错误
    if (error.message.includes("Already Verified")) {
      console.log("✅ 合约已经验证过了!");
      console.log("🔗 BSCScan链接: https://bscscan.com/address/" + contractAddress + "#code");
    } else if (error.message.includes("Invalid API Key")) {
      console.log("❌ API密钥无效，请检查您的BSC_API_KEY环境变量");
      console.log("💡 提示: 您可以在.env文件中设置BSC_API_KEY");
      
      // 生成手动验证的指南
      console.log("\n📝 手动验证指南:");
      console.log("1. 访问 https://bscscan.com/verifyContract");
      console.log("2. 输入合约地址:", contractAddress);
      console.log("3. 选择编译器类型: Solidity (Single file)");
      console.log("4. 选择编译器版本: v0.8.18");
      console.log("5. 选择开源许可证: MIT License");
      console.log("6. 启用优化并设置为200次");
      console.log("7. 上传合约代码 (使用contracts/SafeToken_flattened.sol的内容)");
      console.log("8. 输入构造函数参数 (ABI编码)");
      console.log("9. 点击验证按钮");
    }
  }
}

// 运行验证脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 运行时错误:", error);
    process.exit(1);
  }); 