# -*- coding: utf-8 -*-
"""
数据库导出脚本
使用 MCP Supabase 服务导出所有数据表的结构和数据
"""
import json
import os
from datetime import datetime

# 项目配置
PROJECT_ID = "bfcpimnfgidhgigtgehs"
EXPORT_DIR = "database_export"
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

def export_table_structure(table_info):
    """导出表结构信息"""
    structure = {
        "schema": table_info.get("schema"),
        "name": table_info.get("name"),
        "comment": table_info.get("comment", ""),
        "rls_enabled": table_info.get("rls_enabled", False),
        "rows": table_info.get("rows", 0),
        "columns": [],
        "primary_keys": table_info.get("primary_keys", []),
        "foreign_keys": table_info.get("foreign_key_constraints", [])
    }
    
    for col in table_info.get("columns", []):
        column_info = {
            "name": col.get("name"),
            "data_type": col.get("data_type"),
            "format": col.get("format"),
            "nullable": "nullable" in col.get("options", []),
            "default_value": col.get("default_value"),
            "comment": col.get("comment", "")
        }
        structure["columns"].append(column_info)
    
    return structure

def generate_sql_create_table(structure):
    """生成 CREATE TABLE SQL 语句"""
    table_name = f"{structure['schema']}.{structure['name']}"
    sql = f"-- 表: {table_name}\n"
    sql += f"-- 注释: {structure['comment']}\n"
    sql += f"-- RLS: {'启用' if structure['rls_enabled'] else '禁用'}\n"
    sql += f"-- 行数: {structure['rows']}\n\n"
    
    sql += f"CREATE TABLE IF NOT EXISTS {table_name} (\n"
    
    columns_sql = []
    for col in structure["columns"]:
        col_def = f"    {col['name']} {col['data_type']}"
        
        if col.get("default_value"):
            col_def += f" DEFAULT {col['default_value']}"
        
        if not col.get("nullable"):
            col_def += " NOT NULL"
        
        if col.get("comment"):
            col_def += f" -- {col['comment']}"
        
        columns_sql.append(col_def)
    
    sql += ",\n".join(columns_sql)
    
    if structure["primary_keys"]:
        pk_cols = ", ".join(structure["primary_keys"])
        sql += f",\n    PRIMARY KEY ({pk_cols})"
    
    sql += "\n);\n\n"
    
    if structure["comment"]:
        sql += f"COMMENT ON TABLE {table_name} IS '{structure['comment']}';\n\n"
    
    for col in structure["columns"]:
        if col.get("comment"):
            sql += f"COMMENT ON COLUMN {table_name}.{col['name']} IS '{col['comment']}';\n"
    
    return sql

def main():
    """主函数"""
    print("=" * 60)
    print("数据库导出工具")
    print(f"项目ID: {PROJECT_ID}")
    print(f"导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # 创建导出目录
    export_path = os.path.join(EXPORT_DIR, TIMESTAMP)
    os.makedirs(export_path, exist_ok=True)
    
    print(f"\n导出目录: {export_path}\n")
    
    # 注意：这里需要手动运行 MCP 命令获取表列表
    # 由于无法直接调用 MCP，这里提供导出脚本模板
    
    export_info = {
        "project_id": PROJECT_ID,
        "export_time": TIMESTAMP,
        "tables": []
    }
    
    # 生成导出说明文件
    readme_content = f"""# 数据库导出说明

## 导出信息
- 项目ID: {PROJECT_ID}
- 导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- 导出目录: {export_path}

## 使用说明

### 方法1: 使用 MCP Supabase 工具导出

1. 使用 `mcp_supabase_list_tables` 获取所有表列表
2. 对每个表使用 `mcp_supabase_execute_sql` 查询数据:
   ```sql
   SELECT * FROM table_name;
   ```

### 方法2: 使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref {PROJECT_ID}

# 导出数据库结构
supabase db dump -f schema.sql

# 导出数据
supabase db dump --data-only -f data.sql
```

### 方法3: 使用 pg_dump

```bash
# 获取数据库连接信息后
pg_dump -h db.{PROJECT_ID}.supabase.co \\
        -U postgres \\
        -d postgres \\
        -F c \\
        -f backup.dump
```

## 表结构文件

每个表的结构信息保存在 `tables_structure.json` 中。

## 数据文件

每个表的数据保存在对应的 CSV 文件中。
"""
    
    with open(os.path.join(export_path, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme_content)
    
    print("导出说明文件已创建: README.md")
    print("\n请使用以下方法之一导出数据:")
    print("1. 使用 MCP Supabase 工具")
    print("2. 使用 Supabase CLI")
    print("3. 使用 pg_dump")
    print(f"\n导出目录: {export_path}")

if __name__ == "__main__":
    main()















