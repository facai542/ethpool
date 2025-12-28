# DApp Telegram机器人管理脚本
# 使用方法: .\manage-bot.ps1 [start|stop|status|restart|logs]

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "status", "restart", "logs", "test")]
    [string]$Action = "status"
)

$BotName = "DApp-Telegram-Bot"
$BotScript = "index.js"
$BotPort = 3001

function Get-BotProcess {
    return Get-Process -Name "node" -ErrorAction SilentlyContinue | 
           Where-Object { $_.ProcessName -eq "node" }
}

function Test-BotPort {
    $portCheck = netstat -ano | Select-String ":$BotPort.*LISTENING"
    return $portCheck -ne $null
}

function Start-Bot {
    Write-Host "🚀 启动Telegram机器人..." -ForegroundColor Green
    
    # 检查是否已经运行
    if (Test-BotPort) {
        Write-Host "⚠️  机器人已在运行 (端口 $BotPort)" -ForegroundColor Yellow
        return
    }
    
    # 检查环境变量
    if (-not (Test-Path ".env")) {
        Write-Host "❌ 错误: .env 配置文件不存在" -ForegroundColor Red
        Write-Host "请先配置 TELEGRAM_BOT_TOKEN 和 TELEGRAM_CHAT_ID" -ForegroundColor Red
        return
    }
    
    # 启动机器人
    Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList $BotScript
    Start-Sleep -Seconds 3
    
    if (Test-BotPort) {
        Write-Host "✅ 机器人启动成功!" -ForegroundColor Green
        Write-Host "📱 Webhook地址: http://localhost:$BotPort" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 机器人启动失败" -ForegroundColor Red
    }
}

function Stop-Bot {
    Write-Host "🛑 停止Telegram机器人..." -ForegroundColor Yellow
    
    # 查找并结束进程
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($process in $processes) {
            $connections = netstat -ano | Select-String ":$BotPort.*$($process.Id)"
            if ($connections) {
                Stop-Process -Id $process.Id -Force
                Write-Host "✅ 机器人进程已停止 (PID: $($process.Id))" -ForegroundColor Green
                return
            }
        }
        Write-Host "⚠️  未找到监听端口 $BotPort 的机器人进程" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  没有找到运行的Node.js进程" -ForegroundColor Yellow
    }
}

function Get-BotStatus {
    Write-Host "📊 DApp Telegram机器人状态" -ForegroundColor Cyan
    Write-Host "=" * 40
    
    # 检查端口状态
    if (Test-BotPort) {
        $portInfo = netstat -ano | Select-String ":$BotPort.*LISTENING"
        $pid = ($portInfo -split '\s+')[-1]
        Write-Host "🟢 状态: 运行中" -ForegroundColor Green
        Write-Host "🔌 端口: $BotPort" -ForegroundColor Cyan
        Write-Host "🆔 进程ID: $pid" -ForegroundColor Cyan
        
        # 尝试获取机器人API状态
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:$BotPort/api/status" -Method Get -TimeoutSec 5
            Write-Host "📈 连接用户: $($response.dbConnectedUsers)" -ForegroundColor Green
            Write-Host "⏰ 运行时间: $([math]::Round($response.uptime / 60, 1)) 分钟" -ForegroundColor Green
            Write-Host "💾 数据库: $(if ($response.databaseConnected) { '✅ 已连接' } else { '❌ 断开' })" -ForegroundColor $(if ($response.databaseConnected) { 'Green' } else { 'Red' })
        } catch {
            Write-Host "⚠️  无法获取详细状态 (API可能未响应)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "🔴 状态: 未运行" -ForegroundColor Red
        Write-Host "💡 使用 '.\manage-bot.ps1 start' 启动机器人" -ForegroundColor Cyan
    }
    
    # 检查配置文件
    if (Test-Path ".env") {
        Write-Host "⚙️  配置: .env 文件存在" -ForegroundColor Green
    } else {
        Write-Host "⚙️  配置: ❌ .env 文件缺失" -ForegroundColor Red
    }
}

function Restart-Bot {
    Write-Host "🔄 重启Telegram机器人..." -ForegroundColor Cyan
    Stop-Bot
    Start-Sleep -Seconds 2
    Start-Bot
}

function Test-Bot {
    Write-Host "🧪 测试机器人功能..." -ForegroundColor Cyan
    
    if (-not (Test-BotPort)) {
        Write-Host "❌ 机器人未运行，请先启动" -ForegroundColor Red
        return
    }
    
    try {
        # 测试状态API
        Write-Host "1. 测试状态API..." -ForegroundColor Yellow
        $status = Invoke-RestMethod -Uri "http://localhost:$BotPort/api/status" -Method Get
        Write-Host "   ✅ 状态API正常" -ForegroundColor Green
        
        # 测试用户连接Webhook
        Write-Host "2. 测试用户连接Webhook..." -ForegroundColor Yellow
        $testData = @{
            address = "0x1234567890123456789012345678901234567890"
            action = "connect"
            timestamp = (Get-Date).ToString("o")
        }
        $response = Invoke-RestMethod -Uri "http://localhost:$BotPort/webhook/user-connect" -Method Post -Body ($testData | ConvertTo-Json) -ContentType "application/json"
        Write-Host "   ✅ 用户连接Webhook正常" -ForegroundColor Green
        
        Write-Host "🎉 所有测试通过！" -ForegroundColor Green
        Write-Host "💡 请检查Telegram群组是否收到测试消息" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ 测试失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host "📋 查看机器人日志 (按 Ctrl+C 退出)" -ForegroundColor Cyan
    Write-Host "=" * 40
    
    if (Test-BotPort) {
        Write-Host "⚠️  机器人正在后台运行，无法显示实时日志" -ForegroundColor Yellow
        Write-Host "💡 建议停止机器人后重新以前台模式启动：" -ForegroundColor Cyan
        Write-Host "   .\manage-bot.ps1 stop" -ForegroundColor White
        Write-Host "   node index.js" -ForegroundColor White
    } else {
        Write-Host "🔴 机器人未运行" -ForegroundColor Red
    }
}

# 主逻辑
switch ($Action.ToLower()) {
    "start" { Start-Bot }
    "stop" { Stop-Bot }
    "status" { Get-BotStatus }
    "restart" { Restart-Bot }
    "test" { Test-Bot }
    "logs" { Show-Logs }
    default { 
        Write-Host "使用方法: .\manage-bot.ps1 [start|stop|status|restart|test|logs]" -ForegroundColor Yellow
        Get-BotStatus
    }
}


