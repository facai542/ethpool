#!/usr/bin/env python3
"""
导出所有表的 CREATE TABLE 语句
使用 MCP Supabase 服务获取表结构并生成 SQL
"""

import json
import os
from datetime import datetime

# 源数据库项目 ID
SOURCE_PROJECT_ID = "bfcpimnfgidhgigtgehs"

def generate_create_table_sql(table_info):
    """根据表信息生成 CREATE TABLE SQL"""
    table_name = table_info.get("name", "")
    schema = table_info.get("schema", "public")
    full_table_name = f"{schema}.{table_name}" if schema != "public" else table_name
    
    sql = f"-- ============================================\n"
    sql += f"-- 表: {full_table_name}\n"
    if table_info.get("comment"):
        sql += f"-- 注释: {table_info.get('comment')}\n"
    sql += f"-- RLS: {'启用' if table_info.get('rls_enabled') else '禁用'}\n"
    sql += f"-- ============================================\n\n"
    
    sql += f"CREATE TABLE IF NOT EXISTS {full_table_name} (\n"
    
    # 生成列定义
    columns = []
    for col in table_info.get("columns", []):
        col_name = col.get("name", "")
        data_type = col.get("data_type", "TEXT")
        format_type = col.get("format", "")
        
        # 处理数据类型
        if format_type:
            pg_type = format_type
        elif "uuid" in data_type.lower():
            pg_type = "UUID"
        elif "text" in data_type.lower() or "varchar" in data_type.lower():
            if "(" in data_type:
                pg_type = data_type.upper()
            else:
                pg_type = "TEXT"
        elif "integer" in data_type.lower() or "int" in data_type.lower():
            pg_type = "INTEGER"
        elif "bigint" in data_type.lower():
            pg_type = "BIGINT"
        elif "numeric" in data_type.lower() or "decimal" in data_type.lower():
            pg_type = "NUMERIC"
        elif "boolean" in data_type.lower() or "bool" in data_type.lower():
            pg_type = "BOOLEAN"
        elif "timestamp" in data_type.lower():
            if "time zone" in data_type.lower() or "timestamptz" in data_type.lower():
                pg_type = "TIMESTAMP WITH TIME ZONE"
            else:
                pg_type = "TIMESTAMP"
        elif "json" in data_type.lower():
            if "jsonb" in data_type.lower():
                pg_type = "JSONB"
            else:
                pg_type = "JSON"
        else:
            pg_type = data_type.upper()
        
        col_def = f"    {col_name} {pg_type}"
        
        # 添加默认值
        default_value = col.get("default_value")
        if default_value:
            # 处理默认值
            if isinstance(default_value, str):
                if default_value.upper() in ["NOW()", "CURRENT_TIMESTAMP", "CURRENT_DATE"]:
                    col_def += f" DEFAULT {default_value.upper()}"
                elif default_value.startswith("'") or default_value.startswith('"'):
                    col_def += f" DEFAULT {default_value}"
                else:
                    col_def += f" DEFAULT '{default_value}'"
            else:
                col_def += f" DEFAULT {default_value}"
        
        # 添加 NOT NULL
        options = col.get("options", [])
        if "nullable" not in options:
            col_def += " NOT NULL"
        
        # 添加注释
        if col.get("comment"):
            col_def += f" -- {col.get('comment')}"
        
        columns.append(col_def)
    
    sql += ",\n".join(columns)
    
    # 添加主键
    primary_keys = table_info.get("primary_keys", [])
    if primary_keys:
        pk_cols = ", ".join(primary_keys)
        sql += f",\n    PRIMARY KEY ({pk_cols})"
    
    sql += "\n);\n\n"
    
    # 添加表注释
    if table_info.get("comment"):
        sql += f"COMMENT ON TABLE {full_table_name} IS '{table_info.get('comment')}';\n\n"
    
    # 添加列注释
    for col in table_info.get("columns", []):
        if col.get("comment"):
            sql += f"COMMENT ON COLUMN {full_table_name}.{col.get('name')} IS '{col.get('comment')}';\n"
    
    sql += "\n"
    
    return sql


def main():
    """主函数"""
    print("=" * 60)
    print("导出表结构 SQL 文件生成工具")
    print("=" * 60)
    print("\n这个脚本需要手动运行 MCP 命令来获取表结构。")
    print("请按照以下步骤操作：\n")
    
    print("1. 使用 MCP Supabase 工具列出所有表：")
    print(f"   mcp_supabase_list_tables(project_id='{SOURCE_PROJECT_ID}')")
    print("\n2. 对每个表获取详细信息：")
    print("   mcp_supabase_execute_sql(project_id='...', query='SELECT ...')")
    print("\n3. 或者使用以下 SQL 查询获取所有表结构：\n")
    
    # 生成获取表结构的 SQL 查询
    schema_query = """
-- 获取所有表的结构信息
SELECT 
    t.table_schema,
    t.table_name,
    obj_description(c.oid, 'pg_class') as table_comment
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- 获取每个表的列信息
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name as format_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 获取主键信息
SELECT
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;
"""
    
    print(schema_query)
    
    # 创建输出文件
    output_file = "database_export_sql/create_all_tables.sql"
    print(f"\n4. 将查询结果保存到: {output_file}")
    print("\n或者使用下面的 Python 脚本自动生成...\n")
    
    # 创建一个模板文件
    template = f"""-- ============================================
-- 创建所有表结构
-- 源数据库: https://{SOURCE_PROJECT_ID}.supabase.co
-- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- ============================================

-- 注意：此文件需要根据实际表结构信息生成
-- 请使用以下 SQL 查询获取表结构，然后运行此脚本生成完整的 CREATE TABLE 语句

-- 方法 1: 使用 pg_dump 导出表结构（推荐）
-- pg_dump -h db.{SOURCE_PROJECT_ID}.supabase.co -U postgres -d postgres --schema-only -t 'public.*' > create_all_tables.sql

-- 方法 2: 在 Supabase SQL Editor 中执行以下查询获取表结构
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(template)
        f.write(schema_query)
        f.write("\n\n-- ============================================\n")
        f.write("-- 以下是手动生成的表结构（示例）\n")
        f.write("-- 请根据实际查询结果替换\n")
        f.write("-- ============================================\n\n")
    
    print(f"✅ 已创建模板文件: {output_file}")
    print("\n请使用 pg_dump 或 Supabase SQL Editor 获取完整的表结构！")


if __name__ == "__main__":
    main()



