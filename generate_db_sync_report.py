#!/usr/bin/env python3
"""
生成数据库同步报告和SQL脚本
对比数据库1和数据库2的差异，只针对有差异的表生成同步SQL
"""

# 这个脚本需要通过MCP工具获取数据库结构信息
# 以下是使用示例和SQL模板

SQL_TEMPLATES = {
    "get_all_tables": """
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
    """,
    
    "get_table_columns": """
        SELECT 
            column_name,
            data_type,
            udt_name,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            is_nullable,
            column_default,
            ordinal_position
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = '{table_name}'
        ORDER BY ordinal_position;
    """,
    
    "get_table_constraints": """
        SELECT 
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public' 
          AND tc.table_name = '{table_name}'
        ORDER BY tc.constraint_type, tc.constraint_name;
    """,
    
    "get_table_indexes": """
        SELECT 
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' 
          AND tablename = '{table_name}'
        ORDER BY indexname;
    """,
    
    "get_functions": """
        SELECT 
            routine_name,
            routine_type,
            data_type as return_type
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        ORDER BY routine_name;
    """,
    
    "get_rls_policies": """
        SELECT
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
    """
}

def generate_alter_table_add_column_sql(table_name: str, column: dict) -> str:
    """生成ALTER TABLE ADD COLUMN SQL"""
    col_name = column['column_name']
    udt_name = column.get('udt_name', column.get('data_type', 'text'))
    is_nullable = column.get('is_nullable', 'YES') == 'YES'
    default_value = column.get('column_default')
    char_max_len = column.get('character_maximum_length')
    numeric_precision = column.get('numeric_precision')
    numeric_scale = column.get('numeric_scale')
    
    # 构建数据类型
    if 'varchar' in udt_name.lower():
        if char_max_len:
            type_str = f"VARCHAR({char_max_len})"
        else:
            type_str = "VARCHAR(255)"
    elif 'numeric' in udt_name.lower():
        if numeric_precision is not None and numeric_scale is not None:
            type_str = f"NUMERIC({numeric_precision},{numeric_scale})"
        elif numeric_precision is not None:
            type_str = f"NUMERIC({numeric_precision})"
        else:
            type_str = "NUMERIC"
    elif 'int4' in udt_name.lower():
        type_str = "INTEGER"
    elif 'int8' in udt_name.lower():
        type_str = "BIGINT"
    elif 'timestamptz' in udt_name.lower():
        type_str = "TIMESTAMP WITH TIME ZONE"
    elif 'timestamp' in udt_name.lower() and 'timestamptz' not in udt_name.lower():
        type_str = "TIMESTAMP WITHOUT TIME ZONE"
    elif 'uuid' in udt_name.lower():
        type_str = "UUID"
    elif 'bool' in udt_name.lower():
        type_str = "BOOLEAN"
    elif 'inet' in udt_name.lower():
        type_str = "INET"
    elif 'jsonb' in udt_name.lower():
        type_str = "JSONB"
    elif 'text' in udt_name.lower():
        type_str = "TEXT"
    elif 'date' in udt_name.lower():
        type_str = "DATE"
    elif 'smallint' in udt_name.lower() or 'int2' in udt_name.lower():
        type_str = "SMALLINT"
    else:
        type_str = udt_name.upper()
    
    sql = f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {col_name} {type_str}"
    if not is_nullable:
        sql += " NOT NULL"
    if default_value:
        sql += f" DEFAULT {default_value}"
    sql += ";"
    
    return sql

def generate_add_foreign_key_sql(table_name: str, constraint: dict) -> str:
    """生成添加外键约束的SQL"""
    constraint_name = constraint.get('constraint_name')
    column_name = constraint.get('column_name')
    foreign_table = constraint.get('foreign_table_name')
    foreign_column = constraint.get('foreign_column_name')
    
    return f"ALTER TABLE {table_name} ADD CONSTRAINT IF NOT EXISTS {constraint_name} FOREIGN KEY ({column_name}) REFERENCES {foreign_table}({foreign_column});"

def generate_add_index_sql(index: dict) -> str:
    """生成添加索引的SQL"""
    indexdef = index.get('indexdef', '')
    if indexdef:
        return f"{indexdef};"
    return ""

if __name__ == '__main__':
    print("""
    数据库同步报告生成脚本
    
    使用说明：
    1. 使用MCP工具执行SQL查询获取两个数据库的结构信息
    2. 对比差异，只针对有差异的表生成同步SQL
    3. 生成的SQL脚本可以直接在数据库2中执行
    
    注意：
    - 此脚本只生成SQL，不直接执行
    - 执行前请先备份数据库2
    - 建议在测试环境先验证
    """)



