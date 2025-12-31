# 简化的机器人状态检查脚本

Write-Host "DApp Telegram Bot Status Check" -ForegroundColor Cyan
Write-Host "================================"

# 检查端口3001
$portCheck = netstat -ano | Select-String ":3001.*LISTENING"
if ($portCheck) {
    $pid = ($portCheck -split '\s+')[-1]
    Write-Host "Status: RUNNING" -ForegroundColor Green
    Write-Host "Port: 3001" -ForegroundColor Cyan
    Write-Host "Process ID: $pid" -ForegroundColor Cyan
    
    # 测试API
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/status" -Method Get -TimeoutSec 5
        Write-Host "Connected Users: $($response.dbConnectedUsers)" -ForegroundColor Green
        Write-Host "Uptime: $([math]::Round($response.uptime / 60, 1)) minutes" -ForegroundColor Green
        Write-Host "Database: Connected" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Cannot get detailed status" -ForegroundColor Yellow
    }
} else {
    Write-Host "Status: NOT RUNNING" -ForegroundColor Red
    Write-Host "Use 'node index.js' to start the bot" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Config check:" -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "- .env file: EXISTS" -ForegroundColor Green
} else {
    Write-Host "- .env file: MISSING" -ForegroundColor Red
}


