# 数据库导出说明

## 导出信息
- 项目ID: bfcpimnfgidhgigtgehs
- 导出时间: 2025-12-17 02:19:40
- 导出目录: database_export\20251217_021940

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
supabase link --project-ref bfcpimnfgidhgigtgehs

# 导出数据库结构
supabase db dump -f schema.sql

# 导出数据
supabase db dump --data-only -f data.sql
```

### 方法3: 使用 pg_dump

```bash
# 获取数据库连接信息后
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f backup.dump
```

## 表结构文件

每个表的结构信息保存在 `tables_structure.json` 中。

## 数据文件

每个表的数据保存在对应的 CSV 文件中。
