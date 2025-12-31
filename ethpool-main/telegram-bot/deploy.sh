#!/bin/bash

# DApp Telegram监控机器人部署脚本
# 使用方法: ./deploy.sh [production|development]

set -e  # 出错时退出

MODE=${1:-development}
PROJECT_NAME="dapp-telegram-bot"
BOT_DIR="/opt/$PROJECT_NAME"
SERVICE_NAME="telegram-bot"

echo "🚀 开始部署 $PROJECT_NAME (模式: $MODE)"

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  警告: 正在以root用户运行部署脚本"
fi

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装"
    echo "请先安装 Node.js 18+ 版本"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: Node.js 版本过低 (需要 18+)"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node --version)"

# 检查PM2 (生产模式)
if [ "$MODE" == "production" ]; then
    if ! command -v pm2 &> /dev/null; then
        echo "📦 安装 PM2..."
        npm install -g pm2
    fi
    echo "✅ PM2 版本: $(pm2 --version)"
fi

# 创建项目目录
if [ "$MODE" == "production" ]; then
    echo "📁 创建项目目录: $BOT_DIR"
    sudo mkdir -p $BOT_DIR
    sudo chown -R $USER:$USER $BOT_DIR
fi

# 复制文件
echo "📋 复制项目文件..."
if [ "$MODE" == "production" ]; then
    cp -r ./* $BOT_DIR/
    cd $BOT_DIR
else
    echo "开发模式: 在当前目录运行"
fi

# 安装依赖
echo "📦 安装Node.js依赖..."
npm install --omit=dev

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在"
    echo "📋 创建示例配置文件..."
    cp .env.example .env
    echo "❗ 请编辑 .env 文件并设置正确的配置值"
    echo "必需配置项:"
    echo "  - TELEGRAM_BOT_TOKEN"
    echo "  - TELEGRAM_CHAT_ID"
    read -p "配置完成后按 Enter 继续..."
fi

# 验证关键环境变量
source .env
if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ "$TELEGRAM_BOT_TOKEN" == "your_telegram_bot_token_here" ]; then
    echo "❌ 错误: TELEGRAM_BOT_TOKEN 未正确配置"
    exit 1
fi

if [ -z "$TELEGRAM_CHAT_ID" ] || [ "$TELEGRAM_CHAT_ID" == "your_group_chat_id_here" ]; then
    echo "❌ 错误: TELEGRAM_CHAT_ID 未正确配置"
    exit 1
fi

echo "✅ 环境变量验证通过"

# 测试连接
echo "🧪 测试机器人连接..."
timeout 10s node -e "
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('$TELEGRAM_BOT_TOKEN');
bot.getMe().then(info => {
  console.log('✅ Telegram Bot连接成功: @' + info.username);
  process.exit(0);
}).catch(error => {
  console.error('❌ Telegram连接失败:', error.message);
  process.exit(1);
});
" || {
    echo "❌ Telegram Bot连接测试失败"
    exit 1
}

# 部署模式处理
if [ "$MODE" == "production" ]; then
    echo "🔄 生产模式部署..."
    
    # 停止现有服务
    pm2 delete $SERVICE_NAME 2>/dev/null || true
    
    # 创建PM2配置文件
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'index.js',
    cwd: '$BOT_DIR',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
EOF

    # 创建日志目录
    mkdir -p logs
    
    # 启动服务
    pm2 start ecosystem.config.js
    pm2 save
    
    # 设置开机自启
    sudo pm2 startup systemd -u $USER --hp $HOME
    
    echo "✅ 生产环境部署完成"
    echo "📊 查看状态: pm2 status"
    echo "📋 查看日志: pm2 logs $SERVICE_NAME"
    
else
    echo "🔧 开发模式启动..."
    echo "运行命令: npm run dev"
    echo "或者: node index.js"
fi

# 防火墙配置提示
WEBHOOK_PORT=${WEBHOOK_PORT:-3001}
echo ""
echo "🔒 防火墙配置提示:"
echo "如需外网访问，请开放端口 $WEBHOOK_PORT"
echo "Ubuntu/Debian: sudo ufw allow $WEBHOOK_PORT"
echo "CentOS/RHEL: sudo firewall-cmd --add-port=$WEBHOOK_PORT/tcp --permanent"

# 部署后测试
echo ""
echo "🧪 运行部署后测试? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "⏳ 等待服务启动..."
    sleep 5
    
    if [ "$MODE" == "production" ]; then
        npm run test
    else
        echo "开发模式: 请手动运行 npm run test"
    fi
fi

echo ""
echo "🎉 部署完成!"
echo "📖 详细文档: 查看 README.md"
echo "🤖 机器人管理:"

if [ "$MODE" == "production" ]; then
    echo "  - 查看状态: pm2 status"
    echo "  - 查看日志: pm2 logs $SERVICE_NAME"
    echo "  - 重启服务: pm2 restart $SERVICE_NAME"
    echo "  - 停止服务: pm2 stop $SERVICE_NAME"
else
    echo "  - 启动机器人: npm start"
    echo "  - 开发模式: npm run dev"
    echo "  - 运行测试: npm run test"
fi

echo ""
echo "📱 Telegram群组中发送 /start 命令来激活机器人"
echo "🔗 Webhook地址: http://your-server:$WEBHOOK_PORT"

echo ""
echo "⚡ 快速验证清单:"
echo "□ 机器人已添加到Telegram群组"
echo "□ 机器人有发送消息权限"
echo "□ 服务器防火墙已开放端口 $WEBHOOK_PORT"
echo "□ 前端已集成Webhook调用"
echo "□ 环境变量配置正确"



