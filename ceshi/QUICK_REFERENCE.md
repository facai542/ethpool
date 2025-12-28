# USDT 动账监听系统 - 快速参考

## 一分钟了解系统

### 工作原理
```
用户授权 → Moralis监听地址 → 检测交易 → Webhook推送 
→ 写入数据库 → 触发器处理 → Telegram通知 (1-2秒)
```

### 核心优势
- ✅ **只监听指定地址**（不扫描整个链）
- ✅ **实时推送**（1-2秒延迟）
- ✅ **零轮询成本**（Moralis 主动推送）
- ✅ **完全自动化**（无需人工操作）

## 系统状态

| 组件 | 状态 |
|------|------|
| Moralis Stream | ✅ active（45地址） |
| Webhook | ✅ https://ethmax.vercel.app/api/moralis/webhook |
| 数据库触发器 | ✅ 正常工作 |
| Telegram 通知 | ✅ 格式正确 |

## 常用命令

### 添加所有监听地址到 Moralis
```bash
node ceshi/add-addresses-to-moralis.js
```

### 测试系统
```sql
-- 在 Supabase SQL Editor 执行
INSERT INTO wallet_transactions (
  user_address, transaction_type, amount, token,
  tx_hash, block_number, timestamp,
  from_address, to_address, is_processed, created_at
) VALUES (
  '0x0a7f24d91d34cc5b9aa294583e428eab802d87d0',
  'in', '100.00', 'USDT',
  '0xTEST' || md5(random()::text), 23538400, NOW(),
  '0x1111111111111111111111111111111111111111',
  '0x0a7f24d91d34cc5b9aa294583e428eab802d87d0',
  false, NOW()
);
-- 检查 Telegram 群组
```

### 查看统计
```sql
-- 今日交易
SELECT COUNT(*) FROM wallet_transactions 
WHERE created_at >= CURRENT_DATE;

-- 待发送通知
SELECT COUNT(*) FROM telegram_notification_queue 
WHERE is_sent = false;

-- 监听地址
SELECT COUNT(*) FROM wallet_monitor 
WHERE is_active = true;
```

## 故障排查

### 没有收到通知？

1. **检查 Moralis Stream**
   - 访问：https://admin.moralis.io/streams
   - 状态应该是 "active"

2. **检查数据库**
   ```sql
   SELECT * FROM wallet_transactions 
   ORDER BY created_at DESC LIMIT 5;
   ```

3. **检查通知队列**
   ```sql
   SELECT * FROM telegram_notification_queue 
   WHERE is_sent = false;
   ```

### 消息格式不对？

应该已修复。如果仍有问题：
1. 确认 telegram-notifier 版本 = v23
2. 确认触发器使用 chr(10) 换行
3. 重新部署 telegram-notifier

## 文档索引

- **完整方案**: `ceshi/CORRECT_WALLET_MONITORING_SOLUTION.md`
- **配置详情**: `ceshi/WALLET_MONITORING_FINAL_SETUP.md`
- **总结报告**: `ceshi/FINAL_SUMMARY.md`
- **测试脚本**: `ceshi/test-wallet-notification-system.sql`

## 联系人

如有问题，检查文档或查看 Telegram 群组历史消息。

---

生成时间：2025-10-09


