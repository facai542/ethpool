# 安装 PostgreSQL 客户端工具

## Windows 安装方法

### 方法 1: 使用 Chocolatey（推荐）

```powershell
# 以管理员身份运行 PowerShell
choco install postgresql
```

### 方法 2: 使用安装包

1. 访问 PostgreSQL 官网：https://www.postgresql.org/download/windows/
2. 下载 PostgreSQL 安装程序
3. 安装时**务必选择包含 "Command Line Tools"**
4. 安装完成后，将 PostgreSQL bin 目录添加到 PATH：
   - 默认路径：`C:\Program Files\PostgreSQL\15\bin`
   - 添加到系统环境变量 PATH 中

### 方法 3: 使用 Scoop

```powershell
scoop install postgresql
```

## 验证安装

安装完成后，在 PowerShell 中运行：

```powershell
pg_dump --version
```

如果显示版本号，说明安装成功。

## 安装后运行导出

```powershell
cd database_export_sql
.\export_complete_schema.ps1
```

## 如果无法安装 PostgreSQL 客户端

如果无法安装 PostgreSQL 客户端，可以使用以下替代方案：

1. **使用 Supabase Dashboard**:
   - 登录 Supabase Dashboard
   - 进入 SQL Editor
   - 使用 SQL 查询导出表结构

2. **使用在线工具**:
   - 使用 Supabase CLI（需要 Node.js）
   - 使用 Docker 运行 PostgreSQL 客户端

3. **手动导出**:
   - 在 Supabase Dashboard 中逐个查看表结构
   - 手动创建 CREATE TABLE 语句





