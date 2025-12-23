# -*- coding: utf-8 -*-
"""
数据库迁移脚本
从源数据库导出所有数据并导入到目标数据库
"""
import json
import os
from datetime import datetime
from supabase import create_client, Client
from typing import List, Dict, Any

# 源数据库配置
SOURCE_URL = "https://bfcpimnfgidhgigtgehs.supabase.co"
SOURCE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk"

# 目标数据库配置（通过环境变量或直接配置）
TARGET_URL = "https://xybhjgbgusdyokrrfqst.supabase.co"
# 注意：目标数据库需要 service_role_key 才能导入数据
# 请设置环境变量 SUPABASE_SERVICE_ROLE_KEY 或在此处配置
TARGET_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def get_all_tables(source_client: Client) -> List[str]:
    """获取所有表名"""
    print("正在获取表列表...")
    
    # 查询所有表
    query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
    """
    
    try:
        # 使用 RPC 或直接查询
        result = source_client.rpc('exec_sql', {'query': query}).execute()
        if result.data:
            tables = [row['table_name'] for row in result.data]
            print(f"找到 {len(tables)} 个表")
            return tables
    except Exception as e:
        print(f"使用 RPC 查询失败: {e}")
        print("尝试使用预定义的表列表...")
    
    # 如果 RPC 失败，使用预定义的表列表
    return [
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
        "fish", "fish_browse", "daili", "daili_group", "frontend_websites",
        "reward_settings", "reward_records", "user_balances", "telegram_bindings",
        "bot_notifications"
    ]

def export_table_data(source_client: Client, table_name: str) -> List[Dict[str, Any]]:
    """导出单个表的所有数据"""
    print(f"  导出表: {table_name}...", end=" ")
    
    try:
        # 使用 Supabase 客户端查询数据
        # 注意：anon key 可能有限制，需要分批查询
        response = source_client.table(table_name).select("*").limit(10000).execute()
        
        data = response.data if response.data else []
        print(f"✓ 导出 {len(data)} 条记录")
        return data
    except Exception as e:
        print(f"✗ 错误: {str(e)}")
        return []

def import_table_data(target_client: Client, table_name: str, data: List[Dict[str, Any]]):
    """导入数据到目标数据库"""
    if not data:
        print(f"  跳过空表: {table_name}")
        return
    
    print(f"  导入表: {table_name}...", end=" ")
    
    try:
        # 批量插入数据
        # 注意：Supabase 客户端有批量插入限制，需要分批处理
        batch_size = 1000
        total_inserted = 0
        
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            try:
                # 使用 upsert 避免重复数据
                response = target_client.table(table_name).upsert(batch).execute()
                total_inserted += len(batch)
            except Exception as e:
                print(f"\n    警告: 批次 {i//batch_size + 1} 插入失败: {str(e)}")
                # 尝试逐条插入
                for record in batch:
                    try:
                        target_client.table(table_name).insert(record).execute()
                        total_inserted += 1
                    except:
                        pass
        
        print(f"✓ 导入 {total_inserted} 条记录")
    except Exception as e:
        print(f"✗ 错误: {str(e)}")

def migrate_table(source_client: Client, target_client: Client, table_name: str):
    """迁移单个表"""
    print(f"\n处理表: {table_name}")
    
    # 导出数据
    data = export_table_data(source_client, table_name)
    
    # 导入数据
    if data:
        import_table_data(target_client, table_name, data)
    
    return len(data)

def main():
    """主函数"""
    print("=" * 60)
    print("数据库迁移工具")
    print(f"源数据库: {SOURCE_URL}")
    print(f"目标数据库: {TARGET_URL}")
    print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # 检查目标数据库密钥
    if not TARGET_KEY:
        print("\n错误: 未设置目标数据库的 SUPABASE_SERVICE_ROLE_KEY")
        print("请设置环境变量或在脚本中配置 TARGET_KEY")
        print("\n注意: 使用 anon key 可能没有足够权限导入数据")
        return
    
    # 创建客户端
    try:
        source_client = create_client(SOURCE_URL, SOURCE_KEY)
        target_client = create_client(TARGET_URL, TARGET_KEY)
        print("\n✓ 数据库连接成功")
    except Exception as e:
        print(f"\n✗ 数据库连接失败: {str(e)}")
        return
    
    # 获取所有表
    tables = get_all_tables(source_client)
    
    if not tables:
        print("\n✗ 未找到任何表")
        return
    
    print(f"\n开始迁移 {len(tables)} 个表...\n")
    
    # 迁移统计
    stats = {
        "total_tables": len(tables),
        "success_tables": 0,
        "failed_tables": 0,
        "total_records": 0
    }
    
    # 迁移每个表
    for table_name in tables:
        try:
            record_count = migrate_table(source_client, target_client, table_name)
            stats["success_tables"] += 1
            stats["total_records"] += record_count
        except Exception as e:
            print(f"\n✗ 表 {table_name} 迁移失败: {str(e)}")
            stats["failed_tables"] += 1
    
    # 输出统计信息
    print("\n" + "=" * 60)
    print("迁移完成")
    print("=" * 60)
    print(f"总表数: {stats['total_tables']}")
    print(f"成功: {stats['success_tables']}")
    print(f"失败: {stats['failed_tables']}")
    print(f"总记录数: {stats['total_records']}")
    print(f"完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

if __name__ == "__main__":
    main()







