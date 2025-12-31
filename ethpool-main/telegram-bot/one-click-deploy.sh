#!/bin/bash
# Telegram机器人一键部署脚本 - 支持多种云服务器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志函数
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# 显示欢迎信息
show_welcome() {
    clear
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════╗"
    echo "║        🚀 Telegram机器人一键部署工具          ║"
    echo "║                                              ║"
    echo "║  支持实时监控、自动重启、日志管理             ║"
    echo "║  适用于: 阿里云、腾讯云、AWS、DigitalOcean    ║"
    echo "╚══════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

# 检测操作系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        error "无法检测操作系统版本"
        exit 1
    fi
    
    log "检测到操作系统: $PRETTY_NAME"
}

# 安装Docker
install_docker() {
    log "开始安装Docker..."
    
    # 卸载旧版本
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt-get remove -y docker docker-engine docker.io containerd runc || true
        sudo apt-get update
        sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        
        # 添加Docker官方GPG密钥
        curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # 设置稳定版仓库
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # 安装Docker Engine
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        sudo yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine
        sudo yum install -y yum-utils
        sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        sudo yum install -y docker-ce docker-ce-cli containerd.io
        
    else
        # 通用安装脚本
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        rm get-docker.sh
    fi
    
    # 启动Docker服务
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 添加当前用户到docker组
    sudo usermod -aG docker $USER
    
    success "Docker安装完成"
}

# 安装Docker Compose
install_docker_compose() {
    log "安装Docker Compose..."
    
    # 获取最新版本号
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    
    # 下载Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # 赋予执行权限
    sudo chmod +x /usr/local/bin/docker-compose
    
    # 创建软链接
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    success "Docker Compose安装完成"
}

# 检查Docker环境
check_docker() {
    if command -v docker &> /dev/null; then
        success "Docker已安装: $(docker --version)"
    else
        warning "Docker未安装，正在安装..."
        install_docker
    fi
    
    if command -v docker-compose &> /dev/null; then
        success "Docker Compose已安装: $(docker-compose --version)"
    else
        warning "Docker Compose未安装，正在安装..."
        install_docker_compose
    fi
}

# 创建项目目录
create_project() {
    PROJECT_DIR="/opt/telegram-bot"
    
    log "创建项目目录: $PROJECT_DIR"
    sudo mkdir -p $PROJECT_DIR
    sudo chown $USER:$USER $PROJECT_DIR
    
    cd $PROJECT_DIR
}

# 下载部署文件
download_files() {
    log "下载部署文件..."
    
    # 这里你需要替换为实际的文件下载地址
    # 可以从GitHub release、对象存储等下载
    
    cat > Dockerfile << 'EOF'
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建必要目录
RUN mkdir -p logs data

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# 启动应用
CMD ["node", "index.js"]
EOF

    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  telegram-bot:
    build: .
    container_name: telegram-bot-production
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
      - TELEGRAM_ADMIN_ID=${TELEGRAM_ADMIN_ID}
      - ETH_RPC_URL=${ETH_RPC_URL}
      - USDT_CONTRACT_ADDRESS=${USDT_CONTRACT_ADDRESS}
      - STAKING_CONTRACT_ADDRESS=${STAKING_CONTRACT_ADDRESS}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - WEBHOOK_PORT=3001
      - MONITOR_INTERVAL=10000
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    networks:
      - bot-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  bot-network:
    driver: bridge
EOF

    # 创建机器人主文件（简化版本）
    cat > index.js << 'EOF'
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// 环境变量
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PORT = process.env.WEBHOOK_PORT || 3001;

// 初始化
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 健康检查端点
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 机器人消息处理
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(`收到消息: ${msg.text} 来自: ${chatId}`);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Telegram机器人已启动，端口: ${PORT}`);
    console.log(`📱 机器人Token: ${BOT_TOKEN ? '已配置' : '未配置'}`);
    console.log(`💬 群组ID: ${CHAT_ID || '未配置'}`);
});

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
});
EOF

    cat > package.json << 'EOF'
{
  "name": "telegram-bot-production",
  "version": "1.0.0",
  "description": "DApp Telegram监控机器人",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "node-telegram-bot-api": "^0.64.0",
    "express": "^4.18.2",
    "@supabase/supabase-js": "^2.39.0",
    "ethers": "^6.8.0"
  }
}
EOF

    success "部署文件创建完成"
}

# 配置环境变量
configure_env() {
    log "配置环境变量..."
    
    cat > .env << 'EOF'
# Telegram 机器人配置
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_ADMIN_ID=

# 区块链配置
ETH_RPC_URL=https://ethereum.publicnode.com
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
STAKING_CONTRACT_ADDRESS=0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218

# Supabase数据库配置
SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk

# 服务配置
NODE_ENV=production
WEBHOOK_PORT=3001
MONITOR_INTERVAL=10000
EOF

    warning "请编辑 .env 文件，填入正确的配置："
    echo -e "${CYAN}nano .env${NC}"
    echo ""
    echo "主要需要配置："
    echo "1. TELEGRAM_BOT_TOKEN - 你的机器人Token"
    echo "2. TELEGRAM_CHAT_ID - 你的群组ID"
    echo "3. TELEGRAM_ADMIN_ID - 你的管理员ID"
    echo ""
    read -p "配置完成后按回车继续..."
}

# 部署服务
deploy_service() {
    log "构建和启动服务..."
    
    # 创建必要目录
    mkdir -p logs data
    
    # 构建镜像
    docker-compose build --no-cache
    
    # 启动服务
    docker-compose up -d
    
    success "服务启动完成"
}

# 验证部署
verify_deployment() {
    log "验证部署状态..."
    
    sleep 10  # 等待服务启动
    
    # 检查容器状态
    if docker-compose ps | grep -q "Up"; then
        success "容器运行正常"
    else
        error "容器启动失败"
        docker-compose logs
        exit 1
    fi
    
    # 检查健康状态
    if curl -f http://localhost:3001/health &> /dev/null; then
        success "健康检查通过"
    else
        warning "健康检查失败，检查日志"
        docker-compose logs --tail=20
    fi
}

# 创建管理脚本
create_management_scripts() {
    log "创建管理脚本..."
    
    cat > bot-manager.sh << 'EOF'
#!/bin/bash
# Telegram机器人管理脚本

case "$1" in
    start)
        echo "启动机器人..."
        docker-compose up -d
        ;;
    stop)
        echo "停止机器人..."
        docker-compose down
        ;;
    restart)
        echo "重启机器人..."
        docker-compose restart
        ;;
    logs)
        docker-compose logs -f
        ;;
    status)
        docker-compose ps
        ;;
    update)
        echo "更新机器人..."
        docker-compose pull
        docker-compose up -d --build
        ;;
    *)
        echo "用法: $0 {start|stop|restart|logs|status|update}"
        exit 1
        ;;
esac
EOF

    chmod +x bot-manager.sh
    success "管理脚本创建完成"
}

# 设置防火墙
setup_firewall() {
    log "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        sudo ufw allow 22/tcp      # SSH
        sudo ufw allow 80/tcp      # HTTP
        sudo ufw allow 443/tcp     # HTTPS
        sudo ufw allow 3001/tcp    # Bot端口
        sudo ufw --force enable
        success "防火墙配置完成"
    else
        warning "未检测到ufw，请手动配置防火墙"
    fi
}

# 显示部署结果
show_results() {
    clear
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════╗"
    echo "║            🎉 部署完成！                      ║"
    echo "╚══════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    echo -e "${YELLOW}📍 服务信息:${NC}"
    echo "   项目目录: $PROJECT_DIR"
    echo "   服务端口: 3001"
    echo "   健康检查: http://localhost:3001/health"
    echo ""
    
    echo -e "${YELLOW}🔧 管理命令:${NC}"
    echo "   查看状态: ./bot-manager.sh status"
    echo "   查看日志: ./bot-manager.sh logs"
    echo "   重启服务: ./bot-manager.sh restart"
    echo "   停止服务: ./bot-manager.sh stop"
    echo ""
    
    echo -e "${YELLOW}📊 监控命令:${NC}"
    echo "   实时日志: docker-compose logs -f"
    echo "   容器状态: docker-compose ps"
    echo "   资源使用: docker stats"
    echo ""
    
    echo -e "${GREEN}✅ 机器人已成功部署并运行！${NC}"
}

# 主函数
main() {
    show_welcome
    
    # 检查是否为root用户
    if [ "$EUID" -eq 0 ]; then
        warning "请不要使用root用户运行此脚本"
        echo "建议创建普通用户: useradd -m -s /bin/bash botuser"
        exit 1
    fi
    
    detect_os
    check_docker
    create_project
    download_files
    configure_env
    deploy_service
    verify_deployment
    create_management_scripts
    setup_firewall
    show_results
}

# 运行主函数
main "$@"






