/**
 * 检查环境变量配置
 * 确保所有必要的环境变量都已正确配置
 */

const fs = require('fs')
const path = require('path')

// 检查环境变量文件
function checkEnvFiles() {
  console.log('🔧 检查环境变量文件...\n')
  
  const envFiles = [
    '.env.local',
    '.env',
    'netlify.toml',
    'vercel.json'
  ]
  
  const requiredVars = [
    'ADMIN_PRIVATE_KEY',
    'STAKING_CONTRACT_ADDRESS',
    'TREASURY_ADDRESS',
    'USDT_CONTRACT_ADDRESS',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ]
  
  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      console.log(`📁 找到文件: ${file}`)
      
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        requiredVars.forEach(varName => {
          if (content.includes(varName)) {
            console.log(`  ✅ ${varName}: 已配置`)
          } else {
            console.log(`  ❌ ${varName}: 未配置`)
          }
        })
      } catch (error) {
        console.log(`  ❌ 读取文件失败: ${error.message}`)
      }
    } else {
      console.log(`📁 文件不存在: ${file}`)
    }
    console.log('')
  })
}

// 检查合约地址一致性
function checkContractAddresses() {
  console.log('🔧 检查合约地址一致性...\n')
  
  const files = [
    'src/app/api/admin/real-balance-collection/route.ts',
    'src/app/api/admin/query-balance/route.ts',
    'src/app/api/admin/query-allowance/route.ts',
    'src/lib/load-env.ts'
  ]
  
  const expectedAddress = '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        if (content.includes(expectedAddress)) {
          console.log(`✅ ${file}: 合约地址正确`)
        } else {
          console.log(`❌ ${file}: 合约地址不匹配`)
          console.log(`   期望: ${expectedAddress}`)
        }
      } catch (error) {
        console.log(`❌ ${file}: 读取失败`)
      }
    } else {
      console.log(`❌ ${file}: 文件不存在`)
    }
  })
}

// 生成环境变量配置建议
function generateEnvConfig() {
  console.log('\n🔧 生成环境变量配置建议...\n')
  
  const config = `
# 管理员配置
ADMIN_PRIVATE_KEY=0x你的管理员私钥

# 合约地址配置
STAKING_CONTRACT_ADDRESS=0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
TREASURY_ADDRESS=0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7

# Supabase配置
SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk

# 网络配置
ETH_RPC_URL=https://eth.llamarpc.com
`
  
  console.log('📋 建议的环境变量配置:')
  console.log(config)
  
  // 保存到文件
  const envPath = path.join(process.cwd(), '.env.example')
  fs.writeFileSync(envPath, config)
  console.log(`💾 配置已保存到: ${envPath}`)
}

// 检查管理员权限
function checkAdminPermissions() {
  console.log('\n🔧 检查管理员权限配置...\n')
  
  console.log('📋 管理员权限要求:')
  console.log('1. ADMIN_PRIVATE_KEY 必须对应合约所有者地址')
  console.log('2. 合约所有者地址: 0xc0754D163B8F3C0dD6AdA0168f8029796Bed1BA2')
  console.log('3. 管理员地址必须能够调用 collectUserTokens 函数')
  console.log('4. 管理员地址必须有足够的 ETH 支付 gas 费用')
  
  console.log('\n🔧 权限检查步骤:')
  console.log('1. 在以太坊浏览器中查看合约: https://etherscan.io/address/0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218')
  console.log('2. 确认合约所有者地址')
  console.log('3. 确认 ADMIN_PRIVATE_KEY 对应的地址是合约所有者')
  console.log('4. 确认管理员地址有足够的 ETH 余额')
}

// 主函数
function main() {
  console.log('🚀 开始检查环境变量配置...\n')
  
  checkEnvFiles()
  checkContractAddresses()
  generateEnvConfig()
  checkAdminPermissions()
  
  console.log('\n✅ 环境变量配置检查完成!')
  console.log('\n📋 下一步操作:')
  console.log('1. 根据建议配置环境变量')
  console.log('2. 确保管理员权限正确')
  console.log('3. 运行测试脚本验证功能')
}

main()
