#!/bin/bash
# Supabase 数据库导出脚本 (Bash)
# 使用方法: ./export_database.sh

# ============================================
# 配置区域 - 请修改以下信息
# ============================================
PROJECT_REF="bfcpimnfgidhgigtgehs"
OUTPUT_DIR="database_export_sql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# ============================================
# 检查 pg_dump 是否安装
# ============================================
echo "检查 pg_dump 是否安装..."
if ! command -v pg_dump &> /dev/null; then
    echo "✗ 错误: 未找到 pg_dump 命令"
    echo "请先安装 PostgreSQL 客户端工具:"
    echo "  Mac:   brew install postgresql"
    echo "  Linux: sudo apt-get install postgresql-client"
    exit 1
fi

echo "✓ pg_dump 已安装: $(pg_dump --version)"

# ============================================
# 获取数据库密码
# ============================================
read -sp "请输入数据库密码: " DB_PASSWORD
echo ""

# ============================================
# 创建输出目录
# ============================================
OUTPUT_PATH="$OUTPUT_DIR/$TIMESTAMP"
mkdir -p "$OUTPUT_PATH"
echo "输出目录: $OUTPUT_PATH"

# ============================================
# 设置密码环境变量
# ============================================
export PGPASSWORD="$DB_PASSWORD"

# ============================================
# 导出表结构
# ============================================
echo ""
echo "[1/2] 正在导出表结构..."
SCHEMA_FILE="$OUTPUT_PATH/create_all_tables.sql"

if pg_dump -h "db.$PROJECT_REF.supabase.co" \
           -U postgres \
           -d postgres \
           --schema-only \
           --no-owner \
           --no-privileges \
           -t 'public.*' \
           -f "$SCHEMA_FILE"; then
    
    if [ -f "$SCHEMA_FILE" ]; then
        FILE_SIZE=$(du -h "$SCHEMA_FILE" | cut -f1)
        echo "✓ 表结构导出成功: $SCHEMA_FILE ($FILE_SIZE)"
    else
        echo "✗ 错误: 文件未创建"
        exit 1
    fi
else
    echo "✗ 表结构导出失败"
    exit 1
fi

# ============================================
# 导出数据
# ============================================
echo ""
echo "[2/2] 正在导出数据..."
DATA_FILE="$OUTPUT_PATH/all_tables_data.sql"

if pg_dump -h "db.$PROJECT_REF.supabase.co" \
           -U postgres \
           -d postgres \
           --data-only \
           --no-owner \
           --no-privileges \
           -t 'public.*' \
           -f "$DATA_FILE"; then
    
    if [ -f "$DATA_FILE" ]; then
        FILE_SIZE=$(du -h "$DATA_FILE" | cut -f1)
        echo "✓ 数据导出成功: $DATA_FILE ($FILE_SIZE)"
    else
        echo "✗ 错误: 文件未创建"
        exit 1
    fi
else
    echo "✗ 数据导出失败"
    exit 1
fi

# ============================================
# 清理密码
# ============================================
unset PGPASSWORD

# ============================================
# 完成
# ============================================
echo ""
echo "============================================================"
echo "✓ 导出完成！"
echo "============================================================"
echo ""
echo "文件位置:"
echo "  表结构: $SCHEMA_FILE"
echo "  数据:   $DATA_FILE"
echo ""
echo "下一步:"
echo "  1. 在目标 Supabase 项目中执行表结构文件"
echo "  2. 然后导入数据文件"




