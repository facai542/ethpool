# Railway 部署指南

## 部署步骤

### 方法 1: 通过 GitHub 部署（推荐）

1. **准备代码**
   - 确保代码已推送到 GitHub 仓库：`cursor2b-collab/telegrambott`

2. **在 Railway Dashboard 创建项目**
   - 访问 https://railway.com/dashboard
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择仓库 `cursor2b-collab/telegrambott`

3. **Railway 会自动检测并配置**
   - 检测到 Python 项目
   - 自动读取 `railway.json` 配置

4. **设置环境变量**
   在 Railway Dashboard 的项目设置中添加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   
   **注意：** 
   - 机器人使用 Supabase 数据库（与网站相同）
   - Bot Token 会从 Supabase 的 `options` 表读取 `bot_key` 字段
   - 详细配置见 `railway_deploy_supabase.md`

5. **部署**
   - Railway 会自动开始部署
   - 等待构建完成

6. **查看日志**
   - 在 Dashboard 中点击项目
   - 查看 "Deployments" → "Logs"

---

### 方法 2: 使用 Railway CLI

1. **安装 Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **登录**
   ```bash
   railway login
   ```

3. **初始化项目**
   ```bash
   cd E:\eth-new\telegram-bot
   railway init
   ```
   - 选择创建新项目或使用现有项目

4. **设置环境变量**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   
   **注意：** 使用 Supabase 数据库，不需要设置 MySQL 相关变量

5. **部署**
   ```bash
   railway up
   ```

6. **查看日志**
   ```bash
   railway logs
   ```

---

### 方法 3: 使用 Dockerfile

如果 Railway 自动检测有问题，可以使用 Dockerfile：

1. **创建 Dockerfile**（已存在）
   - `Dockerfile` 已配置好

2. **在 Railway 中**
   - 创建新项目
   - 选择 "Empty Project"
   - 添加 "GitHub Repo"
   - Railway 会自动检测 Dockerfile

3. **设置环境变量和部署**（同上）

---

## 环境变量说明

### 必需的环境变量

```
DB_HOST=your_database_host
DB_PORT=3306
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
DB_DATABASE=your_database_name
```

### 可选的环境变量

```
# Bot Token（如果数据库 options 表中没有）
BOT_TOKEN=your_telegram_bot_token

# 日志级别
LOG_LEVEL=INFO
```

**注意：** 
- Bot Token 会优先从数据库的 `options` 表中读取 `bot_key` 字段
- 只有在数据库中没有配置时才需要环境变量

---

## 配置检查清单

部署前确保：

- [ ] 数据库允许远程连接
- [ ] 数据库防火墙已配置
- [ ] 数据库 `options` 表中有 `bot_key` 配置
- [ ] 数据库中有必要的表结构
- [ ] 环境变量已正确设置

---

## 查看和监控

### 查看日志
```bash
# 使用 CLI
railway logs

# 或浏览器
# 在 Dashboard → 项目 → Deployments → Logs
```

### 查看服务状态
```bash
railway status
```

### 查看环境变量
```bash
railway variables
```

---

## 常见问题

### 1. 构建失败

**检查：**
- Python 版本兼容性（需要 3.11+）
- 依赖是否正确（`requirements_admin.txt`）
- 构建日志中的错误信息

### 2. 运行时错误

**检查：**
- 环境变量是否正确设置
- 数据库连接是否正常
- 查看日志中的错误信息

### 3. Bot 无响应

**检查：**
- Bot Token 是否正确（数据库或环境变量）
- 数据库配置是否正确
- 查看应用日志

### 4. 数据库连接失败

**检查：**
- 数据库服务器是否允许远程连接
- 防火墙是否开放端口
- Railway 的 IP 是否在白名单中

---

## Railway 特性

- ✅ 自动 HTTPS
- ✅ 自动重启（崩溃时）
- ✅ 日志查看
- ✅ 环境变量管理
- ✅ 自定义域名（付费功能）
- ✅ 资源监控

---

## 下一步

部署成功后：
1. 在 Telegram 群组中测试命令
2. 检查日志确保正常运行
3. 配置监控和告警（可选）

