@echo off
REM Cloudflare Workers Webhook 设置脚本 (Windows)

echo 设置 Telegram Bot Webhook 到 Cloudflare Workers
echo ==============================================

setlocal enabledelayedexpansion

REM 从参数获取
set BOT_TOKEN=%1
set WORKER_URL=%2
set SECRET_TOKEN=%3

if "%BOT_TOKEN%"=="" (
    echo 错误: 需要提供 BOT_TOKEN
    echo 用法: setup_webhook_cf.bat ^<BOT_TOKEN^> ^<WORKER_URL^> [SECRET_TOKEN]
    exit /b 1
)

if "%WORKER_URL%"=="" (
    echo 错误: 需要提供 WORKER_URL
    echo 用法: setup_webhook_cf.bat ^<BOT_TOKEN^> ^<WORKER_URL^> [SECRET_TOKEN]
    exit /b 1
)

REM 如果没有提供 SECRET_TOKEN，使用默认值
if "%SECRET_TOKEN%"=="" (
    set SECRET_TOKEN=change-this-secret-token
    echo 警告: 使用默认 Secret Token，建议设置一个随机字符串
)

REM 设置 Webhook
echo 正在设置 Webhook...
curl -X POST "https://api.telegram.org/bot%BOT_TOKEN%/setWebhook" ^
  -H "Content-Type: application/json" ^
  -d "{\"url\": \"%WORKER_URL%/webhook\", \"secret_token\": \"%SECRET_TOKEN%\", \"allowed_updates\": [\"message\", \"callback_query\"], \"drop_pending_updates\": true}"

echo.
echo 检查 Webhook 信息...
curl -s "https://api.telegram.org/bot%BOT_TOKEN%/getWebhookInfo"

echo.
echo 完成！
echo 如果设置成功，Webhook URL 应该是: %WORKER_URL%/webhook

endlocal



