// 检查合约地址状态的脚本
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 检查合约地址状态...");
  
  // 合约地址
  const contractAddress = "0xbBd71C0258D22cCfa4Df8C884bBA02a64eA14e06";
  console.log("📝 合约地址:", contractAddress);
  
  try {
    // 获取网络信息
    const network = await ethers.provider.getNetwork();
    console.log("🌐 当前网络:", network.name, "Chain ID:", network.chainId);
    
    // 检查地址余额
    const balance = await ethers.provider.getBalance(contractAddress);
    console.log("💰 地址余额:", ethers.formatEther(balance), "BNB");
    
    // 检查合约代码
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ 该地址没有合约代码！可能的原因:");
      console.log("  1. 合约部署交易尚未确认");
      console.log("  2. 部署失败");
      console.log("  3. 地址不正确");
      
      // 检查交易状态
      console.log("\n🔍 检查最近的交易...");
      // 这里我们无法直接获取交易历史，但可以提供一些建议
      console.log("💡 建议:");
      console.log("  1. 在BSCScan上查看地址: https://bscscan.com/address/" + contractAddress);
      console.log("  2. 检查部署交易的状态");
      console.log("  3. 确认您使用的网络是BSC主网");
    } else {
      console.log("✅ 该地址有合约代码! 长度:", code.length);
      console.log("🔗 BSCScan链接: https://bscscan.com/address/" + contractAddress + "#code");
      
      // 尝试与合约交互
      try {
        // 使用完全限定名称
        const safeToken = await ethers.getContractAt("contracts/SafeToken.sol:SafeToken", contractAddress);
        const name = await safeToken.name();
        const symbol = await safeToken.symbol();
        const decimals = await safeToken.decimals();
        const totalSupply = await safeToken.totalSupply();
        
        console.log("\n📊 代币信息:");
        console.log("📝 名称:", name);
        console.log("🔣 符号:", symbol);
        console.log("🔢 小数位:", decimals);
        console.log("💰 总供应量:", ethers.formatUnits(totalSupply, decimals));
      } catch (error) {
        console.log("❌ 无法与合约交互:", error.message);
        
        // 尝试使用合约ABI直接与合约交互
        console.log("\n🔄 尝试使用基本ABI与合约交互...");
        try {
          // 创建最小化的ABI
          const minABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)"
          ];
          
          // 使用最小化的ABI创建合约实例
          const tokenContract = new ethers.Contract(contractAddress, minABI, ethers.provider);
          
          // 尝试获取代币信息
          const name = await tokenContract.name();
          const symbol = await tokenContract.symbol();
          const decimals = await tokenContract.decimals();
          const totalSupply = await tokenContract.totalSupply();
          
          console.log("\n📊 代币信息 (通过最小化ABI):");
          console.log("📝 名称:", name);
          console.log("🔣 符号:", symbol);
          console.log("🔢 小数位:", decimals);
          console.log("💰 总供应量:", ethers.formatUnits(totalSupply, decimals));
        } catch (abiError) {
          console.log("❌ 使用基本ABI也无法与合约交互:", abiError.message);
          console.log("💡 建议在BSCScan上手动验证合约");
        }
      }
    }
  } catch (error) {
    console.error("❌ 检查失败:", error.message);
  }
}

// 运行脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 运行时错误:", error);
    process.exit(1);
  }); 