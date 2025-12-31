#!/usr/bin/env python3
"""
数据库完整同步脚本生成器
从数据库1（源）同步到数据库2（目标）

使用方法：
1. 确保已安装 supabase-py 或使用 Supabase CLI
2. 运行此脚本生成完整的同步SQL
3. 在数据库2中执行生成的SQL
"""

import json
from typing import List, Dict, Any

def generate_table_sql(table_info: Dict[str, Any]) -> str:
    """生成单个表的CREATE TABLE语句"""
    table_name = table_info['name']
    columns = table_info['columns']
    primary_keys = table_info.get('primary_keys', [])
    
    sql = f"CREATE TABLE IF NOT EXISTS {table_name} (\n"
    
    # 生成列定义
    column_defs = []
    for col in sorted(columns, key=lambda x: x.get('ordinal_position', 0)):
        col_name = col['name']
        data_type = col.get('format', col.get('data_type', 'text'))
        is_nullable = 'nullable' in col.get('options', [])
        default_value = col.get('default_value')
        
        # 构建数据类型
        type_str = data_type.upper()
        if 'varchar' in data_type.lower():
            max_len = col.get('character_maximum_length')
            if max_len:
                type_str = f"VARCHAR({max_len})"
            else:
                type_str = "VARCHAR"
        elif 'numeric' in data_type.lower():
            precision = col.get('numeric_precision')
            scale = col.get('numeric_scale')
            if precision and scale:
                type_str = f"NUMERIC({precision},{scale})"
            elif precision:
                type_str = f"NUMERIC({precision})"
            else:
                type_str = "NUMERIC"
        
        # 构建列定义
        col_def = f"  {col_name} {type_str}"
        
        if not is_nullable:
            col_def += " NOT NULL"
        
        if default_value:
            col_def += f" DEFAULT {default_value}"
        
        column_defs.append(col_def)
    
    sql += ",\n".join(column_defs)
    
    # 添加主键约束
    if primary_keys:
        pk_cols = ", ".join(primary_keys)
        sql += f",\n  PRIMARY KEY ({pk_cols})"
    
    sql += "\n);\n"
    
    # 添加注释
    if table_info.get('comment'):
        sql += f"COMMENT ON TABLE {table_name} IS '{table_info['comment']}';\n"
    
    return sql

def generate_foreign_key_sql(fk_info: Dict[str, Any]) -> str:
    """生成外键约束SQL"""
    constraint_name = fk_info['name']
    source_table = fk_info['source'].split('.')[1]  # public.table.column
    target_table = fk_info['target'].split('.')[1]
    source_column = fk_info['source'].split('.')[2]
    target_column = fk_info['target'].split('.')[2]
    
    sql = f"""
ALTER TABLE {source_table}
ADD CONSTRAINT IF NOT EXISTS {constraint_name}
FOREIGN KEY ({source_column}) 
REFERENCES {target_table}({target_column})
ON DELETE CASCADE;
"""
    return sql

def generate_index_sql(index_info: Dict[str, Any]) -> str:
    """生成索引SQL"""
    index_name = index_info['indexname']
    table_name = index_info['tablename']
    index_def = index_info['indexdef']
    
    # 使用原始定义，但添加IF NOT EXISTS
    sql = index_def.replace("CREATE UNIQUE INDEX", "CREATE UNIQUE INDEX IF NOT EXISTS")
    sql = sql.replace("CREATE INDEX", "CREATE INDEX IF NOT EXISTS")
    sql += "\n"
    
    return sql

def generate_function_sql(function_info: Dict[str, Any]) -> str:
    """生成函数SQL"""
    function_name = function_info['routine_name']
    return_type = function_info['return_type']
    definition = function_info.get('routine_definition', '')
    
    if not definition:
        return f"-- 函数 {function_name} 的定义未找到\n"
    
    sql = f"""
CREATE OR REPLACE FUNCTION {function_name}()
RETURNS {return_type}
LANGUAGE plpgsql
AS $$
{definition}
$$;
"""
    return sql

def generate_rls_policy_sql(policy_info: Dict[str, Any]) -> str:
    """生成RLS策略SQL"""
    table_name = policy_info['tablename']
    policy_name = policy_info['policyname']
    cmd = policy_info['cmd']
    qual = policy_info.get('qual', 'true')
    with_check = policy_info.get('with_check')
    roles = policy_info.get('roles', '{}')
    
    sql = f"""
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "{policy_name}"
ON {table_name} FOR {cmd}
TO {roles}
"""
    
    if qual and qual != 'true':
        sql += f"USING ({qual})\n"
    
    if with_check:
        sql += f"WITH CHECK ({with_check})\n"
    
    sql += ";\n"
    
    return sql

def main():
    """主函数"""
    print("=" * 60)
    print("数据库完整同步脚本生成器")
    print("=" * 60)
    print()
    print("此脚本需要从Supabase MCP获取完整的数据库结构信息")
    print("建议使用以下方法之一：")
    print()
    print("方法1：使用Supabase CLI")
    print("  supabase db dump -f database1_schema.sql --schema-only")
    print()
    print("方法2：使用pg_dump")
    print("  pg_dump -h <host> -U <user> -d <dbname> \\")
    print("    --schema-only --no-owner --no-privileges \\")
    print("    > database1_schema.sql")
    print()
    print("方法3：使用Supabase Dashboard")
    print("  在Dashboard中导出数据库结构")
    print()
    print("然后使用以下命令在数据库2中应用：")
    print("  psql -h <db2_host> -U <user> -d <db2_name> < database1_schema.sql")
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()



