#!/bin/bash

echo "🚀 开始部署到生产环境..."

# 1. 停止现有服务
echo "📋 1. 停止现有服务"
pkill -f "node.*telegram-bot" || true
pkill -f "node.*blockchain-monitor" || true

# 2. 更新代码
echo "📋 2. 更新代码"
git pull origin main || echo "⚠️ Git pull 失败，继续部署"

# 3. 安装依赖
echo "📋 3. 安装依赖"
cd telegram-bot
npm install

# 4. 启动Telegram Bot服务
echo "📋 4. 启动Telegram Bot服务"
nohup node index.js > telegram-bot.log 2>&1 &
echo $! > telegram-bot.pid

# 5. 启动区块链监听服务
echo "📋 5. 启动区块链监听服务"
nohup node blockchain-monitor.js > blockchain-monitor.log 2>&1 &
echo $! > blockchain-monitor.pid

# 6. 等待服务启动
echo "📋 6. 等待服务启动"
sleep 5

# 7. 检查服务状态
echo "📋 7. 检查服务状态"
if ps -p $(cat telegram-bot.pid 2>/dev/null) > /dev/null 2>&1; then
    echo "✅ Telegram Bot 服务运行中 (PID: $(cat telegram-bot.pid))"
else
    echo "❌ Telegram Bot 服务启动失败"
fi

if ps -p $(cat blockchain-monitor.pid 2>/dev/null) > /dev/null 2>&1; then
    echo "✅ 区块链监听服务运行中 (PID: $(cat blockchain-monitor.pid))"
else
    echo "❌ 区块链监听服务启动失败"
fi

# 8. 显示日志
echo "📋 8. 显示最新日志"
echo "=== Telegram Bot 日志 ==="
tail -n 10 telegram-bot.log 2>/dev/null || echo "无日志文件"

echo "=== 区块链监听日志 ==="
tail -n 10 blockchain-monitor.log 2>/dev/null || echo "无日志文件"

echo "🎉 部署完成!"
echo "📊 服务状态:"
echo "- Telegram Bot: $(cat telegram-bot.pid 2>/dev/null || echo '未运行')"
echo "- 区块链监听: $(cat blockchain-monitor.pid 2>/dev/null || echo '未运行')"


