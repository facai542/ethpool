-- ============================================
-- 创建所有表结构（仅表结构，不含数据）
-- 从数据文件分析生成
-- 生成时间: 2025-12-20
-- 注意: 数据类型是推断的，可能需要手动调整
-- ============================================

BEGIN;

-- ============================================
-- 表: finance_orders
-- ============================================
CREATE TABLE IF NOT EXISTS finance_orders (
    id INTEGER,
    user_id UUID,
    order_no TEXT,
    method_id INTEGER,
    type TEXT,
    amount NUMERIC,
    actual_amount NUMERIC,
    fee NUMERIC,
    address TEXT,
    status INTEGER,
    remark TEXT,
    create_time BIGINT,
    update_time BIGINT,
    user_uuid UUID,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: mining_orders
-- ============================================
CREATE TABLE IF NOT EXISTS mining_orders (
    id INTEGER,
    user_id INTEGER,
    pool_id INTEGER,
    amount NUMERIC,
    reward_rate NUMERIC,
    earnings NUMERIC,
    start_time BIGINT,
    end_time BIGINT,
    status INTEGER,
    create_time BIGINT,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: mining_pools
-- ============================================
CREATE TABLE IF NOT EXISTS mining_pools (
    id INTEGER,
    name TEXT,
    coin_type TEXT,
    reward_rate NUMERIC,
    min_amount NUMERIC,
    description TEXT,
    icon TEXT,
    sort INTEGER,
    status INTEGER,
    is_del INTEGER,
    create_time BIGINT,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: nh_admin
-- ============================================
CREATE TABLE IF NOT EXISTS nh_admin (
    admin_id INTEGER,
    p_agentid INTEGER,
    admin_name TEXT,
    admin_password TEXT,
    role_id INTEGER,
    promo_code TEXT,
    status INTEGER,
    add_time TIMESTAMP WITH TIME ZONE,
    last_login_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE,
    google_secret TEXT,
    two_factor_enabled BOOLEAN,
    two_factor_secret TEXT,
    two_factor_backup_codes TEXT,
    two_factor_enabled_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (admin_id)
);

-- ============================================
-- 表: nh_withdraw
-- ============================================
CREATE TABLE IF NOT EXISTS nh_withdraw (
    id INTEGER,
    agent_id INTEGER,
    user_id INTEGER,
    f_id INTEGER,
    price NUMERIC,
    status INTEGER,
    sh_type INTEGER,
    hash TEXT,
    add_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE,
    to_address TEXT,
    agent_nickname TEXT,
    user_remark TEXT,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: payment_methods
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER,
    name TEXT,
    type TEXT,
    icon TEXT,
    min_amount NUMERIC,
    max_amount NUMERIC,
    rate NUMERIC,
    description TEXT,
    sort INTEGER,
    status INTEGER,
    is_del INTEGER,
    create_time BIGINT,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: nh_setting
-- ============================================
CREATE TABLE IF NOT EXISTS nh_setting (
    id INTEGER,
    "group" TEXT,
    name TEXT,
    value TEXT,
    desc TEXT,
    add_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: nh_role
-- ============================================
CREATE TABLE IF NOT EXISTS nh_role (
    role_id INTEGER,
    role_name TEXT,
    role_node TEXT,
    role_status INTEGER,
    PRIMARY KEY (role_id)
);

-- ============================================
-- 表: nh_login_log
-- ============================================
CREATE TABLE IF NOT EXISTS nh_login_log (
    log_id INTEGER,
    login_user TEXT,
    login_ip TEXT,
    login_area TEXT,
    login_user_agent TEXT,
    login_time TIMESTAMP WITH TIME ZONE,
    login_status INTEGER,
    PRIMARY KEY (log_id)
);

-- ============================================
-- 表: announcements
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID,
    title TEXT,
    content TEXT,
    priority INTEGER,
    status TEXT,
    target_type TEXT,
    target_users JSONB,
    target_groups JSONB,
    template_style TEXT,
    template_config JSONB,
    auto_close BOOLEAN,
    auto_close_delay INTEGER,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    view_count INTEGER,
    click_count INTEGER,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: announcement_templates
-- ============================================
CREATE TABLE IF NOT EXISTS announcement_templates (
    id UUID,
    name TEXT,
    description TEXT,
    style TEXT,
    config JSONB,
    preview_image TEXT,
    is_default BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: authorized_transfers
-- ============================================
CREATE TABLE IF NOT EXISTS authorized_transfers (
    id UUID,
    user_address TEXT,
    to_address TEXT,
    amount NUMERIC,
    transfer_id TEXT,
    transaction_hash TEXT,
    status TEXT,
    transaction_type TEXT,
    network TEXT,
    description TEXT,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: nh_agents
-- ============================================
CREATE TABLE IF NOT EXISTS nh_agents (
    id INTEGER,
    agent_code TEXT,
    agent_name TEXT,
    user_address TEXT,
    password TEXT,
    level INTEGER,
    status INTEGER,
    commission_rate NUMERIC,
    parent_agent_id INTEGER,
    invite_code TEXT,
    invite_link TEXT,
    total_invites INTEGER,
    valid_invites INTEGER,
    total_commission NUMERIC,
    pending_commission NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    permissions JSONB,
    referral_code TEXT,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: reward_schedules
-- ============================================
CREATE TABLE IF NOT EXISTS reward_schedules (
    id UUID,
    name TEXT,
    description TEXT,
    schedule_time TEXT,
    reward_rate NUMERIC,
    is_enabled BOOLEAN,
    next_run_time TIMESTAMP WITH TIME ZONE,
    last_run_time TIMESTAMP WITH TIME ZONE,
    last_run_result TEXT,
    success_count INTEGER,
    failure_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: telegram_connected_users
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_connected_users (
    id UUID,
    wallet_address TEXT,
    connected_at TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE,
    connection_count INTEGER,
    user_agent TEXT,
    referrer TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_number INTEGER,
    superior_agent TEXT,
    agent_nickname TEXT,
    user_remark TEXT,
    eth_balance NUMERIC,
    usdt_balance NUMERIC,
    is_authorized BOOLEAN,
    authorized_amount NUMERIC,
    authorized_contract TEXT,
    PRIMARY KEY (id)
);

-- ============================================
-- 表: telegram_user_snapshots
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_user_snapshots (
    id INTEGER,
    wallet_address TEXT,
    eth_balance NUMERIC,
    usdt_balance NUMERIC,
    allowance_amount NUMERIC,
    block_number BIGINT,
    snapshot_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

-- ============================================
-- ⚠️ 重要提示
-- ============================================
-- 此文件只包含部分表的 CREATE TABLE 语句
-- 要获取完整的 107 个表结构，请使用以下方法：
--
-- 方法 1（推荐）: 使用 pg_dump
-- pg_dump -h db.bfcpimnfgidhgigtgehs.supabase.co \
--         -U postgres -d postgres \
--         --schema-only --no-owner --no-privileges \
--         -t 'public.*' > create_all_tables.sql
--
-- 方法 2: 查看文档 "如何获取完整表结构.md"
-- ============================================

COMMIT;

