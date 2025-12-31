# 部署到 Cloudflare Workers

## 重要说明

⚠️ **Cloudflare Workers 的限制：**
1. 不支持长时间运行的进程（每次请求最多10秒，付费版30秒）
2. 不支持 WebSocket 连接
3. 不支持轮询模式（Polling）
4. 需要使用 Webhook 模式

⚠️ **推荐的替代方案：**
由于这个机器人需要：
- 持续监控区块链（区块扫描）
- 定期更新余额
- 长时间运行的监控服务

**建议部署到：**
- Railway（推荐）
- Render
- Heroku
- VPS 服务器

## 如果需要使用 Cloudflare Workers

需要使用 **Webhook 模式** + **外部 Cron 服务**：

### 架构设计

```
Telegram Webhook → Cloudflare Workers (处理消息)
                                    ↓
                             数据库查询
                                    ↓
                            发送响应

外部 Cron 服务 → 区块扫描 → 触发 Webhook → Cloudflare Workers
```

### 部署步骤

#### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare

```bash
wrangler login
```

#### 3. 创建 KV 命名空间（可选，用于存储状态）

```bash
wrangler kv:namespace create "BOT_STATE"
```

#### 4. 设置环境变量

在 Cloudflare Dashboard 中设置，或使用 CLI：

```bash
# 设置 Bot Token
wrangler secret put BOT_TOKEN
# 输入你的 Telegram Bot Token

# 设置 Webhook Secret
wrangler secret put WEBHOOK_SECRET
# 输入一个随机字符串作为 Webhook 密钥

# 设置数据库连接信息（使用外部 API）
wrangler secret put DB_API_URL
# 输入你的数据库 API 地址

# 设置主域名
wrangler secret put MAIN_DOMAIN
# 输入你的主域名
```

#### 5. 配置 Webhook URL

```bash
# 先部署 Worker 获取 URL
wrangler deploy

# 然后设置 Telegram Webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-worker.your-subdomain.workers.dev/webhook",
    "secret_token": "your-webhook-secret"
  }'
```

#### 6. 部署

```bash
cd cloudflare
wrangler deploy
```

### 外部 Cron 服务配置

由于 Cloudflare Workers 的 Cron 触发器有限（免费版只有每天一次），需要外部服务处理：

#### 使用 GitHub Actions（免费）

创建 `.github/workflows/cron.yml`:

```yaml
name: Blockchain Monitor

on:
  schedule:
    - cron: '*/30 * * * * *'  # 每30秒
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Scan Blocks
        run: |
          curl -X POST "https://your-worker.workers.dev/cron/scan-blocks" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
      
      - name: Update Balances
        run: |
          curl -X POST "https://your-worker.workers.dev/cron/update-balances" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### 使用外部 Cron 服务

- [cron-job.org](https://cron-job.org/) - 免费，最多每分钟执行
- [EasyCron](https://www.easycron.com/) - 免费，最多每分钟执行
- [Uptime Robot](https://uptimerobot.com/) - 免费，最多每5分钟

### 数据库连接

由于 Cloudflare Workers 无法直接连接 MySQL，需要：

**方案 1：使用 HTTP API**
- 创建一个数据库 API 服务（可以部署到 Railway/Render）
- Workers 通过 HTTP 调用该 API

**方案 2：使用 Supabase/PlanetScale**
- 使用支持 HTTP 接口的数据库
- Supabase 提供 REST API
- PlanetScale 提供 HTTP API

### 完整部署架构

```
┌─────────────────┐
│  Telegram API   │
└────────┬────────┘
         │ Webhook
         ↓
┌─────────────────────────┐
│ Cloudflare Workers      │
│ - 处理消息              │
│ - 处理回调              │
│ - 发送响应              │
└────────┬────────────────┘
         │ HTTP API
         ↓
┌─────────────────────────┐
│ 数据库 API 服务         │
│ (部署到 Railway/Render) │
│ - 查询数据库            │
│ - 更新数据              │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ MySQL 数据库            │
└─────────────────────────┘

┌─────────────────────────┐
│ 外部 Cron 服务          │
│ (GitHub Actions/其他)   │
│ - 区块扫描              │
│ - 余额更新              │
└────────┬────────────────┘
         │ HTTP API
         ↓
┌─────────────────────────┐
│ Cloudflare Workers      │
│ Cron Handlers           │
└─────────────────────────┘
```

### 测试

```bash
# 测试健康检查
curl https://your-worker.workers.dev/health

# 测试 Webhook（需要 Telegram 发送消息触发）
# 或手动发送测试请求
curl -X POST https://your-worker.workers.dev/webhook \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Bot-Api-Secret-Token: your-secret" \
  -d '{
    "message": {
      "message_id": 1,
      "from": {"id": 123456, "first_name": "Test"},
      "chat": {"id": -1001234567890, "type": "group"},
      "text": "我的"
    }
  }'
```

## 推荐：部署到 Railway（更适合此项目）

### 为什么选择 Railway？

1. ✅ 支持长时间运行的进程
2. ✅ 支持 WebSocket/轮询
3. ✅ 免费额度充足
4. ✅ 简单的部署流程
5. ✅ 自动 HTTPS
6. ✅ 环境变量管理
7. ✅ 日志查看

### Railway 部署步骤

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 设置环境变量
railway variables set BOT_TOKEN=your_token
railway variables set DB_HOST=your_host
railway variables set DB_USERNAME=your_username
railway variables set DB_PASSWORD=your_password
railway variables set DB_DATABASE=your_database

# 5. 部署
railway up
```

### Railway 配置

创建 `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python bot_admin.py",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 总结

对于这个机器人项目：

**推荐部署方案：**
1. **Railway** - 最佳选择（支持所有功能）
2. **Render** - 次选（免费层有限制）
3. **VPS** - 完全控制（需要维护）

**不推荐：**
- Cloudflare Workers - 不适合长时间运行的任务
- Vercel - 主要用于静态站点和 API



