# Railway 部署指南（使用 Supabase）

## 环境变量配置

由于机器人使用 Supabase 数据库（与网站相同），只需要设置 Supabase 相关环境变量：

### 必需的环境变量

在 Railway Dashboard → Project → Variables 中添加：

```
NEXT_PUBLIC_SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM
```

### 使用 CLI 设置

Railway CLI 的命令可能因版本而异，请尝试以下方式：

**方式 1: 直接设置（如果支持）**
```bash
railway variables NEXT_PUBLIC_SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
railway variables SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM
```

**方式 2: 交互式设置**
```bash
railway variables
# 然后按提示输入变量名和值
```

**方式 3: 通过 Dashboard（推荐）**
- 访问 https://railway.com/dashboard
- 选择项目 → Variables → + New Variable

## 重要说明

1. **Bot Token 配置**
   - Bot Token 会从 Supabase 的 `options` 表中读取 `bot_key` 字段
   - 不需要单独设置环境变量
   - 如果数据库中没有，可以设置 `TELEGRAM_BOT_TOKEN` 环境变量作为备用

2. **数据库连接**
   - 使用 Supabase REST API，不需要配置数据库连接信息
   - 自动通过 HTTPS 连接，无需防火墙配置

3. **Supabase 表结构**
   - 确保 Supabase 中有以下表：
     - `options` - 配置选项表（包含 bot_key 等）
     - `fish` - 鱼苗表
     - `fish_browse` - 鱼苗浏览记录表
     - `daili` - 代理表
     - `daili_group` - 代理群组表
     - `contract_permissions` - 合约权限表
     - `admin_users` - 管理员表

## 部署步骤

### 1. 通过 GitHub 部署

1. 访问 https://railway.com/dashboard
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择仓库 `cursor2b-collab/telegrambott`
5. 在 Variables 中添加上述两个环境变量
6. 等待部署完成

### 2. 使用 CLI 部署

```bash
cd E:\eth-new\telegram-bot

# 登录（如果还没登录）
railway login

# 初始化项目
railway init

# 设置环境变量
railway variables set NEXT_PUBLIC_SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM

# 部署
railway up
```

## 验证部署

部署成功后，查看日志：

```bash
railway logs
```

应该看到：
- ✓ Supabase 连接成功
- ✓ Bot 初始化成功
- ✓ 开始监听消息

## 注意事项

⚠️ **重要安全提示：**
- `SUPABASE_SERVICE_ROLE_KEY` 具有完整数据库权限
- 不要在代码中硬编码
- 不要在公开仓库中提交
- 使用 Railway 的环境变量功能安全存储

## 故障排查

如果遇到问题：

1. **Supabase 连接失败**
   - 检查 `NEXT_PUBLIC_SUPABASE_URL` 是否正确
   - 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确（应该是 JWT 格式）
   - 查看 Railway 日志中的错误信息

2. **Bot Token 未找到**
   - 检查 Supabase `options` 表中是否有 `bot_key` 字段
   - 或设置 `TELEGRAM_BOT_TOKEN` 环境变量

3. **表不存在错误**
   - 确保 Supabase 中有所有必需的表
   - 检查表名是否正确（区分大小写）

