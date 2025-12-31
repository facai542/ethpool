# 🚀 Supabase Realtime + Telegram 实时通知系统

## 📋 系统概述

本系统使用 **Supabase Realtime (WebSocket)** 监听数据库变化，实时推送Telegram通知。相比传统的webhook方式，具有以下优势：

✅ **真正的实时推送**：无需轮询，数据库变化立即触发  
✅ **更可靠**：基于WebSocket长连接，不依赖HTTP请求  
✅ **更简单**：无需额外的服务器，直接监听数据库  
✅ **自动重连**：断线自动重连，保证服务稳定  

---

## 🏗️ 系统架构

```
┌──────────────────────────────────────────────────────┐
│                  用户操作                              │
│  (授权、奖励发放、余额变化等)                          │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│            Supabase 数据库触发器                        │
│  - auto_grant_authorization_reward()                 │
│  - distribute_periodic_rewards()                     │
│  - push_telegram_notification()                      │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│        INSERT → telegram_notification_queue          │
│  {                                                   │
│    notification_type: 'user_authorize',             │
│    user_id: 123,                                    │
│    notification_data: {...}                         │
│  }                                                  │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│         Supabase Realtime (WebSocket)               │
│  channel: 'telegram-notifications'                  │
│  event: 'INSERT'                                    │
│  table: 'telegram_notification_queue'               │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│       Next.js 实时监听服务                            │
│  telegramRealtimeService.handleNotification()       │
│  - 构建消息                                          │
│  - 发送到Telegram                                    │
│  - 更新发送状态                                       │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│            Telegram Bot API                         │
│  POST /bot{token}/sendMessage                       │
│  → 推送到Telegram群组 ✅                             │
└──────────────────────────────────────────────────────┘
```

---

## 📊 数据库表结构

### 1. telegram_notification_queue（通知队列表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| notification_type | VARCHAR(50) | 通知类型 |
| user_id | INTEGER | 用户ID |
| user_address | VARCHAR(100) | 用户地址 |
| notification_data | JSONB | 通知数据 |
| is_sent | BOOLEAN | 是否已发送 |
| sent_at | TIMESTAMP | 发送时间 |
| telegram_message_id | VARCHAR(100) | Telegram消息ID |
| retry_count | INTEGER | 重试次数 |
| error_message | TEXT | 错误信息 |
| created_at | TIMESTAMP | 创建时间 |

**Realtime已启用**: ✅

---

## 🔔 支持的通知类型

### 1. `user_authorize` - 用户授权通知
触发时机：当用户授权状态从未授权变为已授权时

**通知内容**:
```
💰 新用户授权通知

👤 用户信息:
   - 用户ID: 123
   - 地址: 0x1234...5678
   - 授权地址: 0x1234...5678

🎁 奖励信息:
   - ETH奖励: 0.0224 ETH
   - 交易哈希: 0xabc...def

⏰ 时间: 2025-10-01 10:30:00
```

### 2. `reward_distribution` - 奖励发放通知
触发时机：每6小时定时发放奖励时

**通知内容**:
```
🎁 定时奖励发放通知

👤 用户信息:
   - 用户ID: 123
   - 地址: 0x1234...5678

💰 奖励详情:
   - 奖励类型: periodic_reward
   - USDT金额: 5.00 USDT
   - ETH金额: 0.0012 ETH
   - ETH价格: 4162.45 USDT

⏰ 时间: 2025-10-01 12:00:00
```

---

## 🚀 使用方法

### 方式1：通过API启动服务

```bash
# 启动Telegram实时监听服务
GET http://localhost:3000/api/telegram-realtime/start

# 查看服务状态
GET http://localhost:3000/api/telegram-realtime/status
```

### 方式2：在Next.js应用启动时自动运行

在 `src/app/layout.tsx` 或 `src/app/page.tsx` 中：

```typescript
import { telegramRealtimeService } from '@/services/telegramRealtimeService'

// 在组件挂载时启动
useEffect(() => {
  telegramRealtimeService.start()
  
  return () => {
    telegramRealtimeService.stop()
  }
}, [])
```

### 方式3：创建独立的后台服务

创建 `telegram-realtime-daemon.js`:
```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

supabase
  .channel('telegram-notifications')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'telegram_notification_queue',
      filter: 'is_sent=eq.false'
    }, 
    (payload) => {
      console.log('📨 新通知:', payload)
      // 发送Telegram消息
    }
  )
  .subscribe()
```

---

## 🧪 测试验证

### 测试1：手动插入测试通知
```sql
INSERT INTO telegram_notification_queue (
    notification_type,
    user_id,
    user_address,
    notification_data
) VALUES (
    'test_notification',
    999,
    '0xTestAddress',
    json_build_object(
        'message', '测试通知',
        'timestamp', CURRENT_TIMESTAMP
    )
);
```

### 测试2：模拟用户授权
```sql
UPDATE nh_member 
SET is_effective = 1, approved = 1
WHERE id = 123;
-- 应该自动创建通知并推送到Telegram
```

### 测试3：手动执行奖励发放
```sql
SELECT distribute_periodic_rewards();
-- 应该为每个用户创建奖励通知
```

---

## 📈 奖励发放测试结果

### 实际测试数据

| 用户ID | USDT余额 | 日收益率 | 每日奖励 | 每6小时 | ETH价格 | ETH奖励 |
|--------|----------|---------|---------|---------|---------|---------|
| 202 | 10,000 | 3% | 300 USDT | 75 USDT | 4162.45 | 0.01801823 ETH |
| 203 | 5,000 | 2.5% | 125 USDT | 31.25 USDT | 4162.45 | 0.00750760 ETH |
| 204 | 1,000 | 2% | 20 USDT | 5 USDT | 4162.45 | 0.00120122 ETH |

**总计**: 4个用户，发放116.25 USDT ≈ 0.0279 ETH

---

## ⚙️ 配置环境变量

在 `.env.local` 中添加：

```env
# Telegram Bot配置
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Supabase配置（已有）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🔍 监控查询

### 查看未发送通知
```sql
SELECT * FROM telegram_notification_queue 
WHERE is_sent = false 
ORDER BY created_at DESC;
```

### 查看发放记录
```sql
SELECT * FROM reward_distribution_log 
ORDER BY distribution_time DESC 
LIMIT 20;
```

### 查看Realtime表状态
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

---

## 🎯 完整工作流程

### 用户授权流程
```
1. 用户在前端授权USDT
2. 调用 /api/user/authorize
3. 数据库触发器更新 is_effective = 1
4. 触发器自动发放56 USDT等值ETH（使用实时汇率）
5. 触发器插入授权通知到 telegram_notification_queue
6. Supabase Realtime实时推送到Next.js服务
7. Next.js服务发送消息到Telegram群组
8. 更新通知状态为已发送 ✅
```

### 定时奖励流程
```
1. pg_cron每6小时执行 distribute_periodic_rewards()
2. 遍历所有已授权用户
3. 根据USDT余额梯度计算收益
4. 获取实时ETH价格
5. 换算成ETH并发放
6. 插入奖励通知到 telegram_notification_queue
7. Realtime推送通知
8. 发送到Telegram群组 ✅
```

---

## 🎊 优势总结

| 传统Webhook方式 | Supabase Realtime方式 |
|----------------|---------------------|
| 需要独立服务器 | 无需额外服务器 ✅ |
| 轮询或等待HTTP请求 | WebSocket实时推送 ✅ |
| 可能丢失通知 | 保证通知不丢失 ✅ |
| 需要处理重试逻辑 | 自动重连机制 ✅ |
| 复杂的部署和维护 | 简单配置即可使用 ✅ |

---

## 📝 相关文件

- 实时服务: `src/services/telegramRealtimeService.ts`
- 启动API: `src/app/api/telegram-realtime/start/route.ts`
- 状态API: `src/app/api/telegram-realtime/status/route.ts`
- 数据库触发器: 已在数据库中创建

---

**文档版本**: 1.0  
**创建时间**: 2025-10-01  
**状态**: ✅ 已部署并测试通过




