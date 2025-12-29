#!/bin/bash

# TRON 测试网络节点快速设置脚本

echo "🚀 TRON 测试网络节点设置脚本"
echo "=================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未检测到 Docker，请先安装 Docker"
    echo "   访问: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: 未检测到 Docker Compose，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 选择部署方式
echo "请选择部署方式:"
echo "1) 使用 Docker 运行本地 TRON 节点（推荐）"
echo "2) 仅安装依赖，使用公共测试网络"
read -p "请输入选项 (1 或 2): " choice

case $choice in
    1)
        echo ""
        echo "📦 正在启动本地 TRON 节点..."
        docker-compose -f docker-compose.tron.yml up -d
        
        echo ""
        echo "⏳ 等待节点启动（约 30 秒）..."
        sleep 30
        
        echo ""
        echo "🔍 检查节点状态..."
        if curl -s http://localhost:8090/wallet/getnowblock > /dev/null; then
            echo "✅ 节点启动成功！"
            echo ""
            echo "📍 节点信息:"
            echo "   - HTTP API: http://localhost:8090"
            echo "   - gRPC API: http://localhost:8091"
            echo ""
            echo "💡 查看日志: docker logs -f tron-testnet-node"
            echo "💡 停止节点: docker-compose -f docker-compose.tron.yml down"
        else
            echo "⚠️  节点可能还在启动中，请稍后运行:"
            echo "   curl http://localhost:8090/wallet/getnowblock"
        fi
        ;;
    2)
        echo ""
        echo "📦 仅安装依赖..."
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

# 安装 Node.js 依赖
echo ""
echo "📦 检查 Node.js 依赖..."

if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到 package.json"
    exit 1
fi

# 检查是否已安装 tronweb
if grep -q "tronweb" package.json; then
    echo "✅ tronweb 已在 package.json 中"
else
    echo "📥 安装 tronweb..."
    npm install tronweb --save
fi

echo ""
echo "✅ 设置完成！"
echo ""
echo "📚 下一步:"
echo "   1. 运行测试: node scripts/test-tron.js shasta"
echo "   2. 查看文档: cat TRON_TESTNET_SETUP.md"
echo ""

