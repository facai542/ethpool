# Vercel 环境变量快速配置

## 🚀 一键复制配置

### 必需的环境变量（按优先级排序）

#### 1. 核心网络配置
```bash
NEXT_PUBLIC_NETWORK=ethereum
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_ETH_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_DEFAULT_NETWORK=ethereum
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

#### 2. Supabase 数据库
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM
```

#### 3. WalletConnect
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=68b3a8932502eb4c8d76fe35e801663e
```

#### 4. ETH主网合约
```bash
ETH_STAKING_CONTRACT=0x84DEE86c30027D78DBbdBDCb44E944D4978e7068
ETH_TREASURY_ADDRESS=0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a
ETH_USDT_CONTRACT=0xdAC17F958D2ee523a2206206994597C13D831ec7
ETH_ADMIN_ADDRESS=0x40016e5d0024d0D6dA9C7b945Cce810BcE602279
```

#### 5. BSC主网合约
```bash
MAIN_CONTRACT_ADDRESS=0xf50b17a057AD47Dac17eEE3E075bA568e772f79D
SUPPORT_CONTRACT=0xf50b17a057AD47Dac17eEE3E075bA568e772f79D
USDT_CONTRACT=0x55d398326f99059fF775485246999027B3197955
TREASURY_ADDRESS=0x967487daD4899Ccd5CF81108d41E83999bE1cC07
```

#### 6. 系统配置
```bash
NODE_ENV=production
STAKING_TYPE=USDT
NATIVE_CURRENCY=ETH
GAS_PRICE=20
GAS_LIMIT=300000
MAX_APPROVE_AMOUNT=500000
```

#### 7. 管理员配置
```bash
DEPLOYER_ADDRESS=0x40016e5d0024d0D6dA9C7b945Cce810BcE602279
ADMIN_PRIVATE_KEY=debcf9674d9d990a3183f340ced6d4d5b60d43f84f29142759759759766b066282c
ADMIN_PASSWORD=admin123456
```

#### 8. API密钥
```bash
BSCSCAN_API_KEY=GNIPZGWDPY16Z9BJN2GR1DGVHTP9GW1Y9P
SIGNATURE_PRIVATE_KEY=debcf9674d9d990a3183f340ced6d4d5b60d43f84f29142759759766b066282c
SIGNATURE_API_KEY=secure_eth_usdt_api_key
```

#### 9. 其他配置
```bash
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

## 📋 配置步骤

1. **访问 Vercel Dashboard**
   - 进入您的项目
   - 点击 `Settings` → `Environment Variables`

2. **添加环境变量**
   - 点击 `Add New`
   - 复制上面的变量名和值
   - 选择环境：`Production`, `Preview`, `Development`
   - 保存

3. **重新部署**
   - 在项目页面点击 `Redeploy`
   - 或使用命令：`vercel --prod --force`

## ⚡ 快速配置脚本

如果您使用 Vercel CLI，可以运行以下命令：

```bash
# 设置核心配置
vercel env add NEXT_PUBLIC_NETWORK production
vercel env add NEXT_PUBLIC_CHAIN_ID production
vercel env add NEXT_PUBLIC_ETH_RPC_URL production
vercel env add NEXT_PUBLIC_DEFAULT_NETWORK production
vercel env add NEXT_PUBLIC_BSC_RPC_URL production

# 设置 Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 设置 WalletConnect
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production

# 设置合约地址
vercel env add ETH_STAKING_CONTRACT production
vercel env add ETH_TREASURY_ADDRESS production
vercel env add ETH_USDT_CONTRACT production
vercel env add ETH_ADMIN_ADDRESS production
vercel env add MAIN_CONTRACT_ADDRESS production
vercel env add SUPPORT_CONTRACT production
vercel env add USDT_CONTRACT production
vercel env add TREASURY_ADDRESS production

# 设置系统配置
vercel env add NODE_ENV production
vercel env add STAKING_TYPE production
vercel env add NATIVE_CURRENCY production
vercel env add GAS_PRICE production
vercel env add GAS_LIMIT production
vercel env add MAX_APPROVE_AMOUNT production

# 设置管理员配置
vercel env add DEPLOYER_ADDRESS production
vercel env add ADMIN_PRIVATE_KEY production
vercel env add ADMIN_PASSWORD production

# 设置API密钥
vercel env add BSCSCAN_API_KEY production
vercel env add SIGNATURE_PRIVATE_KEY production
vercel env add SIGNATURE_API_KEY production

# 设置其他配置
vercel env add BSC_RPC_URL production
vercel env add BSC_TESTNET_RPC_URL production

# 部署
vercel --prod
```

## ✅ 验证清单

部署完成后，请验证：
- [ ] 网站可以正常访问
- [ ] 钱包连接功能正常
- [ ] 可以切换到ETH主网
- [ ] 可以切换到BSC主网
- [ ] USDTverify功能正常
- [ ] 质押功能正常
- [ ] 管理后台可以访问

---

**总计需要配置 28 个环境变量**

