# Telegram Webhook 设置脚本 (PowerShell)
# 使用方法: .\scripts\setup-telegram-webhook.ps1

# 读取 .env 文件
$envFile = ".env"
$envLocalFile = ".env.local"

function Read-EnvFile {
    param($FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "📄 读取环境变量文件: $FilePath" -ForegroundColor Green
        Get-Content $FilePath | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
}

# 读取环境变量
Read-EnvFile $envFile
Read-EnvFile $envLocalFile

# 获取环境变量
$BOT_TOKEN = $env:TELEGRAM_BOT_TOKEN
$APP_URL = if ($env:NEXT_PUBLIC_APP_URL) { $env:NEXT_PUBLIC_APP_URL } else { "https://ethmax.vercel.app" }
$WEBHOOK_URL = "$APP_URL/api/telegram/webhook"

if (-not $BOT_TOKEN) {
    Write-Host "`n❌ 错误: 未找到 TELEGRAM_BOT_TOKEN" -ForegroundColor Red
    Write-Host "`n请选择以下任一方式:" -ForegroundColor Yellow
    Write-Host "1. 确保项目根目录有 .env 或 .env.local 文件" -ForegroundColor Cyan
    Write-Host "2. 在 PowerShell 中临时设置:" -ForegroundColor Cyan
    Write-Host '   $env:TELEGRAM_BOT_TOKEN="你的Token"' -ForegroundColor White
    Write-Host '   node scripts/setup-telegram-webhook.js set' -ForegroundColor White
    Write-Host "3. 直接传递参数运行 Node.js 脚本:" -ForegroundColor Cyan
    Write-Host '   node scripts/setup-telegram-webhook.js set YOUR_BOT_TOKEN https://your-domain.com' -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "`n🔧 开始设置 Telegram Webhook...`n" -ForegroundColor Green
Write-Host "📡 Webhook URL: $WEBHOOK_URL" -ForegroundColor Cyan
Write-Host "🤖 Bot Token: $($BOT_TOKEN.Substring(0, 10))...`n" -ForegroundColor Cyan

# 设置 Webhook
$body = @{
    url = $WEBHOOK_URL
    allowed_updates = @("message", "callback_query")
    drop_pending_updates = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    if ($response.ok) {
        Write-Host "✅ Webhook 设置成功!`n" -ForegroundColor Green
        Write-Host "设置详情:" -ForegroundColor Yellow
        Write-Host "  - URL: $WEBHOOK_URL" -ForegroundColor White
        Write-Host "  - 允许的更新: message, callback_query" -ForegroundColor White
        Write-Host "  - 清空待处理更新: 是`n" -ForegroundColor White
        
        # 查询当前状态
        Write-Host "📊 查询 Webhook 信息...`n" -ForegroundColor Green
        $infoResponse = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo" -Method Get
        
        if ($infoResponse.ok) {
            Write-Host "当前 Webhook 信息:" -ForegroundColor Yellow
            Write-Host "  - URL: $($infoResponse.result.url)" -ForegroundColor White
            Write-Host "  - 待处理更新: $($infoResponse.result.pending_update_count)" -ForegroundColor White
            if ($infoResponse.result.last_error_message) {
                Write-Host "  - 最后错误: $($infoResponse.result.last_error_message)" -ForegroundColor Red
            } else {
                Write-Host "  - 最后错误: (无)" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "❌ Webhook 设置失败: $($response.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 设置 Webhook 时出错: $_" -ForegroundColor Red
}

Write-Host ""










