#!/usr/bin/env python3
"""
使用 MCP Supabase 工具获取的数据生成完整的数据库结构 SQL 文件
"""

from datetime import datetime
import json

# 从 MCP list_tables 获取的表信息
# 这里需要手动运行 MCP 工具获取数据，或者直接使用已获取的数据

def format_column_definition(col):
    """格式化列定义"""
    col_name = col['name']
    data_type = col['format']  # 使用 format 字段
    
    # 处理默认值
    default_value = col.get('default_value', '')
    nullable = 'nullable' in col.get('options', [])
    
    col_def = f"    {col_name} {data_type}"
    
    # 添加 NOT NULL 约束
    if not nullable:
        col_def += " NOT NULL"
    
    # 添加默认值
    if default_value:
        # 处理序列默认值
        if 'nextval' in str(default_value):
            col_def += f" DEFAULT {default_value}"
        elif 'gen_random_uuid()' in str(default_value) or 'uuid_generate_v4()' in str(default_value):
            col_def += f" DEFAULT {default_value}"
        elif 'now()' in str(default_value) or 'CURRENT_TIMESTAMP' in str(default_value):
            col_def += f" DEFAULT {default_value}"
        elif '::' in str(default_value):
            col_def += f" DEFAULT {default_value}"
        else:
            # 字符串或其他值
            if isinstance(default_value, str) and not default_value.startswith("'") and not default_value.startswith('nextval'):
                col_def += f" DEFAULT '{default_value}'"
            else:
                col_def += f" DEFAULT {default_value}"
    
    # 添加 CHECK 约束
    check_constraint = col.get('check', '')
    if check_constraint:
        col_def += f" CHECK ({check_constraint})"
    
    # 添加注释
    col_comment = col.get('comment', '')
    if col_comment:
        col_def += f" -- {col_comment}"
    
    return col_def

def generate_table_sql(table_info):
    """生成表的 CREATE TABLE SQL"""
    table_name = table_info['name']
    columns = table_info['columns']
    primary_keys = table_info.get('primary_keys', [])
    comment = table_info.get('comment', '')
    
    sql_lines = []
    sql_lines.append(f"-- ============================================")
    sql_lines.append(f"-- 表: {table_name}")
    if comment:
        sql_lines.append(f"-- 说明: {comment}")
    sql_lines.append(f"-- ============================================")
    sql_lines.append(f"CREATE TABLE IF NOT EXISTS {table_name} (")
    
    column_defs = []
    for col in columns:
        column_defs.append(format_column_definition(col))
    
    sql_lines.append(",\n".join(column_defs))
    
    # 添加主键
    if primary_keys:
        pk_cols = ", ".join(primary_keys)
        sql_lines.append(f",\n    PRIMARY KEY ({pk_cols})")
    
    sql_lines.append(");")
    
    # 添加表注释
    if comment:
        # 转义单引号
        comment_escaped = comment.replace("'", "''")
        sql_lines.append(f"COMMENT ON TABLE {table_name} IS '{comment_escaped}';")
    
    sql_lines.append("")
    return "\n".join(sql_lines)

def generate_foreign_keys_sql(foreign_keys_data):
    """生成外键约束 SQL"""
    sql_lines = []
    sql_lines.append("-- ============================================")
    sql_lines.append("-- 外键约束 (Foreign Keys)")
    sql_lines.append("-- ============================================")
    
    for fk in foreign_keys_data:
        table_name = fk['table_name']
        column_name = fk['column_name']
        foreign_table = fk['foreign_table_name']
        foreign_column = fk['foreign_column_name']
        constraint_name = fk['constraint_name']
        
        sql_lines.append(
            f"ALTER TABLE {table_name} "
            f"ADD CONSTRAINT IF NOT EXISTS {constraint_name} "
            f"FOREIGN KEY ({column_name}) "
            f"REFERENCES {foreign_table}({foreign_column});"
        )
    
    sql_lines.append("")
    return "\n".join(sql_lines)

def generate_indexes_sql(indexes_data):
    """生成索引 SQL（排除主键和唯一约束自动创建的索引）"""
    sql_lines = []
    sql_lines.append("-- ============================================")
    sql_lines.append("-- 索引 (Indexes)")
    sql_lines.append("-- ============================================")
    
    # 过滤掉主键索引和唯一约束索引
    filtered_indexes = []
    for idx in indexes_data:
        index_name = idx['indexname']
        # 排除主键索引（通常以 _pkey 结尾）和唯一约束索引（以 _key 结尾）
        if not index_name.endswith('_pkey') and not index_name.endswith('_key'):
            filtered_indexes.append(idx)
    
    if not filtered_indexes:
        sql_lines.append("-- 没有额外的索引需要创建（主键和唯一约束已自动创建索引）")
    else:
        for idx in filtered_indexes:
            # 从 indexdef 中提取索引定义
            indexdef = idx['indexdef']
            # 替换为 IF NOT EXISTS 版本
            if 'CREATE UNIQUE INDEX' in indexdef:
                indexdef = indexdef.replace('CREATE UNIQUE INDEX', 'CREATE UNIQUE INDEX IF NOT EXISTS')
            elif 'CREATE INDEX' in indexdef:
                indexdef = indexdef.replace('CREATE INDEX', 'CREATE INDEX IF NOT EXISTS')
            sql_lines.append(indexdef + ";")
    
    sql_lines.append("")
    return "\n".join(sql_lines)

def main():
    print("=" * 60)
    print("使用 MCP Supabase 工具数据生成完整数据库结构 SQL 文件")
    print("=" * 60)
    print()
    print("注意：此脚本需要从 MCP 工具获取的数据")
    print("由于表数量较多（100+），建议使用 pg_dump 直接导出")
    print()
    print("如果已安装 PostgreSQL 客户端，请使用：")
    print("  .\\export_complete_schema.ps1")
    print()
    print("或者手动运行：")
    print("  pg_dump -h db.xxx.supabase.co -U postgres -d postgres --schema-only --no-owner --no-privileges -t 'public.*' -f schema.sql")
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()




