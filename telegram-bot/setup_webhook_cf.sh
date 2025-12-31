#!/bin/bash

# Cloudflare Workers Webhook 设置脚本

echo "设置 Telegram Bot Webhook 到 Cloudflare Workers"
echo "=============================================="

# 从环境变量或参数获取
BOT_TOKEN=${1:-$BOT_TOKEN}
WORKER_URL=${2:-$WORKER_URL}
SECRET_TOKEN=${3:-$WEBHOOK_SECRET}

if [ -z "$BOT_TOKEN" ] || [ -z "$WORKER_URL" ]; then
    echo "错误: 需要提供 BOT_TOKEN 和 WORKER_URL"
    echo "用法: ./setup_webhook_cf.sh <BOT_TOKEN> <WORKER_URL> [SECRET_TOKEN]"
    exit 1
fi

# 如果没有提供 SECRET_TOKEN，生成一个随机字符串
if [ -z "$SECRET_TOKEN" ]; then
    SECRET_TOKEN=$(openssl rand -hex 16)
    echo "生成的 Webhook Secret: $SECRET_TOKEN"
    echo "请将此值设置为 Cloudflare Workers 的环境变量 WEBHOOK_SECRET"
fi

# 设置 Webhook
echo "正在设置 Webhook..."
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${WORKER_URL}/webhook\",
    \"secret_token\": \"${SECRET_TOKEN}\",
    \"allowed_updates\": [\"message\", \"callback_query\"],
    \"drop_pending_updates\": true
  }")

echo "$RESPONSE" | python3 -m json.tool

# 检查 Webhook 信息
echo ""
echo "检查 Webhook 信息..."
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool

echo ""
echo "完成！"
echo "如果设置成功，Webhook URL 应该是: ${WORKER_URL}/webhook"



