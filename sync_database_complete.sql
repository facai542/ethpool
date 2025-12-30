-- ============================================
-- 数据库完整同步脚本
-- 从数据库1 (bfcpimnfgidhgigtgehs) 同步到数据库2
-- 生成时间: 2025-01-XX
-- 
-- 注意：
-- 1. 此脚本包含所有表、字段、约束、索引、函数、触发器、RLS策略
-- 2. 执行前请先备份数据库2
-- 3. 建议在测试环境先验证
-- ============================================

-- ============================================
-- 第一部分：创建扩展（如果需要）
-- ============================================

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 第二部分：创建所有表
-- ============================================

-- 注意：由于表数量众多（100+），这里只列出关键表的创建语句
-- 实际执行时需要使用pg_dump或类似工具获取完整DDL

-- 示例：nh_member_new表（核心用户表）
CREATE TABLE IF NOT EXISTS nh_member_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL UNIQUE,
    approved INTEGER DEFAULT 0,
    first_approved_at TIMESTAMPTZ,
    last_approved_at TIMESTAMPTZ,
    a_eth NUMERIC DEFAULT 0,
    eth NUMERIC DEFAULT 0,
    usdt NUMERIC DEFAULT 0,
    withdrawal_usdt NUMERIC DEFAULT 0,
    withdrawable_usdt NUMERIC DEFAULT 0,
    dividend_usdt NUMERIC DEFAULT 0,
    daily_reward_rate NUMERIC DEFAULT 2.0,
    last_reward_at TIMESTAMPTZ,
    reward_count_today INTEGER DEFAULT 0,
    telegram_user_id TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    agent_id INTEGER DEFAULT 0,
    withdraw_forbidden BOOLEAN DEFAULT false,
    earnings_forbidden BOOLEAN DEFAULT false,
    forbid_day INTEGER DEFAULT 0,
    pause INTEGER DEFAULT 2,
    status INTEGER DEFAULT 1,
    auth_wallet_address VARCHAR,
    registration_ip INET,
    registration_country VARCHAR,
    last_login_ip INET,
    last_login_country VARCHAR,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    onchain_usdt_balance NUMERIC DEFAULT 0,
    onchain_eth_balance NUMERIC DEFAULT 0,
    balance_updated_at TIMESTAMPTZ DEFAULT now(),
    balance_check_count INTEGER DEFAULT 0,
    user_id BIGINT DEFAULT nextval('nh_member_new_user_id_seq'::regclass)
);

-- 创建序列（如果不存在）
CREATE SEQUENCE IF NOT EXISTS nh_member_new_user_id_seq;

-- ============================================
-- 第三部分：创建外键约束
-- ============================================

-- 示例外键约束
-- ALTER TABLE approval_history 
-- ADD CONSTRAINT approval_history_member_id_fkey 
-- FOREIGN KEY (member_id) REFERENCES nh_member_new(id)
-- ON DELETE CASCADE;

-- ============================================
-- 第四部分：创建索引
-- ============================================

-- 示例索引
-- CREATE INDEX IF NOT EXISTS idx_approval_member 
-- ON approval_history(member_id);

-- CREATE INDEX IF NOT EXISTS idx_approval_wallet 
-- ON approval_history(wallet_address);

-- ============================================
-- 第五部分：创建函数
-- ============================================

-- 注意：函数定义较长，这里只列出关键函数
-- 实际执行时需要使用pg_dump获取完整函数定义

-- ============================================
-- 第六部分：创建触发器
-- ============================================

-- 示例触发器
-- CREATE TRIGGER auto_grant_authorization_reward
-- BEFORE UPDATE ON nh_member_new
-- FOR EACH ROW
-- WHEN (OLD.approved = 0 AND NEW.approved = 1)
-- EXECUTE FUNCTION auto_grant_authorization_reward();

-- ============================================
-- 第七部分：创建RLS策略
-- ============================================

-- 示例RLS策略
-- ALTER TABLE finance_orders ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "允许匿名查看finance_orders"
-- ON finance_orders FOR SELECT
-- TO public
-- USING (true);

-- ============================================
-- 重要提示
-- ============================================
-- 
-- 由于数据库结构非常复杂（100+表，80+函数，200+约束），
-- 建议使用以下方法之一来获取完整的同步脚本：
-- 
-- 方法1：使用Supabase CLI
--   supabase db dump -f database1_schema.sql --schema-only
-- 
-- 方法2：使用pg_dump（如果有直接数据库访问）
--   pg_dump -h <db1_host> -U <user> -d <db1_name> \
--     --schema-only --no-owner --no-privileges \
--     > database1_schema.sql
-- 
-- 方法3：使用Supabase Dashboard
--   在Supabase Dashboard中导出数据库结构
-- 
-- 然后使用以下命令在数据库2中应用：
--   psql -h <db2_host> -U <user> -d <db2_name> < database1_schema.sql
-- 
-- ============================================

