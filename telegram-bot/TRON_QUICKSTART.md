# TRON 测试网络快速开始指南

## 🚀 快速开始（3 步）

### 方法一：使用公共测试网络（最简单，推荐）

```bash
# 1. 安装依赖
npm install tronweb

# 2. 测试连接
node scripts/test-tron.js shasta

# 3. 完成！现在可以使用 TRON 测试网络了
```

### 方法二：运行本地节点（需要 Docker）

```bash
# 1. 启动本地节点
docker-compose -f docker-compose.tron.yml up -d

# 2. 等待节点启动（约 30 秒）
sleep 30

# 3. 测试连接
node scripts/test-tron.js local
```

---

## 📋 详细步骤

### 步骤 1: 安装依赖

```bash
npm install tronweb
```

### 步骤 2: 配置环境变量（可选）

在 `.env.local` 中添加：

```env
# TRON 网络配置
TRON_NETWORK=SHASTA
TRON_API_KEY=your-api-key-optional
```

### 步骤 3: 测试连接

```bash
# 测试 Shasta 测试网
node scripts/test-tron.js shasta

# 测试 Nile 测试网
node scripts/test-tron.js nile

# 测试本地节点
node scripts/test-tron.js local
```

---

## 🌐 可用的测试网络

| 网络 | RPC URL | 浏览器 | 用途 |
|------|---------|--------|------|
| **Shasta** | https://api.shasta.trongrid.io | https://shasta.tronscan.org | 开发测试（推荐） |
| **Nile** | https://api.nileex.io | https://nile.tronscan.org | 新功能测试 |
| **Mainnet** | https://api.trongrid.io | https://tronscan.org | 生产环境 |

---

## 💰 获取测试代币

### Shasta 测试网
1. 访问: https://www.trongrid.io/faucet
2. 输入您的 TRON 地址
3. 完成验证后领取测试 TRX

### Nile 测试网
1. 访问: https://nileex.io/join/getJoinPage
2. 输入您的 TRON 地址
3. 领取测试 TRX

---

## 📝 使用示例

### 在代码中使用

```typescript
import { getTronNetworkConfig } from '@/lib/tron-config'

// 获取网络配置
const config = getTronNetworkConfig('SHASTA')
console.log('网络名称:', config.networkName)
console.log('RPC URL:', config.fullHost)
```

### 连接 TRON 节点

```javascript
const TronWeb = require('tronweb')

const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io'
})

// 获取当前区块
const block = await tronWeb.trx.getCurrentBlock()
console.log('当前区块:', block.block_header.raw_data.number)
```

---

## 🔧 常见问题

### Q: 如何选择测试网络？
**A:** 
- **Shasta**: 最稳定，适合日常开发
- **Nile**: 用于测试新功能
- **本地节点**: 完全控制，但需要同步数据

### Q: 测试代币在哪里领取？
**A:** 
- Shasta: https://www.trongrid.io/faucet
- Nile: https://nileex.io/join/getJoinPage

### Q: 本地节点同步需要多长时间？
**A:** 首次同步可能需要几小时，建议使用公共测试网络进行快速开发。

### Q: 如何查看节点日志？
**A:** 
```bash
docker logs -f tron-testnet-node
```

---

## 📚 更多资源

- [完整设置指南](./TRON_TESTNET_SETUP.md)
- [TRON 官方文档](https://developers.tron.network/)
- [TronWeb API 文档](https://developers.tron.network/reference)

---

## ✅ 验证安装

运行以下命令验证一切正常：

```bash
node scripts/test-tron.js shasta
```

如果看到 "✅ 所有测试完成！"，说明设置成功！

