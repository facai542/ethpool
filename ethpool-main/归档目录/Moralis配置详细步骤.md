# Moralis Stream 配置详细步骤

## 访问 Moralis Dashboard

1. 打开 https://admin.moralis.io/streams
2. 登录您的 Moralis 账户

---

## 创建新的 Stream

### 步骤 1: 点击 "Create Stream"

### 步骤 2: 配置 Contract Address

**重要**: 必须先设置合约地址

1. 在 "Contract Address" 字段输入:
   ```
   0xdAC17F958D2ee523a2206206994597C13D831ec7
   ```
   这是 USDT 合约地址

2. 选择网络: **Ethereum**

3. 选择事件: **Transfer**

### 步骤 3: 添加监听地址

1. 在 "Add address(es) to track" 部分
2. 输入要监听的地址:
   ```
   0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0
   ```
3. 点击 "Continue"

### 步骤 4: 设置 Webhook URL

1. 在 "Webhook URL" 字段输入:
   ```
   https://ethmax.vercel.app/api/moralis/webhook
   ```
2. 点击 "Continue"

### 步骤 5: 测试 Stream（可选）

1. 可以跳过测试，直接点击 "Continue"
2. 或输入一个区块号进行测试

### 步骤 6: 部署 Stream

1. 点击 "Deploy" 按钮
2. 等待部署完成
3. 确认 Stream 状态为 "Active"

---

## 验证配置

### 检查 Stream 状态

1. 在 Streams 列表中
2. 确认状态显示为 "Active"
3. 点击进入 Stream 详情

### 检查监听地址

1. 在 Stream 详情页面
2. 查看 "Addresses" 部分
3. 确认地址 `0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0` 在列表中

### 检查 Webhook URL

1. 确认 Webhook URL 为:
   ```
   https://ethmax.vercel.app/api/moralis/webhook
   ```

---

## 测试通知

### 发送测试交易

1. 向地址 `0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0` 发送 1 USDT
2. 等待交易确认（约 1-2 分钟）

### 检查 Telegram 群组

1. 打开 Telegram 群组: -1003149735777
2. 查看是否收到交易通知

### 预期通知格式

```
收入USDT 提醒

钱包余额: XXX.XX USDT
用户钱包: 0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0
订单金额: 1.00 USDT
交易对象: 0x...
执行操作: 客户收入
交易哈希: 0x...
区块高度: ...
```

---

## 常见问题

### Q: 找不到 Contract Address 字段？
A: 确保在创建新 Stream 时，先选择 "Contract" 类型，而不是 "Address" 类型

### Q: 如何添加多个地址？
A: 在 "Add address(es) to track" 部分，每行输入一个地址，或用逗号分隔

### Q: Webhook 测试失败？
A: 确保 Vercel 部署已完成，URL 可以正常访问

### Q: 收不到通知？
A: 检查 Telegram Bot Token 和 Chat ID 是否正确设置

---

## 完成后的状态

配置成功后，您应该看到:

1. Stream 状态: Active
2. 监听地址: 0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0
3. 合约地址: 0xdAC17F958D2ee523a2206206994597C13D831ec7
4. Webhook URL: https://ethmax.vercel.app/api/moralis/webhook

现在可以向该地址发送 USDT 测试通知功能。

