# 快速开始指南

## Railway 部署（使用 Supabase）

### 步骤 1: 设置环境变量

#### 方法 1: 通过 Railway Dashboard（推荐）⭐

1. 访问 https://railway.com/dashboard
2. 选择你的项目（或创建新项目）
3. 点击 **Variables** 标签
4. 点击 **+ New Variable** 添加以下变量：

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://bfcpimnfgidhgigtgehs.supabase.co
   ```

   ```
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM
   ```

#### 方法 2: 使用 Railway CLI

```powershell
cd E:\eth-new\telegram-bot

# 方式 A: 直接设置（如果 CLI 支持）
railway variables NEXT_PUBLIC_SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
railway variables SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM

# 方式 B: 交互式设置
railway variables

# 方式 C: 使用 .env 文件
# 1. 创建 .env 文件（从 .env.example 复制）
# 2. 填写 Supabase 配置
# 3. railway variables --file .env
```

### 步骤 2: 部署

```powershell
railway up
```

### 步骤 3: 查看日志

```powershell
railway logs
```

## 环境变量说明

机器人使用 **Supabase 数据库**（与网站相同），只需要两个环境变量：

1. **NEXT_PUBLIC_SUPABASE_URL** - Supabase 项目 URL
2. **SUPABASE_SERVICE_ROLE_KEY** - Supabase Service Role Key

**不需要设置：**
- ❌ DB_HOST
- ❌ DB_PORT  
- ❌ DB_USERNAME
- ❌ DB_PASSWORD
- ❌ DB_DATABASE

**Bot Token:**
- 会从 Supabase 的 `options` 表中读取 `bot_key` 字段（推荐）
- 如果数据库中没有，可以设置 `TELEGRAM_BOT_TOKEN` 环境变量作为备用
- 当前 Bot Token: `8352601865:AAE7XtV7gsbAV9raAx7E2b7El32hQCwWV7U`
- 详细配置见 `setup_bot_token.md`

## 验证部署

部署成功后，查看日志应该看到：
```
✓ Supabase 连接成功
✓ Bot 初始化成功
✓ 开始监听消息
```

## 需要帮助？

详细说明请查看：
- `railway_deploy_supabase.md` - 完整部署指南
- `railway_deploy.md` - 通用部署指南

