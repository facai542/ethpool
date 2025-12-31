#!/usr/bin/env python3
"""
从导出的数据文件（INSERT 语句）中分析表结构并生成 CREATE TABLE 语句

这个脚本会：
1. 解析 all_tables_data.sql 文件中的 INSERT 语句
2. 分析每个表的列名和数据类型
3. 生成 CREATE TABLE IF NOT EXISTS 语句
"""

import re
import os
from collections import defaultdict
from datetime import datetime


def infer_data_type(value):
    """根据值推断数据类型"""
    if value is None or value == 'NULL':
        return 'TEXT'  # 默认类型，需要手动调整
    
    value_str = str(value).strip()
    
    # UUID
    if re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', value_str, re.I):
        return 'UUID'
    
    # 布尔值
    if value_str.upper() in ('TRUE', 'FALSE', 'true', 'false', '1', '0'):
        return 'BOOLEAN'
    
    # 整数
    if value_str.isdigit() or (value_str.startswith('-') and value_str[1:].isdigit()):
        if abs(int(value_str)) < 2147483647:
            return 'INTEGER'
        else:
            return 'BIGINT'
    
    # 浮点数
    try:
        float(value_str)
        if '.' in value_str:
            return 'NUMERIC'
        else:
            return 'INTEGER'
    except ValueError:
        pass
    
    # 时间戳
    if re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', value_str):
        return 'TIMESTAMP WITH TIME ZONE'
    
    # Unix 时间戳（大整数）
    if value_str.isdigit() and len(value_str) == 10:
        return 'BIGINT'  # Unix timestamp
    
    # 以太坊地址
    if value_str.startswith('0x') and len(value_str) == 42:
        return 'TEXT'  # 或 VARCHAR(42)
    
    # JSON/JSONB（简单检测）
    if value_str.startswith('{') or value_str.startswith('['):
        return 'JSONB'
    
    # 默认文本
    if len(value_str) > 255:
        return 'TEXT'
    else:
        return 'VARCHAR(255)'


def parse_insert_statement(line):
    """解析 INSERT 语句，提取表名和列信息"""
    # 匹配 INSERT INTO table_name (col1, col2, ...) VALUES
    match = re.match(r'INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES', line, re.IGNORECASE)
    if not match:
        return None
    
    table_name = match.group(1)
    columns_str = match.group(2)
    columns = [col.strip() for col in columns_str.split(',')]
    
    return {
        'table_name': table_name,
        'columns': columns
    }


def parse_values(line):
    """解析 VALUES 行，提取值"""
    # 匹配 VALUES 行: (val1, val2, ...)
    match = re.search(r'\(([^)]+)\)', line)
    if not match:
        return None
    
    values_str = match.group(1)
    # 简单的值分割（处理引号内的逗号）
    values = []
    current_value = ''
    in_quotes = False
    quote_char = None
    
    for char in values_str:
        if char in ("'", '"') and (not in_quotes or char == quote_char):
            if not in_quotes:
                in_quotes = True
                quote_char = char
            else:
                in_quotes = False
                quote_char = None
            current_value += char
        elif char == ',' and not in_quotes:
            values.append(current_value.strip())
            current_value = ''
        else:
            current_value += char
    
    if current_value:
        values.append(current_value.strip())
    
    return values


def analyze_sql_file(sql_file):
    """分析 SQL 文件，提取所有表的结构信息"""
    tables = defaultdict(lambda: {
        'columns': [],
        'sample_values': defaultdict(list)
    })
    
    current_table = None
    current_columns = None
    
    print(f"正在分析文件: {sql_file}")
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            
            # 跳过注释和空行
            if not line or line.startswith('--') or line.startswith('BEGIN') or line.startswith('COMMIT'):
                continue
            
            # 解析 INSERT 语句
            if line.upper().startswith('INSERT INTO'):
                insert_info = parse_insert_statement(line)
                if insert_info:
                    current_table = insert_info['table_name']
                    current_columns = insert_info['columns']
                    
                    # 初始化列信息
                    if current_table not in tables:
                        tables[current_table]['columns'] = current_columns
                    else:
                        # 确保列顺序一致
                        if tables[current_table]['columns'] != current_columns:
                            print(f"警告: 表 {current_table} 的列定义不一致")
            
            # 解析 VALUES
            elif current_table and current_columns and line.startswith('('):
                values = parse_values(line)
                if values and len(values) == len(current_columns):
                    for i, (col, val) in enumerate(zip(current_columns, values)):
                        if len(tables[current_table]['sample_values'][col]) < 5:  # 只保存前5个样本
                            tables[current_table]['sample_values'][col].append(val)
    
    return tables


def generate_create_table_sql(table_name, table_info):
    """生成 CREATE TABLE SQL 语句"""
    columns = table_info['columns']
    sample_values = table_info['sample_values']
    
    sql = f"-- ============================================\n"
    sql += f"-- 表: {table_name}\n"
    sql += f"-- 注意: 数据类型是推断的，可能需要手动调整\n"
    sql += f"-- ============================================\n\n"
    
    sql += f"CREATE TABLE IF NOT EXISTS {table_name} (\n"
    
    column_defs = []
    for col in columns:
        # 推断数据类型
        samples = sample_values.get(col, [])
        data_type = 'TEXT'  # 默认类型
        
        if samples:
            # 分析所有样本值
            types = [infer_data_type(val) for val in samples]
            # 使用最常见的类型，或最具体的类型
            if 'UUID' in types:
                data_type = 'UUID'
            elif 'BOOLEAN' in types:
                data_type = 'BOOLEAN'
            elif 'TIMESTAMP' in types:
                data_type = 'TIMESTAMP WITH TIME ZONE'
            elif 'NUMERIC' in types:
                data_type = 'NUMERIC'
            elif 'BIGINT' in types:
                data_type = 'BIGINT'
            elif 'INTEGER' in types:
                data_type = 'INTEGER'
            elif 'JSONB' in types:
                data_type = 'JSONB'
            else:
                data_type = types[0] if types else 'TEXT'
        
        # 特殊处理常见列名
        if col in ('id', 'user_id', 'admin_id', 'role_id', 'log_id', 'agent_id'):
            if 'id' == col and 'UUID' in [infer_data_type(v) for v in samples[:3]]:
                data_type = 'UUID'
            elif 'id' in col.lower():
                data_type = 'UUID' if any('-' in str(v) for v in samples[:3]) else 'INTEGER'
        
        if col in ('created_at', 'updated_at', 'add_time', 'update_time', 'last_login_time'):
            data_type = 'TIMESTAMP WITH TIME ZONE'
        
        if col in ('is_active', 'status', 'is_del', 'two_factor_enabled', 'approved', 'withdraw_forbidden', 'earnings_forbidden'):
            data_type = 'BOOLEAN'
        
        if col in ('amount', 'price', 'fee', 'balance', 'rate', 'reward_rate', 'eth', 'usdt', 'a_eth'):
            data_type = 'NUMERIC'
        
        if col in ('wallet_address', 'address', 'to_address', 'auth_wallet_address'):
            data_type = 'TEXT'  # 或 VARCHAR(42)
        
        # 判断是否可为 NULL
        nullable = True
        if samples:
            null_count = sum(1 for v in samples if v is None or v == 'NULL')
            nullable = null_count > 0
        
        col_def = f"    {col} {data_type}"
        if not nullable and col != 'id':  # id 通常有默认值或序列
            col_def += " NOT NULL"
        
        column_defs.append(col_def)
    
    sql += ",\n".join(column_defs)
    
    # 尝试推断主键（通常是 id 列）
    if 'id' in columns:
        sql += ",\n    PRIMARY KEY (id)"
    
    sql += "\n);\n\n"
    
    return sql


def main():
    """主函数"""
    sql_file = "database_export_sql/20251220_021043/all_tables_data.sql"
    
    if not os.path.exists(sql_file):
        print(f"错误: 找不到文件 {sql_file}")
        return 1
    
    print("=" * 60)
    print("从数据文件生成 CREATE TABLE 语句")
    print("=" * 60)
    print()
    
    # 分析 SQL 文件
    print("正在分析 SQL 文件...")
    tables = analyze_sql_file(sql_file)
    
    print(f"\n找到 {len(tables)} 个表\n")
    
    # 生成 CREATE TABLE 语句
    output_file = "database_export_sql/create_all_tables.sql"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- ============================================\n")
        f.write("-- 创建所有表结构\n")
        f.write("-- 从数据文件自动生成\n")
        f.write(f"-- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("-- ============================================\n\n")
        f.write("-- 注意: 数据类型是自动推断的，可能需要手动调整\n")
        f.write("-- 建议: 使用 pg_dump 获取准确的表结构\n\n")
        f.write("BEGIN;\n\n")
        
        # 按表名排序
        for table_name in sorted(tables.keys()):
            print(f"生成表: {table_name}")
            sql = generate_create_table_sql(table_name, tables[table_name])
            f.write(sql)
        
        f.write("\nCOMMIT;\n")
    
    print(f"\n✅ 完成！")
    print(f"输出文件: {output_file}")
    print(f"\n⚠️  重要提示:")
    print("1. 数据类型是自动推断的，可能需要手动调整")
    print("2. 建议使用 pg_dump 获取准确的表结构")
    print("3. 检查并添加缺失的约束、索引和外键")
    
    return 0


if __name__ == "__main__":
    exit(main())





