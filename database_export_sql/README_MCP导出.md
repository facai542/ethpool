# MCP 工具导出数据库结构说明

## 📋 当前状态

已通过 MCP Supabase 工具成功获取了以下信息：

- ✅ **所有表的列表和结构**（100+ 表）
- ✅ **所有字段及其属性**（数据类型、约束、默认值、注释）
- ✅ **所有外键关系**（17 个外键）
- ✅ **所有序列**（90+ 个序列）
- ✅ **所有索引**（500+ 个索引）

## 🎯 导出方法

由于系统未安装 PostgreSQL 客户端工具（pg_dump），有以下几种导出方法：

### 方法 1: 安装 PostgreSQL 客户端（推荐）

**Windows:**
```powershell
# 使用 Chocolatey
choco install postgresql

# 或下载安装包
# https://www.postgresql.org/download/windows/
```

安装后运行：
```powershell
cd database_export_sql
.\export_complete_schema.ps1
```

### 方法 2: 使用 Supabase CLI

**前提：** 需要安装 Node.js

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref bfcpimnfgidhgigtgehs

# 导出结构
supabase db dump --schema-only > complete_database_schema.sql
```

### 方法 3: 使用 Supabase Dashboard

1. 登录 Supabase Dashboard
2. 进入 **SQL Editor**
3. 执行以下 SQL 查询获取表结构：

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

### 方法 4: 使用 Docker（如果已安装 Docker）

```bash
docker run --rm -e PGPASSWORD=your_password \
  postgres:15 \
  pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
          -U postgres \
          -d postgres \
          --schema-only \
          --no-owner \
          --no-privileges \
          -t 'public.*' > complete_database_schema.sql
```

## 📊 已获取的数据统计

- **表数量**: 100+ 表
- **外键关系**: 17 个
- **序列**: 90+ 个
- **索引**: 500+ 个

## 📝 生成的 SQL 文件应包含

1. **扩展启用**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

2. **所有表的 CREATE TABLE 语句**
   - 包含所有字段定义
   - 包含数据类型、约束、默认值
   - 包含主键定义
   - 包含表注释

3. **所有外键约束**
   ```sql
   ALTER TABLE table_name 
   ADD CONSTRAINT fk_name 
   FOREIGN KEY (column) 
   REFERENCES other_table(id);
   ```

4. **所有索引**（可选，主键和唯一约束已自动创建索引）

## ✅ 验证导出

导出后检查：

```bash
# 检查文件大小
ls -lh complete_database_schema.sql

# 检查表数量
grep -i "CREATE TABLE" complete_database_schema.sql | wc -l

# 检查外键数量
grep -i "FOREIGN KEY" complete_database_schema.sql | wc -l
```

## 🚀 推荐方案

**最简单的方法：** 安装 PostgreSQL 客户端工具，然后运行 `export_complete_schema.ps1` 脚本。

**最快的方法：** 如果已安装 Node.js，使用 Supabase CLI。

**无需安装的方法：** 使用 Supabase Dashboard 的 SQL Editor。

## 📚 相关文件

- `export_complete_schema.ps1` - PowerShell 导出脚本
- `安装PostgreSQL客户端.md` - 安装指南
- `使用SupabaseCLI导出.md` - Supabase CLI 使用指南
- `MCP导出完整数据库结构指南.md` - 详细导出指南





