# 使用 Supabase CLI 导出数据库结构

## 前提条件

- 已安装 Node.js (https://nodejs.org/)
- 已安装 npm

## 安装 Supabase CLI

```bash
npm install -g supabase
```

## 登录 Supabase

```bash
supabase login
```

这会打开浏览器让你登录 Supabase 账户。

## 链接到项目

```bash
supabase link --project-ref bfcpimnfgidhgigtgehs
```

## 导出数据库结构

```bash
# 导出表结构（不含数据）
supabase db dump --schema-only > database_export_sql/complete_database_schema.sql

# 或者导出完整数据库（包含数据）
supabase db dump > database_export_sql/full_database.sql
```

## 验证导出

```bash
# 查看文件大小
ls -lh database_export_sql/complete_database_schema.sql

# 查看前几行
head -n 50 database_export_sql/complete_database_schema.sql
```

## 导入到目标数据库

```bash
# 链接到目标项目
supabase link --project-ref target-project-ref

# 导入结构
supabase db reset  # 重置数据库（可选）
# 然后手动执行 SQL 文件
```

## 其他有用的命令

```bash
# 查看项目信息
supabase projects list

# 查看数据库迁移
supabase migration list

# 创建新的迁移
supabase migration new create_tables
```



