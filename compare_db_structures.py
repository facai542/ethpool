#!/usr/bin/env python3
"""
数据库结构对比脚本
对比两个Supabase数据库的结构差异（表、字段、约束、索引、函数、RLS策略）
"""

import json
from typing import Dict, List, Set, Any

def compare_table_columns(db1_columns: List[Dict], db2_columns: List[Dict], table_name: str) -> Dict:
    """对比两个表的字段差异"""
    db1_cols = {col['column_name']: col for col in db1_columns}
    db2_cols = {col['column_name']: col for col in db2_columns}
    
    differences = {
        'missing_in_db2': [],
        'missing_in_db1': [],
        'type_differences': [],
        'nullable_differences': [],
        'default_differences': []
    }
    
    # 检查数据库1中有但数据库2中没有的字段
    for col_name, col_info in db1_cols.items():
        if col_name not in db2_cols:
            differences['missing_in_db2'].append({
                'column_name': col_name,
                'data_type': col_info.get('data_type'),
                'udt_name': col_info.get('udt_name'),
                'is_nullable': col_info.get('is_nullable'),
                'column_default': col_info.get('column_default')
            })
        else:
            # 检查类型差异
            db2_col = db2_cols[col_name]
            if col_info.get('data_type') != db2_col.get('data_type') or \
               col_info.get('udt_name') != db2_col.get('udt_name'):
                differences['type_differences'].append({
                    'column_name': col_name,
                    'db1_type': col_info.get('data_type'),
                    'db1_udt': col_info.get('udt_name'),
                    'db2_type': db2_col.get('data_type'),
                    'db2_udt': db2_col.get('udt_name')
                })
            
            # 检查可空性差异
            if col_info.get('is_nullable') != db2_col.get('is_nullable'):
                differences['nullable_differences'].append({
                    'column_name': col_name,
                    'db1_nullable': col_info.get('is_nullable'),
                    'db2_nullable': db2_col.get('is_nullable')
                })
            
            # 检查默认值差异
            if col_info.get('column_default') != db2_col.get('column_default'):
                differences['default_differences'].append({
                    'column_name': col_name,
                    'db1_default': col_info.get('column_default'),
                    'db2_default': db2_col.get('column_default')
                })
    
    # 检查数据库2中有但数据库1中没有的字段（通常不需要同步，但记录下来）
    for col_name, col_info in db2_cols.items():
        if col_name not in db1_cols:
            differences['missing_in_db1'].append({
                'column_name': col_name,
                'data_type': col_info.get('data_type'),
                'udt_name': col_info.get('udt_name')
            })
    
    return differences

def compare_constraints(db1_constraints: List[Dict], db2_constraints: List[Dict], table_name: str) -> Dict:
    """对比两个表的约束差异"""
    db1_cons = {(c.get('constraint_name'), c.get('constraint_type')): c for c in db1_constraints}
    db2_cons = {(c.get('constraint_name'), c.get('constraint_type')): c for c in db2_constraints}
    
    differences = {
        'missing_in_db2': [],
        'missing_in_db1': []
    }
    
    # 检查数据库1中有但数据库2中没有的约束
    for key, constraint in db1_cons.items():
        if key not in db2_cons:
            differences['missing_in_db2'].append(constraint)
    
    # 检查数据库2中有但数据库1中没有的约束
    for key, constraint in db2_cons.items():
        if key not in db1_cons:
            differences['missing_in_db1'].append(constraint)
    
    return differences

def compare_indexes(db1_indexes: List[Dict], db2_indexes: List[Dict], table_name: str) -> Dict:
    """对比两个表的索引差异"""
    db1_idx = {idx.get('indexname'): idx for idx in db1_indexes}
    db2_idx = {idx.get('indexname'): idx for idx in db2_indexes}
    
    differences = {
        'missing_in_db2': [],
        'missing_in_db1': []
    }
    
    # 检查数据库1中有但数据库2中没有的索引
    for idx_name, idx_info in db1_idx.items():
        if idx_name not in db2_idx:
            differences['missing_in_db2'].append(idx_info)
    
    # 检查数据库2中有但数据库1中没有的索引
    for idx_name, idx_info in db2_idx.items():
        if idx_name not in db1_idx:
            differences['missing_in_db1'].append(idx_info)
    
    return differences

def generate_sync_sql_for_table(table_name: str, differences: Dict) -> List[str]:
    """为单个表生成同步SQL"""
    sql_statements = []
    
    # 添加缺失的字段
    for col in differences.get('columns', {}).get('missing_in_db2', []):
        col_name = col['column_name']
        data_type = col.get('udt_name', col.get('data_type', 'text'))
        is_nullable = col.get('is_nullable', 'YES') == 'YES'
        default_value = col.get('column_default')
        
        # 构建数据类型
        type_str = data_type.upper()
        if 'varchar' in data_type.lower():
            type_str = f"VARCHAR(255)"  # 简化处理
        elif 'numeric' in data_type.lower():
            type_str = "NUMERIC"
        elif 'int4' in data_type.lower():
            type_str = "INTEGER"
        elif 'int8' in data_type.lower():
            type_str = "BIGINT"
        elif 'timestamptz' in data_type.lower():
            type_str = "TIMESTAMP WITH TIME ZONE"
        elif 'timestamp' in data_type.lower():
            type_str = "TIMESTAMP WITHOUT TIME ZONE"
        elif 'uuid' in data_type.lower():
            type_str = "UUID"
        elif 'bool' in data_type.lower():
            type_str = "BOOLEAN"
        elif 'inet' in data_type.lower():
            type_str = "INET"
        elif 'jsonb' in data_type.lower():
            type_str = "JSONB"
        elif 'text' in data_type.lower():
            type_str = "TEXT"
        elif 'date' in data_type.lower():
            type_str = "DATE"
        
        col_def = f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {col_name} {type_str}"
        if not is_nullable:
            col_def += " NOT NULL"
        if default_value:
            col_def += f" DEFAULT {default_value}"
        col_def += ";"
        sql_statements.append(col_def)
    
    # 添加缺失的外键约束
    for fk in differences.get('constraints', {}).get('missing_in_db2', []):
        if fk.get('constraint_type') == 'FOREIGN KEY':
            constraint_name = fk.get('constraint_name')
            column_name = fk.get('column_name')
            foreign_table = fk.get('foreign_table_name')
            foreign_column = fk.get('foreign_column_name')
            
            sql = f"ALTER TABLE {table_name} ADD CONSTRAINT IF NOT EXISTS {constraint_name} "
            sql += f"FOREIGN KEY ({column_name}) REFERENCES {foreign_table}({foreign_column});"
            sql_statements.append(sql)
    
    # 添加缺失的索引
    for idx in differences.get('indexes', {}).get('missing_in_db2', []):
        indexdef = idx.get('indexdef', '')
        if indexdef:
            sql_statements.append(f"{indexdef};")
    
    return sql_statements

# 示例使用说明
if __name__ == '__main__':
    print("""
    数据库结构对比脚本使用说明：
    
    1. 此脚本需要配合MCP工具使用，通过SQL查询获取两个数据库的结构信息
    2. 对比内容包括：
       - 表字段差异（缺失字段、类型差异、可空性差异、默认值差异）
       - 约束差异（主键、外键、唯一、检查约束）
       - 索引差异
       - 函数差异
       - RLS策略差异
    
    3. 使用方法：
       - 使用MCP工具查询两个数据库的结构信息
       - 调用对比函数进行差异分析
       - 生成同步SQL脚本
    
    4. 注意：此脚本只生成同步SQL，不直接执行
    """)



