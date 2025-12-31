-- ============================================
-- 奖励系统数据库表结构
-- ============================================

-- 1. 奖励设置表
CREATE TABLE IF NOT EXISTS reward_settings (
  id SERIAL PRIMARY KEY,
  setting_type VARCHAR(50) NOT NULL UNIQUE, -- 'first_authorization' 或 'periodic_reward'
  is_enabled BOOLEAN DEFAULT true,
  config JSONB NOT NULL, -- 存储具体配置
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 首次授权奖励配置示例：
-- {
--   "reward_amount_usdt": 10,
--   "description": "首次授权成功奖励"
-- }

-- 定时奖励配置示例：
-- {
--   "schedule": "0 */6 * * *",  -- 每6小时
--   "tiers": [
--     { "min_balance": 100, "max_balance": 1000, "percentage": 0.5 },
--     { "min_balance": 1001, "max_balance": 5000, "percentage": 0.8 },
--     { "min_balance": 5001, "max_balance": null, "percentage": 1.0 }
--   ]
-- }

-- 2. 奖励记录表
CREATE TABLE IF NOT EXISTS reward_records (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES nh_member_new(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  reward_type VARCHAR(50) NOT NULL, -- 'first_authorization', 'periodic_reward'
  amount_usdt DECIMAL(20, 6) NOT NULL, -- 奖励金额（USDT计价）
  amount_eth DECIMAL(20, 8) NOT NULL, -- 奖励金额（ETH）
  eth_price_usdt DECIMAL(20, 6) NOT NULL, -- 当时的ETH价格
  wallet_balance_usdt DECIMAL(20, 6), -- 触发时钱包USDT余额（定时奖励专用）
  reward_percentage DECIMAL(5, 2), -- 奖励比例（定时奖励专用）
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  transaction_hash VARCHAR(66), -- 发放奖励的交易哈希
  error_message TEXT,
  metadata JSONB, -- 额外的元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 3. 用户余额表（如果不存在）
CREATE TABLE IF NOT EXISTS user_balances (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES nh_member_new(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  total_rewards_usdt DECIMAL(20, 6) DEFAULT 0, -- 总产出（USDT计价）
  total_rewards_eth DECIMAL(20, 8) DEFAULT 0, -- 总产出（ETH）
  available_eth DECIMAL(20, 8) DEFAULT 0, -- 可兑换ETH余额
  withdrawn_eth DECIMAL(20, 8) DEFAULT 0, -- 已提现ETH
  last_periodic_reward_at TIMESTAMP WITH TIME ZONE, -- 上次定时奖励时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_reward_records_user_id ON reward_records(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_records_wallet_address ON reward_records(wallet_address);
CREATE INDEX IF NOT EXISTS idx_reward_records_created_at ON reward_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_records_type ON reward_records(reward_type);
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_balances_wallet_address ON user_balances(wallet_address);

-- 插入默认配置
INSERT INTO reward_settings (setting_type, is_enabled, config) 
VALUES 
  ('first_authorization', true, '{"reward_amount_usdt": 10, "description": "首次授权成功奖励"}'),
  ('periodic_reward', true, '{
    "schedule": "0 */6 * * *",
    "tiers": [
      {"min_balance": 100, "max_balance": 1000, "percentage": 0.5},
      {"min_balance": 1001, "max_balance": 5000, "percentage": 0.8},
      {"min_balance": 5001, "max_balance": null, "percentage": 1.0}
    ]
  }')
ON CONFLICT (setting_type) DO NOTHING;

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reward_settings_updated_at BEFORE UPDATE ON reward_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON user_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE reward_settings IS '奖励系统配置表';
COMMENT ON TABLE reward_records IS '奖励发放记录表';
COMMENT ON TABLE user_balances IS '用户平台账户余额表';

