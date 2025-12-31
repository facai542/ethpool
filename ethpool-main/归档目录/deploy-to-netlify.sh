#!/bin/bash
# Netlify 自动部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 显示部署信息
show_deployment_info() {
    clear
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════╗"
    echo "║           🚀 Netlify 自动部署工具            ║"
    echo "║                                              ║"
    echo "║  包含最新合约地址和优化配置                   ║"
    echo "╚══════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

# 检查必要工具
check_requirements() {
    log "检查部署环境..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装，请先安装 Node.js 20+"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 20 ]; then
        error "Node.js 版本过低，需要 20+ 版本"
        exit 1
    fi
    
    success "Node.js 版本: $(node --version)"
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        error "npm 未安装"
        exit 1
    fi
    
    success "npm 版本: $(npm --version)"
    
    # 检查Netlify CLI（可选）
    if command -v netlify &> /dev/null; then
        success "Netlify CLI 已安装: $(netlify --version)"
    else
        warning "Netlify CLI 未安装，将跳过自动部署"
        warning "请手动上传构建文件或安装: npm install -g netlify-cli"
    fi
}

# 清理和安装依赖
install_dependencies() {
    log "安装项目依赖..."
    
    # 清理缓存
    if [ -d "node_modules" ]; then
        log "清理现有 node_modules..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        log "清理 package-lock.json..."
        rm -f package-lock.json
    fi
    
    # 安装依赖
    log "使用 npm ci 进行快速、可靠的安装..."
    npm ci --legacy-peer-deps --prefer-offline
    
    if [ $? -eq 0 ]; then
        success "依赖安装完成"
    else
        warning "npm ci 失败，尝试使用 npm install..."
        npm install --legacy-peer-deps
        success "依赖安装完成"
    fi
}

# 环境变量检查
check_environment() {
    log "检查环境配置..."
    
    # 检查关键环境变量是否在netlify.toml中配置
    if ! grep -q "STAKING_CONTRACT_ADDRESS.*0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218" netlify.toml; then
        error "netlify.toml 中的合约地址未更新"
        exit 1
    fi
    
    if ! grep -q "TREASURY_ADDRESS.*0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a" netlify.toml; then
        error "netlify.toml 中的财务地址未更新"
        exit 1
    fi
    
    success "环境配置检查通过"
}

# 运行测试
run_tests() {
    log "运行项目检查..."
    
    # 类型检查
    if npm run lint &> /dev/null; then
        success "代码检查通过"
    else
        warning "代码检查发现问题，继续部署..."
    fi
}

# 构建项目
build_project() {
    log "构建生产版本..."
    
    # 设置环境变量
    export NODE_ENV=production
    export NEXT_TELEMETRY_DISABLED=1
    
    # 清理旧构建文件
    if [ -d ".next" ]; then
        rm -rf .next
    fi
    
    # 构建项目
    log "开始构建项目..."
    npm run build
    
    if [ $? -eq 0 ]; then
        success "项目构建成功"
        
        # 检查构建输出
        if [ -d ".next" ]; then
            log "构建输出目录: .next/"
            log "构建文件大小: $(du -sh .next 2>/dev/null | cut -f1 || echo '未知')"
        else
            warning "未找到 .next 目录"
        fi
    else
        error "项目构建失败"
        log "请检查构建日志以获取更多信息"
        exit 1
    fi
}

# 部署到Netlify
deploy_to_netlify() {
    if command -v netlify &> /dev/null; then
        log "部署到 Netlify..."
        
        # 检查是否已登录
        if netlify status 2>/dev/null | grep -q "Not logged in"; then
            warning "请先登录 Netlify CLI:"
            warning "运行: netlify login"
            return 1
        fi
        
        # 部署
        netlify deploy --prod --dir=.next
        
        if [ $? -eq 0 ]; then
            success "部署到 Netlify 成功"
            log "查看部署状态: netlify open"
        else
            error "部署到 Netlify 失败"
            return 1
        fi
    else
        log "跳过自动部署，请手动上传 .next 文件夹到 Netlify"
    fi
}

# 显示部署后信息
show_post_deployment_info() {
    echo ""
    echo -e "${GREEN}🎉 部署准备完成！${NC}"
    echo ""
    echo -e "${YELLOW}📋 部署信息:${NC}"
    echo "   ✅ 使用最新合约地址: 0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218"
    echo "   ✅ 财务地址已更新: 0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a"
    echo "   ✅ 环境变量已配置: netlify.toml"
    echo "   ✅ 构建文件已生成: .next/"
    echo ""
    echo -e "${YELLOW}🌐 如果使用 Netlify CLI:${NC}"
    echo "   1. 确保已登录: netlify login"
    echo "   2. 链接站点: netlify link"
    echo "   3. 部署: netlify deploy --prod"
    echo ""
    echo -e "${YELLOW}📁 如果手动上传:${NC}"
    echo "   1. 将 .next 文件夹上传到 Netlify"
    echo "   2. 或将整个项目推送到 Git 仓库"
    echo "   3. Netlify 会自动检测到更改并部署"
    echo ""
    echo -e "${YELLOW}🔧 重要配置:${NC}"
    echo "   • 构建命令: npm run build"
    echo "   • 发布目录: 由 @netlify/plugin-nextjs 自动处理"
    echo "   • Node.js 版本: 18"
    echo ""
}

# 创建部署检查清单
create_deployment_checklist() {
    cat > NETLIFY_DEPLOYMENT_CHECKLIST.md << 'EOF'
# 📋 Netlify 部署检查清单

## ✅ 部署前检查
- [ ] Node.js 18+ 已安装
- [ ] 项目依赖已安装 (`npm install`)
- [ ] 环境变量已在 netlify.toml 中配置
- [ ] 合约地址已更新为: `0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218`
- [ ] 财务地址已更新为: `0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a`

## ✅ Netlify 站点配置
- [ ] Netlify 账户已创建
- [ ] 站点已连接到 Git 仓库
- [ ] 构建设置已配置:
  - 构建命令: `npm run build`
  - 发布目录: 由插件自动处理
  - Node.js 版本: 18

## ✅ 环境变量设置（在 Netlify 控制台中）
- [ ] ADMIN_PRIVATE_KEY (敏感信息，不要在代码中硬编码)
- [ ] ETHERSCAN_API_KEY
- [ ] 其他敏感环境变量

## ✅ 部署后验证
- [ ] 网站可正常访问
- [ ] 钱包连接功能正常
- [ ] 合约交互功能正常
- [ ] API 端点响应正常
- [ ] 管理后台功能正常

## ✅ 性能优化
- [ ] 图像已优化
- [ ] 静态资源缓存已配置
- [ ] CDN 缓存已启用
- [ ] Core Web Vitals 分数良好

## 🚨 安全检查
- [ ] 敏感信息未在客户端暴露
- [ ] API 端点有适当的权限验证
- [ ] CORS 配置正确
- [ ] HTTPS 已启用

## 📞 故障排除
如果部署失败：
1. 检查 Netlify 构建日志
2. 验证 package.json 中的依赖
3. 检查 Next.js 配置
4. 验证环境变量设置

---
*此检查清单由自动部署脚本生成*
EOF

    success "部署检查清单已创建: NETLIFY_DEPLOYMENT_CHECKLIST.md"
}

# 主函数
main() {
    show_deployment_info
    check_requirements
    check_environment
    install_dependencies
    run_tests
    build_project
    create_deployment_checklist
    
    # 尝试自动部署（如果有 Netlify CLI）
    if deploy_to_netlify; then
        success "🎉 自动部署完成！"
    else
        show_post_deployment_info
    fi
    
    log "部署流程完成！"
}

# 命令行参数处理
case "${1:-}" in
    --build-only)
        log "仅构建模式..."
        check_requirements
        check_environment
        install_dependencies
        build_project
        success "构建完成！文件位于 .next/ 目录"
        ;;
    --check-only)
        log "仅检查模式..."
        check_requirements
        check_environment
        success "环境检查完成！"
        ;;
    --help|-h)
        echo "Netlify 部署脚本使用方法:"
        echo ""
        echo "  $0              # 完整部署流程"
        echo "  $0 --build-only # 仅构建项目"
        echo "  $0 --check-only # 仅检查环境"
        echo "  $0 --help       # 显示帮助"
        ;;
    *)
        main "$@"
        ;;
esac





