// 最小化的SafeToken合约部署脚本
const hre = require("hardhat");

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
    console.log("获取合约工厂...");
    const SafeToken = await hre.ethers.getContractFactory("contracts/SafeToken.sol:SafeToken");
    
    // 部署合约
    console.log("部署合约中...");
    const tx = await SafeToken.deploy(name, symbol, decimals, initialSupply, initialHolder);
    console.log("合约已部署，地址:", tx.address);
    console.log("交易哈希:", tx.deployTransaction.hash);
    
    // 打印验证命令
    console.log("\n验证命令:");
    console.log(`npx hardhat verify --network bsc ${tx.address} "${name}" "${symbol}" ${decimals} ${initialSupply} ${initialHolder}`);
    
  } catch (error) {
    console.error("部署过程中出错:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// 运行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("运行时错误:", error);
    process.exit(1);
  }); 