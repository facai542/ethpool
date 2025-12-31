# -*- coding: utf-8 -*-
"""
生成 SQL 导出和导入脚本
用于在 Supabase SQL Editor 中执行
"""
import json
from datetime import datetime

# 源数据库项目ID
SOURCE_PROJECT_ID = "bfcpimnfgidhgigtgehs"
# 目标数据库项目ID  
TARGET_PROJECT_ID = "xybhjgbgusdyokrrfqst"

# 所有表列表
TABLES = [
    "finance_orders", "mining_orders", "mining_pools", "nh_address", "nh_admin",
    "nh_finance", "nh_withdraw", "payment_methods", "nh_setting", "nh_role",
    "nh_node", "nh_login_log", "nh_operate_log", "nh_banner", "nh_goods",
    "nh_goods_level", "nh_invitation", "nh_point", "nh_order", "nh_receive_log",
    "nh_recharge", "nh_reward_set", "nh_service_link", "nh_spread", "nh_systeminfo",
    "nh_transferlog", "nh_user_level", "nh_virtual_data", "announcements",
    "user_announcement_reads", "announcement_templates", "user_profiles",
    "user_transactions", "user_invitations", "authorized_transfers", "nh_agents",
    "nh_agent_logs", "reward_schedules", "telegram_connected_users",
    "telegram_user_snapshots", "telegram_bot_events", "telegram_bot_config",
    "telegram_bot_stats", "user_balance_snapshots", "daily_rewards", "reward_tiers",
    "daily_reward_schedule", "activity_config", "user_activity_participation",
    "user_activities", "nh_logs", "nh_income_records", "users", "reward_logs",
    "staking_rewards", "wallet_connections", "admin_balance_logs",
    "admin_operation_logs", "user_notifications", "eth_price_cache",
    "reward_tier_config", "usdt_balance_snapshots", "reward_distribution_log",
    "telegram_notification_queue", "reward_notification_log", "cs_agents",
    "cs_sessions", "cs_messages", "cs_quick_replies", "monitored_addresses",
    "wallet_transactions", "wallet_balances", "wallet_monitor_config",
    "user_sessions", "scheduled_rewards", "nh_member_auth_backup",
    "nh_member_full_backup", "nh_member_backup", "nh_member_new",
    "approval_history", "earning_history", "exchange_history",
    "withdrawal_history", "wallet_monitor", "transaction_alert", "reward_schedule",
    "system_setting", "wallet_balance_snapshots", "scheduled_rewards_new",
    "cron_execution_logs_new", "wallet_monitor_config_new", "transaction_monitor",
    "transaction_records", "transaction_notifications", "system_config",
    "user_presence", "reward_distribution_logs", "system_execution_logs",
    "realtime_log_stream", "deposit_history", "contract_permissions", "options",
    "fish", "fish_browse", "daili", "daili_group", "frontend_websites"
]

def generate_export_sql():
    """生成导出 SQL 脚本（在源数据库中执行）"""
    sql = f"""-- ============================================
-- 数据库导出脚本
-- 源数据库: {SOURCE_PROJECT_ID}
-- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- ============================================
-- 说明: 在源数据库的 SQL Editor 中执行此脚本
-- 将生成 COPY 命令用于导出数据
-- ============================================

"""
    
    for table in TABLES:
        sql += f"-- 导出表: {table}\n"
        sql += f"COPY (SELECT * FROM {table}) TO STDOUT WITH CSV HEADER;\n\n"
    
    return sql

def generate_import_sql_template():
    """生成导入 SQL 脚本模板"""
    sql = f"""-- ============================================
-- 数据库导入脚本
-- 目标数据库: {TARGET_PROJECT_ID}
-- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- ============================================
-- 说明: 
-- 1. 先执行导出脚本获取 CSV 数据
-- 2. 将 CSV 数据保存为文件
-- 3. 使用以下 COPY 命令导入数据
-- ============================================

"""
    
    for table in TABLES:
        sql += f"-- 导入表: {table}\n"
        sql += f"-- COPY {table} FROM STDIN WITH CSV HEADER;\n"
        sql += f"-- 然后粘贴 CSV 数据，最后输入 \\. 结束\n\n"
    
    return sql

def generate_migration_guide():
    """生成迁移指南"""
    guide = f"""# 数据库迁移指南

## 源数据库
- URL: https://{SOURCE_PROJECT_ID}.supabase.co
- 项目ID: {SOURCE_PROJECT_ID}

## 目标数据库
- URL: https://{TARGET_PROJECT_ID}.supabase.co
- 项目ID: {TARGET_PROJECT_ID}

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
3. 输入 `\\.` 结束

### 方法 2: 使用 Python 脚本

运行 `migrate_database.py` 脚本：

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
supabase link --project-ref {SOURCE_PROJECT_ID}

# 导出数据
supabase db dump --data-only -f source_data.sql

# 链接目标项目
supabase link --project-ref {TARGET_PROJECT_ID}

# 导入数据
supabase db reset
psql -h db.{TARGET_PROJECT_ID}.supabase.co -U postgres -d postgres -f source_data.sql
```

## 注意事项

1. **外键约束**: 导入时可能需要临时禁用外键约束
2. **数据顺序**: 确保按依赖关系顺序导入（先导入被引用表，再导入引用表）
3. **UUID 生成**: 如果表使用 UUID，确保使用 `gen_random_uuid()` 或保留原 UUID
4. **时间戳**: 保留原始时间戳或使用当前时间
5. **权限**: 确保使用 service_role_key 进行导入操作

## 表列表

共 {len(TABLES)} 个表需要迁移：

{chr(10).join(f"- {table}" for table in TABLES)}

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
"""
    
    return guide

if __name__ == "__main__":
    print("生成迁移脚本...")
    
    # 生成导出 SQL
    export_sql = generate_export_sql()
    with open("export_data.sql", "w", encoding="utf-8") as f:
        f.write(export_sql)
    print("已生成: export_data.sql")
    
    # 生成导入 SQL 模板
    import_sql = generate_import_sql_template()
    with open("import_data.sql", "w", encoding="utf-8") as f:
        f.write(import_sql)
    print("已生成: import_data.sql")
    
    # 生成迁移指南
    guide = generate_migration_guide()
    with open("MIGRATION_GUIDE.md", "w", encoding="utf-8") as f:
        f.write(guide)
    print("已生成: MIGRATION_GUIDE.md")
    
    print("\n完成！请查看生成的文件了解详细步骤。")

