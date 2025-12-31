-- 代理信息数据同步修复SQL
-- 用于修复历史提现订单中缺失的代理信息和用户备注
-- 执行前请先备份数据库！

-- ============================================
-- 1. 检查当前数据情况
-- ============================================

-- 查看有代理ID的用户
SELECT 
  m.id,
  m.wallet_address,
  m.agent_id,
  m.telegram_user_id as user_remark,
  m.approved,
  a.agent_name,
  a.agent_code
FROM nh_member_new m
LEFT JOIN nh_agents a ON m.agent_id = a.id
WHERE m.is_active = true AND m.agent_id > 0
ORDER BY m.created_at DESC;

-- 查看提现订单中的代理信息
SELECT 
  w.id,
  w.user_id,
  w.agent_id,
  w.agent_nickname,
  w.user_remark,
  w.to_address,
  w.status
FROM nh_withdraw w
ORDER BY w.add_time DESC
LIMIT 20;

-- 统计提现订单中代理信息缺失情况
SELECT 
  COUNT(*) as total_withdrawals,
  COUNT(CASE WHEN agent_id IS NULL OR agent_id = 0 THEN 1 END) as missing_agent_id,
  COUNT(CASE WHEN agent_nickname IS NULL OR agent_nickname = '' THEN 1 END) as missing_agent_nickname,
  COUNT(CASE WHEN user_remark IS NULL OR user_remark = '' THEN 1 END) as missing_user_remark
FROM nh_withdraw;

-- ============================================
-- 2. 修复提现订单的代理信息
-- ============================================

-- 方案A: 通过提现地址(to_address)匹配用户钱包地址来补充代理信息
UPDATE nh_withdraw w
SET 
  agent_id = m.agent_id,
  agent_nickname = CASE 
    WHEN a.agent_name IS NOT NULL THEN a.agent_name || ' (' || a.agent_code || ')'
    ELSE '默认代理'
  END,
  user_remark = COALESCE(m.telegram_user_id, w.user_remark, '无备注'),
  update_time = NOW()
FROM nh_member_new m
LEFT JOIN nh_agents a ON m.agent_id = a.id
WHERE w.to_address = m.wallet_address
  AND m.is_active = true
  AND (w.agent_id IS NULL OR w.agent_id = 0 OR w.agent_nickname IS NULL OR w.agent_nickname = '');

-- ============================================
-- 3. 验证修复结果
-- ============================================

-- 检查修复后的提现订单
SELECT 
  w.id,
  w.agent_id,
  w.agent_nickname,
  w.user_remark,
  w.to_address,
  m.wallet_address,
  m.agent_id as member_agent_id,
  a.agent_name
FROM nh_withdraw w
LEFT JOIN nh_member_new m ON w.to_address = m.wallet_address
LEFT JOIN nh_agents a ON w.agent_id = a.id
WHERE w.agent_id > 0
ORDER BY w.add_time DESC
LIMIT 20;

-- 统计修复后的情况
SELECT 
  COUNT(*) as total_withdrawals,
  COUNT(CASE WHEN agent_id > 0 THEN 1 END) as has_agent,
  COUNT(CASE WHEN agent_nickname IS NOT NULL AND agent_nickname != '' THEN 1 END) as has_agent_nickname,
  COUNT(CASE WHEN user_remark IS NOT NULL AND user_remark != '' THEN 1 END) as has_user_remark
FROM nh_withdraw;

-- ============================================
-- 4. 同步用户备注到提现订单
-- ============================================

-- 将用户表中的最新备注同步到提现订单
-- 注意：这会覆盖提现订单中的现有备注
UPDATE nh_withdraw w
SET 
  user_remark = m.telegram_user_id,
  update_time = NOW()
FROM nh_member_new m
WHERE w.to_address = m.wallet_address
  AND m.is_active = true
  AND m.telegram_user_id IS NOT NULL
  AND m.telegram_user_id != ''
  AND (w.user_remark IS NULL OR w.user_remark = '' OR w.user_remark = '无备注');

-- ============================================
-- 5. 验证代理统计数据准确性
-- ============================================

-- 比较代理表统计数据和实际用户数
SELECT 
  a.id,
  a.agent_name,
  a.agent_code,
  a.total_invites as recorded_total,
  a.valid_invites as recorded_valid,
  COUNT(m.id) as actual_total,
  COUNT(CASE WHEN m.approved = 1 THEN 1 END) as actual_valid
FROM nh_agents a
LEFT JOIN nh_member_new m ON m.agent_id = a.id AND m.is_active = true
WHERE a.status = 'active'
GROUP BY a.id, a.agent_name, a.agent_code, a.total_invites, a.valid_invites
HAVING COUNT(m.id) != a.total_invites OR COUNT(CASE WHEN m.approved = 1 THEN 1 END) != a.valid_invites;

-- 修正代理统计数据（如果不一致）
WITH agent_stats AS (
  SELECT 
    agent_id,
    COUNT(*) as total_count,
    COUNT(CASE WHEN approved = 1 THEN 1 END) as valid_count
  FROM nh_member_new
  WHERE agent_id > 0 AND is_active = true
  GROUP BY agent_id
)
UPDATE nh_agents a
SET 
  total_invites = COALESCE(s.total_count, 0),
  valid_invites = COALESCE(s.valid_count, 0),
  updated_at = NOW()
FROM agent_stats s
WHERE a.id = s.agent_id;

-- ============================================
-- 6. 最终验证 - 完整数据检查
-- ============================================

-- 用户、代理、提现订单三表关联查询
SELECT 
  m.wallet_address,
  m.agent_id as member_agent_id,
  m.telegram_user_id as member_remark,
  a.agent_name,
  a.agent_code,
  w.id as withdraw_id,
  w.agent_id as withdraw_agent_id,
  w.agent_nickname,
  w.user_remark as withdraw_remark,
  w.status as withdraw_status
FROM nh_member_new m
LEFT JOIN nh_agents a ON m.agent_id = a.id
LEFT JOIN nh_withdraw w ON w.to_address = m.wallet_address
WHERE m.agent_id > 0 AND m.is_active = true
ORDER BY m.created_at DESC, w.add_time DESC
LIMIT 50;

-- 检查数据不一致的记录
SELECT 
  '提现订单代理信息不一致' as issue_type,
  w.id as withdraw_id,
  w.agent_id as withdraw_agent,
  m.agent_id as member_agent,
  w.agent_nickname,
  a.agent_name,
  w.user_remark,
  m.telegram_user_id
FROM nh_withdraw w
INNER JOIN nh_member_new m ON w.to_address = m.wallet_address
LEFT JOIN nh_agents a ON m.agent_id = a.id
WHERE m.is_active = true
  AND (
    w.agent_id != m.agent_id 
    OR (m.agent_id > 0 AND (w.agent_nickname IS NULL OR w.agent_nickname = ''))
    OR (m.telegram_user_id IS NOT NULL AND m.telegram_user_id != '' AND w.user_remark != m.telegram_user_id)
  )
LIMIT 20;

-- ============================================
-- 7. 创建视图方便查询（可选）
-- ============================================

-- 创建用户完整信息视图
CREATE OR REPLACE VIEW v_user_complete_info AS
SELECT 
  m.id,
  m.wallet_address,
  m.agent_id,
  m.telegram_user_id as user_remark,
  m.approved,
  m.usdt,
  m.withdrawable_usdt,
  m.withdrawal_usdt,
  m.created_at,
  a.agent_name,
  a.agent_code,
  a.referral_code as agent_referral_code,
  (SELECT COUNT(*) FROM nh_withdraw WHERE to_address = m.wallet_address) as withdraw_count
FROM nh_member_new m
LEFT JOIN nh_agents a ON m.agent_id = a.id
WHERE m.is_active = true;

-- 创建提现订单完整信息视图
CREATE OR REPLACE VIEW v_withdraw_complete_info AS
SELECT 
  w.id,
  w.user_id,
  w.agent_id,
  w.agent_nickname,
  w.user_remark,
  w.price,
  w.status,
  w.to_address,
  w.add_time,
  m.wallet_address as user_wallet,
  m.telegram_user_id as latest_user_remark,
  m.agent_id as user_current_agent_id,
  a.agent_name,
  a.agent_code,
  CASE 
    WHEN w.agent_id != m.agent_id THEN '代理ID不一致'
    WHEN m.telegram_user_id IS NOT NULL AND w.user_remark != m.telegram_user_id THEN '备注不一致'
    ELSE '一致'
  END as sync_status
FROM nh_withdraw w
LEFT JOIN nh_member_new m ON w.to_address = m.wallet_address
LEFT JOIN nh_agents a ON w.agent_id = a.id;

-- 使用视图查询
-- SELECT * FROM v_user_complete_info WHERE agent_id > 0;
-- SELECT * FROM v_withdraw_complete_info WHERE sync_status != '一致';




