#!/bin/bash
# 监控和管理脚本

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查服务状态
check_status() {
    log_info "检查服务状态..."
    
    if docker-compose ps | grep -q "Up"; then
        log_success "✅ 服务正在运行"
        
        # 检查健康状态
        if curl -f http://localhost:3001/health &> /dev/null; then
            log_success "✅ 健康检查通过"
        else
            log_warning "⚠️ 健康检查失败"
        fi
        
        # 显示容器信息
        echo ""
        docker-compose ps
        
        # 显示资源使用情况
        echo ""
        log_info "资源使用情况："
        docker stats --no-stream $(docker-compose ps -q)
        
    else
        log_error "❌ 服务未运行"
        return 1
    fi
}

# 查看日志
view_logs() {
    local lines=${1:-50}
    log_info "显示最近 $lines 行日志..."
    docker-compose logs --tail=$lines
}

# 实时日志
tail_logs() {
    log_info "实时日志监控 (按Ctrl+C退出)..."
    docker-compose logs -f
}

# 重启服务
restart_service() {
    log_info "重启服务..."
    docker-compose restart
    sleep 5
    check_status
}

# 更新服务
update_service() {
    log_info "更新服务..."
    
    # 备份当前数据
    backup_dir="backups/update_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    cp -r logs data "$backup_dir/" 2>/dev/null || true
    log_success "数据已备份到 $backup_dir"
    
    # 拉取最新代码
    git pull origin main
    
    # 重新构建并启动
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    sleep 10
    check_status
}

# 清理日志
clean_logs() {
    local days=${1:-7}
    log_info "清理 $days 天前的日志..."
    
    find logs -name "*.log" -mtime +$days -delete 2>/dev/null || true
    find backups -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
    
    # Docker日志清理
    docker-compose down
    docker system prune -f
    docker-compose up -d
    
    log_success "日志清理完成"
}

# 性能测试
performance_test() {
    log_info "执行性能测试..."
    
    # 测试健康检查端点
    echo "健康检查端点测试:"
    time curl -f http://localhost:3001/health
    
    echo ""
    echo "Webhook端点测试:"
    time curl -X POST -H "Content-Type: application/json" \
         -d '{"test": true}' \
         http://localhost:3001/webhook/user-connect
    
    # 显示系统资源
    echo ""
    log_info "系统资源:"
    free -h
    df -h
    
    echo ""
    log_info "Docker资源:"
    docker system df
}

# 数据库连接测试
test_database() {
    log_info "测试数据库连接..."
    
    # 运行数据库测试
    docker-compose exec telegram-bot node -e "
        const { TelegramBotDatabase } = require('./database');
        const database = new TelegramBotDatabase();
        database.testConnection()
            .then(() => console.log('✅ 数据库连接正常'))
            .catch(err => {
                console.error('❌ 数据库连接失败:', err.message);
                process.exit(1);
            });
    "
}

# 设置定时任务
setup_cron() {
    log_info "设置定时监控任务..."
    
    # 创建cron任务
    cat > /tmp/telegram-bot-cron << EOF
# 每5分钟检查服务状态
*/5 * * * * $PWD/monitor.sh status > /dev/null 2>&1 || $PWD/monitor.sh restart
# 每天清理日志
0 2 * * * $PWD/monitor.sh clean-logs 7
# 每周执行性能测试
0 3 * * 1 $PWD/monitor.sh performance >> logs/performance.log 2>&1
EOF
    
    if command -v crontab &> /dev/null; then
        crontab /tmp/telegram-bot-cron
        rm /tmp/telegram-bot-cron
        log_success "定时任务已设置"
        crontab -l
    else
        log_warning "crontab未安装，请手动设置定时任务"
        cat /tmp/telegram-bot-cron
    fi
}

# 显示帮助
show_help() {
    echo "DApp Telegram Bot 监控脚本"
    echo ""
    echo "用法: $0 <命令> [参数]"
    echo ""
    echo "命令:"
    echo "  status              检查服务状态"
    echo "  logs [行数]         查看日志 (默认50行)"
    echo "  tail               实时日志监控"
    echo "  restart            重启服务"
    echo "  update             更新服务"
    echo "  clean-logs [天数]  清理日志 (默认7天)"
    echo "  performance        性能测试"
    echo "  test-db            测试数据库连接"
    echo "  setup-cron         设置定时监控任务"
    echo "  help               显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 status           # 检查状态"
    echo "  $0 logs 100         # 查看最近100行日志"
    echo "  $0 clean-logs 3     # 清理3天前的日志"
}

# 主函数
main() {
    case "$1" in
        status)
            check_status
            ;;
        logs)
            view_logs "$2"
            ;;
        tail)
            tail_logs
            ;;
        restart)
            restart_service
            ;;
        update)
            update_service
            ;;
        clean-logs)
            clean_logs "$2"
            ;;
        performance)
            performance_test
            ;;
        test-db)
            test_database
            ;;
        setup-cron)
            setup_cron
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo "未知命令: $1"
            echo "使用 '$0 help' 查看帮助"
            exit 1
            ;;
    esac
}

main "$@"

