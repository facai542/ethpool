# 测试 Webhook URL 是否可以从外网访问
$webhookUrl = "https://ethmax.vercel.app/api/moralis/webhook"

Write-Host "测试 Webhook URL 可访问性"
Write-Host "=" * 60
Write-Host "URL: $webhookUrl"
Write-Host ""

try {
    $body = @{
        test = $true
        message = "Test from PowerShell"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri $webhookUrl -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ Webhook URL 可访问"
    Write-Host "状态码: $($response.StatusCode)"
    Write-Host "响应内容: $($response.Content)"
} catch {
    Write-Host "❌ Webhook URL 无法访问"
    Write-Host "错误: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "状态码: $statusCode"
    }
}

Write-Host ""
Write-Host "如果无法访问，可能的原因："
Write-Host "1. Vercel 项目未部署或已暂停"
Write-Host "2. API 路由文件未部署"
Write-Host "3. 域名配置错误"


