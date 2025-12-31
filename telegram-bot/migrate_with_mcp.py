# -*- coding: utf-8 -*-
"""
使用 MCP 服务迁移数据库
从源数据库 (bfcpimnfgidhgigtgehs) 导出数据到目标数据库 (xybhjgbgusdyokrrfqst)
"""
import json
from typing import List, Dict, Any

# 注意：这个脚本需要在 MCP 环境中运行
# 或者手动调用 MCP 工具

SOURCE_PROJECT_ID = "bfcpimnfgidhgigtgehs"
TARGET_PROJECT_ID = "xybhjgbgusdyokrrfqst"

# 所有需要迁移的表（从之前的列表）
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

def generate_migration_sql():
    """生成迁移 SQL 脚本"""
    
    print("=" * 60)
    print("生成 MCP 迁移脚本")
    print("=" * 60)
    print(f"源数据库: {SOURCE_PROJECT_ID}")
    print(f"目标数据库: {TARGET_PROJECT_ID}")
    print(f"总表数: {len(TABLES)}")
    print("=" * 60)
    
    # 生成导出脚本（在源数据库执行）
    export_sql = f"""-- ============================================
-- 从源数据库导出数据
-- 项目ID: {SOURCE_PROJECT_ID}
-- ============================================
-- 说明: 在源数据库的 SQL Editor 中执行以下查询
-- 然后将结果保存为 JSON 或 CSV 格式
-- ============================================

"""
    
    for table in TABLES:
        export_sql += f"-- 导出表: {table}\n"
        export_sql += f"SELECT * FROM {table};\n\n"
    
    # 生成导入脚本模板
    import_template = f"""-- ============================================
-- 导入数据到目标数据库
-- 项目ID: {TARGET_PROJECT_ID}
-- ============================================
-- 说明: 
-- 1. 对于每个表，使用以下格式导入数据
-- 2. 将导出的 JSON 数据转换为 INSERT 语句
-- ============================================

"""
    
    for table in TABLES:
        import_template += f"-- 导入表: {table}\n"
        import_template += f"-- INSERT INTO {table} (col1, col2, ...) VALUES\n"
        import_template += f"--   (val1, val2, ...),\n"
        import_template += f"--   ...\n"
        import_template += f"-- ON CONFLICT DO NOTHING;\n\n"
    
    # 保存文件
    with open("mcp_export_queries.sql", "w", encoding="utf-8") as f:
        f.write(export_sql)
    print("\n已生成: mcp_export_queries.sql")
    
    with open("mcp_import_template.sql", "w", encoding="utf-8") as f:
        f.write(import_template)
    print("已生成: mcp_import_template.sql")
    
    # 生成迁移说明
    readme = f"""# MCP 数据库迁移说明

## 概述

从源数据库 `{SOURCE_PROJECT_ID}` 迁移数据到目标数据库 `{TARGET_PROJECT_ID}`

## MCP 服务配置

### 源数据库 (supabases)
- URL: https://mcp.supabase.com/mcp?project_ref={SOURCE_PROJECT_ID}
- 已在 mcp.json 中配置

### 目标数据库 (supabase)
- 使用 access token 配置
- 项目ID: {TARGET_PROJECT_ID}

## 迁移步骤

由于 MCP 工具需要 project_id 参数，建议使用以下方法：

### 方法 1: 使用 Python 脚本（推荐）

运行 `migrate_data_direct.py`:

```bash
# 设置目标数据库的 service_role_key
export TARGET_SERVICE_ROLE_KEY="your_service_role_key"

# 运行迁移
python migrate_data_direct.py
```

### 方法 2: 手动使用 MCP 工具

由于 `mcp_supabases_*` 工具需要 project_id，但 URL 中已配置项目，
可能需要直接使用 Supabase Dashboard 或 Python 客户端。

### 方法 3: 使用 Supabase Dashboard

1. 在源数据库 Dashboard 中导出数据
2. 在目标数据库 Dashboard 中导入数据

## 表列表

共 {len(TABLES)} 个表需要迁移。

详细列表请查看 `mcp_export_queries.sql` 文件。
"""
    
    with open("MCP_MIGRATION_README.md", "w", encoding="utf-8") as f:
        f.write(readme)
    print("已生成: MCP_MIGRATION_README.md")
    
    print("\n" + "=" * 60)
    print("完成！")
    print("=" * 60)
    print("\n注意: 由于 MCP 工具限制，建议使用 Python 脚本进行迁移")
    print("运行: python migrate_data_direct.py")

if __name__ == "__main__":
    generate_migration_sql()










