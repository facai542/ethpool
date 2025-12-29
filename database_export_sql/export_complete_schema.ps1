# 导出完整数据库结构脚本 (PowerShell)
# 使用 pg_dump 导出所有表、字段、关系、约束和索引

# ============================================
# 配置区域 - 请修改以下信息
# ============================================
$PROJECT_REF = "bfcpimnfgidhgigtgehs"
$DB_PASSWORD = Read-Host "请输入数据库密码" -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
)
$OUTPUT_DIR = "database_export_sql"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$OUTPUT_FILE = Join-Path $OUTPUT_DIR "complete_database_schema_$TIMESTAMP.sql"

# ============================================
# 检查 pg_dump 是否安装
# ============================================
Write-Host "检查 pg_dump 是否安装..." -ForegroundColor Cyan
try {
    $pgdumpVersion = pg_dump --version 2>&1
    Write-Host "✓ pg_dump 已安装: $pgdumpVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误: 未找到 pg_dump 命令" -ForegroundColor Red
    Write-Host "请先安装 PostgreSQL 客户端工具:" -ForegroundColor Yellow
    Write-Host "  choco install postgresql" -ForegroundColor Yellow
    Write-Host "  或访问: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# ============================================
# 创建输出目录
# ============================================
New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null
Write-Host "`n输出文件: $OUTPUT_FILE" -ForegroundColor Cyan

# ============================================
# 测试 DNS 解析和确定连接主机
# ============================================
$DB_HOST = "db.$PROJECT_REF.supabase.co"
Write-Host "`n检查数据库连接..." -ForegroundColor Cyan

try {
    $ipAddresses = [System.Net.Dns]::GetHostAddresses($DB_HOST)
    Write-Host "✓ DNS 解析成功: $DB_HOST -> $($ipAddresses[0].IPAddressToString)" -ForegroundColor Green
    $USE_IP = $false
} catch {
    Write-Host "✗ DNS 解析失败: $_" -ForegroundColor Red
    Write-Host "  尝试刷新 DNS 缓存..." -ForegroundColor Yellow
    try {
        ipconfig /flushdns | Out-Null
        Start-Sleep -Seconds 2
        $ipAddresses = [System.Net.Dns]::GetHostAddresses($DB_HOST)
        Write-Host "✓ DNS 刷新后解析成功" -ForegroundColor Green
        $USE_IP = $false
    } catch {
        Write-Host "✗ DNS 仍然无法解析" -ForegroundColor Red
        Write-Host "  提示: 请检查网络连接或运行 .\test_connection.ps1 进行详细诊断" -ForegroundColor Yellow
        Write-Host "  如果问题持续，可能需要:" -ForegroundColor Yellow
        Write-Host "    - 检查防火墙设置" -ForegroundColor White
        Write-Host "    - 检查代理设置" -ForegroundColor White
        Write-Host "    - 尝试使用 VPN" -ForegroundColor White
        Write-Host "    - 联系网络管理员" -ForegroundColor White
        exit 1
    }
}

# ============================================
# 设置密码环境变量
# ============================================
$env:PGPASSWORD = $DB_PASSWORD_PLAIN

# ============================================
# 导出完整数据库结构
# ============================================
Write-Host "`n正在导出完整数据库结构..." -ForegroundColor Cyan
Write-Host "这包括:" -ForegroundColor Yellow
Write-Host "  - 所有表的 CREATE TABLE 语句" -ForegroundColor White
Write-Host "  - 所有字段及其数据类型、约束、默认值" -ForegroundColor White
Write-Host "  - 所有主键定义" -ForegroundColor White
Write-Host "  - 所有外键关系" -ForegroundColor White
Write-Host "  - 所有索引" -ForegroundColor White
Write-Host "  - 所有序列" -ForegroundColor White
Write-Host ""

$exportSuccess = $false
$lastError = ""

# 首先尝试使用主机名连接
try {
    Write-Host "尝试使用主机名连接: $DB_HOST" -ForegroundColor Yellow
    pg_dump -h $DB_HOST `
            -U postgres `
            -d postgres `
            --schema-only `
            --no-owner `
            --no-privileges `
            --no-tablespaces `
            -t 'public.*' `
            -f $OUTPUT_FILE 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $OUTPUT_FILE)) {
        $exportSuccess = $true
    } else {
        $lastError = "使用主机名连接失败 (退出代码: $LASTEXITCODE)"
    }
} catch {
    $lastError = "使用主机名连接异常: $_"
}

# 如果主机名连接失败，尝试使用 IP 地址
if (-not $exportSuccess -and $ipAddresses) {
    $ipAddress = $ipAddresses[0].IPAddressToString
    Write-Host "`n尝试使用 IP 地址连接: $ipAddress" -ForegroundColor Yellow
    try {
        Remove-Item $OUTPUT_FILE -ErrorAction SilentlyContinue
        pg_dump -h $ipAddress `
                -U postgres `
                -d postgres `
                --schema-only `
                --no-owner `
                --no-privileges `
                --no-tablespaces `
                -t 'public.*' `
                -f $OUTPUT_FILE 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0 -and (Test-Path $OUTPUT_FILE)) {
            $exportSuccess = $true
            Write-Host "✓ 使用 IP 地址连接成功" -ForegroundColor Green
        } else {
            $lastError = "使用 IP 地址连接也失败 (退出代码: $LASTEXITCODE)"
        }
    } catch {
        $lastError = "使用 IP 地址连接异常: $_"
    }
}

if (-not $exportSuccess) {
    Write-Host "✗ 导出失败: $lastError" -ForegroundColor Red
    Write-Host "`n故障排除建议:" -ForegroundColor Yellow
    Write-Host "  1. 运行诊断脚本: .\test_connection.ps1" -ForegroundColor White
    Write-Host "  2. 检查网络连接和防火墙设置" -ForegroundColor White
    Write-Host "  3. 验证数据库密码是否正确" -ForegroundColor White
    Write-Host "  4. 检查 Supabase 项目状态" -ForegroundColor White
    $env:PGPASSWORD = $null
    $DB_PASSWORD_PLAIN = $null
    exit 1
}

# 导出成功，显示统计信息
if (Test-Path $OUTPUT_FILE) {
    $fileSize = (Get-Item $OUTPUT_FILE).Length / 1KB
    Write-Host "✓ 数据库结构导出成功!" -ForegroundColor Green
    Write-Host "  文件: $OUTPUT_FILE" -ForegroundColor White
    Write-Host "  大小: $([math]::Round($fileSize, 2)) KB" -ForegroundColor White
    
    # 统计信息
    $content = Get-Content $OUTPUT_FILE -Raw
    $tableCount = ([regex]::Matches($content, "CREATE TABLE", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
    $fkCount = ([regex]::Matches($content, "FOREIGN KEY", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
    $indexCount = ([regex]::Matches($content, "CREATE.*INDEX", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
    
    Write-Host "`n统计信息:" -ForegroundColor Cyan
    Write-Host "  表数量: $tableCount" -ForegroundColor White
    Write-Host "  外键数量: $fkCount" -ForegroundColor White
    Write-Host "  索引数量: $indexCount" -ForegroundColor White
} else {
    Write-Host "✗ 导出失败: 文件未创建" -ForegroundColor Red
    $env:PGPASSWORD = $null
    $DB_PASSWORD_PLAIN = $null
    exit 1
}

# ============================================
# 清理密码
# ============================================
$env:PGPASSWORD = $null
$DB_PASSWORD_PLAIN = $null

# ============================================
# 完成
# ============================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Green
Write-Host "✓ 导出完成！" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host "`n下一步:" -ForegroundColor Cyan
Write-Host "  1. 检查生成的 SQL 文件" -ForegroundColor White
Write-Host "  2. 在目标 Supabase 项目中执行此文件" -ForegroundColor White
Write-Host "  3. 验证所有表、关系、索引都已正确创建" -ForegroundColor White
Write-Host "`n导入方法:" -ForegroundColor Cyan
Write-Host "  - Supabase Dashboard > SQL Editor" -ForegroundColor White
Write-Host "  - psql -h db.xxx.supabase.co -U postgres -d postgres -f $OUTPUT_FILE" -ForegroundColor White


