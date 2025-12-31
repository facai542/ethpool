# 免费部署方案

由于 Railway 已限制免费账户，这里提供其他免费部署方案。

## 🆓 推荐免费平台

### 方案 1: Render（推荐）⭐⭐⭐⭐

**优点：**
- ✅ 每月 750 小时免费额度
- ✅ 自动 HTTPS
- ✅ 通过 GitHub 自动部署
- ✅ 简单易用

**缺点：**
- ⚠️ 15分钟不活跃会休眠（需要时间启动）
- ⚠️ 免费额度有限

**部署步骤：**

1. **访问 Render**
   - 打开 https://render.com
   - 使用 GitHub 登录

2. **创建新服务**
   - 点击 "New +" → "Web Service"
   - 连接 GitHub 仓库 `cursor2b-collab/telegrambott`

3. **配置服务**
   ```
   Name: telegram-bot-admin
   Environment: Python 3
   Build Command: pip install -r requirements_admin.txt
   Start Command: python bot_admin.py
   Plan: Free
   ```

4. **添加环境变量**
   - `DB_HOST` = 你的数据库主机
   - `DB_PORT` = 3306
   - `DB_USERNAME` = 你的数据库用户名
   - `DB_PASSWORD` = 你的数据库密码
   - `DB_DATABASE` = 你的数据库名

5. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成

---

### 方案 2: Fly.io（推荐）⭐⭐⭐⭐⭐

**优点：**
- ✅ 3个共享CPU VM免费
- ✅ 不会休眠
- ✅ 全球边缘部署
- ✅ 自动 HTTPS

**部署步骤：**

1. **安装 Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # 或使用其他方法
   # https://fly.io/docs/getting-started/installing-flyctl/
   ```

2. **登录**
   ```bash
   fly auth login
   ```

3. **初始化**
   ```bash
   cd E:\eth-new\telegram-bot
   fly launch
   ```
   - 选择应用名称
   - 选择地区（推荐：hongkong/hkg）
   - 选择不部署数据库（使用外部数据库）

4. **设置密钥**
   ```bash
   fly secrets set DB_HOST=your_host
   fly secrets set DB_PORT=3306
   fly secrets set DB_USERNAME=your_username
   fly secrets set DB_PASSWORD=your_password
   fly secrets set DB_DATABASE=your_database
   ```

5. **部署**
   ```bash
   fly deploy
   ```

6. **查看日志**
   ```bash
   fly logs
   ```

---

### 方案 3: Oracle Cloud Always Free（最佳长期方案）⭐⭐⭐⭐⭐

**优点：**
- ✅ 永久免费（永远免费）
- ✅ 2个 AMD 实例
- ✅ 24GB 内存
- ✅ 不限制运行时间
- ✅ 不限制流量
- ✅ 不会休眠

**缺点：**
- ⚠️ 注册需要信用卡（但不会扣费）
- ⚠️ 需要一些 Linux 知识

**部署步骤：**

1. **注册 Oracle Cloud**
   - 访问 https://www.oracle.com/cloud/free/
   - 注册账号（需要信用卡验证，但不会扣费）

2. **创建实例**
   - 登录控制台
   - 创建 Always Free 实例
   - 选择 Ubuntu 22.04
   - 配置 SSH 密钥

3. **连接到服务器**
   ```bash
   ssh ubuntu@your-instance-ip
   ```

4. **安装依赖**
   ```bash
   sudo apt update
   sudo apt install python3.11 python3.11-venv python3-pip git -y
   ```

5. **克隆代码**
   ```bash
   git clone https://github.com/cursor2b-collab/telegrambott.git
   cd telegrambott
   ```

6. **设置虚拟环境**
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements_admin.txt
   ```

7. **配置环境变量**
   ```bash
   cp .env.example .env
   nano .env  # 编辑配置
   ```

8. **使用 systemd 管理服务**

   创建 `/etc/systemd/system/telegram-bot.service`:
   ```ini
   [Unit]
   Description=Telegram Bot Admin
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/telegrambott
   Environment="PATH=/home/ubuntu/telegrambott/venv/bin"
   ExecStart=/home/ubuntu/telegrambott/venv/bin/python bot_admin.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

9. **启动服务**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable telegram-bot
   sudo systemctl start telegram-bot
   sudo systemctl status telegram-bot
   ```

10. **查看日志**
    ```bash
    sudo journalctl -u telegram-bot -f
    ```

---

### 方案 4: Koyeb（简单快速）⭐⭐⭐

**优点：**
- ✅ 简单易用
- ✅ 通过 GitHub 自动部署
- ✅ 全球边缘部署

**部署步骤：**

1. **访问 Koyeb**
   - 打开 https://www.koyeb.com
   - 使用 GitHub 登录

2. **创建应用**
   - 点击 "Create App"
   - 选择 "GitHub"
   - 选择仓库 `cursor2b-collab/telegrambott`

3. **配置**
   ```
   Name: telegram-bot-admin
   Build Command: pip install -r requirements_admin.txt
   Run Command: python bot_admin.py
   ```

4. **添加环境变量**
   在 Environment Variables 中添加数据库配置

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成

---

## 📊 平台对比

| 平台 | 免费额度 | 休眠限制 | 推荐度 | 适合场景 |
|------|---------|---------|--------|---------|
| **Render** | 750小时/月 | 15分钟不活跃 | ⭐⭐⭐⭐ | 短期测试 |
| **Fly.io** | 3个VM | 不会休眠 | ⭐⭐⭐⭐⭐ | 生产环境 |
| **Oracle Cloud** | 永久免费 | 不会休眠 | ⭐⭐⭐⭐⭐ | 长期使用 |
| **Koyeb** | 有限额度 | 不会休眠 | ⭐⭐⭐ | 小型项目 |

---

## 🚀 快速开始推荐

**如果你需要：**
- **快速测试** → 使用 **Render**（最简单）
- **稳定运行** → 使用 **Fly.io**（推荐）
- **长期免费** → 使用 **Oracle Cloud**（最佳）

---

## ⚠️ 重要提示

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 使用环境变量或密钥管理

2. **数据库连接**
   - 确保数据库允许远程连接
   - 配置防火墙规则

3. **日志监控**
   - 定期查看日志
   - 设置错误通知

4. **备份**
   - 定期备份数据库
   - 保存配置文件

---

## 🆘 如果遇到问题

1. 查看平台日志
2. 检查环境变量配置
3. 确认数据库连接
4. 查看相关文档



