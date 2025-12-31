# 使用 MCP 工具导出完整数据库结构指南

## 📋 概述

本指南说明如何使用 MCP Supabase 工具导出完整的数据库结构（包括所有表、字段、关系、约束和索引），生成可直接导入其他 Supabase 数据库的 SQL 文件。

## 🎯 目标

生成一个包含以下内容的 SQL 文件：
- ✅ 所有表的 CREATE TABLE 语句
- ✅ 所有字段及其数据类型、约束、默认值
- ✅ 所有主键定义
- ✅ 所有外键关系
- ✅ 所有索引
- ✅ 所有序列（Sequences）
- ✅ 表注释和字段注释

## 🚀 方法 1: 使用 pg_dump（推荐，最简单）

### 步骤 1: 获取数据库连接信息

1. 登录 Supabase Dashboard
2. 进入 Settings → Database
3. 复制连接字符串或记录以下信息：
   - Host: `db.bfcpimnfgidhgigtgehs.supabase.co`
   - Database: `postgres`
   - User: `postgres`
   - Password: （在 Dashboard 中查看）
   - Port: `5432`

### 步骤 2: 使用 pg_dump 导出

**Windows PowerShell:**
```powershell
$env:PGPASSWORD="你的数据库密码"
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co `
        -U postgres `
        -d postgres `
        --schema-only `
        --no-owner `
        --no-privileges `
        --no-tablespaces `
        -t 'public.*' `
        -f database_export_sql/complete_database_schema.sql
```

**Linux/Mac:**
```bash
export PGPASSWORD="你的数据库密码"
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
        -U postgres \
        -d postgres \
        --schema-only \
        --no-owner \
        --no-privileges \
        --no-tablespaces \
        -t 'public.*' \
        -f database_export_sql/complete_database_schema.sql
```

### 参数说明

- `--schema-only`: 只导出表结构，不导出数据 ✅
- `--no-owner`: 不包含所有者信息（推荐）
- `--no-privileges`: 不包含权限信息（推荐）
- `--no-tablespaces`: 不包含表空间信息（推荐）
- `-t 'public.*'`: 只导出 public schema 下的所有表

## 🔧 方法 2: 使用 Supabase CLI

### 步骤 1: 安装 Supabase CLI

```bash
npm install -g supabase
```

### 步骤 2: 登录并链接项目

```bash
supabase login
supabase link --project-ref bfcpimnfgidhgigtgehs
```

### 步骤 3: 导出数据库结构

```bash
supabase db dump --schema-only > database_export_sql/complete_database_schema.sql
```

## 🛠️ 方法 3: 使用 MCP 工具（程序化方式）

### 步骤 1: 使用 MCP 工具获取所有表信息

MCP Supabase 工具已经获取了以下信息：
- ✅ 所有表的列表和结构
- ✅ 所有字段及其属性
- ✅ 所有外键关系
- ✅ 所有序列
- ✅ 所有索引

### 步骤 2: 生成 SQL 文件

由于表数量较多（100+），建议使用以下 Python 脚本处理 MCP 数据：

```python
# 使用 database_export_sql/generate_complete_schema_mcp.py
python database_export_sql/generate_complete_schema_mcp.py
```

### 步骤 3: 手动处理（如果脚本不可用）

如果 Python 脚本无法运行，可以：

1. **使用 Supabase Dashboard SQL Editor**:
   - 登录 Supabase Dashboard
   - 进入 SQL Editor
   - 执行以下查询获取表结构：

```sql
-- 获取所有表的 CREATE TABLE 语句
SELECT 
    'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' || 
    string_agg(
        column_name || ' ' || 
        data_type || 
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        ', '
    ) || 
    ');' as create_statement
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name;
```

2. **使用 Supabase Dashboard 的 Table Editor**:
   - 进入每个表
   - 查看表结构
   - 手动创建 CREATE TABLE 语句

## 📝 生成的 SQL 文件结构

生成的 SQL 文件应包含以下部分：

```sql
-- 1. 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 所有表的 CREATE TABLE 语句
CREATE TABLE IF NOT EXISTS table1 (...);
CREATE TABLE IF NOT EXISTS table2 (...);
-- ... 更多表

-- 3. 外键约束
ALTER TABLE table1 ADD CONSTRAINT fk_name FOREIGN KEY (col) REFERENCES table2(id);
-- ... 更多外键

-- 4. 索引（如果需要）
CREATE INDEX IF NOT EXISTS idx_name ON table1(column1);
-- ... 更多索引
```

## ✅ 验证导出

导出后验证文件：

```bash
# 检查文件大小
ls -lh database_export_sql/complete_database_schema.sql

# 查看文件前几行
head -n 50 database_export_sql/complete_database_schema.sql

# 检查是否包含 CREATE TABLE
grep -i "CREATE TABLE" database_export_sql/complete_database_schema.sql | wc -l

# 检查是否包含外键
grep -i "FOREIGN KEY" database_export_sql/complete_database_schema.sql | wc -l
```

## 📤 导入到目标数据库

### 方法 1: 使用 Supabase Dashboard

1. 登录目标 Supabase 项目
2. 进入 SQL Editor
3. 复制 SQL 文件内容
4. 粘贴并执行

### 方法 2: 使用 psql

```bash
psql -h db.target-project.supabase.co \
     -U postgres \
     -d postgres \
     -f database_export_sql/complete_database_schema.sql
```

### 方法 3: 使用 Supabase CLI

```bash
supabase db reset  # 重置数据库（可选）
supabase db push  # 推送迁移（如果使用迁移文件）
```

## ⚠️ 注意事项

1. **表顺序**: 确保先创建被引用的表，再创建引用表（外键依赖）
2. **扩展**: 确保目标数据库已启用必要的扩展（uuid-ossp, pgcrypto）
3. **RLS 策略**: 此文件不包含 Row Level Security (RLS) 策略，需要单独导出
4. **函数和触发器**: 此文件不包含数据库函数和触发器，需要单独导出
5. **视图**: 此文件不包含视图定义，需要单独导出

## 🔍 导出其他对象

如果需要导出其他数据库对象：

```bash
# 导出函数
pg_dump -h db.xxx.supabase.co -U postgres -d postgres \
        --schema-only --no-owner -t 'public.*' \
        --section=functions > functions.sql

# 导出触发器
pg_dump -h db.xxx.supabase.co -U postgres -d postgres \
        --schema-only --no-owner -t 'public.*' \
        --section=triggers > triggers.sql

# 导出视图
pg_dump -h db.xxx.supabase.co -U postgres -d postgres \
        --schema-only --no-owner -t 'public.*' \
        --section=views > views.sql

# 导出 RLS 策略
pg_dump -h db.xxx.supabase.co -U postgres -d postgres \
        --schema-only --no-owner -t 'public.*' \
        --section=policies > policies.sql
```

## 📚 相关文件

- `export_database.ps1` - Windows PowerShell 导出脚本
- `export_database.sh` - Linux/Mac Bash 导出脚本
- `generate_complete_schema_mcp.py` - MCP 数据生成脚本
- `SUPABASE命令行导出指南.md` - 详细导出指南

## 🎉 完成

导出完成后，你将得到一个可以直接导入到其他 Supabase 数据库的完整 SQL 文件！





