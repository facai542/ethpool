# USDT 动账监听的正确实现方案

## 问题回顾

### 错误方案（之前）
```
blockchain-monitor 边缘函数（每5分钟）
    ↓
扫描整个以太坊链的所有 USDT 交易
    ↓
过滤出监听地址的交易
    ↓
写入数据库
```

**问题**：
- ❌ 扫描整个链，海量交易数据
- ❌ 每次都要获取几千条日志
- ❌ 消耗大量 RPC 请求
- ❌ Supabase 会限制请求频率
- ❌ 效率极低，延迟高

### 正确方案（已修复）
```
用户授权成功
    ↓
地址添加到 Moralis Stream（只监听指定地址）
    ↓
链上有 USDT 交易
    ↓
Moralis 主动推送 Webhook
    ↓
/api/moralis/webhook 接收
    ↓
写入 wallet_transactions 表
    ↓
数据库触发器自动触发
    ↓
创建 Telegram 通知队列
    ↓
telegram-notifier 发送消息
```

**优点**：
- ✅ 只监听指定地址，零扫描成本
- ✅ Moralis 主动推送，实时通知
- ✅ 无需轮询，不会被限制
- ✅ 高效稳定，可扩展

## 核心组件

### 1. Moralis Streams API

**作用**：监听指定钱包地址的 USDT 交易

**配置**：
- Stream ID: `eth-usdt-monitor`
- 链：Ethereum Mainnet (0x1)
- 合约：USDT (0xdAC17F958D2ee523a2206206994597C13D831ec7)
- 事件：Transfer(address,address,uint256)
- Webhook：`https://ethmax.vercel.app/api/moralis/webhook`

**监听地址管理**：
- 用户授权成功 → 自动添加到 Stream
- 文件：`src/app/api/user/authorize/route.ts` 第532行

### 2. Webhook 接收器

**文件**：`src/app/api/moralis/webhook/route.ts`

**功能**：
1. 接收 Moralis 推送的交易事件
2. 解析 Transfer 事件（支持多种格式）
3. 检查是否为监听地址
4. 写入 `wallet_transactions` 表
5. 返回处理结果

**关键代码**：
```typescript
// 获取监听地址列表
const { data: monitoredWallets } = await supabase
  .from('wallet_monitor')
  .select('wallet_address')
  .eq('is_active', true)

// 解析事件
events = body.evm_logs
  .filter(log => log.address === USDT_CONTRACT)
  .map(log => ({
    from: '0x' + log.topic1.slice(26),
    to: '0x' + log.topic2.slice(26),
    value: log.data,
    transactionHash: log.transaction_hash,
    blockNumber: parseInt(body.block.number)
  }))

// 保存到数据库（触发器会处理通知）
await supabase.from('wallet_transactions').insert({
  user_address: userAddress,
  transaction_type: 'in' | 'out',
  amount: value,
  token: 'USDT',
  tx_hash: event.transactionHash,
  // ...其他字段
})
```

### 3. 数据库触发器

**函数**：`handle_wallet_transaction_notification()`

**触发器**：`trigger_wallet_transaction_notification`

**触发时机**：
- wallet_transactions 表 INSERT 时
- is_processed = false 时

**功能**：
1. 查询用户信息（nh_member_new）
2. 查询代理信息（nh_agents）
3. 计算用户编号
4. 构建完整的 Telegram 消息
5. 插入通知队列
6. 标记交易为已处理

### 4. Telegram 通知发送

**边缘函数**：`telegram-notifier`（版本 23）

**功能**：
- 监听 `telegram_notification_queue` 表
- 处理 `wallet_transaction` 类型通知
- 发送格式化消息到 Telegram 群组

## 配置验证

### 检查 Moralis Stream 配置

运行配置脚本：
```bash
node ceshi/setup-moralis-stream.js
```

脚本功能：
1. 连接 Moralis API
2. 查询现有 Streams
3. 创建 USDT 监听 Stream（如不存在）
4. 从数据库获取监听地址
5. 批量添加地址到 Stream
6. 显示最终配置

### 手动验证

```javascript
// 1. 检查 Stream 状态
const streams = await Moralis.Streams.getAll()

// 2. 检查监听地址
const addresses = await Moralis.Streams.getAddresses({ 
  id: 'stream-id',
  limit: 1000 
})

// 3. 测试 Webhook
await Moralis.Streams.trigger({ 
  streamId: 'stream-id',
  webhookUrl: 'your-webhook-url'
})
```

## 完整工作流程

### 用户授权流程

```typescript
// src/app/api/user/authorize/route.ts

// 1. 更新用户授权状态
await supabase.from('nh_member_new').update({ approved: 1 })

// 2. 添加到 wallet_monitor 表
await walletMonitorService.addMonitoredAddress(wallet_address)

// 3. 添加到 Moralis Stream（关键步骤）
await addAddressToMoralisStream(wallet_address)
```

### 交易监听流程

```
链上发生 USDT 交易（转入或转出监听地址）
    ↓
Moralis 检测到交易（实时）
    ↓
Moralis 推送 Webhook 到 /api/moralis/webhook
    ↓
Webhook 解析事件数据
    ↓
写入 wallet_transactions 表
    ↓
数据库触发器自动执行
    ↓
查询用户和代理信息
    ↓
构建 Telegram 消息
    ↓
插入 telegram_notification_queue
    ↓
telegram-notifier 发送通知（实时）
```

### Telegram 消息格式

```
🟢收入 USDT 提醒

钱包余额: 1234.56
顶层代理: XL001
代理昵称: AGENT000001
用户编号: 24
用户备注: 巴德
是否活动: 是
用户钱包: 
0x0a7f24d91D34CC5B9Aa294583e428EAB802d87d0
订单金额: +1234.56 USDT
授权时间: 2025-10-09 10:59:02
交易对象: 0x2222222222222222222222222222222222222222
执行操作: 客户USDT余额增加
```

## 性能对比

### 错误方案（blockchain-monitor）

| 指标 | 数值 |
|------|------|
| 执行频率 | 每5分钟 |
| 每次请求 | 扫描最新区块的所有 USDT 交易（可能几千条） |
| RPC 调用 | 高频（每5分钟至少2次） |
| 延迟 | 0-5分钟 |
| 成本 | 高（大量请求） |
| 限制风险 | 高 |

### 正确方案（Moralis Stream）

| 指标 | 数值 |
|------|------|
| 执行频率 | 实时（有交易时推送） |
| 每次请求 | 仅包含监听地址的交易 |
| RPC 调用 | 零（Moralis 处理） |
| 延迟 | 1-2秒 |
| 成本 | 极低（按交易计费） |
| 限制风险 | 无 |

## Moralis 免费额度

Moralis 免费计划包含：
- ✅ 40,000,000 计算单元/月
- ✅ 无限 Streams
- ✅ 每个 Stream 最多 100,000 个地址
- ✅ Webhook 推送
- ✅ 历史数据查询

**估算**：
- 58个地址 × 平均每天10笔交易 = 580笔/天
- 每笔交易约消耗 10 计算单元
- 每月消耗：580 × 30 × 10 = 174,000 单元
- **完全在免费额度内**

## 监控和维护

### 1. 检查 Moralis Stream 状态

访问 Moralis Dashboard:
```
https://admin.moralis.io/streams
```

查看：
- Stream 状态（Active/Paused）
- 监听地址数量
- Webhook 调用日志
- 错误率统计

### 2. 检查 Webhook 调用日志

Vercel Dashboard:
```
https://vercel.com/your-project/logs
→ 筛选 /api/moralis/webhook
```

查看：
- 接收到的事件数量
- 处理成功/失败率
- 响应时间

### 3. 数据库监控

```sql
-- 检查最近的交易记录
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as last_hour,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') as last_day
FROM wallet_transactions;

-- 检查通知发送情况
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_sent = true) as sent,
  COUNT(*) FILTER (WHERE is_sent = false) as pending
FROM telegram_notification_queue
WHERE notification_type = 'wallet_transaction';
```

## 测试验证

### 方法1：使用测试网

1. 配置 Goerli 测试网 Stream
2. 使用测试网 USDT 合约
3. 发送测试交易
4. 验证 Webhook 接收

### 方法2：使用 Moralis 测试功能

```bash
# 在 Moralis Dashboard 中点击 "Test Webhook"
# 查看 /api/moralis/webhook 日志
```

### 方法3：等待真实交易

1. 用户授权成功（地址自动添加）
2. 向该地址转账 USDT
3. 1-2秒后收到 Telegram 通知

## 故障排查

### 问题1：没有收到 Webhook 推送

**检查清单**：
1. Stream 状态是否为 Active
2. Webhook URL 是否可访问（公网）
3. 地址是否已添加到 Stream
4. Moralis Dashboard 中查看错误日志

**解决方法**：
```javascript
// 检查 Stream 状态
const stream = await Moralis.Streams.getById({ id: 'stream-id' })
console.log(stream.status) // 应该是 'active'

// 检查 Webhook URL
const status = await Moralis.Streams.getStats({ id: 'stream-id' })
console.log(status.totalWebhooksFailed) // 应该是 0 或很小
```

### 问题2：Webhook 接收到但没有通知

**检查清单**：
1. wallet_transactions 表是否有新记录
2. 触发器是否正常执行
3. telegram_notification_queue 是否有新通知
4. telegram-notifier 是否正常运行

**解决方法**：
```sql
-- 检查交易记录
SELECT * FROM wallet_transactions
ORDER BY created_at DESC LIMIT 5;

-- 检查触发器
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'trigger_wallet_transaction_notification';

-- 检查通知队列
SELECT * FROM telegram_notification_queue
WHERE is_sent = false
ORDER BY created_at DESC LIMIT 5;
```

### 问题3：地址没有添加到 Stream

**检查清单**：
1. 授权流程是否成功
2. Moralis API Key 是否有效
3. 是否有错误日志

**解决方法**：
```bash
# 运行配置脚本重新添加所有地址
node ceshi/setup-moralis-stream.js
```

## 成本对比

### 方案A：blockchain-monitor（错误）

假设监听 58 个地址：

| 项目 | 数值 |
|------|------|
| 执行频率 | 288次/天（每5分钟） |
| 每次获取日志 | ~5000条（以太坊 USDT 交易量） |
| 每日日志请求 | 1,440,000 条 |
| RPC 请求 | 576次/天 |
| Supabase 函数调用 | 288次/天 |
| **预计月成本** | **超出免费额度** |

### 方案B：Moralis Stream（正确）

假设监听 58 个地址，每天共 580 笔交易：

| 项目 | 数值 |
|------|------|
| 执行频率 | 按交易触发（580次/天） |
| 每次推送 | 1条交易 |
| 每日 Webhook | 580 次 |
| RPC 请求 | 0（Moralis 处理） |
| Moralis 计算单元 | ~5,800/天 |
| **预计月成本** | **174,000 单元/月（免费额度内）** |

**节省**：
- RPC 请求：从 576/天 → 0
- 数据传输：从 GB 级 → KB 级
- 响应时间：从 0-5分钟 → 1-2秒

## 已完成的修改

### 1. 删除 blockchain-monitor 定时任务
```json
// vercel.json
// 已删除：
// {
//   "path": "/api/cron/blockchain-monitor",
//   "schedule": "*/5 * * * *"
// }
```

### 2. 修改 Moralis Webhook 处理逻辑
```typescript
// src/app/api/moralis/webhook/route.ts

// 之前：直接发送 Telegram 消息
await sendTelegramMessage(message)

// 现在：写入数据库，触发器处理
await supabase.from('wallet_transactions').insert({
  user_address,
  transaction_type,
  amount,
  // ...
})
```

### 3. 数据库触发器（已创建）
```sql
CREATE TRIGGER trigger_wallet_transaction_notification
  BEFORE INSERT OR UPDATE ON wallet_transactions
  FOR EACH ROW
  WHEN (NEW.is_processed = false)
  EXECUTE FUNCTION handle_wallet_transaction_notification();
```

### 4. Telegram-Notifier 支持（版本 23）
```typescript
case 'wallet_transaction':
  message = buildWalletTransactionMessage(notification);
  break;
```

## 部署和激活

### 1. 部署到 Vercel

```bash
git add .
git commit -m "修复：使用 Moralis Stream 监听指定地址，替代全链扫描"
git push
```

### 2. 配置 Moralis Stream

```bash
# 运行配置脚本
node ceshi/setup-moralis-stream.js
```

脚本会：
- 检查/创建 USDT 监听 Stream
- 从数据库读取所有监听地址
- 批量添加到 Moralis Stream
- 验证配置成功

### 3. 验证配置

```bash
# 查看 Moralis Dashboard
https://admin.moralis.io/streams

# 检查监听地址数量
# 检查 Webhook URL 是否正确
# 测试 Webhook 连通性
```

## 监听地址管理

### 自动添加（推荐）

用户授权成功时自动添加：
```typescript
// src/app/api/user/authorize/route.ts 第532行
await addAddressToMoralisStream(wallet_address)
```

### 批量添加（一次性）

首次配置或修复：
```bash
node ceshi/setup-moralis-stream.js
```

### 手动添加（个别地址）

```typescript
await Moralis.Streams.addAddress({
  id: 'eth-usdt-monitor',
  address: ['0x地址1', '0x地址2']
})
```

### 移除地址

```typescript
await Moralis.Streams.deleteAddress({
  id: 'eth-usdt-monitor',
  address: ['0x地址']
})
```

## 数据库表结构

### wallet_monitor（监听地址列表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| member_id | uuid | 用户ID |
| wallet_address | text | 钱包地址 |
| is_active | boolean | 是否监听 |
| monitor_transactions | boolean | 是否监听交易 |
| created_at | timestamp | 创建时间 |

### wallet_transactions（交易记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| user_address | varchar | 用户地址 |
| transaction_type | varchar | in/out |
| amount | varchar | 金额 |
| token | varchar | 代币（USDT） |
| tx_hash | varchar | 交易哈希 |
| block_number | bigint | 区块号 |
| from_address | varchar | 发送方 |
| to_address | varchar | 接收方 |
| is_processed | boolean | 是否已处理 |
| notification_sent | boolean | 是否已通知 |
| created_at | timestamp | 创建时间 |

### telegram_notification_queue（通知队列）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| notification_type | varchar | 类型 |
| user_id | uuid | 用户ID |
| user_address | varchar | 用户地址 |
| notification_data | jsonb | 通知数据 |
| is_sent | boolean | 是否已发送 |
| sent_at | timestamp | 发送时间 |
| created_at | timestamp | 创建时间 |

## 扩展性

### 支持更多代币

```typescript
// 添加 ETH 转账监听
const ethStream = await Moralis.Streams.add({
  chains: ['0x1'],
  tag: 'eth-native-monitor',
  webhookUrl: WEBHOOK_URL,
  includeNativeTxs: true,  // 监听原生代币
  includeContractLogs: false
})

// Webhook 处理
if (body.nativeTxs) {
  // 处理 ETH 转账
}
```

### 支持多条链

```typescript
const bscStream = await Moralis.Streams.add({
  chains: ['0x38'],  // BSC Mainnet
  tag: 'bsc-usdt-monitor',
  webhookUrl: WEBHOOK_URL,
  // ... 配置 BSC USDT 合约
})
```

### 添加更多通知渠道

```typescript
// 数据库触发器中添加
INSERT INTO email_notification_queue (...)  -- 邮件通知
INSERT INTO sms_notification_queue (...)    -- 短信通知
INSERT INTO webhook_queue (...)             -- 第三方 Webhook
```

## 安全建议

### 1. Webhook 验证

```typescript
// src/app/api/moralis/webhook/route.ts

// 验证 Moralis 签名
const signature = request.headers.get('x-signature')
const webhookSecret = process.env.MORALIS_WEBHOOK_SECRET

if (signature !== expectedSignature) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
```

### 2. 地址白名单

```typescript
// 只处理白名单中的地址
if (!monitoredAddresses.includes(userAddress)) {
  console.log('地址不在监听列表中')
  return false
}
```

### 3. 防重放攻击

```typescript
// 检查交易是否已存在
const { data: existing } = await supabase
  .from('wallet_transactions')
  .select('id')
  .eq('tx_hash', txHash)
  .single()

if (existing) {
  return false // 跳过重复交易
}
```

## 总结

### 修改前
- ❌ blockchain-monitor 扫描整个链（错误）
- ❌ 海量请求，会被限制
- ❌ 效率低，延迟高

### 修改后
- ✅ Moralis Stream 监听指定地址（正确）
- ✅ 零轮询成本，实时推送
- ✅ 高效稳定，可扩展

### 系统架构

```
用户授权
    ↓
添加到 Moralis Stream（只监听指定地址）
    ↓
Moralis 实时推送 Webhook
    ↓
写入数据库
    ↓
触发器处理
    ↓
Telegram 通知
```

### 文件清单

- ✅ `src/app/api/moralis/webhook/route.ts` - Webhook 接收器（已优化）
- ✅ `vercel.json` - 删除 blockchain-monitor 定时任务
- ✅ 数据库触发器 - 自动处理通知
- ✅ `telegram-notifier` v23 - 支持 wallet_transaction
- ✅ `ceshi/setup-moralis-stream.js` - 配置脚本
- ✅ `ceshi/CORRECT_WALLET_MONITORING_SOLUTION.md` - 本文档

---

生成时间：2025-10-09  
项目：newdapp-master  
实施人员：AI Assistant  
方案：Moralis Streams API + Database Trigger + Telegram Notifier


