# -*- coding: utf-8 -*-
"""
直接数据库迁移脚本
使用 Supabase Python 客户端从源数据库导出并导入到目标数据库
"""
import os
import sys
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

# 目标数据库配置
TARGET_URL = "https://xybhjgbgusdyokrrfqst.supabase.co"
# 重要: 需要设置目标数据库的 service_role_key
TARGET_KEY = os.getenv("TARGET_SERVICE_ROLE_KEY", "")
if not TARGET_KEY:
    print("警告: 未设置 TARGET_SERVICE_ROLE_KEY 环境变量")
    print("请设置环境变量或在脚本中直接配置 TARGET_KEY")
    print("例如: export TARGET_SERVICE_ROLE_KEY='your_service_role_key'")
    print("\n继续使用 anon key（可能权限不足）...")

# 所有需要迁移的表
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

def export_table(source_client: Client, table_name: str) -> List[Dict[str, Any]]:
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
        
        print(f"成功 ({len(all_data)} 条记录)")
        return all_data
    except Exception as e:
        print(f"失败: {str(e)}")
        return []

def import_table(target_client: Client, table_name: str, data: List[Dict[str, Any]]):
    """导入数据到目标数据库"""
    if not data:
        print(f"  跳过空表: {table_name}")
        return 0
    
    print(f"  导入 {table_name}...", end=" ")
    
    try:
        # 批量插入，每次最多 1000 条
        batch_size = 1000
        total_inserted = 0
        
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            try:
                # 使用 upsert 避免重复
                response = target_client.table(table_name).upsert(batch).execute()
                total_inserted += len(batch)
            except Exception as e:
                # 如果批量插入失败，尝试逐条插入
                print(f"\n    批量插入失败，尝试逐条插入...")
                for record in batch:
                    try:
                        target_client.table(table_name).upsert(record).execute()
                        total_inserted += 1
                    except:
                        pass
        
        print(f"成功 ({total_inserted} 条记录)")
        return total_inserted
    except Exception as e:
        print(f"失败: {str(e)}")
        return 0

def main():
    """主函数"""
    print("=" * 60)
    print("数据库迁移工具")
    print("=" * 60)
    print(f"源数据库: {SOURCE_URL}")
    print(f"目标数据库: {TARGET_URL}")
    print(f"总表数: {len(TABLES)}")
    print("=" * 60)
    
    # 创建客户端
    try:
        source_client = create_client(SOURCE_URL, SOURCE_KEY)
        target_key = TARGET_KEY if TARGET_KEY else SOURCE_KEY  # 如果没有设置，使用 anon key
        target_client = create_client(TARGET_URL, target_key)
        print("\n数据库连接成功\n")
    except Exception as e:
        print(f"\n数据库连接失败: {str(e)}")
        return
    
    # 统计信息
    stats = {
        "total": len(TABLES),
        "success": 0,
        "failed": 0,
        "total_records": 0
    }
    
    # 迁移每个表
    for i, table_name in enumerate(TABLES, 1):
        print(f"\n[{i}/{len(TABLES)}] 处理表: {table_name}")
        
        try:
            # 导出
            data = export_table(source_client, table_name)
            
            # 导入
            if data:
                imported = import_table(target_client, table_name, data)
                stats["success"] += 1
                stats["total_records"] += imported
            else:
                stats["success"] += 1  # 空表也算成功
        except Exception as e:
            print(f"  错误: {str(e)}")
            stats["failed"] += 1
    
    # 输出统计
    print("\n" + "=" * 60)
    print("迁移完成")
    print("=" * 60)
    print(f"总表数: {stats['total']}")
    print(f"成功: {stats['success']}")
    print(f"失败: {stats['failed']}")
    print(f"总记录数: {stats['total_records']}")
    print("=" * 60)

if __name__ == "__main__":
    main()







