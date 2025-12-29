# 创建所有表的数据库文件

## 📋 方法说明

由于无法直接访问源数据库获取表结构，这里提供了几种方法来生成 CREATE TABLE 语句：

## 🚀 方法 1: 使用 pg_dump（最推荐，最准确）

### 步骤

1. **安装 PostgreSQL 客户端工具**（如果还没有）
   - Windows: 下载并安装 PostgreSQL，或使用 Chocolatey: `choco install postgresql`
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql-client`

2. **获取数据库连接信息**
   - 登录源数据库 Supabase Dashboard: https://bfcpimnfgidhgigtgehs.supabase.co
   - 进入 Settings → Database
   - 复制 Connection string（使用 Session mode）

3. **导出表结构**

```bash
# Windows PowerShell
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co `
        -U postgres `
        -d postgres `
        --schema-only `
        --no-owner `
        --no-privileges `
        -t 'public.*' `
        > database_export_sql/create_all_tables.sql

# Linux/Mac
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
        -U postgres \
        -d postgres \
        --schema-only \
        --no-owner \
        --no-privileges \
        -t 'public.*' \
        > database_export_sql/create_all_tables.sql
```

4. **输入数据库密码**（在 Supabase Dashboard → Settings → Database 中获取）

### 优点
- ✅ 最准确，包含所有约束、索引、外键
- ✅ 自动处理数据类型
- ✅ 包含表注释和列注释

## 🔧 方法 2: 使用 Supabase SQL Editor 查询

1. **登录源数据库 Supabase Dashboard**
2. **打开 SQL Editor**
3. **执行查询**（见 `get_table_schema.sql` 文件）
4. **手动生成 CREATE TABLE 语句**

## 🤖 方法 3: 使用 Python 脚本自动生成（从数据推断）

运行脚本从数据文件推断表结构：

```bash
python database_export_sql/generate_create_tables_from_data.py
```

### 注意
- ⚠️ 数据类型是推断的，可能不准确
- ⚠️ 不包含外键、索引等约束
- ⚠️ 需要手动检查和调整

## 📝 方法 4: 使用 Supabase CLI

```bash
# 安装
npm install -g supabase

# 登录
supabase login

# 链接源项目
supabase link --project-ref bfcpimnfgidhgigtgehs

# 导出表结构
supabase db dump --schema-only > database_export_sql/create_all_tables.sql
```

## 📂 生成的文件

执行后会生成 `database_export_sql/create_all_tables.sql` 文件，包含所有表的 CREATE TABLE 语句。

## ✅ 使用生成的文件

1. **在目标 Supabase 项目中打开 SQL Editor**
2. **复制 `create_all_tables.sql` 的内容**
3. **粘贴并执行**

## ⚠️ 重要提示

1. **表结构顺序**: 如果有外键依赖，可能需要调整表的创建顺序
2. **扩展**: 如果使用了 Postgres 扩展（如 uuid-ossp），需要先启用：
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
3. **RLS 策略**: 表结构导出不包含 RLS 策略，需要单独配置
4. **索引**: pg_dump 会自动包含索引定义

## 🔍 验证

创建表后，执行以下查询验证：

```sql
-- 检查表数量（应该是 107）
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- 列出所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```



