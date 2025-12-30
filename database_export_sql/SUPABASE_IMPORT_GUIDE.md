# Supabase 数据库导入指南

## 文件说明

本目录包含可以直接导入 Supabase 的数据库文件。

### 主要文件

- **`20251220_021043/all_tables_data.sql`** - 包含所有表数据的合并 SQL 文件（推荐使用）
- **单独表文件** - 每个表都有独立的 SQL 文件，可以单独导入

## 导入方法

### 方法 1: 使用 Supabase SQL Editor（推荐）

这是最简单的方法，适合中小型数据库：

1. **登录 Supabase Dashboard**
   - 访问你的 Supabase 项目：https://app.supabase.com
   - 选择目标项目

2. **打开 SQL Editor**
   - 在左侧菜单中点击 "SQL Editor"
   - 点击 "New query"

3. **导入 SQL 文件**
   - 打开 `20251220_021043/all_tables_data.sql` 文件
   - 复制全部内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 或按 `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **等待执行完成**
   - 执行时间取决于数据量大小
   - 查看底部的结果面板确认是否成功

### 方法 2: 使用 Supabase CLI

适合需要自动化或大型数据库的场景：

```bash
# 1. 安装 Supabase CLI
npm install -g supabase

# 2. 登录 Supabase
supabase login

# 3. 链接到你的项目
supabase link --project-ref your-project-ref

# 4. 导入 SQL 文件
supabase db reset  # 可选：重置数据库（会删除所有数据）
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f 20251220_021043/all_tables_data.sql
```

### 方法 3: 使用 psql 命令行工具

如果你有数据库连接信息：

```bash
# 获取连接信息
# 在 Supabase Dashboard > Settings > Database > Connection string

# 导入 SQL 文件
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f 20251220_021043/all_tables_data.sql
```

### 方法 4: 使用 Python 脚本（自动化导入）

如果你有 Service Role Key，可以使用 Python 脚本：

```python
import os
from supabase import create_client, Client

# 配置
SUPABASE_URL = "https://your-project-ref.supabase.co"
SUPABASE_KEY = "your-service-role-key"  # 使用 service_role key，不是 anon key

# 创建客户端
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 读取 SQL 文件
with open('20251220_021043/all_tables_data.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

# 执行 SQL（注意：Supabase Python 客户端不直接支持执行 SQL）
# 你需要使用 REST API 或 psql
```

## 注意事项

### 1. 权限要求

- **SQL Editor**: 需要项目所有者或协作者权限
- **CLI/psql**: 需要数据库密码（在 Supabase Dashboard > Settings > Database 中获取）
- **Service Role Key**: 拥有完全权限，可以绕过 RLS（Row Level Security）

### 2. 数据冲突处理

SQL 文件使用了 `ON CONFLICT DO NOTHING`，这意味着：
- 如果记录已存在（基于主键），不会覆盖
- 不会报错，会静默跳过
- 如果需要更新现有数据，需要修改 SQL 语句

### 3. 外键约束

如果表之间有外键关系：
- 确保按依赖顺序导入
- 或者暂时禁用外键检查（不推荐）

### 4. 事务处理

SQL 文件使用 `BEGIN` 和 `COMMIT` 包裹：
- 如果中途出错，所有更改会回滚
- 确保数据一致性

### 5. 文件大小限制

- **SQL Editor**: 建议文件大小 < 10MB
- **CLI/psql**: 可以处理更大的文件

如果文件太大，可以：
- 分批导入（使用单独的表文件）
- 使用 CLI 或 psql 工具

## 验证导入

导入完成后，执行以下 SQL 验证：

```sql
-- 检查表数量
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- 检查主要表的记录数
SELECT 
  'nh_member_new' as table_name, 
  COUNT(*) as record_count 
FROM nh_member_new
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'reward_tiers', COUNT(*) FROM reward_tiers
UNION ALL
SELECT 'wallet_balances', COUNT(*) FROM wallet_balances;

-- 检查特定表的示例数据
SELECT * FROM nh_member_new LIMIT 5;
```

## 故障排除

### 问题 1: 导入失败，提示权限不足

**解决方案**:
- 确保使用 Service Role Key 或数据库密码
- 检查 RLS 策略是否阻止插入

### 问题 2: 外键约束错误

**解决方案**:
- 检查表之间的依赖关系
- 按正确顺序导入表
- 或暂时禁用外键检查（不推荐生产环境）

### 问题 3: 文件太大无法导入

**解决方案**:
- 使用 CLI 或 psql 工具
- 分批导入单独的表文件
- 压缩 SQL 文件（但需要先解压）

### 问题 4: 字符编码问题

**解决方案**:
- 确保 SQL 文件使用 UTF-8 编码
- 检查数据库字符集设置

## 导出信息

- **源数据库**: https://bfcpimnfgidhgigtgehs.supabase.co
- **导出时间**: 2025-12-20 02:10:43
- **总表数**: 107
- **总记录数**: 33,632
- **文件大小**: 约 6.5 MB

## 需要帮助？

如果遇到问题：
1. 查看 Supabase 文档: https://supabase.com/docs
2. 检查 Supabase 社区: https://github.com/supabase/supabase/discussions
3. 查看项目日志: Supabase Dashboard > Logs




