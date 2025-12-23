-- ============================================
-- 手动创建所有表结构（根据导出的 SQL 文件）
-- 目标数据库: xybhjgbgusdyokrrfqst
-- ============================================

-- 注意：由于源数据库和目标数据库的表结构可能不同
-- 这里只创建缺失的列，不修改现有列的类型

-- 1. finance_orders - 添加缺失的列
ALTER TABLE finance_orders 
ADD COLUMN IF NOT EXISTS method_id INTEGER,
ADD COLUMN IF NOT EXISTS actual_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS remark TEXT,
ADD COLUMN IF NOT EXISTS create_time BIGINT,
ADD COLUMN IF NOT EXISTS update_time BIGINT,
ADD COLUMN IF NOT EXISTS user_uuid UUID;

-- 2. mining_orders - 添加缺失的列
ALTER TABLE mining_orders 
ADD COLUMN IF NOT EXISTS reward_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS earnings NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_time BIGINT,
ADD COLUMN IF NOT EXISTS end_time BIGINT,
ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS create_time BIGINT;

-- 3. mining_pools - 添加缺失的列
ALTER TABLE mining_pools 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_del INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS create_time BIGINT;

-- 4. nh_admin - 添加缺失的列
ALTER TABLE nh_admin 
ADD COLUMN IF NOT EXISTS p_agentid INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_code TEXT,
ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS add_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS update_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS google_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT,
ADD COLUMN IF NOT EXISTS two_factor_enabled_at TIMESTAMPTZ;

-- 5. nh_withdraw - 添加缺失的列（如果表存在）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'nh_withdraw') THEN
        ALTER TABLE nh_withdraw 
        ADD COLUMN IF NOT EXISTS agent_id INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS f_id INTEGER,
        ADD COLUMN IF NOT EXISTS sh_type INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS to_address TEXT,
        ADD COLUMN IF NOT EXISTS agent_nickname TEXT,
        ADD COLUMN IF NOT EXISTS user_remark TEXT,
        ADD COLUMN IF NOT EXISTS add_time TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS update_time TIMESTAMPTZ;
    END IF;
END $$;

-- 注意：由于表太多，建议使用 Python 脚本批量处理
-- 或者逐个表手动添加缺失的列







