# Supabase 命令行导出指南

## 📋 方法概览

在 Supabase 中使用命令行导出数据库有两种主要方法：
1. **pg_dump**（推荐）- PostgreSQL 官方工具
2. **Supabase CLI** - Supabase 官方 CLI 工具

---

## 🚀 方法 1: 使用 pg_dump（推荐）

### 步骤 1: 安装 PostgreSQL 客户端

**Windows:**
```powershell
# 方法 1: 使用 Chocolatey
choco install postgresql

# 方法 2: 下载安装包
# https://www.postgresql.org/download/windows/
# 安装时选择包含 "Command Line Tools"
```

**Mac:**
```bash
brew install postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

**验证安装:**
```bash
pg_dump --version
```

### 步骤 2: 获取数据库连接信息

1. 登录 Supabase Dashboard: https://app.supabase.com
2. 选择你的项目
3. 进入 **Settings** → **Database**
4. 找到 **Connection string** 部分
5. 选择 **Session mode** 或 **Transaction mode**
6. 复制连接字符串，格式如下：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

   或者记录以下信息：
   - **Host**: `db.[PROJECT-REF].supabase.co`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: （在 Dashboard 中查看）
   - **Port**: `5432`

### 步骤 3: 导出表结构（不含数据）

**Windows PowerShell:**
```powershell
# 方法 1: 使用连接字符串
$env:PGPASSWORD="your_password_here"
pg_dump "postgresql://postgres@db.bfcpimnfgidhgigtgehs.supabase.co:5432/postgres" `
        --schema-only `
        --no-owner `
        --no-privileges `
        -t 'public.*' `
        -f database_export_sql/create_all_tables.sql

# 方法 2: 使用参数
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co `
        -U postgres `
        -d postgres `
        --schema-only `
        --no-owner `
        --no-privileges `
        -t 'public.*' `
        -f database_export_sql/create_all_tables.sql
```

**Linux/Mac:**
```bash
# 方法 1: 使用连接字符串
export PGPASSWORD="your_password_here"
pg_dump "postgresql://postgres@db.bfcpimnfgidhgigtgehs.supabase.co:5432/postgres" \
        --schema-only \
        --no-owner \
        --no-privileges \
        -t 'public.*' \
        -f database_export_sql/create_all_tables.sql

# 方法 2: 使用参数
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
        -U postgres \
        -d postgres \
        --schema-only \
        --no-owner \
        --no-privileges \
        -t 'public.*' \
        -f database_export_sql/create_all_tables.sql
```

### 步骤 4: 导出数据（不含表结构）

```bash
# 导出所有表的数据
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
        -U postgres \
        -d postgres \
        --data-only \
        --no-owner \
        --no-privileges \
        -t 'public.*' \
        -f database_export_sql/all_tables_data.sql
```

### 步骤 5: 导出完整数据库（表结构 + 数据）

```bash
# 导出完整的数据库
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
        -U postgres \
        -d postgres \
        --no-owner \
        --no-privileges \
        -t 'public.*' \
        -f database_export_sql/full_database.sql
```

### pg_dump 常用参数说明

| 参数 | 说明 |
|------|------|
| `--schema-only` | 只导出表结构，不导出数据 ✅ |
| `--data-only` | 只导出数据，不导出表结构 ✅ |
| `--no-owner` | 不包含所有者信息（推荐） |
| `--no-privileges` | 不包含权限信息（推荐） |
| `-t 'public.*'` | 只导出 public schema 下的所有表 |
| `-t 'table_name'` | 只导出指定表 |
| `-f filename.sql` | 输出到文件 |
| `-F c` | 使用自定义格式（压缩） |
| `-F d` | 使用目录格式 |

### 导出特定表

```bash
# 导出单个表
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
        -U postgres \
        -d postgres \
        --schema-only \
        -t 'public.nh_member_new' \
        -f nh_member_new_structure.sql

# 导出多个表
pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
        -U postgres \
        -d postgres \
        --schema-only \
        -t 'public.nh_member_new' \
        -t 'public.wallet_balances' \
        -t 'public.reward_tiers' \
        -f selected_tables.sql
```

---

## 🔧 方法 2: 使用 Supabase CLI

### 步骤 1: 安装 Supabase CLI

```bash
# 使用 npm
npm install -g supabase

# 或使用 Homebrew (Mac)
brew install supabase/tap/supabase

# 验证安装
supabase --version
```

### 步骤 2: 登录 Supabase

```bash
supabase login
```

这会打开浏览器让你登录 Supabase 账户。

### 步骤 3: 链接到项目

```bash
# 链接到源项目
supabase link --project-ref bfcpimnfgidhgigtgehs
```

### 步骤 4: 导出数据库

```bash
# 导出表结构
supabase db dump --schema-only > database_export_sql/create_all_tables.sql

# 导出数据
supabase db dump --data-only > database_export_sql/all_tables_data.sql

# 导出完整数据库
supabase db dump > database_export_sql/full_database.sql
```

### 步骤 5: 导出特定表

```bash
# 导出单个表
supabase db dump --schema-only -t nh_member_new > nh_member_new.sql

# 导出多个表
supabase db dump --schema-only -t nh_member_new -t wallet_balances > selected_tables.sql
```

---

## 📝 完整导出脚本示例

### Windows PowerShell 脚本

创建文件 `export_database.ps1`:

```powershell
# 配置
$PROJECT_REF = "bfcpimnfgidhgigtgehs"
$DB_PASSWORD = "your_password_here"
$OUTPUT_DIR = "database_export_sql"

# 设置密码环境变量
$env:PGPASSWORD = $DB_PASSWORD

# 创建输出目录
New-Item -ItemType Directory -Force -Path $OUTPUT_DIR

# 导出表结构
Write-Host "正在导出表结构..."
pg_dump -h "db.$PROJECT_REF.supabase.co" `
        -U postgres `
        -d postgres `
        --schema-only `
        --no-owner `
        --no-privileges `
        -t 'public.*' `
        -f "$OUTPUT_DIR\create_all_tables.sql"

# 导出数据
Write-Host "正在导出数据..."
pg_dump -h "db.$PROJECT_REF.supabase.co" `
        -U postgres `
        -d postgres `
        --data-only `
        --no-owner `
        --no-privileges `
        -t 'public.*' `
        -f "$OUTPUT_DIR\all_tables_data.sql"

Write-Host "导出完成！"
```

运行：
```powershell
.\export_database.ps1
```

### Linux/Mac Bash 脚本

创建文件 `export_database.sh`:

```bash
#!/bin/bash

# 配置
PROJECT_REF="bfcpimnfgidhgigtgehs"
DB_PASSWORD="your_password_here"
OUTPUT_DIR="database_export_sql"

# 设置密码环境变量
export PGPASSWORD=$DB_PASSWORD

# 创建输出目录
mkdir -p $OUTPUT_DIR

# 导出表结构
echo "正在导出表结构..."
pg_dump -h "db.$PROJECT_REF.supabase.co" \
        -U postgres \
        -d postgres \
        --schema-only \
        --no-owner \
        --no-privileges \
        -t 'public.*' \
        -f "$OUTPUT_DIR/create_all_tables.sql"

# 导出数据
echo "正在导出数据..."
pg_dump -h "db.$PROJECT_REF.supabase.co" \
        -U postgres \
        -d postgres \
        --data-only \
        --no-owner \
        --no-privileges \
        -t 'public.*' \
        -f "$OUTPUT_DIR/all_tables_data.sql"

echo "导出完成！"
```

运行：
```bash
chmod +x export_database.sh
./export_database.sh
```

---

## 🔐 安全提示

### 方法 1: 使用环境变量（推荐）

**Windows PowerShell:**
```powershell
$env:PGPASSWORD="your_password_here"
pg_dump -h db.xxx.supabase.co -U postgres -d postgres ...
```

**Linux/Mac:**
```bash
export PGPASSWORD="your_password_here"
pg_dump -h db.xxx.supabase.co -U postgres -d postgres ...
```

### 方法 2: 使用 .pgpass 文件（更安全）

创建文件 `~/.pgpass` (Linux/Mac) 或 `%APPDATA%\postgresql\pgpass.conf` (Windows):

```
db.xxx.supabase.co:5432:postgres:postgres:your_password_here
```

设置权限（Linux/Mac）:
```bash
chmod 600 ~/.pgpass
```

然后可以直接运行 pg_dump，不需要输入密码。

---

## ✅ 验证导出

导出后验证文件：

```bash
# 检查文件大小
ls -lh database_export_sql/*.sql

# 查看文件前几行
head -n 20 database_export_sql/create_all_tables.sql

# 检查是否包含 CREATE TABLE
grep -i "CREATE TABLE" database_export_sql/create_all_tables.sql | head -5
```

---

## 🐛 常见问题

### 问题 1: 连接被拒绝

**错误**: `could not connect to server: Connection refused`

**解决**:
- 检查防火墙设置
- 确认 Supabase 项目未暂停
- 检查连接字符串是否正确

### 问题 2: 认证失败

**错误**: `password authentication failed`

**解决**:
- 确认密码正确（在 Supabase Dashboard 中重置）
- 检查用户名是否为 `postgres`
- 使用 `.pgpass` 文件避免密码错误

### 问题 3: 找不到 pg_dump 命令

**错误**: `pg_dump: command not found`

**解决**:
- 确认 PostgreSQL 客户端已安装
- 将 PostgreSQL bin 目录添加到 PATH
- Windows: `C:\Program Files\PostgreSQL\15\bin`
- Mac: `/usr/local/bin` 或 `/opt/homebrew/bin`

### 问题 4: 导出文件为空

**解决**:
- 检查是否有数据/表
- 确认表在 `public` schema 下
- 尝试不使用 `-t` 参数导出所有 schema

---

## 📚 更多资源

- PostgreSQL 官方文档: https://www.postgresql.org/docs/
- Supabase CLI 文档: https://supabase.com/docs/reference/cli
- pg_dump 完整参数: `pg_dump --help`




