// 基本的SafeToken合约部署脚本
const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署SafeToken合约...");
  
  // 设置代币参数
  const name = "Safe Token";
  const symbol = "SAFE";
  const decimals = 18;
  const initialSupply = 1000000; // 100万代币
  const initialHolder = "0x0000000000000000000000000000000000000000"; // 零地址表示部署者
  
  try {
    // 获取合约工厂
    const SafeTokenFactory = await ethers.getContractFactory("contracts/SafeToken.sol:SafeToken");
    
    // 部署合约
    console.log("正在部署合约...");
    const safeToken = await SafeTokenFactory.deploy(
      name,
      symbol,
      decimals,
      initialSupply,
      initialHolder
    );
    
    console.log("交易已提交，等待确认...");
    console.log("交易哈希:", safeToken.hash);
    
    // 等待交易确认
    const receipt = await safeToken.wait();
    
    console.log("合约已部署到地址:", receipt.contractAddress);
    
    // 打印验证信息
    console.log("\n=== 合约验证信息 ===");
    console.log("合约地址:", receipt.contractAddress);
    console.log("构造函数参数:");
    console.log(`- 名称: ${name}`);
    console.log(`- 符号: ${symbol}`);
    console.log(`- 小数位: ${decimals}`);
    console.log(`- 初始供应量: ${initialSupply}`);
    console.log(`- 初始持有者: ${initialHolder || "部署者地址"}`);
    
    console.log("\n验证命令:");
    console.log(`npx hardhat verify --network bsc ${receipt.contractAddress} "${name}" "${symbol}" ${decimals} ${initialSupply} ${initialHolder}`);
    
  } catch (error) {
    console.error("部署过程中出错:", error);
  }
}

// 运行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 