# TRON 测试网络节点创建指南

本指南将帮助您创建和配置 TRON 测试网络节点，用于开发和测试 TRC20 代币相关功能。

## 目录
1. [方法一：使用 Docker 运行本地 TRON 节点（推荐）](#方法一使用-docker-运行本地-tron-节点推荐)
2. [方法二：连接到公共测试网络](#方法二连接到公共测试网络)
3. [方法三：使用 TronBox 开发环境](#方法三使用-tronbox-开发环境)
4. [项目配置集成](#项目配置集成)

---

## 方法一：使用 Docker 运行本地 TRON 节点（推荐）

### 前置要求
- Docker 和 Docker Compose
- 至少 4GB 可用内存
- 至少 20GB 可用磁盘空间

### 步骤 1：创建 Docker Compose 配置

创建 `docker-compose.tron.yml` 文件：

```yaml
version: '3.8'

services:
  tron-node:
    image: tronprotocol/java-tron:latest
    container_name: tron-testnet-node
    ports:
      - "8090:8090"  # FullNode HTTP API
      - "8091:8091"  # FullNode gRPC API
      - "18888:18888"  # P2P 端口
    volumes:
      - ./tron-data:/tron/data
      - ./tron-config:/tron/config
    environment:
      - JVM_OPTS=-Xmx4g
    command: |
      java -Xmx4g -XX:+HeapDumpOnOutOfMemoryError \
      -jar /tron/FullNode.jar \
      -c /tron/config/main_net_config.conf \
      -d /tron/data
    restart: unless-stopped
    networks:
      - tron-network

networks:
  tron-network:
    driver: bridge
```

### 步骤 2：使用 TronQuickstart（最简单）

使用官方提供的快速启动工具：

```bash
# 克隆 TronQuickstart
git clone https://github.com/tronprotocol/tron-quickstart.git
cd tron-quickstart

# 启动本地测试网络（Shasta 测试网）
docker-compose -f docker-compose.yml up -d

# 查看日志
docker-compose logs -f
```

### 步骤 3：验证节点运行

```bash
# 检查节点状态
curl http://localhost:8090/wallet/getnowblock

# 应该返回当前区块信息
```

---

## 方法二：连接到公共测试网络

### Shasta 测试网络（推荐用于开发）

**网络信息：**
- RPC URL: `https://api.shasta.trongrid.io`
- 浏览器: https://shasta.tronscan.org
- 网络 ID: `201910292`

**获取测试代币：**
1. 访问 Shasta Faucet: https://www.trongrid.io/faucet
2. 输入您的 TRON 地址
3. 完成验证后领取测试 TRX

### Nile 测试网络（用于新功能测试）

**网络信息：**
- RPC URL: `https://api.nileex.io`
- 浏览器: https://nile.tronscan.org
- 网络 ID: `201910292`

---

## 方法三：使用 TronBox 开发环境

### 安装 TronBox

```bash
npm install -g tronbox
```

### 初始化项目

```bash
mkdir tron-project
cd tron-project
tronbox init
```

### 配置 `tronbox.js`

```javascript
module.exports = {
  networks: {
    development: {
      privateKey: 'your-private-key-here',
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'http://127.0.0.1:8090',
      network_id: '1'
    },
    shasta: {
      privateKey: 'your-private-key-here',
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
    mainnet: {
      privateKey: 'your-private-key-here',
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    }
  }
};
```

### 部署合约

```bash
# 部署到本地网络
tronbox migrate --network development

# 部署到 Shasta 测试网
tronbox migrate --network shasta
```

---

## 项目配置集成

### 1. 安装 TRON 相关依赖

```bash
npm install tronweb @tronweb3/tronwallet-adapters
```

### 2. 创建 TRON 网络配置文件

创建 `src/lib/tron-config.ts`:

```typescript
export interface TronNetworkConfig {
  fullHost: string
  networkId: string
  explorerUrl: string
  networkName: string
  usdtContract: string
  chainType: 'TRC20' | 'ERC20'
}

export const TRON_NETWORKS: Record<string, TronNetworkConfig> = {
  // Shasta 测试网
  SHASTA: {
    fullHost: 'https://api.shasta.trongrid.io',
    networkId: '201910292',
    explorerUrl: 'https://shasta.tronscan.org',
    networkName: 'Shasta Testnet',
    usdtContract: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', // Shasta 测试网 USDT
    chainType: 'TRC20'
  },
  // Nile 测试网
  NILE: {
    fullHost: 'https://api.nileex.io',
    networkId: '201910292',
    explorerUrl: 'https://nile.tronscan.org',
    networkName: 'Nile Testnet',
    usdtContract: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', // Nile 测试网 USDT
    chainType: 'TRC20'
  },
  // TRON 主网
  MAINNET: {
    fullHost: 'https://api.trongrid.io',
    networkId: '1',
    explorerUrl: 'https://tronscan.org',
    networkName: 'TRON Mainnet',
    usdtContract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // TRON 主网 USDT
    chainType: 'TRC20'
  },
  // 本地节点
  LOCAL: {
    fullHost: 'http://127.0.0.1:8090',
    networkId: '1',
    explorerUrl: 'http://localhost:8090',
    networkName: 'Local TRON Node',
    usdtContract: '', // 需要部署测试合约
    chainType: 'TRC20'
  }
}

// 获取当前网络配置
export function getTronNetworkConfig(network: string = 'SHASTA'): TronNetworkConfig {
  return TRON_NETWORKS[network] || TRON_NETWORKS.SHASTA
}
```

### 3. 创建 TRON Web3 工具类

创建 `src/lib/tron-web3.ts`:

```typescript
import TronWeb from 'tronweb'
import { getTronNetworkConfig } from './tron-config'

let tronWebInstance: TronWeb | null = null

export function getTronWeb(network: string = 'SHASTA'): TronWeb {
  if (tronWebInstance) {
    return tronWebInstance
  }

  const config = getTronNetworkConfig(network)
  
  tronWebInstance = new TronWeb({
    fullHost: config.fullHost,
    headers: { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY || '' }
  })

  return tronWebInstance
}

// 获取账户余额
export async function getTronBalance(address: string, network: string = 'SHASTA'): Promise<number> {
  const tronWeb = getTronWeb(network)
  const balance = await tronWeb.trx.getBalance(address)
  return tronWeb.fromSun(balance)
}

// 获取 TRC20 代币余额
export async function getTRC20Balance(
  contractAddress: string,
  userAddress: string,
  network: string = 'SHASTA'
): Promise<number> {
  const tronWeb = getTronWeb(network)
  const contract = await tronWeb.contract().at(contractAddress)
  const balance = await contract.balanceOf(userAddress).call()
  return tronWeb.toBigNumber(balance).dividedBy(1e6).toNumber() // USDT 6位小数
}

// 发送 TRC20 代币
export async function transferTRC20(
  contractAddress: string,
  toAddress: string,
  amount: number,
  privateKey: string,
  network: string = 'SHASTA'
): Promise<string> {
  const tronWeb = getTronWeb(network)
  tronWeb.setPrivateKey(privateKey)
  
  const contract = await tronWeb.contract().at(contractAddress)
  const amountInSun = tronWeb.toBigNumber(amount).multipliedBy(1e6).toFixed()
  
  const transaction = await contract.transfer(toAddress, amountInSun).send()
  return transaction
}
```

### 4. 更新环境变量

在 `.env.local` 中添加：

```env
# TRON 网络配置
TRON_NETWORK=SHASTA
TRON_API_KEY=your-tron-api-key-optional
TRON_PRIVATE_KEY=your-private-key-for-testing

# TRON 合约地址
TRON_USDT_CONTRACT=TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf
```

### 5. 创建测试脚本

创建 `scripts/test-tron.js`:

```javascript
const TronWeb = require('tronweb')
require('dotenv').config({ path: '.env.local' })

async function testTronConnection() {
  const tronWeb = new TronWeb({
    fullHost: 'https://api.shasta.trongrid.io'
  })

  try {
    // 获取当前区块
    const block = await tronWeb.trx.getCurrentBlock()
    console.log('✅ 连接成功！当前区块:', block.block_header.raw_data.number)
    
    // 获取账户信息（使用测试地址）
    const testAddress = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'
    const account = await tronWeb.trx.getAccount(testAddress)
    console.log('账户信息:', account)
    
    // 获取 TRC20 余额
    const usdtContract = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'
    const contract = await tronWeb.contract().at(usdtContract)
    const balance = await contract.balanceOf(testAddress).call()
    console.log('USDT 余额:', tronWeb.toBigNumber(balance).dividedBy(1e6).toString())
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message)
  }
}

testTronConnection()
```

运行测试：
```bash
node scripts/test-tron.js
```

---

## 快速开始（推荐）

### 使用 Docker Compose 快速启动

1. **创建 `docker-compose.tron.yml`**:

```yaml
version: '3.8'
services:
  tron-node:
    image: tronprotocol/tron-quickstart:latest
    ports:
      - "8090:8090"
      - "8091:8091"
    environment:
      - NETWORK=shasta
    restart: unless-stopped
```

2. **启动节点**:
```bash
docker-compose -f docker-compose.tron.yml up -d
```

3. **验证连接**:
```bash
curl http://localhost:8090/wallet/getnowblock
```

---

## 常见问题

### Q: 如何获取测试 TRX？
A: 访问 https://www.trongrid.io/faucet 或 https://nileex.io/join/getJoinPage

### Q: 本地节点同步需要多长时间？
A: 首次同步可能需要几个小时，取决于网络速度。建议使用公共测试网络进行快速开发。

### Q: 如何查看节点日志？
A: 
```bash
docker logs -f tron-testnet-node
```

### Q: TRC20 和 ERC20 有什么区别？
A: 
- TRC20 是 TRON 网络的代币标准
- ERC20 是以太坊网络的代币标准
- TRC20 交易费用更低，速度更快

---

## 参考资料

- [TRON 官方文档](https://developers.tron.network/)
- [java-tron GitHub](https://github.com/tronprotocol/java-tron)
- [TronBox 文档](https://www.tronbox.org/)
- [TronGrid API](https://www.trongrid.io/)
- [Shasta 测试网浏览器](https://shasta.tronscan.org)

---

## 下一步

1. 配置项目以支持 TRON 网络
2. 部署 TRC20 测试合约
3. 集成 TRON 钱包连接
4. 实现 TRC20 代币转账功能

