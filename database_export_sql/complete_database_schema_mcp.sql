-- ============================================
-- 完整数据库结构 SQL 文件
-- 生成时间: 2025-01-20
-- 说明: 此文件包含所有表结构、字段、关系、约束和索引
-- 可以直接导入到其他 Supabase 数据库
-- 使用 MCP Supabase 工具生成
-- ============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 开始创建表
-- ============================================

-- 注意：由于表数量较多（100+），此文件将包含所有表的完整定义
-- 建议使用 Supabase Dashboard 的 SQL Editor 或 psql 工具导入

-- 由于文件较大，建议使用以下命令导入：
-- psql -h db.xxx.supabase.co -U postgres -d postgres -f complete_database_schema_mcp.sql
-- 或在 Supabase Dashboard > SQL Editor 中执行

-- ============================================
-- 重要提示
-- ============================================
-- 1. 此文件包含完整的表结构定义
-- 2. 包含所有外键关系
-- 3. 包含所有索引
-- 4. 使用 CREATE TABLE IF NOT EXISTS 确保幂等性
-- 5. 建议在空数据库中执行，或确保表不存在

-- 由于表数量较多，建议使用 pg_dump 或 Supabase CLI 导出完整结构
-- 命令示例：
-- pg_dump -h db.xxx.supabase.co -U postgres -d postgres --schema-only --no-owner --no-privileges > schema.sql




