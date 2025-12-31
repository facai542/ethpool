# 数据库迁移说明

## 快速开始

由于 MCP 服务没有权限直接访问源数据库，请使用以下方法之一进行迁移：

## 方法 1: 使用 Python 脚本（推荐）

### 步骤 1: 安装依赖

```bash
pip install supabase
```

### 步骤 2: 获取目标数据库的 Service Role Key

1. 登录目标数据库的 Supabase Dashboard: https://xybhjgbgusdyokrrfqst.supabase.co
2. 进入 Settings > API
3. 复制 `service_role` key（不是 anon key）

### 步骤 3: 运行迁移脚本

**Windows PowerShell:**
```powershell
$env:TARGET_SERVICE_ROLE_KEY="your_service_role_key_here"
python migrate_data_direct.py
```

**Linux/Mac:**
```bash
export TARGET_SERVICE_ROLE_KEY="your_service_role_key_here"
python migrate_data_direct.py
```

脚本会自动：
- 从源数据库导出所有表的数据
- 导入到目标数据库
- 显示进度和统计信息

## 方法 2: 使用 Supabase Dashboard（手动）

### 步骤 1: 在源数据库中导出数据

1. 登录源数据库: https://bfcpimnfgidhgigtgehs.supabase.co
2. 打开 SQL Editor
3. 对每个表执行查询并导出为 CSV：

```sql
-- 示例：导出 nh_member_new 表
SELECT * FROM nh_member_new;
```

4. 点击 "Download CSV" 或复制数据

### 步骤 2: 在目标数据库中导入数据

1. 登录目标数据库: https://xybhjgbgusdyokrrfqst.supabase.co
2. 打开 SQL Editor
3. 使用以下方式导入：

**小数据量（< 1000 行）:**
```sql
INSERT INTO table_name (col1, col2, ...) VALUES
  (val1, val2, ...),
  (val1, val2, ...)
ON CONFLICT DO NOTHING;
```

**大数据量:**
使用 Table Editor 的 Import 功能，或使用 COPY 命令。

## 方法 3: 使用 Supabase CLI

```bash
# 安装
npm install -g supabase

# 登录
supabase login

# 导出源数据库
supabase link --project-ref bfcpimnfgidhgigtgehs
supabase db dump --data-only -f source_data.sql

# 导入到目标数据库
supabase link --project-ref xybhjgbgusdyokrrfqst
# 注意：需要数据库连接信息
psql -h db.xybhjgbgusdyokrrfqst.supabase.co -U postgres -d postgres -f source_data.sql
```

## 注意事项

1. **权限**: 目标数据库需要使用 `service_role_key` 才能插入数据
2. **外键**: 如果表有外键约束，需要按依赖顺序导入
3. **UUID**: UUID 字段会保留原始值或使用 `gen_random_uuid()`
4. **时间戳**: 时间戳字段会保留原始值

## 验证迁移

迁移完成后，在目标数据库执行：

```sql
-- 检查表数量
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 检查主要表的记录数
SELECT 'nh_member_new' as table_name, COUNT(*) as count FROM nh_member_new
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'reward_tiers', COUNT(*) FROM reward_tiers;
```

## 文件说明

- `migrate_data_direct.py` - 自动化迁移脚本（推荐）
- `migrate_database.py` - 另一个迁移脚本
- `MIGRATION_GUIDE.md` - 详细迁移指南
- `export_data.sql` - SQL 导出脚本模板
- `import_data.sql` - SQL 导入脚本模板

## 需要帮助？

如果遇到问题：
1. 检查网络连接
2. 确认 API keys 正确
3. 查看错误日志
4. 参考 Supabase 文档: https://supabase.com/docs










