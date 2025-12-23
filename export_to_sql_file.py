# -*- coding: utf-8 -*-
"""
导出数据库数据到本地 SQL 文件
从源数据库导出所有表的数据，生成 INSERT 语句的 SQL 文件
"""
import os
import sys
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

try:
    from supabase import create_client, Client
except ImportError:
    print("错误: 请先安装 supabase 库")
    print("运行: pip install supabase")
    sys.exit(1)

# 源数据库配置
SOURCE_URL = "https://bfcpimnfgidhgigtgehs.supabase.co"
SOURCE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk"

# 输出目录
OUTPUT_DIR = "database_export_sql"
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

# 所有需要导出的表
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

def escape_sql_value(value: Any) -> str:
    """转义 SQL 值"""
    if value is None:
        return "NULL"
    elif isinstance(value, bool):
        return "true" if value else "false"
    elif isinstance(value, (int, float)):
        return str(value)
    elif isinstance(value, dict):
        # JSONB 类型
        return f"'{json.dumps(value).replace("'", "''")}'::jsonb"
    elif isinstance(value, list):
        # 数组类型
        return f"'{json.dumps(value).replace("'", "''")}'"
    else:
        # 字符串类型
        return f"'{str(value).replace("'", "''")}'"

def generate_insert_sql(table_name: str, data: List[Dict[str, Any]]) -> str:
    """生成 INSERT SQL 语句"""
    if not data:
        return f"-- 表 {table_name} 无数据\n\n"
    
    sql = f"-- ============================================\n"
    sql += f"-- 表: {table_name}\n"
    sql += f"-- 记录数: {len(data)}\n"
    sql += f"-- ============================================\n\n"
    
    # 获取所有列名
    columns = list(data[0].keys())
    columns_str = ", ".join(columns)
    
    # 生成 INSERT 语句
    sql += f"INSERT INTO {table_name} ({columns_str}) VALUES\n"
    
    values_list = []
    for record in data:
        values = [escape_sql_value(record.get(col)) for col in columns]
        values_list.append(f"  ({', '.join(values)})")
    
    # 每 100 条记录一个 INSERT 语句，避免单个语句过大
    batch_size = 100
    sql_statements = []
    
    for i in range(0, len(values_list), batch_size):
        batch = values_list[i:i + batch_size]
        batch_sql = f"INSERT INTO {table_name} ({columns_str}) VALUES\n"
        batch_sql += ",\n".join(batch)
        batch_sql += "\nON CONFLICT DO NOTHING;\n\n"
        sql_statements.append(batch_sql)
    
    return "".join(sql_statements)

def export_table_data(source_client: Client, table_name: str) -> List[Dict[str, Any]]:
    """从源数据库导出表数据"""
    print(f"  导出 {table_name}...", end=" ")
    
    try:
        all_data = []
        page_size = 1000
        offset = 0
        
        while True:
            response = source_client.table(table_name).select("*").range(offset, offset + page_size - 1).execute()
            
            if not response.data:
                break
                
            all_data.extend(response.data)
            
            if len(response.data) < page_size:
                break
                
            offset += page_size
            print(".", end="", flush=True)
        
        print(f" 成功 ({len(all_data)} 条记录)")
        return all_data
    except Exception as e:
        print(f" 失败: {str(e)}")
        return []

def main():
    """主函数"""
    print("=" * 60)
    print("导出数据库数据到 SQL 文件")
    print("=" * 60)
    print(f"源数据库: {SOURCE_URL}")
    print(f"输出目录: {OUTPUT_DIR}/{TIMESTAMP}")
    print(f"总表数: {len(TABLES)}")
    print("=" * 60)
    
    # 创建输出目录
    output_path = os.path.join(OUTPUT_DIR, TIMESTAMP)
    os.makedirs(output_path, exist_ok=True)
    
    # 创建客户端
    try:
        source_client = create_client(SOURCE_URL, SOURCE_KEY)
        print("\n数据库连接成功\n")
    except Exception as e:
        print(f"\n数据库连接失败: {str(e)}")
        return
    
    # 统计信息
    stats = {
        "total": len(TABLES),
        "success": 0,
        "failed": 0,
        "total_records": 0,
        "total_sql_size": 0
    }
    
    # 为每个表生成单独的 SQL 文件
    all_sql_content = []
    all_sql_content.append(f"-- ============================================\n")
    all_sql_content.append(f"-- 数据库导出 SQL 文件\n")
    all_sql_content.append(f"-- 源数据库: {SOURCE_URL}\n")
    all_sql_content.append(f"-- 导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    all_sql_content.append(f"-- 总表数: {len(TABLES)}\n")
    all_sql_content.append(f"-- ============================================\n\n")
    all_sql_content.append("BEGIN;\n\n")
    
    # 导出每个表
    for i, table_name in enumerate(TABLES, 1):
        print(f"\n[{i}/{len(TABLES)}] 处理表: {table_name}")
        
        try:
            # 导出数据
            data = export_table_data(source_client, table_name)
            
            if data:
                # 生成 SQL
                sql_content = generate_insert_sql(table_name, data)
                
                # 保存到单独的文件
                table_file = os.path.join(output_path, f"{table_name}.sql")
                with open(table_file, "w", encoding="utf-8") as f:
                    f.write(sql_content)
                
                # 添加到总文件
                all_sql_content.append(sql_content)
                
                stats["success"] += 1
                stats["total_records"] += len(data)
                stats["total_sql_size"] += len(sql_content.encode('utf-8'))
            else:
                stats["success"] += 1  # 空表也算成功
                
        except Exception as e:
            print(f"  错误: {str(e)}")
            stats["failed"] += 1
    
    # 添加事务结束
    all_sql_content.append("COMMIT;\n")
    
    # 保存合并的 SQL 文件
    all_sql_file = os.path.join(output_path, "all_tables_data.sql")
    with open(all_sql_file, "w", encoding="utf-8") as f:
        f.write("".join(all_sql_content))
    
    # 生成摘要文件
    summary = {
        "source_url": SOURCE_URL,
        "export_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "total_tables": stats["total"],
        "success_tables": stats["success"],
        "failed_tables": stats["failed"],
        "total_records": stats["total_records"],
        "total_sql_size_bytes": stats["total_sql_size"],
        "output_directory": output_path,
        "files": {
            "all_tables": "all_tables_data.sql",
            "individual_tables": [f"{table}.sql" for table in TABLES]
        }
    }
    
    summary_file = os.path.join(output_path, "export_summary.json")
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    # 生成 README
    readme_content = f"""# 数据库导出说明

## 导出信息

- 源数据库: {SOURCE_URL}
- 导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- 总表数: {stats['total']}
- 成功: {stats['success']}
- 失败: {stats['failed']}
- 总记录数: {stats['total_records']}
- SQL 文件大小: {stats['total_sql_size'] / 1024 / 1024:.2f} MB

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
psql -h db.xybhjgbgusdyokrrfqst.supabase.co \\
     -U postgres \\
     -d postgres \\
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

共 {len(TABLES)} 个表：
{chr(10).join(f"- {table}" for table in TABLES)}
"""
    
    readme_file = os.path.join(output_path, "README.md")
    with open(readme_file, "w", encoding="utf-8") as f:
        f.write(readme_content)
    
    # 输出统计
    print("\n" + "=" * 60)
    print("导出完成")
    print("=" * 60)
    print(f"总表数: {stats['total']}")
    print(f"成功: {stats['success']}")
    print(f"失败: {stats['failed']}")
    print(f"总记录数: {stats['total_records']}")
    print(f"SQL 文件大小: {stats['total_sql_size'] / 1024 / 1024:.2f} MB")
    print(f"输出目录: {output_path}")
    print(f"合并文件: all_tables_data.sql")
    print("=" * 60)
    print(f"\n下一步: 将 {all_sql_file} 导入到目标数据库")

if __name__ == "__main__":
    main()







