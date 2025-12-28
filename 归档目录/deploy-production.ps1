Write-Host "🚀 开始部署到生产环境..." -ForegroundColor Green

# 1. 停止现有服务
Write-Host "📋 1. 停止现有服务" -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*telegram-bot*" -or $_.CommandLine -like "*blockchain-monitor*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. 切换到telegram-bot目录
Write-Host "📋 2. 切换到telegram-bot目录" -ForegroundColor Yellow
Set-Location telegram-bot

# 3. 安装依赖
Write-Host "📋 3. 安装依赖" -ForegroundColor Yellow
npm install

# 4. 启动Telegram Bot服务
Write-Host "📋 4. 启动Telegram Bot服务" -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "index.js" -WindowStyle Hidden -RedirectStandardOutput "telegram-bot.log" -RedirectStandardError "telegram-bot-error.log"

# 5. 启动区块链监听服务
Write-Host "📋 5. 启动区块链监听服务" -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "blockchain-monitor.js" -WindowStyle Hidden -RedirectStandardOutput "blockchain-monitor.log" -RedirectStandardError "blockchain-monitor-error.log"

# 6. 等待服务启动
Write-Host "📋 6. 等待服务启动" -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 7. 检查服务状态
Write-Host "📋 7. 检查服务状态" -ForegroundColor Yellow
$telegramProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*index.js*" }
$blockchainProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*blockchain-monitor.js*" }

if ($telegramProcesses) {
    Write-Host "✅ Telegram Bot 服务运行中 (PID: $($telegramProcesses[0].Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Telegram Bot 服务启动失败" -ForegroundColor Red
}

if ($blockchainProcesses) {
    Write-Host "✅ 区块链监听服务运行中 (PID: $($blockchainProcesses[0].Id))" -ForegroundColor Green
} else {
    Write-Host "❌ 区块链监听服务启动失败" -ForegroundColor Red
}

# 8. 显示日志
Write-Host "📋 8. 显示最新日志" -ForegroundColor Yellow
if (Test-Path "telegram-bot.log") {
    Write-Host "=== Telegram Bot 日志 ===" -ForegroundColor Cyan
    Get-Content "telegram-bot.log" -Tail 10
}

if (Test-Path "blockchain-monitor.log") {
    Write-Host "=== 区块链监听日志 ===" -ForegroundColor Cyan
    Get-Content "blockchain-monitor.log" -Tail 10
}

Write-Host "🎉 部署完成!" -ForegroundColor Green
Write-Host "📊 服务状态:" -ForegroundColor Yellow
Write-Host "- Telegram Bot: $($telegramProcesses.Count) 个进程" -ForegroundColor White
Write-Host "- 区块链监听: $($blockchainProcesses.Count) 个进程" -ForegroundColor White


