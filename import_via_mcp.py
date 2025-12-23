# -*- coding: utf-8 -*-
"""
使用 MCP 工具逐个表导入 SQL 文件到目标数据库
"""
import os
import json
from pathlib import Path

SQL_DIR = r"E:\eth-new\database_export_sql\20251220_021030"
TARGET_PROJECT_ID = "xybhjgbgusdyokrrfqst"

def get_table_files():
    """获取所有表 SQL 文件"""
    sql_dir = Path(SQL_DIR)
    table_files = []
    
    for file in sql_dir.glob("*.sql"):
        if file.name != "all_tables_data.sql":
            table_files.append(file)
    
    return sorted(table_files)

def read_sql_file(file_path):
    """读取 SQL 文件内容"""
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def main():
    """主函数"""
    print("=" * 60)
    print("使用 MCP 工具导入 SQL 文件")
    print("=" * 60)
    print(f"SQL 目录: {SQL_DIR}")
    print(f"目标数据库: {TARGET_PROJECT_ID}")
    print("=" * 60)
    
    # 获取所有表文件
    table_files = get_table_files()
    print(f"\n找到 {len(table_files)} 个表的 SQL 文件")
    
    # 读取导出摘要
    summary_file = Path(SQL_DIR) / "export_summary.json"
    if summary_file.exists():
        with open(summary_file, "r", encoding="utf-8") as f:
            summary = json.load(f)
        print(f"总记录数: {summary.get('total_records', 0)}")
    
    print("\n注意: 由于 MCP 工具限制，请手动执行以下 SQL 语句")
    print("=" * 60)
    print("\n方法 1: 使用 Supabase Dashboard SQL Editor")
    print("1. 登录 https://xybhjgbgusdyokrrfqst.supabase.co")
    print("2. 打开 SQL Editor")
    print("3. 逐个复制以下表的 SQL 内容并执行\n")
    
    for i, file_path in enumerate(table_files, 1):
        table_name = file_path.stem
        file_size = file_path.stat().st_size
        print(f"[{i}/{len(table_files)}] {table_name} ({file_size / 1024:.1f} KB)")
    
    print("\n" + "=" * 60)
    print("方法 2: 使用合并文件")
    print(f"直接导入: {SQL_DIR}\\all_tables_data.sql")
    print("（注意：文件较大，可能需要分批执行）")
    print("=" * 60)

if __name__ == "__main__":
    main()







