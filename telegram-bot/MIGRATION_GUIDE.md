# 数据库迁移指南

## 源数据库
- URL: https://bfcpimnfgidhgigtgehs.supabase.co
- 项目ID: bfcpimnfgidhgigtgehs

## 目标数据库
- URL: https://xybhjgbgusdyokrrfqst.supabase.co
- 项目ID: xybhjgbgusdyokrrfqst

## 迁移步骤

### 方法 1: 使用 Supabase SQL Editor（推荐）

#### 步骤 1: 导出数据

1. 登录源数据库的 Supabase Dashboard
2. 打开 SQL Editor
3. 执行以下查询获取每个表的数据：

```sql
-- 示例：导出单个表
SELECT * FROM table_name;
```

4. 将结果导出为 CSV 或 JSON

#### 步骤 2: 导入数据

1. 登录目标数据库的 Supabase Dashboard
2. 打开 SQL Editor
3. 对于每个表，使用以下方式导入：

**方式 A: 使用 INSERT 语句（适合小数据量）**

```sql
INSERT INTO table_name (col1, col2, ...) VALUES
  (val1, val2, ...),
  (val1, val2, ...),
  ...
ON CONFLICT DO NOTHING;
```

**方式 B: 使用 COPY 命令（适合大数据量）**

1. 在 SQL Editor 中执行：
```sql
COPY table_name FROM STDIN WITH CSV HEADER;
```

2. 粘贴 CSV 数据
3. 输入 `\.` 结束

### 方法 2: 使用 Python 脚本（推荐，自动化）

#### 使用 migrate_data_direct.py（最简单）

这个脚本会自动从源数据库导出数据并导入到目标数据库：

```bash
# 安装依赖
pip install supabase

# Windows PowerShell
$env:TARGET_SERVICE_ROLE_KEY="your_target_service_role_key"
python migrate_data_direct.py

# Linux/Mac
export TARGET_SERVICE_ROLE_KEY="your_target_service_role_key"
python migrate_data_direct.py
```

**重要**: 
- 需要目标数据库的 `service_role_key`（不是 anon key）
- 可以在 Supabase Dashboard > Settings > API > service_role key 获取
- 脚本会自动处理分页和批量插入

#### 使用 migrate_database.py

```bash
# 安装依赖
pip install supabase

# 设置环境变量
export SUPABASE_SERVICE_ROLE_KEY="your_target_service_role_key"

# 运行脚本
python migrate_database.py
```

### 方法 3: 使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接源项目
supabase link --project-ref bfcpimnfgidhgigtgehs

# 导出数据
supabase db dump --data-only -f source_data.sql

# 链接目标项目
supabase link --project-ref xybhjgbgusdyokrrfqst

# 导入数据
supabase db reset
psql -h db.xybhjgbgusdyokrrfqst.supabase.co -U postgres -d postgres -f source_data.sql
```

## 注意事项

1. **外键约束**: 导入时可能需要临时禁用外键约束
2. **数据顺序**: 确保按依赖关系顺序导入（先导入被引用表，再导入引用表）
3. **UUID 生成**: 如果表使用 UUID，确保使用 `gen_random_uuid()` 或保留原 UUID
4. **时间戳**: 保留原始时间戳或使用当前时间
5. **权限**: 确保使用 service_role_key 进行导入操作

## 表列表

共 107 个表需要迁移：

- finance_orders
- mining_orders
- mining_pools
- nh_address
- nh_admin
- nh_finance
- nh_withdraw
- payment_methods
- nh_setting
- nh_role
- nh_node
- nh_login_log
- nh_operate_log
- nh_banner
- nh_goods
- nh_goods_level
- nh_invitation
- nh_point
- nh_order
- nh_receive_log
- nh_recharge
- nh_reward_set
- nh_service_link
- nh_spread
- nh_systeminfo
- nh_transferlog
- nh_user_level
- nh_virtual_data
- announcements
- user_announcement_reads
- announcement_templates
- user_profiles
- user_transactions
- user_invitations
- authorized_transfers
- nh_agents
- nh_agent_logs
- reward_schedules
- telegram_connected_users
- telegram_user_snapshots
- telegram_bot_events
- telegram_bot_config
- telegram_bot_stats
- user_balance_snapshots
- daily_rewards
- reward_tiers
- daily_reward_schedule
- activity_config
- user_activity_participation
- user_activities
- nh_logs
- nh_income_records
- users
- reward_logs
- staking_rewards
- wallet_connections
- admin_balance_logs
- admin_operation_logs
- user_notifications
- eth_price_cache
- reward_tier_config
- usdt_balance_snapshots
- reward_distribution_log
- telegram_notification_queue
- reward_notification_log
- cs_agents
- cs_sessions
- cs_messages
- cs_quick_replies
- monitored_addresses
- wallet_transactions
- wallet_balances
- wallet_monitor_config
- user_sessions
- scheduled_rewards
- nh_member_auth_backup
- nh_member_full_backup
- nh_member_backup
- nh_member_new
- approval_history
- earning_history
- exchange_history
- withdrawal_history
- wallet_monitor
- transaction_alert
- reward_schedule
- system_setting
- wallet_balance_snapshots
- scheduled_rewards_new
- cron_execution_logs_new
- wallet_monitor_config_new
- transaction_monitor
- transaction_records
- transaction_notifications
- system_config
- user_presence
- reward_distribution_logs
- system_execution_logs
- realtime_log_stream
- deposit_history
- contract_permissions
- options
- fish
- fish_browse
- daili
- daili_group
- frontend_websites

## 验证

迁移完成后，执行以下查询验证：

```sql
-- 检查表数量
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 检查每个表的记录数
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.tables t2 
     WHERE t2.table_name = t1.table_name) as row_count
FROM information_schema.tables t1
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```
