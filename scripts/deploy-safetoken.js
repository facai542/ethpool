// 部署SafeToken合约的脚本
const hre = require("hardhat");

async function main() {
  // 获取合约工厂 - 使用完全限定名称
  const SafeToken = await hre.ethers.getContractFactory("contracts/SafeToken.sol:SafeToken");
  
  // 设置代币参数
  const name = "Safe Token";
  const symbol = "SAFE";
  const decimals = 18;
  const initialSupply = 1000000; // 100万代币
  const initialHolder = "0x0000000000000000000000000000000000000000"; // 设置为零地址将默认发送给部署者
  
  // 部署合约
  console.log("正在部署SafeToken合约...");
  const safeToken = await SafeToken.deploy(name, symbol, decimals, initialSupply, initialHolder);
  
  // 等待部署完成
  console.log("等待交易确认...");
  await safeToken.deployTransaction.wait();
  
  console.log("SafeToken合约已部署到:", safeToken.address);
  console.log("代币名称:", await safeToken.name());
  console.log("代币符号:", await safeToken.symbol());
  console.log("代币小数位:", await safeToken.decimals());
  console.log("总供应量:", (await safeToken.totalSupply()).toString());
  
  // 打印验证信息
  console.log("\n=== 合约验证信息 ===");
  console.log("合约地址:", safeToken.address);
  console.log("构造函数参数:");
  console.log(`- 名称: ${name}`);
  console.log(`- 符号: ${symbol}`);
  console.log(`- 小数位: ${decimals}`);
  console.log(`- 初始供应量: ${initialSupply}`);
  console.log(`- 初始持有者: ${initialHolder || "部署者地址"}`);
  
  // 获取部署者地址
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("\n验证命令:");
  console.log(`npx hardhat verify --network bsc ${safeToken.address} "${name}" "${symbol}" ${decimals} ${initialSupply} ${initialHolder || deployerAddress}`);
}

// 运行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 