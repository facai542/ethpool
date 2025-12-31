# -*- coding: utf-8 -*-
"""
使用 MCP 工具将 SQL 文件导入到目标数据库
分批执行，避免单次 SQL 过大
"""
import os
import re
from typing import List, Tuple

SQL_FILE = r"E:\eth-new\database_export_sql\20251220_021030\all_tables_data.sql"
TARGET_PROJECT_ID = "xybhjgbgusdyokrrfqst"

def split_sql_by_table(sql_content: str) -> List[Tuple[str, str]]:
    """按表分割 SQL 内容"""
    # 移除 BEGIN 和 COMMIT
    sql_content = sql_content.replace("BEGIN;", "").replace("COMMIT;", "").strip()
    
    # 按 INSERT INTO 分割
    pattern = r'(INSERT INTO\s+(\w+)\s+[^;]+;)'
    matches = re.finditer(pattern, sql_content, re.IGNORECASE | re.DOTALL)
    
    tables_sql = []
    current_table = None
    current_sql = []
    
    for match in matches:
        table_name = match.group(2)
        insert_stmt = match.group(1)
        
        if current_table != table_name:
            if current_table:
                tables_sql.append((current_table, "\n".join(current_sql)))
            current_table = table_name
            current_sql = [insert_stmt]
        else:
            current_sql.append(insert_stmt)
    
    if current_table:
        tables_sql.append((current_table, "\n".join(current_sql)))
    
    return tables_sql

def main():
    """主函数"""
    print("=" * 60)
    print("使用 MCP 工具导入 SQL 文件")
    print("=" * 60)
    print(f"SQL 文件: {SQL_FILE}")
    print(f"目标数据库: {TARGET_PROJECT_ID}")
    print("=" * 60)
    
    if not os.path.exists(SQL_FILE):
        print(f"\n错误: SQL 文件不存在: {SQL_FILE}")
        return
    
    # 读取 SQL 文件
    print("\n读取 SQL 文件...")
    with open(SQL_FILE, "r", encoding="utf-8") as f:
        sql_content = f.read()
    
    print(f"文件大小: {len(sql_content) / 1024 / 1024:.2f} MB")
    
    # 按表分割
    print("\n分割 SQL 语句...")
    tables_sql = split_sql_by_table(sql_content)
    print(f"找到 {len(tables_sql)} 个表的 SQL 语句")
    
    # 生成导入脚本说明
    print("\n生成导入脚本...")
    
    import_script = f"""-- ============================================
-- 数据库导入脚本
-- 目标数据库: {TARGET_PROJECT_ID}
-- 源文件: {SQL_FILE}
-- ============================================
-- 说明: 此文件包含按表分割的 SQL 语句
-- 可以逐个表执行，或使用 MCP 工具批量执行
-- ============================================

"""
    
    for i, (table_name, sql) in enumerate(tables_sql, 1):
        import_script += f"-- ============================================\n"
        import_script += f"-- 表 {i}: {table_name}\n"
        import_script += f"-- ============================================\n\n"
        import_script += f"{sql}\n\n"
    
    output_file = "import_to_target.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(import_script)
    
    print(f"已生成: {output_file}")
    print(f"\n总计: {len(tables_sql)} 个表的 SQL 语句")
    print("\n下一步: 使用 MCP 工具执行导入")

if __name__ == "__main__":
    main()










