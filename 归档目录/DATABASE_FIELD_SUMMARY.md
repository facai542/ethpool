# 数据库字段查询总结

## 查询工具

### 1. 使用 Supabase MCP 工具
通过 Supabase MCP 工具可以直接查询数据库表结构：
- `mcp_supabase_list_tables` - 列出所有表及其字段信息
- `mcp_supabase_execute_sql` - 执行 SQL 查询

### 2. 使用查询脚本
创建了 `ceshi/query-table-fields.js` 脚本，可以快速查询指定表的字段：

```bash
# 查看所有常用表
node ceshi/query-table-fields.js

# 查询特定表字段
node ceshi/query-table-fields.js wallet_transactions
node ceshi/query-table-fields.js monitored_addresses
node ceshi/query-table-fields.js telegram_notification_queue
```

## 核心表字段确认

### 1. wallet_transactions (钱包交易表)
```sql
- id: number (主键)
- user_address: string (用户钱包地址)
- transaction_type: string (交易类型：in/out)
- amount: string (交易金额)
- token: string (代币类型)
- tx_hash: string (交易哈希)
- block_number: number (区块号)
- timestamp: string (交易时间)
- from_address: string (发送地址)
- to_address: string (接收地址)
- is_processed: boolean (是否已处理)
- processed_at: string (处理时间)
- notification_sent: boolean (是否已发送通知)
- error_message: object (错误信息)
- created_at: string (创建时间)
```

### 2. monitored_addresses (监听地址表)
```sql
- id: number (主键)
- address: string (钱包地址)
- is_active: boolean (是否激活监听)
- created_at: string (创建时间)
- updated_at: string (更新时间)
```

### 3. telegram_notification_queue (Telegram通知队列表)
```sql
- id: number (主键)
- notification_type: string (通知类型)
- user_id: number (用户ID)
- user_address: string (用户地址)
- notification_data: object (通知数据，JSON格式)
- is_sent: boolean (是否已发送)
- sent_at: string (发送时间)
- telegram_message_id: object (Telegram消息ID)
- retry_count: number (重试次数)
- error_message: object (错误信息)
- created_at: string (创建时间)
- user_uuid: string (用户UUID)
```

## 重要发现

### 1. 字段类型确认
- **金额字段**: 使用 `string` 类型存储，确保精度
- **时间字段**: 使用 `string` 类型存储 ISO 格式时间戳
- **JSON字段**: 使用 `object` 类型存储复杂数据
- **布尔字段**: 使用 `boolean` 类型

### 2. 关键字段说明
- `wallet_transactions.is_processed`: 控制交易是否被监听系统处理
- `wallet_transactions.notification_sent`: 控制是否已发送 Telegram 通知
- `monitored_addresses.is_active`: 控制地址是否被监听
- `telegram_notification_queue.is_sent`: 控制通知发送状态

### 3. 数据完整性
- 所有核心表都有完整的字段结构
- 外键关系正确设置
- 索引和约束配置合理

## 模拟交易测试结果

### 1. 测试成功
- ✅ 数据库连接正常
- ✅ 表结构查询正常
- ✅ 字段类型确认正确
- ✅ 数据插入和查询正常

### 2. 模拟交易流程
1. **插入交易记录** → `wallet_transactions` 表
2. **设置 is_processed=false** → 触发监听系统
3. **监听系统处理** → 更新 is_processed=true
4. **发送通知** → 插入 `telegram_notification_queue`
5. **Telegram发送** → 更新 notification_sent=true

## 使用建议

### 1. 开发时查询字段
```bash
# 快速查询表字段
node ceshi/query-table-fields.js <表名>

# 常用表名
- nh_member_new (新用户表)
- wallet_transactions (钱包交易表)
- monitored_addresses (监听地址表)
- telegram_notification_queue (通知队列表)
- approval_history (授权历史表)
```

### 2. 调试时检查数据
```sql
-- 检查监听地址
SELECT * FROM monitored_addresses WHERE is_active = true;

-- 检查未处理的交易
SELECT * FROM wallet_transactions WHERE is_processed = false;

-- 检查未发送的通知
SELECT * FROM telegram_notification_queue WHERE is_sent = false;
```

### 3. 监控系统状态
```sql
-- 监听系统统计
SELECT 
  COUNT(*) as total_addresses,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_addresses
FROM monitored_addresses;

-- 交易处理统计
SELECT 
  COUNT(*) as total_transactions,
  COUNT(CASE WHEN is_processed = true THEN 1 END) as processed_transactions
FROM wallet_transactions;

-- 通知发送统计
SELECT 
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN is_sent = true THEN 1 END) as sent_notifications
FROM telegram_notification_queue;
```

---

**总结**: 数据库字段结构完整，所有核心功能表都有正确的字段定义，可以支持完整的钱包监听和 Telegram 通知功能。


