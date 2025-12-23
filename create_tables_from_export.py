# -*- coding: utf-8 -*-
"""
根据导出的 SQL 文件分析表结构，然后创建表
"""
import os
import re
from pathlib import Path
from typing import Dict, List, Set

SQL_DIR = r"E:\eth-new\database_export_sql\20251220_021030"

def extract_table_structure(sql_file: Path) -> Dict:
    """从 SQL 文件中提取表结构"""
    with open(sql_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 提取 INSERT INTO 语句
    pattern = r'INSERT INTO\s+(\w+)\s+\(([^)]+)\)\s+VALUES'
    match = re.search(pattern, content, re.IGNORECASE)
    
    if not match:
        return None
    
    table_name = match.group(1)
    columns_str = match.group(2)
    columns = [col.strip() for col in columns_str.split(',')]
    
    # 提取第一条数据示例
    values_pattern = r'VALUES\s+\(([^)]+)\)'
    values_match = re.search(values_pattern, content, re.IGNORECASE | re.DOTALL)
    
    if values_match:
        values_str = values_match.group(1)
        # 简单解析值（不处理复杂情况）
        values = []
        in_quotes = False
        current = ""
        for char in values_str:
            if char == "'" and (not current or current[-1] != "\\"):
                in_quotes = not in_quotes
            elif char == "," and not in_quotes:
                values.append(current.strip())
                current = ""
                continue
            current += char
        if current:
            values.append(current.strip())
    else:
        values = []
    
    return {
        "table_name": table_name,
        "columns": columns,
        "sample_values": values[:len(columns)] if values else []
    }

def infer_column_type(value: str, column_name: str) -> str:
    """根据值推断列类型"""
    value = value.strip()
    
    if value.upper() == "NULL":
        return "TEXT"  # 默认类型
    
    # UUID 类型
    if re.match(r"^'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'$", value, re.IGNORECASE):
        return "UUID"
    
    # 布尔类型
    if value.upper() in ("TRUE", "FALSE", "true", "false"):
        return "BOOLEAN"
    
    # 数字类型
    if re.match(r"^-?\d+\.?\d*$", value.replace("'", "")):
        if "." in value:
            return "NUMERIC"
        else:
            return "BIGINT" if abs(int(value.replace("'", ""))) > 2147483647 else "INTEGER"
    
    # 时间戳
    if "T" in value and ("+" in value or "Z" in value or re.match(r"^\d{4}-\d{2}-\d{2}", value)):
        return "TIMESTAMPTZ"
    
    # JSONB
    if value.startswith("'") and ("{" in value or "[" in value):
        return "JSONB"
    
    # 文本类型
    return "TEXT"

def generate_create_table_sql(structure: Dict) -> str:
    """生成 CREATE TABLE SQL"""
    if not structure:
        return None
    
    table_name = structure["table_name"]
    columns = structure["columns"]
    sample_values = structure.get("sample_values", [])
    
    sql = f"CREATE TABLE IF NOT EXISTS {table_name} (\n"
    
    column_defs = []
    for i, col in enumerate(columns):
        col_type = "TEXT"
        if i < len(sample_values):
            col_type = infer_column_type(sample_values[i], col)
        
        # 特殊处理 id 列
        if col.lower() == "id":
            if col_type == "UUID":
                column_defs.append(f"  {col} UUID DEFAULT gen_random_uuid() PRIMARY KEY")
            elif col_type == "INTEGER" or col_type == "BIGINT":
                column_defs.append(f"  {col} SERIAL PRIMARY KEY")
            else:
                column_defs.append(f"  {col} UUID DEFAULT gen_random_uuid() PRIMARY KEY")
        else:
            nullable = "NULL" if i >= len(sample_values) or sample_values[i].strip().upper() == "NULL" else ""
            column_defs.append(f"  {col} {col_type} {nullable}")
    
    sql += ",\n".join(column_defs)
    sql += "\n);"
    
    return sql

def main():
    """主函数"""
    sql_dir = Path(SQL_DIR)
    table_files = sorted([f for f in sql_dir.glob("*.sql") if f.name != "all_tables_data.sql"])
    
    print("=" * 60)
    print("分析表结构并生成 CREATE TABLE 语句")
    print("=" * 60)
    print(f"找到 {len(table_files)} 个表的 SQL 文件\n")
    
    create_statements = []
    
    for sql_file in table_files:
        print(f"处理: {sql_file.name}")
        structure = extract_table_structure(sql_file)
        
        if structure:
            create_sql = generate_create_table_sql(structure)
            if create_sql:
                create_statements.append({
                    "table": structure["table_name"],
                    "sql": create_sql,
                    "columns": structure["columns"]
                })
                print(f"  成功 {structure['table_name']} ({len(structure['columns'])} 列)")
            else:
                print(f"  失败 无法生成 CREATE TABLE")
        else:
            print(f"  失败 无法解析表结构")
    
    # 保存 CREATE TABLE 语句
    output_file = sql_dir / "create_tables.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("-- ============================================\n")
        f.write("-- 根据导出的 SQL 文件生成的 CREATE TABLE 语句\n")
        f.write("-- ============================================\n\n")
        
        for stmt in create_statements:
            f.write(f"-- 表: {stmt['table']}\n")
            f.write(stmt['sql'])
            f.write("\n\n")
    
    print(f"\n已生成: {output_file}")
    print(f"共 {len(create_statements)} 个表的 CREATE TABLE 语句")

if __name__ == "__main__":
    main()

