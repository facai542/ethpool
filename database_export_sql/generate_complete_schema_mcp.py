#!/usr/bin/env python3
"""
使用 MCP Supabase 工具生成完整的数据库结构 SQL 文件
包含所有表、字段、关系、约束、索引等
"""

import json
from datetime import datetime

# 从 MCP 工具获取的数据
# 这里需要手动运行 MCP 工具获取数据，或者使用 API 调用

def generate_create_table_sql(table_info):
    """根据表信息生成 CREATE TABLE SQL"""
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
        col_name = col['name']
        data_type = col['format']  # 使用 format 字段，它包含完整的数据类型信息
        
        # 处理默认值
        default_value = col.get('default_value', '')
        nullable = 'nullable' in col.get('options', [])
        
        col_def = f"    {col_name} {data_type}"
        
        # 添加 NOT NULL 约束
        if not nullable and 'updatable' in col.get('options', []):
            col_def += " NOT NULL"
        
        # 添加默认值
        if default_value:
            # 处理序列默认值
            if 'nextval' in default_value:
                col_def += f" DEFAULT {default_value}"
            elif 'gen_random_uuid()' in default_value or 'uuid_generate_v4()' in default_value:
                col_def += f" DEFAULT {default_value}"
            elif 'now()' in default_value or 'CURRENT_TIMESTAMP' in default_value:
                col_def += f" DEFAULT {default_value}"
            elif '::' in default_value:
                # PostgreSQL 类型转换
                col_def += f" DEFAULT {default_value}"
            else:
                # 字符串或其他值
                if isinstance(default_value, str) and not default_value.startswith("'"):
                    col_def += f" DEFAULT '{default_value}'"
                else:
                    col_def += f" DEFAULT {default_value}"
        
        # 添加注释
        col_comment = col.get('comment', '')
        if col_comment:
            col_def += f" -- {col_comment}"
        
        column_defs.append(col_def)
    
    sql_lines.append(",\n".join(column_defs))
    
    # 添加主键
    if primary_keys:
        pk_cols = ", ".join(primary_keys)
        sql_lines.append(f",\n    PRIMARY KEY ({pk_cols})")
    
    sql_lines.append(");")
    
    # 添加表注释
    if comment:
        sql_lines.append(f"COMMENT ON TABLE {table_name} IS '{comment}';")
    
    sql_lines.append("")
    return "\n".join(sql_lines)

def generate_foreign_keys_sql(foreign_keys):
    """生成外键约束 SQL"""
    sql_lines = []
    sql_lines.append("-- ============================================")
    sql_lines.append("-- 外键约束")
    sql_lines.append("-- ============================================")
    
    for fk in foreign_keys:
        table_name = fk['table_name']
        column_name = fk['column_name']
        foreign_table = fk['foreign_table_name']
        foreign_column = fk['foreign_column_name']
        constraint_name = fk['constraint_name']
        
        sql_lines.append(
            f"ALTER TABLE {table_name} "
            f"ADD CONSTRAINT {constraint_name} "
            f"FOREIGN KEY ({column_name}) "
            f"REFERENCES {foreign_table}({foreign_column});"
        )
    
    sql_lines.append("")
    return "\n".join(sql_lines)

def generate_sequences_sql(sequences):
    """生成序列 SQL"""
    sql_lines = []
    sql_lines.append("-- ============================================")
    sql_lines.append("-- 序列 (Sequences)")
    sql_lines.append("-- ============================================")
    
    for seq in sequences:
        seq_name = seq['sequencename']
        # 序列通常由表自动创建，这里只记录
        sql_lines.append(f"-- 序列: {seq_name} (由表自动管理)")
    
    sql_lines.append("")
    return "\n".join(sql_lines)

def generate_indexes_sql(indexes):
    """生成索引 SQL（排除主键和唯一约束自动创建的索引）"""
    sql_lines = []
    sql_lines.append("-- ============================================")
    sql_lines.append("-- 索引 (Indexes)")
    sql_lines.append("-- ============================================")
    
    # 过滤掉主键索引和唯一约束索引
    filtered_indexes = []
    for idx in indexes:
        index_name = idx['indexname']
        # 排除主键索引（通常以 _pkey 结尾）
        if not index_name.endswith('_pkey') and not index_name.endswith('_key'):
            filtered_indexes.append(idx)
    
    if not filtered_indexes:
        sql_lines.append("-- 没有额外的索引需要创建（主键和唯一约束已自动创建索引）")
    else:
        for idx in filtered_indexes:
            # 从 indexdef 中提取索引定义
            indexdef = idx['indexdef']
            # 替换 CREATE UNIQUE INDEX 为 CREATE INDEX IF NOT EXISTS
            if 'CREATE UNIQUE INDEX' in indexdef:
                indexdef = indexdef.replace('CREATE UNIQUE INDEX', 'CREATE UNIQUE INDEX IF NOT EXISTS')
            elif 'CREATE INDEX' in indexdef:
                indexdef = indexdef.replace('CREATE INDEX', 'CREATE INDEX IF NOT EXISTS')
            sql_lines.append(indexdef + ";")
    
    sql_lines.append("")
    return "\n".join(sql_lines)

def main():
    print("正在生成完整的数据库结构 SQL 文件...")
    print("注意：此脚本需要从 MCP 工具获取的数据")
    print("请使用 MCP Supabase 工具获取表信息后，手动运行此脚本")
    
    # 这里应该从 MCP 工具获取数据
    # 由于无法直接调用，我们生成一个模板文件
    output_file = "database_export_sql/complete_database_schema.sql"
    
    sql_content = []
    sql_content.append("-- ============================================")
    sql_content.append("-- 完整数据库结构 SQL 文件")
    sql_content.append(f"-- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_content.append("-- 说明: 此文件包含所有表结构、字段、关系、约束和索引")
    sql_content.append("-- 可以直接导入到其他 Supabase 数据库")
    sql_content.append("-- ============================================")
    sql_content.append("")
    sql_content.append("-- 启用必要的扩展")
    sql_content.append("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
    sql_content.append("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";")
    sql_content.append("")
    
    # 注意：实际使用时，需要从 MCP 工具获取的数据填充以下部分
    sql_content.append("-- TODO: 从 MCP 工具获取表信息后，填充以下内容")
    sql_content.append("-- 1. 所有表的 CREATE TABLE 语句")
    sql_content.append("-- 2. 所有外键约束")
    sql_content.append("-- 3. 所有索引")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_content))
    
    print(f"模板文件已生成: {output_file}")
    print("请使用 MCP Supabase 工具获取完整数据后，更新此文件")

if __name__ == "__main__":
    main()




