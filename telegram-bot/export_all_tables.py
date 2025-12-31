# -*- coding: utf-8 -*-
"""
使用 MCP Supabase 导出所有数据表
"""
import json
import csv
import os
from datetime import datetime

# 项目配置
PROJECT_ID = "bfcpimnfgidhgigtgehs"
EXPORT_DIR = "database_export"
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

# 所有表列表（从 list_tables 结果中提取）
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

def export_table_data(table_name, project_id):
    """导出单个表的数据"""
    print(f"正在导出表: {table_name}...")
    
    try:
        # 先获取表结构
        query_structure = f"""
        SELECT 
            column_name, 
            data_type, 
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = '{table_name}'
        ORDER BY ordinal_position;
        """
        
        # 获取数据
        query_data = f"SELECT * FROM {table_name} LIMIT 10000;"
        
        return {
            "table_name": table_name,
            "status": "pending",
            "note": "需要使用 MCP 工具执行 SQL 查询"
        }
    except Exception as e:
        return {
            "table_name": table_name,
            "status": "error",
            "error": str(e)
        }

def generate_export_summary():
    """生成导出摘要"""
    summary = {
        "project_id": PROJECT_ID,
        "export_time": TIMESTAMP,
        "total_tables": len(TABLES),
        "tables": TABLES
    }
    
    export_path = os.path.join(EXPORT_DIR, TIMESTAMP)
    os.makedirs(export_path, exist_ok=True)
    
    # 保存摘要
    with open(os.path.join(export_path, "export_summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    # 生成 SQL 导出脚本
    sql_script = f"""-- 数据库导出脚本
-- 项目ID: {PROJECT_ID}
-- 导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- 总表数: {len(TABLES)}

"""
    
    for table in TABLES:
        sql_script += f"-- 导出表: {table}\n"
        sql_script += f"COPY {table} TO STDOUT WITH CSV HEADER;\n\n"
    
    with open(os.path.join(export_path, "export_all_tables.sql"), "w", encoding="utf-8") as f:
        f.write(sql_script)
    
    # 生成 Python 导出脚本
    python_script = f"""# -*- coding: utf-8 -*-
\"\"\"
使用 MCP Supabase 导出所有表的数据
\"\"\"
import json

PROJECT_ID = "{PROJECT_ID}"
TABLES = {json.dumps(TABLES, indent=2, ensure_ascii=False)}

# 对每个表执行导出
for table_name in TABLES:
    print(f"导出表: {{table_name}}")
    # 使用 MCP 工具执行:
    # mcp_supabase_execute_sql(
    #     project_id=PROJECT_ID,
    #     query=f"SELECT * FROM {{table_name}};"
    # )
"""
    
    with open(os.path.join(export_path, "export_script.py"), "w", encoding="utf-8") as f:
        f.write(python_script)
    
    print(f"\n导出摘要已生成:")
    print(f"  - 总表数: {len(TABLES)}")
    print(f"  - 导出目录: {export_path}")
    print(f"  - 文件:")
    print(f"    * export_summary.json - 导出摘要")
    print(f"    * export_all_tables.sql - SQL 导出脚本")
    print(f"    * export_script.py - Python 导出脚本")

if __name__ == "__main__":
    print("=" * 60)
    print("数据库表导出工具")
    print(f"项目ID: {PROJECT_ID}")
    print(f"导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    generate_export_summary()
    
    print("\n" + "=" * 60)
    print("下一步:")
    print("1. 查看 export_summary.json 了解所有表")
    print("2. 使用 MCP Supabase 工具逐个导出表数据")
    print("3. 或使用 Supabase CLI 批量导出")
    print("=" * 60)















