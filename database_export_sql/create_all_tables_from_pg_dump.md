# 使用 pg_dump 导出表结构

## 方法 1: 使用 pg_dump（推荐，最简单）

### 步骤

1. **获取数据库连接信息**
   - 登录 Supabase Dashboard
   - 进入 Settings → Database
   - 复制 Connection string（使用 Session mode）

2. **使用 pg_dump 导出表结构**

```bash
# Windows PowerShell
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co `
        -U postgres `
        -d postgres `
        --schema-only `
        --no-owner `
        --no-privileges `
        -t 'public.*' `
        > create_all_tables.sql

# Linux/Mac
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
        -U postgres \
        -d postgres \
        --schema-only \
        --no-owner \
        --no-privileges \
        -t 'public.*' \
        > create_all_tables.sql
```

3. **输入数据库密码**（在 Supabase Dashboard → Settings → Database 中获取）

### 参数说明

- `--schema-only`: 只导出表结构，不导出数据
- `--no-owner`: 不包含所有者信息
- `--no-privileges`: 不包含权限信息
- `-t 'public.*'`: 只导出 public schema 下的所有表

## 方法 2: 使用 Supabase SQL Editor

1. **登录 Supabase Dashboard**
2. **打开 SQL Editor**
3. **执行以下查询获取表结构**（见 `get_table_schema.sql`）
4. **手动生成 CREATE TABLE 语句**

## 方法 3: 使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref bfcpimnfgidhgigtgehs

# 导出表结构
supabase db dump --schema-only > create_all_tables.sql
```

## 生成的文件

执行后会在当前目录生成 `create_all_tables.sql` 文件，包含所有表的 CREATE TABLE 语句。

## 注意事项

1. **表结构可能包含扩展**：如果使用了 Postgres 扩展（如 uuid-ossp），需要先启用
2. **外键约束**：确保按依赖顺序创建表，或先创建所有表再添加外键
3. **索引**：pg_dump 会自动包含索引定义
4. **RLS 策略**：表结构导出不包含 RLS 策略，需要单独导出

## 优化导出文件

生成后，可以手动编辑文件：
- 添加 `IF NOT EXISTS` 避免重复创建
- 移除不必要的注释
- 调整格式以便阅读





