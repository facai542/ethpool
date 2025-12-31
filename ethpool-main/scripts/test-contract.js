const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 检查现有合约...");

  // 现有合约地址
  const CONTRACT_ADDRESS = "0xb4c181CcBd4DEb3C99D5030a703194E74f2482a6";
  
  // 获取合约代码
  const code = await ethers.provider.getCode(CONTRACT_ADDRESS);
  console.log("📄 合约代码长度:", code.length);
  
  if (code === "0x") {
    console.log("❌ 合约不存在");
    return;
  }
  
  console.log("✅ 合约存在");
  
  // 尝试调用owner函数
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [{"name": "", "type": "address"}],
        "type": "function"
      }
    ], ethers.provider);
    
    const owner = await contract.owner();
    console.log("👤 合约所有者:", owner);
  } catch (error) {
    console.log("❌ 无法调用owner函数:", error.message);
  }
  
  // 尝试调用collectUserTokens函数
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
      {
        "constant": false,
        "inputs": [
          {"name": "_user", "type": "address"},
          {"name": "_amount", "type": "uint256"}
        ],
        "name": "collectUserTokens",
        "outputs": [],
        "type": "function"
      }
    ], ethers.provider);
    
    // 尝试静态调用
    await contract.collectUserTokens.staticCall("0x0000000000000000000000000000000000000000", 0);
    console.log("✅ collectUserTokens 函数存在");
  } catch (error) {
    console.log("❌ collectUserTokens 函数不存在:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });
