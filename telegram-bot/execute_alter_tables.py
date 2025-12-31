# -*- coding: utf-8 -*-
"""
读取生成的 ALTER TABLE SQL 文件，解析并执行每个表的语句
"""
import re
from pathlib import Path

SQL_FILE = r"E:\eth-new\database_export_sql\20251220_021030\add_missing_columns.sql"

def parse_alter_statements(sql_file: Path):
    """解析 SQL 文件中的 ALTER TABLE 语句"""
    with open(sql_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 按表分割
    pattern = r'-- 表: (\w+)\n(ALTER TABLE[^;]+;)'
    matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
    
    statements = []
    for match in matches:
        table_name = match.group(1)
        alter_sql = match.group(2)
        
        # 移除试图添加 id 列的部分（因为 id 已经存在）
        # 简化：只保留不包含 id 的 ADD COLUMN 语句
        lines = alter_sql.split('\n')
        filtered_lines = []
        skip_next = False
        
        for line in lines:
            if 'ADD COLUMN IF NOT EXISTS id' in line:
                continue
            filtered_lines.append(line)
        
        filtered_sql = '\n'.join(filtered_lines)
        
        statements.append({
            "table": table_name,
            "sql": filtered_sql
        })
    
    return statements

def main():
    """主函数"""
    sql_file = Path(SQL_FILE)
    statements = parse_alter_statements(sql_file)
    
    print("=" * 60)
    print("解析 ALTER TABLE 语句")
    print("=" * 60)
    print(f"找到 {len(statements)} 个表的 ALTER TABLE 语句\n")
    
    # 生成清理后的 SQL 文件
    output_file = sql_file.parent / "add_missing_columns_cleaned.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("-- ============================================\n")
        f.write("-- 为所有表添加缺失的列（已清理）\n")
        f.write("-- 目标数据库: xybhjgbgusdyokrrfqst\n")
        f.write("-- ============================================\n\n")
        
        for stmt in statements:
            f.write(f"-- 表: {stmt['table']}\n")
            f.write(stmt['sql'])
            f.write("\n\n")
    
    print(f"已生成清理后的文件: {output_file}")
    print("\n下一步: 使用 MCP 工具执行这些 SQL 语句")
    print("或者直接在 Supabase Dashboard 的 SQL Editor 中执行")

if __name__ == "__main__":
    main()










