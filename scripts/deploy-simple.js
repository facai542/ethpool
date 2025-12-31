// 部署SafeToken合约的简单脚本
const hre = require("hardhat");

async function main() {
  console.log("开始部署SafeToken合约...");
  
  // 编译合约
  await hre.run("compile");
  console.log("合约编译完成");
  
  // 设置代币参数
  const name = "Safe Token";
  const symbol = "SAFE";
  const decimals = 18;
  const initialSupply = 1000000; // 100万代币
  const initialHolder = "0x0000000000000000000000000000000000000000"; // 设置为零地址将默认发送给部署者
  
  try {
    // 获取合约工厂 - 使用完全限定名称
    const SafeToken = await hre.ethers.getContractFactory("contracts/SafeToken.sol:SafeToken");
    
    // 部署合约
    console.log("正在部署合约...");
    const safeToken = await SafeToken.deploy(
      name,
      symbol,
      decimals,
      initialSupply,
      initialHolder
    );
    
    console.log("合约已部署，交易哈希:", safeToken.deployTransaction.hash);
    console.log("等待交易确认...");
    
    // 等待部署完成
    await safeToken.deployed();
    
    console.log("合约已部署到地址:", safeToken.address);
    
    // 打印验证信息
    console.log("\n=== 合约验证信息 ===");
    console.log("合约地址:", safeToken.address);
    console.log("构造函数参数:");
    console.log(`- 名称: ${name}`);
    console.log(`- 符号: ${symbol}`);
    console.log(`- 小数位: ${decimals}`);
    console.log(`- 初始供应量: ${initialSupply}`);
    console.log(`- 初始持有者: ${initialHolder || "部署者地址"}`);
    
    console.log("\n验证命令:");
    console.log(`npx hardhat verify --network bsc ${safeToken.address} "${name}" "${symbol}" ${decimals} ${initialSupply} ${initialHolder}`);
    
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