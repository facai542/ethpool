#!/usr/bin/env python3
"""
数据库对比脚本
对比数据库1和数据库2的表结构差异
"""

import json
from typing import Dict, List, Any

def compare_table_structures(db1_tables: List[Dict], db2_tables: List[Dict]) -> Dict[str, Any]:
    """
    对比两个数据库的表结构
    返回差异报告
    """
    differences = {
        'missing_tables_in_db2': [],
        'missing_columns_in_db2': [],
        'column_type_differences': [],
        'column_default_differences': [],
        'column_nullable_differences': [],
        'missing_constraints_in_db2': [],
        'missing_indexes_in_db2': [],
        'missing_functions_in_db2': [],
        'missing_rls_policies_in_db2': []
    }
    
    # 创建表名到表结构的映射
    db1_table_map = {table['name']: table for table in db1_tables}
    db2_table_map = {table['name']: table for table in db2_tables}
    
    # 检查缺失的表
    for table_name in db1_table_map:
        if table_name not in db2_table_map:
            differences['missing_tables_in_db2'].append(table_name)
    
    # 检查每个表的字段差异
    for table_name in db1_table_map:
        if table_name not in db2_table_map:
            continue
            
        db1_table = db1_table_map[table_name]
        db2_table = db2_table_map[table_name]
        
        # 创建字段名到字段定义的映射
        db1_columns = {col['name']: col for col in db1_table.get('columns', [])}
        db2_columns = {col['name']: col for col in db2_table.get('columns', [])}
        
        # 检查缺失的字段
        for col_name in db1_columns:
            if col_name not in db2_columns:
                differences['missing_columns_in_db2'].append({
                    'table': table_name,
                    'column': col_name,
                    'db1_definition': db1_columns[col_name]
                })
            else:
                # 检查字段类型差异
                db1_col = db1_columns[col_name]
                db2_col = db2_columns[col_name]
                
                if db1_col.get('format') != db2_col.get('format'):
                    differences['column_type_differences'].append({
                        'table': table_name,
                        'column': col_name,
                        'db1_type': db1_col.get('format'),
                        'db2_type': db2_col.get('format')
                    })
                
                # 检查默认值差异
                if db1_col.get('default_value') != db2_col.get('default_value'):
                    differences['column_default_differences'].append({
                        'table': table_name,
                        'column': col_name,
                        'db1_default': db1_col.get('default_value'),
                        'db2_default': db2_col.get('default_value')
                    })
                
                # 检查可空性差异
                db1_nullable = 'nullable' in db1_col.get('options', [])
                db2_nullable = 'nullable' in db2_col.get('options', [])
                if db1_nullable != db2_nullable:
                    differences['column_nullable_differences'].append({
                        'table': table_name,
                        'column': col_name,
                        'db1_nullable': db1_nullable,
                        'db2_nullable': db2_nullable
                    })
    
    return differences

def generate_migration_sql(differences: Dict[str, Any]) -> str:
    """
    根据差异生成迁移SQL
    """
    sql_statements = []
    
    # 生成创建缺失表的SQL（需要从数据库1获取完整DDL）
    if differences['missing_tables_in_db2']:
        sql_statements.append("-- 缺失的表（需要从数据库1获取完整DDL）:")
        for table_name in differences['missing_tables_in_db2']:
            sql_statements.append(f"-- CREATE TABLE {table_name} (...);")
    
    # 生成添加缺失字段的SQL
    if differences['missing_columns_in_db2']:
        sql_statements.append("\n-- 添加缺失的字段:")
        for diff in differences['missing_columns_in_db2']:
            col = diff['db1_definition']
            col_name = diff['column']
            table_name = diff['table']
            data_type = col.get('format', 'text')
            is_nullable = 'nullable' in col.get('options', [])
            default_value = col.get('default_value')
            
            sql = f"ALTER TABLE {table_name} ADD COLUMN {col_name} {data_type}"
            if not is_nullable:
                sql += " NOT NULL"
            if default_value:
                sql += f" DEFAULT {default_value}"
            sql += ";"
            sql_statements.append(sql)
    
    # 生成修改字段类型的SQL
    if differences['column_type_differences']:
        sql_statements.append("\n-- 修改字段类型:")
        for diff in differences['column_type_differences']:
            sql_statements.append(
                f"ALTER TABLE {diff['table']} ALTER COLUMN {diff['column']} "
                f"TYPE {diff['db1_type']};"
            )
    
    # 生成修改默认值的SQL
    if differences['column_default_differences']:
        sql_statements.append("\n-- 修改字段默认值:")
        for diff in differences['column_default_differences']:
            table = diff['table']
            column = diff['column']
            default = diff['db1_default']
            if default:
                sql_statements.append(
                    f"ALTER TABLE {table} ALTER COLUMN {column} "
                    f"SET DEFAULT {default};"
                )
            else:
                sql_statements.append(
                    f"ALTER TABLE {table} ALTER COLUMN {column} "
                    f"DROP DEFAULT;"
                )
    
    # 生成修改可空性的SQL
    if differences['column_nullable_differences']:
        sql_statements.append("\n-- 修改字段可空性:")
        for diff in differences['column_nullable_differences']:
            table = diff['table']
            column = diff['column']
            if diff['db1_nullable']:
                sql_statements.append(
                    f"ALTER TABLE {table} ALTER COLUMN {column} DROP NOT NULL;"
                )
            else:
                sql_statements.append(
                    f"ALTER TABLE {table} ALTER COLUMN {column} SET NOT NULL;"
                )
    
    return "\n".join(sql_statements)

if __name__ == "__main__":
    print("数据库对比脚本")
    print("请使用MCP工具获取两个数据库的表结构，然后调用此脚本进行对比")


