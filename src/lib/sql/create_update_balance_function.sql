-- ============================================
-- 更新用户余额的数据库函数
-- ============================================

CREATE OR REPLACE FUNCTION update_user_balance(
  p_user_id UUID,
  p_wallet_address VARCHAR(42),
  p_reward_usdt DECIMAL(20, 6),
  p_reward_eth DECIMAL(20, 8)
)
RETURNS VOID AS $$
BEGIN
  -- 使用 INSERT ... ON CONFLICT 实现 UPSERT
  INSERT INTO user_balances (
    user_id,
    wallet_address,
    total_rewards_usdt,
    total_rewards_eth,
    available_eth,
    withdrawn_eth,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    LOWER(p_wallet_address),
    p_reward_usdt,
    p_reward_eth,
    p_reward_eth,  -- 新增的奖励直接加到可兑换余额
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_rewards_usdt = user_balances.total_rewards_usdt + p_reward_usdt,
    total_rewards_eth = user_balances.total_rewards_eth + p_reward_eth,
    available_eth = user_balances.available_eth + p_reward_eth,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_user_balance IS '更新用户平台账户余额（总产出和可兑换余额）';

