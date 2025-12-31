# 🚀 DApp Telegram Bot - 云服务器部署指南

支持实时监听通知的完整云服务器部署方案。

## 📋 目录结构

```
cloud-deployment/
├── 📦 docker-compose.yml    # Docker编排配置
├── 🐳 Dockerfile           # Docker镜像构建
├── 🚀 deploy.sh            # 一键部署脚本
├── 📊 monitor.sh           # 监控管理脚本
├── 🌐 nginx.conf           # Nginx反向代理配置
├── 🔐 .env.production      # 生产环境变量
└── 📖 README.md           # 部署文档
```

## ⚡ 快速部署

### 1. 服务器要求

- **系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **内存**: 最少1GB，推荐2GB+
- **存储**: 最少10GB可用空间
- **网络**: 公网IP，开放80/443/3001端口

### 2. 安装Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 下载部署文件

```bash
# 创建项目目录
mkdir -p /opt/telegram-bot
cd /opt/telegram-bot

# 下载部署文件 (假设您有Git仓库)
git clone <your-repo> .
cd telegram-bot/cloud-deployment

# 或手动上传文件到此目录
```

### 4. 配置环境变量

```bash
# 复制配置文件
cp .env.production .env

# 编辑配置 (确保所有必要的变量都已设置)
nano .env
```

### 5. 一键部署

```bash
# 给脚本执行权限
chmod +x deploy.sh monitor.sh

# 执行部署
./deploy.sh --with-backup

# 或者安装为系统服务
sudo ./deploy.sh --install-service
```

## 🔧 详细配置

### Docker Compose 配置

```yaml
# 服务会自动:
# ✅ 重启策略: 容器异常退出时自动重启
# ✅ 健康检查: 每30秒检查服务健康状态
# ✅ 日志轮转: 自动管理日志文件大小
# ✅ 网络隔离: 独立的Docker网络
# ✅ 数据持久化: 日志和数据目录挂载
```

### 环境变量说明

```bash
# 必需配置
TELEGRAM_BOT_TOKEN=your_bot_token     # 机器人Token
TELEGRAM_CHAT_ID=your_chat_id         # 群组ID
TELEGRAM_ADMIN_ID=your_admin_id       # 管理员ID

# 区块链配置
ETH_RPC_URL=https://ethereum.publicnode.com
STAKING_CONTRACT_ADDRESS=0x9773a5279603CE262e48bfE3be50033a98c0842F

# 数据库配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# 服务配置
MONITOR_INTERVAL=10000               # 监控间隔(毫秒)
WEBHOOK_PORT=3001                    # 服务端口
```

## 📊 监控管理

### 使用监控脚本

```bash
# 检查服务状态
./monitor.sh status

# 查看日志
./monitor.sh logs 100              # 最近100行
./monitor.sh tail                  # 实时日志

# 服务管理
./monitor.sh restart               # 重启服务
./monitor.sh update                # 更新服务

# 维护操作
./monitor.sh clean-logs 7          # 清理7天前日志
./monitor.sh performance           # 性能测试
./monitor.sh test-db               # 测试数据库连接
```

### 设置自动监控

```bash
# 设置定时任务自动监控
./monitor.sh setup-cron

# 手动添加到crontab:
crontab -e

# 添加以下内容:
*/5 * * * * /opt/telegram-bot/monitor.sh status > /dev/null 2>&1 || /opt/telegram-bot/monitor.sh restart
0 2 * * * /opt/telegram-bot/monitor.sh clean-logs 7
0 3 * * 1 /opt/telegram-bot/monitor.sh performance >> /opt/telegram-bot/logs/performance.log 2>&1
```

## 🌐 Nginx反向代理 (可选)

如果需要域名访问和SSL证书:

### 1. 安装Nginx

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. 配置SSL证书

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com
```

### 3. 应用Nginx配置

```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/telegram-bot
sudo ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

## 🔍 故障排除

### 常见问题

#### 1. 容器启动失败
```bash
# 查看详细日志
docker-compose logs telegram-bot

# 检查配置
docker-compose config

# 重新构建
docker-compose build --no-cache
```

#### 2. 数据库连接失败
```bash
# 测试数据库连接
./monitor.sh test-db

# 检查环境变量
docker-compose exec telegram-bot env | grep SUPABASE
```

#### 3. 机器人无响应
```bash
# 检查Bot Token
curl "https://api.telegram.org/bot<TOKEN>/getMe"

# 检查Webhook设置
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

#### 4. 内存不足
```bash
# 增加swap空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 日志位置

```bash
# 应用日志
./logs/bot.log

# Docker日志
docker-compose logs

# Nginx日志 (如使用)
/var/log/nginx/telegram_bot_access.log
/var/log/nginx/telegram_bot_error.log

# 系统日志
sudo journalctl -u telegram-bot
```

## 📈 性能优化

### 1. 系统优化

```bash
# 增加文件句柄限制
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf

# 优化网络参数
echo "net.core.somaxconn = 1024" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 1024" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Docker优化

```bash
# 限制日志大小
# 在docker-compose.yml中已配置日志轮转

# 清理无用镜像
docker system prune -af

# 监控资源使用
docker stats
```

## 🔐 安全建议

1. **防火墙配置**
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 3001/tcp    # Bot端口 (可选，如使用Nginx代理则关闭)
sudo ufw enable
```

2. **定期更新**
```bash
# 系统更新
sudo apt update && sudo apt upgrade

# 容器更新
./monitor.sh update
```

3. **备份策略**
```bash
# 每日自动备份
echo "0 1 * * * /opt/telegram-bot/deploy.sh --backup" | crontab -

# 手动备份
./deploy.sh --backup
```

## 📞 技术支持

- **日志监控**: `./monitor.sh tail`
- **状态检查**: `./monitor.sh status`  
- **性能测试**: `./monitor.sh performance`
- **健康检查**: `curl http://localhost:3001/health`

## ✅ 功能特性

- ✅ **实时监控** - 10秒间隔监控用户状态
- ✅ **自动重启** - 容器异常时自动恢复
- ✅ **日志管理** - 自动轮转和清理
- ✅ **健康检查** - 30秒间隔健康检测
- ✅ **性能监控** - 资源使用情况追踪
- ✅ **备份恢复** - 自动数据备份
- ✅ **SSL支持** - HTTPS安全连接
- ✅ **负载均衡** - Nginx反向代理

现在您的机器人可以在云服务器上稳定运行，支持实时监听通知！🚀

