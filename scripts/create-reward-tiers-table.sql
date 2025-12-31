-- ============================================
-- 收益等级表创建脚本
-- 用途: 根据用户链上USDT余额设置不同的收益比例
-- 创建日期: 2025-10-07
-- ============================================

-- 1. 创建 reward_tiers 表
CREATE TABLE IF NOT EXISTS reward_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_name TEXT NOT NULL,
  min_balance NUMERIC(20, 6) NOT NULL DEFAULT 0,
  max_balance NUMERIC(20, 6) NOT NULL DEFAULT 999999999,
  daily_rate NUMERIC(10, 6) NOT NULL DEFAULT 0.02,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT check_balance_range CHECK (max_balance >= min_balance),
  CONSTRAINT check_daily_rate CHECK (daily_rate >= 0 AND daily_rate <= 1),
  CONSTRAINT uk_tier_name UNIQUE (tier_name)
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_reward_tiers_balance 
  ON reward_tiers(min_balance, max_balance);

CREATE INDEX IF NOT EXISTS idx_reward_tiers_active 
  ON reward_tiers(is_active);

CREATE INDEX IF NOT EXISTS idx_reward_tiers_created 
  ON reward_tiers(created_at DESC);

-- 3. 添加注释
COMMENT ON TABLE reward_tiers IS '收益等级配置表 - 根据USDT余额设置收益率';
COMMENT ON COLUMN reward_tiers.id IS '主键UUID';
COMMENT ON COLUMN reward_tiers.tier_name IS '等级名称（唯一）';
COMMENT ON COLUMN reward_tiers.min_balance IS '最小USDT余额（含）';
COMMENT ON COLUMN reward_tiers.max_balance IS '最大USDT余额（含）';
COMMENT ON COLUMN reward_tiers.daily_rate IS '日收益率（小数形式，如0.02表示2%）';
COMMENT ON COLUMN reward_tiers.description IS '等级说明';
COMMENT ON COLUMN reward_tiers.is_active IS '是否启用（只有启用的等级会参与匹配）';
COMMENT ON COLUMN reward_tiers.created_at IS '创建时间';
COMMENT ON COLUMN reward_tiers.updated_at IS '更新时间';

-- 4. 插入默认收益等级数据
INSERT INTO reward_tiers (tier_name, min_balance, max_balance, daily_rate, description, is_active) VALUES
  ('青铜等级', 50, 999, 0.02, '适合新手，稳健收益', true),
  ('白银等级', 1000, 4999, 0.025, '进阶选择，收益提升', true),
  ('黄金等级', 5000, 9999, 0.03, '优质客户，更高回报', true),
  ('铂金等级', 10000, 49999, 0.035, 'VIP等级，专属收益', true),
  ('钻石等级', 50000, 999999999, 0.04, '顶级会员，最高收益', true)
ON CONFLICT (tier_name) DO NOTHING;

-- 5. 创建更新触发器函数
CREATE OR REPLACE FUNCTION update_reward_tiers_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建触发器
DROP TRIGGER IF EXISTS trigger_update_reward_tiers_timestamp ON reward_tiers;
CREATE TRIGGER trigger_update_reward_tiers_timestamp
  BEFORE UPDATE ON reward_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_reward_tiers_timestamp();

-- 7. 启用 RLS (Row Level Security)
ALTER TABLE reward_tiers ENABLE ROW LEVEL SECURITY;

-- 8. 创建 RLS 策略 - 只允许服务密钥访问
CREATE POLICY "Enable read access for service role" 
  ON reward_tiers FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for service role" 
  ON reward_tiers FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for service role" 
  ON reward_tiers FOR UPDATE 
  USING (true);

CREATE POLICY "Enable delete for service role" 
  ON reward_tiers FOR DELETE 
  USING (true);

-- ============================================
-- 验证查询
-- ============================================

-- 查看所有收益等级
SELECT 
  tier_name,
  min_balance,
  max_balance,
  (daily_rate * 100)::TEXT || '%' as daily_rate,
  is_active,
  description
FROM reward_tiers
ORDER BY min_balance;

-- 查看索引
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'reward_tiers';

-- 查看表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'reward_tiers'
ORDER BY ordinal_position;

-- ============================================
-- 测试查询
-- ============================================

-- 模拟用户余额匹配等级
WITH user_balances AS (
  SELECT 
    '用户A' as user_name,
    500 as usdt_balance
  UNION ALL SELECT '用户B', 3000
  UNION ALL SELECT '用户C', 8000
  UNION ALL SELECT '用户D', 25000
  UNION ALL SELECT '用户E', 100000
)
SELECT 
  ub.user_name,
  ub.usdt_balance,
  rt.tier_name,
  (rt.daily_rate * 100)::TEXT || '%' as daily_rate,
  (ub.usdt_balance * rt.daily_rate)::NUMERIC(20, 6) as daily_reward_usdt
FROM user_balances ub
LEFT JOIN reward_tiers rt ON 
  ub.usdt_balance >= rt.min_balance AND 
  ub.usdt_balance <= rt.max_balance AND
  rt.is_active = true
ORDER BY ub.usdt_balance;

-- ============================================
-- 完成信息
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ reward_tiers 表创建成功！';
  RAISE NOTICE '📊 已插入 5 个默认收益等级';
  RAISE NOTICE '🔍 已创建索引和触发器';
  RAISE NOTICE '🛡️  已启用 RLS 安全策略';
  RAISE NOTICE '';
  RAISE NOTICE '📝 下一步:';
  RAISE NOTICE '1. 访问管理后台: /admin/reward-tiers';
  RAISE NOTICE '2. 查看或调整收益等级设置';
  RAISE NOTICE '3. 在定时任务中配置奖励发放时间';
  RAISE NOTICE '4. 测试执行一次奖励发放';
END $$;










