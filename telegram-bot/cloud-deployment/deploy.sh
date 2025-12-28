#!/bin/bash
# 云服务器自动部署脚本

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "Docker环境检查通过"
}

# 检查环境变量
check_env() {
    if [ ! -f ".env" ]; then
        log_error "未找到.env文件，请创建并配置环境变量"
        log_info "请复制.env.example为.env并填入正确的值"
        exit 1
    fi
    
    # 检查关键环境变量
    source .env
    
    if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
        log_error "TELEGRAM_BOT_TOKEN未设置"
        exit 1
    fi
    
    if [ -z "$TELEGRAM_CHAT_ID" ]; then
        log_error "TELEGRAM_CHAT_ID未设置"
        exit 1
    fi
    
    log_success "环境变量检查通过"
}

# 创建必要目录
create_directories() {
    mkdir -p logs data backups
    log_success "创建必要目录"
}

# 停止现有容器
stop_existing() {
    log_info "停止现有容器..."
    docker-compose down --remove-orphans || true
    
    # 清理悬挂的镜像
    docker system prune -f || true
    
    log_success "现有容器已停止"
}

# 构建并启动
build_and_start() {
    log_info "构建Docker镜像..."
    docker-compose build --no-cache
    
    log_info "启动服务..."
    docker-compose up -d
    
    log_success "服务启动成功"
}

# 等待服务就绪
wait_for_service() {
    log_info "等待服务启动..."
    
    # 等待最多60秒
    for i in {1..12}; do
        if docker-compose ps | grep -q "Up"; then
            log_success "服务已启动"
            return 0
        fi
        sleep 5
    done
    
    log_error "服务启动超时"
    docker-compose logs
    exit 1
}

# 显示服务状态
show_status() {
    log_info "服务状态："
    docker-compose ps
    
    log_info "服务日志（最后20行）："
    docker-compose logs --tail=20
}

# 创建systemd服务文件
create_systemd_service() {
    local service_file="/etc/systemd/system/telegram-bot.service"
    local current_dir=$(pwd)
    
    if [ "$EUID" -eq 0 ]; then
        log_info "创建systemd服务..."
        
        cat > $service_file << EOF
[Unit]
Description=DApp Telegram Bot
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=$current_dir
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
        
        systemctl daemon-reload
        systemctl enable telegram-bot
        log_success "systemd服务已创建并启用"
    else
        log_warning "非root用户，跳过systemd服务创建"
        log_info "如需开机自启动，请以root用户运行此脚本"
    fi
}

# 备份数据
backup_data() {
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    if [ -d "logs" ]; then
        cp -r logs "$backup_dir/"
    fi
    
    if [ -d "data" ]; then
        cp -r data "$backup_dir/"
    fi
    
    if [ -f ".env" ]; then
        cp .env "$backup_dir/"
    fi
    
    log_success "数据已备份到 $backup_dir"
}

# 主函数
main() {
    log_info "开始部署DApp Telegram监控机器人..."
    
    # 检查参数
    if [ "$1" = "--backup" ]; then
        backup_data
        exit 0
    fi
    
    check_docker
    check_env
    create_directories
    
    # 如果指定了备份，则先备份
    if [ "$1" = "--with-backup" ]; then
        backup_data
    fi
    
    stop_existing
    build_and_start
    wait_for_service
    show_status
    
    # 创建systemd服务（可选）
    if [ "$1" = "--install-service" ]; then
        create_systemd_service
    fi
    
    log_success "🎉 部署完成！"
    log_info "机器人已启动，正在监控用户状态"
    log_info "使用 'docker-compose logs -f' 查看实时日志"
    log_info "使用 'docker-compose down' 停止服务"
    log_info "使用 'docker-compose restart' 重启服务"
}

# 显示帮助信息
show_help() {
    echo "DApp Telegram Bot 部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --help              显示此帮助信息"
    echo "  --backup            仅备份现有数据"
    echo "  --with-backup       部署前备份数据"
    echo "  --install-service   创建systemd服务（需要root权限）"
    echo ""
    echo "示例:"
    echo "  $0                    # 正常部署"
    echo "  $0 --with-backup      # 备份后部署"
    echo "  $0 --install-service  # 部署并创建系统服务"
}

# 处理命令行参数
case "$1" in
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac

