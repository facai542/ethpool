# Supabase 数据库导出脚本 (PowerShell)
# 使用方法: .\export_database.ps1

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
$OUTPUT_PATH = Join-Path $OUTPUT_DIR $TIMESTAMP
New-Item -ItemType Directory -Force -Path $OUTPUT_PATH | Out-Null
Write-Host "`n输出目录: $OUTPUT_PATH" -ForegroundColor Cyan

# ============================================
# 设置密码环境变量
# ============================================
$env:PGPASSWORD = $DB_PASSWORD_PLAIN

# ============================================
# 导出表结构
# ============================================
Write-Host "`n[1/2] 正在导出表结构..." -ForegroundColor Cyan
$SCHEMA_FILE = Join-Path $OUTPUT_PATH "create_all_tables.sql"

try {
    pg_dump -h "db.$PROJECT_REF.supabase.co" `
            -U postgres `
            -d postgres `
            --schema-only `
            --no-owner `
            --no-privileges `
            -t 'public.*' `
            -f $SCHEMA_FILE
    
    if (Test-Path $SCHEMA_FILE) {
        $fileSize = (Get-Item $SCHEMA_FILE).Length / 1KB
        Write-Host "✓ 表结构导出成功: $SCHEMA_FILE ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
    } else {
        throw "文件未创建"
    }
} catch {
    Write-Host "✗ 表结构导出失败: $_" -ForegroundColor Red
    exit 1
}

# ============================================
# 导出数据
# ============================================
Write-Host "`n[2/2] 正在导出数据..." -ForegroundColor Cyan
$DATA_FILE = Join-Path $OUTPUT_PATH "all_tables_data.sql"

try {
    pg_dump -h "db.$PROJECT_REF.supabase.co" `
            -U postgres `
            -d postgres `
            --data-only `
            --no-owner `
            --no-privileges `
            -t 'public.*' `
            -f $DATA_FILE
    
    if (Test-Path $DATA_FILE) {
        $fileSize = (Get-Item $DATA_FILE).Length / 1MB
        Write-Host "✓ 数据导出成功: $DATA_FILE ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
    } else {
        throw "文件未创建"
    }
} catch {
    Write-Host "✗ 数据导出失败: $_" -ForegroundColor Red
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
Write-Host "`n文件位置:" -ForegroundColor Cyan
Write-Host "  表结构: $SCHEMA_FILE" -ForegroundColor White
Write-Host "  数据:   $DATA_FILE" -ForegroundColor White
Write-Host "`n下一步:" -ForegroundColor Cyan
Write-Host "  1. 在目标 Supabase 项目中执行表结构文件" -ForegroundColor White
Write-Host "  2. 然后导入数据文件" -ForegroundColor White




