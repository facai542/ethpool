# 测试 Supabase 数据库连接脚本
# 用于诊断网络和 DNS 问题

$PROJECT_REF = "bfcpimnfgidhgigtgehs"
$HOST = "db.$PROJECT_REF.supabase.co"
$PORT = 5432

Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Supabase 数据库连接诊断" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# 1. 测试 DNS 解析
Write-Host "[1/5] 测试 DNS 解析..." -ForegroundColor Yellow
try {
    $ipAddresses = [System.Net.Dns]::GetHostAddresses($HOST)
    Write-Host "✓ DNS 解析成功" -ForegroundColor Green
    Write-Host "  主机名: $HOST" -ForegroundColor White
    foreach ($ip in $ipAddresses) {
        Write-Host "  IP 地址: $($ip.IPAddressToString)" -ForegroundColor White
    }
} catch {
    Write-Host "✗ DNS 解析失败: $_" -ForegroundColor Red
    Write-Host "  可能的原因:" -ForegroundColor Yellow
    Write-Host "    - 网络连接问题" -ForegroundColor White
    Write-Host "    - DNS 服务器问题" -ForegroundColor White
    Write-Host "    - 防火墙阻止 DNS 查询" -ForegroundColor White
    Write-Host "    - 主机名可能已更改" -ForegroundColor White
    Write-Host ""
    Write-Host "  建议解决方案:" -ForegroundColor Yellow
    Write-Host "    1. 检查网络连接" -ForegroundColor White
    Write-Host "    2. 尝试刷新 DNS: ipconfig /flushdns" -ForegroundColor White
    Write-Host "    3. 检查防火墙设置" -ForegroundColor White
    Write-Host "    4. 尝试使用 VPN 或更换网络" -ForegroundColor White
    exit 1
}

Write-Host ""

# 2. 测试端口连接
Write-Host "[2/5] 测试端口连接 ($PORT)..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connect = $tcpClient.BeginConnect($HOST, $PORT, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(5000, $false)
    
    if ($wait) {
        $tcpClient.EndConnect($connect)
        Write-Host "✓ 端口连接成功" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        throw "连接超时"
    }
} catch {
    Write-Host "✗ 端口连接失败: $_" -ForegroundColor Red
    Write-Host "  可能的原因:" -ForegroundColor Yellow
    Write-Host "    - 防火墙阻止连接" -ForegroundColor White
    Write-Host "    - 网络代理问题" -ForegroundColor White
    Write-Host "    - Supabase 服务器暂时不可用" -ForegroundColor White
}

Write-Host ""

# 3. 测试 ping
Write-Host "[3/5] 测试 ping..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName $HOST -Count 2 -ErrorAction Stop
    Write-Host "✓ Ping 成功" -ForegroundColor Green
    foreach ($result in $ping) {
        Write-Host "  响应时间: $($result.ResponseTime)ms" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Ping 失败: $_" -ForegroundColor Red
    Write-Host "  注意: 某些服务器可能禁用了 ICMP，这不一定表示连接失败" -ForegroundColor Yellow
}

Write-Host ""

# 4. 测试 PostgreSQL 连接
Write-Host "[4/5] 测试 PostgreSQL 连接..." -ForegroundColor Yellow
try {
    $pgdumpVersion = pg_dump --version 2>&1
    Write-Host "✓ pg_dump 可用: $pgdumpVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ pg_dump 不可用" -ForegroundColor Red
    Write-Host "  请先安装 PostgreSQL 客户端工具" -ForegroundColor Yellow
}

Write-Host ""

# 5. 尝试使用 IP 地址连接（如果 DNS 解析成功）
Write-Host "[5/5] 尝试使用 IP 地址连接..." -ForegroundColor Yellow
if ($ipAddresses) {
    $firstIP = $ipAddresses[0].IPAddressToString
    Write-Host "  使用 IP: $firstIP" -ForegroundColor White
    
    $DB_PASSWORD = Read-Host "请输入数据库密码" -AsSecureString
    $DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
    )
    $env:PGPASSWORD = $DB_PASSWORD_PLAIN
    
    Write-Host "  测试连接..." -ForegroundColor White
    try {
        # 使用 psql 测试连接（如果可用）
        $testQuery = "SELECT version();" | psql -h $firstIP -U postgres -d postgres -t -A 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ 使用 IP 地址连接成功" -ForegroundColor Green
            Write-Host "  建议: 在脚本中使用 IP 地址代替主机名" -ForegroundColor Yellow
        } else {
            Write-Host "✗ 使用 IP 地址连接失败" -ForegroundColor Red
            Write-Host "  错误: $testQuery" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ 无法测试连接: $_" -ForegroundColor Red
        Write-Host "  提示: 可以尝试手动运行以下命令:" -ForegroundColor Yellow
        Write-Host "  psql -h $firstIP -U postgres -d postgres" -ForegroundColor White
    }
    
    $env:PGPASSWORD = $null
    $DB_PASSWORD_PLAIN = $null
} else {
    Write-Host "  跳过: DNS 解析失败，无法获取 IP 地址" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "诊断完成" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

