// 部署SafeToken合约的脚本
const hre = require("hardhat");

async function main() {
  console.log("开始部署SafeToken合约...");
  
  // 获取部署者账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("使用账户:", deployer.address);
  console.log("账户余额:", (await deployer.getBalance()).toString());
  
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
    // 获取合约工厂
    const SafeTokenFactory = await hre.ethers.getContractFactory("SafeToken", deployer);
    
    // 部署合约
    console.log("正在部署合约...");
    const safeToken = await SafeTokenFactory.deploy(
      name,
      symbol,
      decimals,
      initialSupply,
      initialHolder
    );
    
    // 等待部署完成
    console.log("等待交易确认...");
    const receipt = await safeToken.deployTransaction.wait();
    
    console.log("合约已部署到地址:", safeToken.address);
    console.log("交易哈希:", receipt.transactionHash);
    console.log("区块号:", receipt.blockNumber);
    console.log("Gas使用量:", receipt.gasUsed.toString());
    
    // 打印验证信息
    console.log("\n=== 合约验证信息 ===");
    console.log("合约地址:", safeToken.address);
    console.log("构造函数参数:");
    console.log(`- 名称: ${name}`);
    console.log(`- 符号: ${symbol}`);
    console.log(`- 小数位: ${decimals}`);
    console.log(`- 初始供应量: ${initialSupply}`);
    console.log(`- 初始持有者: ${initialHolder || deployer.address}`);
    
    console.log("\n验证命令:");
    console.log(`npx hardhat verify --network bsc ${safeToken.address} "${name}" "${symbol}" ${decimals} ${initialSupply} ${initialHolder || deployer.address}`);
    
    // 尝试自动验证合约
    console.log("\n尝试自动验证合约...");
    try {
      await hre.run("verify:verify", {
        address: safeToken.address,
        constructorArguments: [
          name,
          symbol,
          decimals,
          initialSupply,
          initialHolder || deployer.address
        ],
      });
      console.log("合约验证成功！");
    } catch (error) {
      console.log("自动验证失败，请使用上面的命令手动验证:", error.message);
    }
    
  } catch (error) {
    console.error("部署过程中出错:", error);
    process.exit(1);
  }
}

// 运行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 