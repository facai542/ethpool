# Bot Token 配置说明

## Bot Token: `8352601865:AAE7XtV7gsbAV9raAx7E2b7El32hQCwWV7U`

## 配置方式

### 方式 1: 存储在 Supabase 数据库（推荐）⭐

Bot Token 会优先从 Supabase 的 `options` 表中读取 `bot_key` 字段。

**在 Supabase 中设置：**

1. 访问 Supabase Dashboard: https://supabase.com/dashboard
2. 选择项目 `bfcpimnfgidhgigtgehs`
3. 进入 **Table Editor** → `options` 表
4. 查找或创建 `name = 'bot_key'` 的记录
5. 设置 `value = 8352601865:AAE7XtV7gsbAV9raAx7E2b7El32hQCwWV7U`

**SQL 方式：**
```sql
-- 如果记录不存在，插入
INSERT INTO options (name, value) 
VALUES ('bot_key', '8352601865:AAE7XtV7gsbAV9raAx7E2b7El32hQCwWV7U')
ON CONFLICT (name) 
DO UPDATE SET value = '8352601865:AAE7XtV7gsbAV9raAx7E2b7El32hQCwWV7U';

-- 或更新现有记录
UPDATE options 
SET value = '8352601865:AAE7XtV7gsbAV9raAx7E2b7El32hQCwWV7U' 
WHERE name = 'bot_key';
```

### 方式 2: Railway 环境变量（备用）

如果 Supabase 数据库中没有配置，可以设置环境变量作为备用：

在 Railway Dashboard → Variables 中添加：
```
TELEGRAM_BOT_TOKEN=8352601865:AAE7XtV7gsbAV9raAx7E2b7El32hQCwWV7U
```

## 优先级

1. **Supabase `options` 表的 `bot_key`**（优先）
2. **环境变量 `TELEGRAM_BOT_TOKEN`**（备用）

## 安全提示

⚠️ **重要：**
- Bot Token 是敏感信息，不要提交到公开仓库
- 已添加到 `.gitignore`
- 使用环境变量或数据库存储，不要硬编码在代码中

## 验证配置

部署后，查看日志应该看到：
```
✓ Bot Token 已加载
✓ Bot 初始化成功
```

如果看到错误：
```
❌ Bot Token 未找到
```
请检查 Supabase `options` 表或环境变量配置。



