# Tokenview 自动化 - 最终配置步骤

## 🎯 你的目标（100%正确）

```
用户授权地址
    ↓
自动添加到 Tokenview 监控
    ↓
Tokenview 监听链上交易
    ↓
有交易时推送到 webhook
    ↓
保存到数据库 wallet_transactions 表
    ↓
数据库触发器自动触发
    ↓
插入到 telegram_notification_queue 表
    ↓
Edge Function 发送 Telegram 消息
    ↓
群组收到实时通知 ✅
```

## ✅ 你的逻辑完全正确

### 小修正

你说的：
> "通过 Supabase Realtime 将动账消息实时通过 Telegram 机器人发送到群组"

实际上：
> "通过数据库触发器 + Edge Function 将动账消息实时通过 Telegram 机器人发送到群组"

**Supabase Realtime 的作用：**
- ✅ 实时推送数据到**前端浏览器**（让前端页面实时更新）
- ❌ 不能直接发送 Telegram 消息

**正确的方案：**
- 数据库触发器 + Edge Function（或 HTTP API）
- 完全后端处理，无需前端在线
- 更可靠、更高效

## 📋 完整配置清单

### ✅ 已完成的部分

1. ✅ Webhook 接收端点 
   - `/api/tokenview/webhook` 已创建
   - 可以接收 Tokenview 推送的交易数据

2. ✅ Webhook Secret 已配置
   - `TOKENVIEW_WEBHOOK_SECRET=fSpkcrSkEMrMOxY65gr0`

3. ✅ Tokenview 自动添加代码已创建
   - `src/lib/tokenview.ts`
   - `src/app/api/user/authorize/route.ts`

4. ✅ 数据库表已存在
   - `wallet_monitor` - 监听地址列表
   - `wallet_transactions` - 交易记录
   - `telegram_notification_queue` - 通知队列

### ⏳ 需要配置的部分

#### 步骤1：添加 Tokenview API Key（必需）

**位置：** Vercel Dashboard → Settings → Environment Variables

**添加：**
```
名称：TOKENVIEW_API_KEY
值：[你的 Tokenview API Key]
环境：Production, Preview, Development
```

**如何获取：**
1. 访问 https://services.tokenview.io/en/dashboard
2. 登录你的账号
3. 找到 **API Keys** 或 **API 管理** 菜单
4. 复制 API Key
5. 粘贴到 Vercel 环境变量

#### 步骤2：创建数据库触发器（必需）

**位置：** Supabase Dashboard → SQL Editor

**执行：** `ceshi/创建Tokenview触发器.sql`

**步骤：**
1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 打开 `ceshi/创建Tokenview触发器.sql` 文件
4. 复制全部内容
5. 粘贴到 SQL Editor
6. 点击 Run（或按 Ctrl+Enter）
7. 看到 "✅ 触发器创建成功！" 表示成功

#### 步骤3：重新部署（必需）

**执行：**
```bash
git add .
git commit -m "feat: 集成 Tokenview 自动监控"
git push
```

或在 Vercel Dashboard 点击 **Redeploy**

## 🧪 测试流程

### 测试1：Webhook 端点可用性 ✅

你已经测试过了：
```json
{"service":"Tokenview Webhook Receiver","status":"active"}
```

### 测试2：自动添加监控地址

**步骤：**
1. 前端连接钱包
2. 授权 USDT 合约
3. 查看 Vercel 日志：

```bash
vercel logs --follow
```

**预期日志：**
```
🔍 添加地址到监控服务... 0x1234...
📡 添加地址到 Moralis Stream: 0x1234...
✅ Moralis Stream 地址已添加
📡 添加地址到 Tokenview 监控: 0x1234...
✅ 地址已添加到 Tokenview 监控
✅ 地址已添加到监控服务（Moralis/Tokenview）
```

### 测试3：数据库触发器

**在 Supabase SQL Editor 中执行：**

```sql
-- 替换为你实际的监控地址
INSERT INTO wallet_transactions (
  user_address,
  transaction_type,
  amount,
  token,
  tx_hash,
  block_number,
  timestamp,
  from_address,
  to_address,
  is_processed,
  created_at
) VALUES (
  '0x你的监控地址',
  'in',
  '100.50',
  'USDT',
  '0xtest_' || md5(random()::text || NOW()::text),
  23537500,
  NOW(),
  '0x1111111111111111111111111111111111111111',
  '0x你的监控地址',
  false,
  NOW()
);

-- 检查通知队列
SELECT 
  notification_type,
  user_address,
  notification_data->>'message' as message,
  is_sent,
  created_at
FROM telegram_notification_queue
ORDER BY created_at DESC
LIMIT 3;
```

**预期结果：**
- `is_sent = false`（等待发送）
- `message` 包含完整的 Telegram 消息内容

### 测试4：真实交易

**步骤：**
1. 向监控地址发送 0.1 USDT
2. 等待 15-30 秒（区块确认）
3. 查看 Vercel 日志
4. 检查 Telegram 群组是否收到通知

**预期日志（Tokenview）：**
```
📡 收到 Tokenview Webhook
💰 Transfer: 0x1234... → 0x5678... 0.100000 USDT
📝 保存交易到数据库
✅ 交易已保存，触发器将自动发送通知
```

**预期 Telegram 消息：**
```
🟢收入USDT 提醒       +0.1 USDT

顶层代理：直链注册
用户编号：123
用户昵称：测试用户
是否活动：是
用户钱包：
0x1234567890abcdef1234567890abcdef12345678

订单金额：+0.1 USDT
授权时间：2025-10-11 16:30:00
交易对象：
0xabcdef1234567890abcdef1234567890abcdef12
执行操作：客户转入
交易哈希：
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## 📊 架构对比

### ❌ 你的原始理解

```
数据库 → Supabase Realtime → Telegram
```

问题：Realtime 不能发送 Telegram 消息

### ✅ 实际架构

```
数据库触发器 → Edge Function → Telegram Bot API → 群组
```

优势：
- ⚡ 完全后端处理
- 🔒 无需前端在线
- 💯 100% 可靠

### 🎁 可选：前端实时更新

如果你想让前端页面实时显示交易，可以**额外**使用 Realtime：

```typescript
// 前端代码
const channel = supabase
  .channel('wallet-transactions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'wallet_transactions',
      filter: `user_address=eq.${userAddress}`
    },
    (payload) => {
      console.log('新交易:', payload.new)
      // 更新页面显示
    }
  )
  .subscribe()
```

但这**不影响** Telegram 通知！Telegram 通知由触发器 + Edge Function 处理。

## 🎯 技术流程总结

### 完整数据流

```
用户授权
    ↓
[前端] POST /api/user/authorize
    ↓
[后端] 保存到 wallet_monitor
    ↓
[后端] 调用 addAddressToTokenview()
    ↓
[Tokenview API] 添加地址监控
    ↓
[Tokenview] 监听链上交易
    ↓
[Tokenview] 有交易时 POST /api/tokenview/webhook
    ↓
[后端] 保存到 wallet_transactions 表
    ↓
[数据库] 触发器自动执行
    ↓
[数据库] 插入到 telegram_notification_queue
    ↓
[Edge Function] 读取队列并发送
    ↓
[Telegram Bot API] 推送消息到群组
    ↓
[群组] 收到实时通知 ✅
```

### 关键技术

| 技术 | 作用 | 是否必需 |
|------|------|---------|
| Tokenview | 监听链上交易 | ✅ 必需 |
| Next.js API Route | 接收 webhook | ✅ 必需 |
| PostgreSQL Trigger | 自动触发通知 | ✅ 必需 |
| Edge Function | 发送 Telegram | ✅ 必需 |
| Supabase Realtime | 前端实时更新 | ⚪ 可选 |

## ✅ 配置完成检查清单

配置完成后，请确认：

- [ ] Webhook 端点可访问（已验证 ✅）
- [ ] `TOKENVIEW_WEBHOOK_SECRET` 已配置（已完成 ✅）
- [ ] `TOKENVIEW_API_KEY` 已添加到 Vercel
- [ ] 数据库触发器已创建
- [ ] 项目已重新部署
- [ ] 测试授权地址自动添加
- [ ] 测试交易监听和通知

## 🎉 完成后的效果

1. **用户授权** → 地址自动添加到 Tokenview
2. **有交易** → Tokenview 自动推送到 webhook
3. **保存数据库** → 触发器自动创建通知
4. **Edge Function** → 自动发送 Telegram 消息
5. **群组收到通知** → 完全自动化 ✅

**全程无需任何手动操作！** 🎯

## 📚 相关文档

- `ceshi/Tokenview集成-完整实现方案.md` - 完整技术方案
- `ceshi/创建Tokenview触发器.sql` - 数据库触发器 SQL
- `ceshi/Tokenview自动添加-配置指南.md` - 自动添加配置

## 💡 常见问题

### Q：Supabase Realtime 到底有什么用？

A：Realtime 用于前端实时更新，例如：
- 交易列表实时刷新
- 余额实时变化
- 通知气泡实时显示

但它**不负责**发送 Telegram 消息。

### Q：如果不用 Realtime，Telegram 通知会失效吗？

A：**不会！** Telegram 通知由触发器 + Edge Function 处理，完全独立。

### Q：可以只用 Tokenview，不用 Moralis 吗？

A：可以！只需要不配置 `MORALIS_API_KEY` 即可。

### Q：两个监控服务会重复通知吗？

A：不会！代码会自动去重（通过 `tx_hash`）。

---

**现在你只需要完成 3 个步骤：**
1. ✅ 添加 `TOKENVIEW_API_KEY` 到 Vercel
2. ✅ 在 Supabase 执行 `创建Tokenview触发器.sql`
3. ✅ 重新部署项目

**然后就可以测试完整流程了！** 🚀

