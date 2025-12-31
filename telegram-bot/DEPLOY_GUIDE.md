# 部署指南

本机器人可以部署到多个平台。根据你的需求选择最适合的平台。

## 🚀 推荐平台对比

| 平台 | 免费额度 | 长时间运行 | 轮询支持 | 推荐度 |
|------|---------|-----------|---------|--------|
| **Railway** | $5/月 | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Render** | 750小时/月 | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Heroku** | 无免费 | ✅ | ✅ | ⭐⭐⭐ |
| **Cloudflare Workers** | 10万次/天 | ❌ | ❌ | ⭐⭐ |
| **VPS** | 需付费 | ✅ | ✅ | ⭐⭐⭐⭐ |

## 📦 部署方案

### 方案 1: Railway（推荐）⭐

**优点：**
- 免费 $5 额度，够用
- 部署简单
- 支持长时间运行
- 自动 HTTPS
- 环境变量管理方便

**步骤：**

1. **注册账号**
   - 访问 https://railway.app
   - 使用 GitHub 登录

2. **安装 CLI**
   ```bash
   npm install -g @railway/cli
   ```

3. **登录**
   ```bash
   railway login
   ```

4. **初始化项目**
   ```bash
   cd telegram-bot
   railway init
   ```

5. **设置环境变量**
   ```bash
   railway variables set DB_HOST=your_host
   railway variables set DB_PORT=3306
   railway variables set DB_USERNAME=your_username
   railway variables set DB_PASSWORD=your_password
   railway variables set DB_DATABASE=your_database
   ```

6. **部署**
   ```bash
   railway up
   ```

7. **查看日志**
   ```bash
   railway logs
   ```

**注意：** Bot Token 会从数据库的 `options` 表读取，无需设置环境变量。

---

### 方案 2: Render

**步骤：**

1. **注册账号**
   - 访问 https://render.com
   - 使用 GitHub 登录

2. **创建新服务**
   - 选择 "New Web Service"
   - 连接 GitHub 仓库

3. **配置**
   - **Name**: `telegram-bot-admin`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements_admin.txt`
   - **Start Command**: `python bot_admin.py`
   - **Plan**: Free

4. **设置环境变量**
   - 在 Environment Variables 中添加：
     - `DB_HOST`
     - `DB_PORT` (默认: 3306)
     - `DB_USERNAME`
     - `DB_PASSWORD`
     - `DB_DATABASE`

5. **部署**
   - 点击 "Create Web Service"
   - 等待构建完成

**注意：** Render 免费版会在一段时间不活跃后休眠。

---

### 方案 3: Cloudflare Workers（Webhook 模式）

⚠️ **限制：** 需要外部服务处理长时间运行的任务（区块扫描等）

**步骤：**

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录**
   ```bash
   wrangler login
   ```

3. **设置密钥**
   ```bash
   cd cloudflare
   wrangler secret put BOT_TOKEN
   wrangler secret put WEBHOOK_SECRET
   wrangler secret put MAIN_DOMAIN
   ```

4. **部署**
   ```bash
   wrangler deploy
   ```

5. **设置 Webhook**
   ```bash
   # Windows
   setup_webhook_cf.bat YOUR_BOT_TOKEN https://your-worker.workers.dev

   # Linux/Mac
   chmod +x setup_webhook_cf.sh
   ./setup_webhook_cf.sh YOUR_BOT_TOKEN https://your-worker.workers.dev
   ```

**重要：** 区块扫描等任务需要部署到其他平台（如 Railway）或使用 Cron 服务。

详细说明见 `cloudflare/deploy.md`

---

### 方案 4: Docker 部署

**步骤：**

1. **构建镜像**
   ```bash
   docker build -t telegram-bot-admin .
   ```

2. **运行容器**
   ```bash
   docker run -d \
     --name telegram-bot \
     --restart unless-stopped \
     -e DB_HOST=your_host \
     -e DB_PORT=3306 \
     -e DB_USERNAME=your_username \
     -e DB_PASSWORD=your_password \
     -e DB_DATABASE=your_database \
     telegram-bot-admin
   ```

3. **或使用 docker-compose**
   ```bash
   # 创建 .env 文件
   cp .env.example .env
   # 编辑 .env 文件，填入数据库配置
   
   # 启动
   docker-compose up -d
   
   # 查看日志
   docker-compose logs -f
   ```

---

### 方案 5: VPS 服务器

**步骤：**

1. **安装 Python 3.11+**
   ```bash
   sudo apt update
   sudo apt install python3.11 python3.11-venv python3-pip
   ```

2. **克隆项目**
   ```bash
   git clone your-repo-url
   cd telegram-bot
   ```

3. **创建虚拟环境**
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   ```

4. **安装依赖**
   ```bash
   pip install -r requirements_admin.txt
   ```

5. **配置环境变量**
   ```bash
   cp .env.example .env
   nano .env  # 编辑配置
   ```

6. **使用 systemd 管理服务**

   创建 `/etc/systemd/system/telegram-bot.service`:
   ```ini
   [Unit]
   Description=Telegram Bot Admin
   After=network.target

   [Service]
   Type=simple
   User=your-user
   WorkingDirectory=/path/to/telegram-bot
   Environment="PATH=/path/to/telegram-bot/venv/bin"
   ExecStart=/path/to/telegram-bot/venv/bin/python bot_admin.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

7. **启动服务**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable telegram-bot
   sudo systemctl start telegram-bot
   sudo systemctl status telegram-bot
   ```

---

## 🔧 环境变量说明

所有环境变量都可以在 `.env` 文件中设置：

```env
# 数据库配置（必需）
DB_HOST=your_database_host
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name

# Bot Token（可选，会从数据库 options 表读取）
BOT_TOKEN=your_telegram_bot_token

# 其他配置（可选）
LOG_LEVEL=INFO
```

**注意：** Bot Token 会优先从数据库的 `options` 表中读取 `bot_key` 字段。

---

## 🧪 测试部署

部署后，测试机器人是否正常工作：

1. **检查日志**
   - Railway: `railway logs`
   - Render: 在 Dashboard 查看日志
   - Docker: `docker logs telegram-bot`
   - VPS: `sudo journalctl -u telegram-bot -f`

2. **发送测试命令**
   - 在 Telegram 群组中发送 `规则` 或 `我的`
   - 检查是否收到回复

3. **检查数据库连接**
   - 查看日志中是否有数据库连接错误

---

## 🐛 常见问题

### 1. 机器人无响应

**检查：**
- 数据库连接是否正常
- Bot Token 是否正确
- 群组 ID 是否在数据库中配置
- 查看日志中的错误信息

### 2. 数据库连接失败

**检查：**
- 数据库服务器是否允许远程连接
- 防火墙是否开放端口
- 用户名密码是否正确

### 3. Cloudflare Workers 超时

**解决：**
- 使用 Webhook 模式
- 将长时间运行的任务移到外部服务
- 使用 Durable Objects 存储状态

### 4. Render 服务休眠

**解决：**
- 升级到付费计划
- 或使用 Railway（不会休眠）

---

## 📚 相关文档

- [Railway 文档](https://docs.railway.app)
- [Render 文档](https://render.com/docs)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Docker 文档](https://docs.docker.com)

---

## 💡 最佳实践

1. **使用环境变量** - 不要硬编码敏感信息
2. **启用日志** - 方便调试和监控
3. **设置重启策略** - 确保服务自动恢复
4. **定期备份** - 备份数据库和配置
5. **监控资源** - 关注 CPU、内存使用情况

---

## 🆘 获取帮助

如果遇到问题：
1. 查看日志文件
2. 检查环境变量配置
3. 确认数据库连接
4. 查看相关文档



