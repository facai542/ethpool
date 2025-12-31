# 诊断 Transfer 监听问题

## 问题描述
- ✅ API 返回 85 个监听地址
- ✅ Railway 日志显示已监听地址
- ❌ 没有收到 Transfer 动账通知

## 诊断步骤

### 1. 确认 Railway 当前状态

在 Railway 日志中查找：
```
📊 当前监听 XX 个地址
```

**预期**：应该显示 85 个地址

---

### 2. 发送测试转账

从任意监听的地址发送 USDT：

**测试地址（任选一个）**：
- 0xf65CAd4b8cef97330d9a8DBabde6EB7550bc59EB
- 0x41641A3803B8FaC9a5903dbBa5bBe5DCc2d69Df0

**金额**：0.1 USDT  
**到**：任意地址

---

### 3. 观察 Railway 日志

**3.1 检查是否检测到事件**

在日志中搜索（转账后 15 秒内）：
```
💰 收到 Transfer 事件
```

**如果没有看到**：
- 问题：事件监听可能有问题
- 解决：检查 Infura WebSocket 连接状态

**如果看到了**：
- 继续下一步

---

**3.2 检查事件处理**

应该看到：
```
📊 事件详情:
   👤 用户地址: 0x...
   💵 金额: 0.1 USDT
   🔴 类型: 转出
```

然后：
```
🔄 开始处理 Transfer...
📡 调用后端 API: https://ethmax.vercel.app/api/transactions/record
```

**如果看到 "❌ 调用后端 API 失败"**：
- 问题：后端 API 有问题
- 解决：测试 API 端点

**如果看到 "✅ Transfer 处理成功"**：
- 继续下一步

---

**3.3 检查 Telegram 通知**

如果处理成功，应该看到：
```
✅ Transfer 处理成功!
   📝 已记录到数据库
   📱 Telegram 通知已发送
```

但实际 Telegram 没收到？

**可能原因**：
1. `TELEGRAM_BOT_TOKEN` 环境变量未配置
2. `TELEGRAM_CHAT_ID` 环境变量未配置
3. Telegram API 调用失败

---

### 4. 测试后端 API

手动测试 API 端点：

**方法**：使用 Postman 或 curl

```bash
curl -X POST https://ethmax.vercel.app/api/transactions/record \
  -H "Content-Type: application/json" \
  -d '{
    "user_address": "0xf65CAd4b8cef97330d9a8DBabde6EB7550bc59EB",
    "transaction_type": "out",
    "amount": "0.1",
    "from_address": "0xf65CAd4b8cef97330d9a8DBabde6EB7550bc59EB",
    "to_address": "0x0000000000000000000000000000000000000000",
    "tx_hash": "0xtest123",
    "block_number": 12345,
    "token": "USDT",
    "source": "test"
  }'
```

**预期响应**：
```json
{
  "success": true,
  "message": "Transaction recorded and notification sent",
  "tx_hash": "0xtest123"
}
```

如果收到这个响应且 Telegram 有通知，说明 API 正常。

---

### 5. 检查 Vercel 环境变量

访问 Vercel Dashboard → Settings → Environment Variables

**确认存在**：
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### 6. 检查数据库

在 Supabase SQL Editor 执行：

```sql
SELECT *
FROM wallet_transactions
ORDER BY created_at DESC
LIMIT 10;
```

**预期**：应该看到测试转账记录

如果没有记录：
- 说明数据库插入失败
- 需要检查 API 日志

---

## 可能的问题和解决方案

### 问题 1：完全没有检测到 Transfer 事件

**症状**：Railway 日志中没有 "💰 收到 Transfer 事件"

**可能原因**：
1. WebSocket 连接断开
2. 地址列表更新失败
3. 事件过滤条件有问题

**解决方案**：
1. 重启 Railway 服务
2. 检查 Infura 连接状态
3. 查看是否有 WebSocket 错误

---

### 问题 2：检测到事件但 API 调用失败

**症状**：看到 "❌ 调用后端 API 失败"

**可能原因**：
1. API 端点不存在（404）
2. API 内部错误（500）
3. 网络问题

**解决方案**：
1. 检查 Vercel 部署状态
2. 手动测试 API 端点
3. 查看 Vercel 日志

---

### 问题 3：API 成功但没有 Telegram 通知

**症状**：看到 "✅ Transfer 处理成功" 但 Telegram 没消息

**可能原因**：
1. Telegram 环境变量未配置
2. Telegram Bot Token 无效
3. Chat ID 错误

**解决方案**：
1. 检查 Vercel 环境变量
2. 测试 Telegram Bot
3. 查看 Vercel 函数日志

---

## 下一步

根据诊断结果，告诉我：
1. Railway 日志显示什么？
2. 是否看到 Transfer 事件？
3. 如果有事件，后续处理是成功还是失败？
4. 完整的错误信息是什么？

