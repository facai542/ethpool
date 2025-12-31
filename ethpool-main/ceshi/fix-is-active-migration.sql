-- 修复 is_active 字段的数据迁移脚本
-- 
-- 问题：历史数据中正常用户的 is_active 可能设置为 0 或 false
-- 解决：将所有正常用户的 is_active 统一设置为 true
-- 
-- 执行前请先备份数据库！

-- 1. 检查当前 is_active 字段的数据分布
SELECT 
  is_active,
  COUNT(*) as user_count,
  COUNT(CASE WHEN approved = 1 THEN 1 END) as approved_count,
  COUNT(CASE WHEN agent_id > 0 THEN 1 END) as has_agent_count
FROM nh_member_new
GROUP BY is_active;

-- 2. 查看 is_active = 0 但应该是正常用户的记录
-- （这些用户有授权记录或有代理关联）
SELECT 
  id,
  wallet_address,
  agent_id,
  approved,
  created_at,
  is_active
FROM nh_member_new
WHERE is_active = false OR is_active = 0
ORDER BY created_at DESC
LIMIT 20;

-- 3. 修正所有正常用户的 is_active 字段为 true
-- 只有明确标记为删除的用户才应该是 false
UPDATE nh_member_new
SET is_active = true,
    updated_at = NOW()
WHERE is_active = false OR is_active = 0;

-- 4. 验证修复结果
SELECT 
  'After Fix' as status,
  is_active,
  COUNT(*) as user_count
FROM nh_member_new
GROUP BY is_active;

-- 5. 检查通过代理邀请的用户数量
SELECT 
  a.id as agent_id,
  a.agent_name,
  a.agent_code,
  a.total_invites,
  a.valid_invites,
  COUNT(m.id) as actual_member_count,
  COUNT(CASE WHEN m.approved = 1 THEN 1 END) as approved_member_count
FROM nh_agents a
LEFT JOIN nh_member_new m ON m.agent_id = a.id AND m.is_active = true
WHERE a.status = 'active'
GROUP BY a.id, a.agent_name, a.agent_code, a.total_invites, a.valid_invites
ORDER BY actual_member_count DESC;

-- 6. 修正代理统计数据（如果不一致）
-- 重新计算每个代理的实际邀请用户数
WITH agent_stats AS (
  SELECT 
    agent_id,
    COUNT(*) as total_count,
    COUNT(CASE WHEN approved = 1 THEN 1 END) as approved_count
  FROM nh_member_new
  WHERE agent_id > 0 AND is_active = true
  GROUP BY agent_id
)
UPDATE nh_agents a
SET 
  total_invites = COALESCE(s.total_count, 0),
  valid_invites = COALESCE(s.approved_count, 0)
FROM agent_stats s
WHERE a.id = s.agent_id;

-- 7. 最终验证：代理及其邀请用户列表
SELECT 
  a.agent_name,
  m.wallet_address,
  m.approved,
  m.created_at,
  m.is_active
FROM nh_agents a
INNER JOIN nh_member_new m ON m.agent_id = a.id
WHERE a.status = 'active'
ORDER BY a.id, m.created_at DESC
LIMIT 50;




