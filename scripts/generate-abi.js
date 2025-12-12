// 生成ABI编码的脚本
const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 生成SafeToken合约构造函数参数的ABI编码...");
  
  // 合约参数
  const name = "Safe Token";
  const symbol = "SAFE";
  const decimals = 18;
  const initialSupply = 1000000;
  const initialHolder = "0x0000000000000000000000000000000000000000";
  
  console.log("📝 合约参数:");
  console.log(`  - 名称: ${name}`);
  console.log(`  - 符号: ${symbol}`);
  console.log(`  - 小数位: ${decimals}`);
  console.log(`  - 初始供应量: ${initialSupply}`);
  console.log(`  - 初始持有者: ${initialHolder}`);
  
  try {
    // 使用ethers.js的AbiCoder生成ABI编码
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const encodedParams = abiCoder.encode(
      ["string", "string", "uint8", "uint256", "address"],
      [name, symbol, decimals, initialSupply, initialHolder]
    );
    
    console.log("\n📄 构造函数参数的ABI编码:");
    console.log(encodedParams.substring(2)); // 移除前缀"0x"
    
    console.log("\n📋 BSCScan手动验证指南:");
    console.log("1. 访问 https://bscscan.com/verifyContract");
    console.log("2. 输入合约地址: 0xbBd71C0258D22cCfa4Df8C884bBA02a64eA14e06");
    console.log("3. 选择编译器类型: Solidity (Single file)");
    console.log("4. 选择编译器版本: v0.8.18");
    console.log("5. 选择开源许可证: MIT License");
    console.log("6. 优化: 启用");
    console.log("7. 优化运行: 200");
    console.log("8. 目标的EVM版本: Paris");
    console.log("9. 上传合约代码 (使用contracts/SafeToken_flattened.sol的内容)");
    console.log("10. 在构造函数参数(ABI编码)字段中粘贴上面生成的编码");
    console.log("11. 点击验证按钮");
  } catch (error) {
    console.error("❌ 生成ABI编码失败:", error.message);
  }
}

// 运行脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 运行时错误:", error);
    process.exit(1);
  }); 