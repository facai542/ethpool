# 数据库结构同步指南

## 概述

本指南说明如何将数据库1（源数据库）的完整结构同步到数据库2（目标数据库）。

## 当前状态

- **数据库1项目ID**: `bfcpimnfgidhgigtgehs` (dapp项目)
- **数据库2项目ID**: 需要确认（可能是同一个项目或不同项目）
- **表数量**: 100+ 个表
- **函数数量**: 80+ 个函数
- **外键约束**: 17个
- **唯一约束**: 40+ 个
- **检查约束**: 200+ 个

## 重要发现

通过MCP查询发现，两个Supabase MCP服务器（supabase和supabase2）返回了相同的项目列表和表列表。这可能意味着：

1. **情况A**: 两个MCP服务器连接到同一个Supabase账户，但可能是不同的项目
2. **情况B**: 需要确认数据库2的具体项目ID

## 同步步骤

### 方法1：使用Supabase CLI（推荐）

```bash
# 1. 导出数据库1的完整结构
supabase db dump -f database1_schema.sql --schema-only

# 2. 在数据库2中应用
supabase db push --db-url <database2_connection_string> < database1_schema.sql
```

### 方法2：使用pg_dump（如果有直接数据库访问）

```bash
# 导出数据库1的结构
pg_dump -h <db1_host> -U <user> -d <db1_name> \
  --schema-only \
  --no-owner \
  --no-privileges \
  > database1_schema.sql

# 在数据库2中应用
psql -h <db2_host> -U <user> -d <db2_name> < database1_schema.sql
```

### 方法3：使用Supabase MCP迁移功能

使用 `apply_migration` 功能逐步应用迁移。

## 需要同步的内容

### 1. 表结构（100+ 表）
- 所有表的CREATE TABLE语句
- 字段定义、数据类型、默认值
- NOT NULL约束

### 2. 约束
- 主键约束（100+ 个）
- 外键约束（17个）
- 唯一约束（40+ 个）
- 检查约束（200+ 个）

### 3. 索引
- 主键索引（自动创建）
- 唯一索引（自动创建）
- 其他性能索引

### 4. 函数（80+ 个）
- 所有自定义函数
- 触发器函数

### 5. 触发器
- 自动更新时间戳的触发器
- 业务逻辑触发器

### 6. RLS策略
- Row Level Security策略
- 策略权限设置

### 7. 序列（Sequences）
- 自增ID序列
- 自定义序列

## 关键表列表

主要业务表：
- `nh_member_new` - 用户主表（UUID主键）
- `approval_history` - 授权历史
- `earning_history` - 收益历史
- `exchange_history` - 兑换历史
- `withdrawal_history` - 提现历史
- `deposit_history` - 充值历史
- `wallet_monitor` - 钱包监听
- `reward_schedule` - 奖励计划
- `scheduled_rewards_new` - 计划奖励
- `telegram_connected_users` - Telegram用户
- `telegram_notification_queue` - 通知队列

## 注意事项

1. **数据迁移**: 本指南只涉及结构同步，不涉及数据迁移
2. **备份**: 在应用迁移前，务必备份数据库2
3. **测试**: 建议先在测试环境验证迁移脚本
4. **依赖顺序**: 创建表时需要按照外键依赖顺序
5. **函数依赖**: 某些函数可能依赖扩展（如uuid-ossp, http等）

## 下一步

1. 确认数据库2的项目ID
2. 生成完整的迁移SQL脚本
3. 在数据库2中应用迁移
4. 验证同步结果

