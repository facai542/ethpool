# -*- coding: utf-8 -*-
"""
测试源数据库访问权限
"""
import sys

try:
    from supabase import create_client, Client
except ImportError:
    print("错误: 请先安装 supabase 库")
    print("运行: pip install supabase")
    sys.exit(1)

# 源数据库配置
SOURCE_URL = "https://bfcpimnfgidhgigtgehs.supabase.co"
SOURCE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk"

def test_connection():
    """测试连接"""
    print("=" * 60)
    print("测试源数据库访问权限")
    print("=" * 60)
    print(f"URL: {SOURCE_URL}")
    print(f"Key: {SOURCE_KEY[:20]}...")
    print("=" * 60)
    
    try:
        # 创建客户端
        client = create_client(SOURCE_URL, SOURCE_KEY)
        print("\n[OK] 客户端创建成功")
    except Exception as e:
        print(f"\n[ERROR] 客户端创建失败: {str(e)}")
        return False
    
    return client

def test_table_access(client: Client, table_name: str):
    """测试表访问"""
    print(f"\n测试表: {table_name}")
    print("-" * 60)
    
    try:
        # 测试 1: 查询记录数
        print("  1. 查询记录数...", end=" ")
        response = client.table(table_name).select("id", count="exact").limit(1).execute()
        count = response.count if hasattr(response, 'count') else "未知"
        print(f"[OK] 成功 (约 {count} 条记录)")
    except Exception as e:
        print(f"[ERROR] 失败: {str(e)}")
        return False
    
    try:
        # 测试 2: 查询前 5 条记录
        print("  2. 查询前 5 条记录...", end=" ")
        response = client.table(table_name).select("*").limit(5).execute()
        if response.data:
            print(f"[OK] 成功 (获取 {len(response.data)} 条记录)")
            print(f"    示例字段: {list(response.data[0].keys())[:5]}")
        else:
            print("[OK] 成功 (表为空)")
    except Exception as e:
        print(f"[ERROR] 失败: {str(e)}")
        return False
    
    return True

def test_multiple_tables(client: Client):
    """测试多个表"""
    test_tables = [
        "nh_member_new",
        "users",
        "reward_tiers",
        "finance_orders",
        "nh_admin"
    ]
    
    print("\n" + "=" * 60)
    print("测试多个表的访问权限")
    print("=" * 60)
    
    results = {}
    for table in test_tables:
        results[table] = test_table_access(client, table)
    
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    for table, success in results.items():
        status = "[OK] 成功" if success else "[ERROR] 失败"
        print(f"{table}: {status}")
    
    success_count = sum(1 for v in results.values() if v)
    print(f"\n总计: {success_count}/{len(test_tables)} 个表可以访问")
    
    return success_count > 0

def main():
    """主函数"""
    client = test_connection()
    if not client:
        return
    
    # 测试单个表
    print("\n" + "=" * 60)
    print("测试单个表访问")
    print("=" * 60)
    test_table_access(client, "nh_member_new")
    
    # 测试多个表
    can_access = test_multiple_tables(client)
    
    print("\n" + "=" * 60)
    if can_access:
        print("结论: 可以使用 anon key 访问源数据库")
        print("可以运行 migrate_data_direct.py 进行数据迁移")
    else:
        print("结论: anon key 权限不足，无法访问数据")
        print("建议: 使用 service_role key 或通过 Supabase Dashboard 手动导出")
    print("=" * 60)

if __name__ == "__main__":
    main()

