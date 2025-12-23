# 数据库导出说明

## 导出信息

- 源数据库: https://bfcpimnfgidhgigtgehs.supabase.co
- 导出时间: 2025-12-20 02:11:16
- 总表数: 107
- 成功: 107
- 失败: 0
- 总记录数: 33632
- SQL 文件大小: 6.47 MB

## 文件说明

### all_tables_data.sql
包含所有表数据的合并 SQL 文件，可以直接导入到目标数据库。

### 单独的表文件
每个表都有单独的 SQL 文件，格式为 `表名.sql`。

## 使用方法

### 方法 1: 使用 Supabase SQL Editor

1. 登录目标数据库 Dashboard
2. 打开 SQL Editor
3. 复制 `all_tables_data.sql` 的内容
4. 粘贴并执行

### 方法 2: 使用 psql

```bash
psql -h db.xybhjgbgusdyokrrfqst.supabase.co \
     -U postgres \
     -d postgres \
     -f all_tables_data.sql
```

### 方法 3: 使用 Supabase CLI

```bash
supabase db reset
# 然后导入 SQL 文件
```

## 注意事项

1. SQL 文件使用 `ON CONFLICT DO NOTHING`，不会覆盖现有数据
2. 所有 INSERT 语句包含在事务中（BEGIN/COMMIT）
3. 如果某个表导入失败，可以单独导入该表的 SQL 文件
4. 建议在导入前备份目标数据库

## 表列表

共 107 个表：
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
