# -*- coding: utf-8 -*-
"""
根据导出的 SQL 文件，为每个表添加缺失的列
"""
import os
import re
import json
from pathlib import Path
from supabase import create_client

SQL_DIR = r"E:\eth-new\database_export_sql\20251220_021030"
TARGET_URL = "https://xybhjgbgusdyokrrfqst.supabase.co"
TARGET_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def extract_columns_from_sql(sql_file: Path) -> list:
    """从 SQL 文件中提取列名"""
    with open(sql_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    pattern = r'INSERT INTO\s+(\w+)\s+\(([^)]+)\)\s+VALUES'
    match = re.search(pattern, content, re.IGNORECASE)
    
    if not match:
        return None, None
    
    table_name = match.group(1)
    columns_str = match.group(2)
    columns = [col.strip() for col in columns_str.split(',')]
    
    return table_name, columns

def infer_column_type_from_value(value: str) -> str:
    """根据值推断列类型"""
    value = value.strip()
    
    if value.upper() == "NULL":
        return "TEXT"
    
    # UUID
    if re.match(r"^'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'$", value, re.IGNORECASE):
        return "UUID"
    
    # Boolean
    if value.upper() in ("TRUE", "FALSE"):
        return "BOOLEAN DEFAULT false"
    
    # Numbers
    if re.match(r"^-?\d+\.?\d*$", value.replace("'", "")):
        if "." in value:
            return "NUMERIC DEFAULT 0"
        else:
            num = int(value.replace("'", ""))
            if abs(num) > 2147483647:
                return "BIGINT DEFAULT 0"
            else:
                return "INTEGER DEFAULT 0"
    
    # Timestamp
    if "T" in value and ("+" in value or "Z" in value):
        return "TIMESTAMPTZ"
    
    # JSONB
    if value.startswith("'") and ("{" in value or "[" in value):
        return "JSONB"
    
    # Text
    return "TEXT"

def get_existing_columns(client, table_name: str) -> set:
    """获取表中已存在的列"""
    try:
        # 使用 information_schema 查询
        query = f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '{table_name}' AND table_schema = 'public'
        """
        # 这里需要使用 execute_sql，但为了简化，我们假设表已存在
        # 实际应该通过 MCP 工具查询
        return set()
    except:
        return set()

def generate_alter_statements():
    """生成所有表的 ALTER TABLE 语句"""
    sql_dir = Path(SQL_DIR)
    table_files = sorted([f for f in sql_dir.glob("*.sql") if f.name != "all_tables_data.sql"])
    
    all_statements = []
    
    for sql_file in table_files:
        table_name, columns = extract_columns_from_sql(sql_file)
        if not table_name or not columns:
            continue
        
        # 读取第一条数据来推断类型
        with open(sql_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        values_pattern = r'VALUES\s+\(([^)]+)\)'
        values_match = re.search(values_pattern, content, re.IGNORECASE | re.DOTALL)
        
        if values_match:
            values_str = values_match.group(1)
            # 简单解析（不处理复杂嵌套）
            values = []
            current = ""
            in_quotes = False
            paren_depth = 0
            
            for char in values_str:
                if char == "'" and (not current or current[-1] != "\\"):
                    in_quotes = not in_quotes
                elif char == "(" and not in_quotes:
                    paren_depth += 1
                elif char == ")" and not in_quotes:
                    paren_depth -= 1
                elif char == "," and not in_quotes and paren_depth == 0:
                    values.append(current.strip())
                    current = ""
                    continue
                current += char
            if current:
                values.append(current.strip())
        else:
            values = []
        
        # 生成 ALTER TABLE 语句
        alter_parts = []
        for i, col in enumerate(columns):
            col_type = "TEXT"
            if i < len(values):
                col_type = infer_column_type_from_value(values[i])
            
            alter_parts.append(f"ADD COLUMN IF NOT EXISTS {col} {col_type}")
        
        if alter_parts:
            alter_sql = f"ALTER TABLE {table_name}\n  " + ",\n  ".join(alter_parts) + ";"
            all_statements.append({
                "table": table_name,
                "sql": alter_sql,
                "columns": columns
            })
    
    return all_statements

def main():
    """主函数"""
    print("=" * 60)
    print("生成 ALTER TABLE 语句")
    print("=" * 60)
    
    statements = generate_alter_statements()
    
    # 保存到文件
    output_file = Path(SQL_DIR) / "add_missing_columns.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("-- ============================================\n")
        f.write("-- 为所有表添加缺失的列\n")
        f.write("-- 目标数据库: xybhjgbgusdyokrrfqst\n")
        f.write("-- ============================================\n\n")
        
        for stmt in statements:
            f.write(f"-- 表: {stmt['table']}\n")
            f.write(stmt['sql'])
            f.write("\n\n")
    
    print(f"已生成: {output_file}")
    print(f"共 {len(statements)} 个表的 ALTER TABLE 语句")
    print("\n注意: 请检查生成的 SQL 文件，然后使用 MCP 工具执行")

if __name__ == "__main__":
    main()







