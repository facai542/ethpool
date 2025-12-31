-- 测试钱包USDT动账通知系统
-- 使用真实的已授权用户地址进行测试

-- ====================================
-- 步骤1：查看最近授权的用户
-- ====================================
SELECT 
  id,
  wallet_address,
  auth_wallet_address,
  approved,
  first_approved_at,
  telegram_user_id
FROM nh_member_new
WHERE approved = 1
  AND is_active = true
ORDER BY first_approved_at DESC
LIMIT 5;

-- ====================================
-- 步骤2：选择一个地址进行测试
-- ====================================
-- 请从上面的结果中选择一个 wallet_address
-- 例如：0x4512C6C2E2A450751979129f003Bf211e1C16F55

-- ====================================
-- 步骤3：检查该地址是否在监听列表中
-- ====================================
SELECT 
  id,
  wallet_address,
  is_active,
  monitor_transactions,
  created_at
FROM wallet_monitor
WHERE wallet_address = '0x4512C6C2E2A450751979129f003Bf211e1C16F55'  -- 替换为实际地址
  AND is_active = true;

-- 如果没有记录，需要手动添加
-- 获取用户ID
WITH user_id AS (
  SELECT id FROM nh_member_new 
  WHERE wallet_address = '0x4512C6C2E2A450751979129f003Bf211e1C16F55' 
  LIMIT 1
)
INSERT INTO wallet_monitor (
  member_id,
  wallet_address,
  is_active,
  monitor_transactions,
  created_at
)
SELECT 
  id,
  '0x4512C6C2E2A450751979129f003Bf211e1C16F55',
  true,
  true,
  NOW()
FROM user_id
ON CONFLICT (wallet_address) DO UPDATE
SET is_active = true, monitor_transactions = true;

-- ====================================
-- 步骤4：插入测试交易（转入）
-- ====================================
INSERT INTO wallet_transactions (
  user_address,
  transaction_type,
  amount,
  token,
  tx_hash,
  block_number,
  timestamp,
  from_address,
  to_address,
  is_processed,
  created_at
) VALUES (
  '0x4512C6C2E2A450751979129f003Bf211e1C16F55',  -- 替换为实际地址
  'in',  -- 转入
  '888.88',  -- 测试金额
  'USDT',
  '0x' || md5(random()::text || NOW()::text),  -- 随机交易哈希
  23537500 + floor(random() * 1000)::int,  -- 随机区块号
  NOW(),
  '0x1234567890123456789012345678901234567890',  -- 发送方
  '0x4512C6C2E2A450751979129f003Bf211e1C16F55',  -- 接收方
  false,  -- 未处理，将触发触发器
  NOW()
) RETURNING id, user_address, amount, is_processed;

-- ====================================
-- 步骤5：等待3秒后检查处理结果
-- ====================================
-- 在 pgAdmin 或 SQL 客户端中运行此查询
SELECT pg_sleep(3);

-- 检查交易是否已处理
SELECT 
  id,
  user_address,
  transaction_type,
  amount,
  token,
  is_processed,
  processed_at,
  notification_sent,
  created_at
FROM wallet_transactions
WHERE user_address = '0x4512C6C2E2A450751979129f003Bf211e1C16F55'
ORDER BY created_at DESC
LIMIT 5;

-- ====================================
-- 步骤6：检查通知队列
-- ====================================
SELECT 
  id,
  notification_type,
  user_address,
  notification_data->>'message' as telegram_message,
  is_sent,
  sent_at,
  created_at
FROM telegram_notification_queue
WHERE user_address = '0x4512C6C2E2A450751979129f003Bf211e1C16F55'
ORDER BY created_at DESC
LIMIT 3;

-- ====================================
-- 步骤7：插入测试交易（转出）
-- ====================================
INSERT INTO wallet_transactions (
  user_address,
  transaction_type,
  amount,
  token,
  tx_hash,
  block_number,
  timestamp,
  from_address,
  to_address,
  is_processed,
  created_at
) VALUES (
  '0x4512C6C2E2A450751979129f003Bf211e1C16F55',  -- 替换为实际地址
  'out',  -- 转出
  '66.66',  -- 测试金额
  'USDT',
  '0x' || md5(random()::text || NOW()::text),
  23537500 + floor(random() * 1000)::int,
  NOW(),
  '0x4512C6C2E2A450751979129f003Bf211e1C16F55',  -- 发送方
  '0x9876543210987654321098765432109876543210',  -- 接收方
  false,
  NOW()
) RETURNING id, user_address, amount, is_processed;

-- ====================================
-- 步骤8：再次检查结果
-- ====================================
SELECT pg_sleep(3);

-- 查看所有测试交易
SELECT 
  id,
  user_address,
  transaction_type,
  amount,
  is_processed,
  notification_sent,
  created_at
FROM wallet_transactions
WHERE user_address = '0x4512C6C2E2A450751979129f003Bf211e1C16F55'
  AND created_at >= NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;

-- 查看所有测试通知
SELECT 
  id,
  notification_type,
  LEFT(notification_data->>'message', 100) as message_preview,
  is_sent,
  created_at
FROM telegram_notification_queue
WHERE user_address = '0x4512C6C2E2A450751979129f003Bf211e1C16F55'
  AND created_at >= NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;

-- ====================================
-- 步骤9：查看完整的 Telegram 消息
-- ====================================
SELECT 
  notification_data->>'message' as full_telegram_message
FROM telegram_notification_queue
WHERE user_address = '0x4512C6C2E2A450751979129f003Bf211e1C16F55'
ORDER BY created_at DESC
LIMIT 1;

-- ====================================
-- 步骤10：清理测试数据（可选）
-- ====================================
/*
-- 取消注释以下行来清理测试数据

-- 删除测试交易
DELETE FROM wallet_transactions
WHERE user_address = '0x4512C6C2E2A450751979129f003Bf211e1C16F55'
  AND created_at >= NOW() - INTERVAL '10 minutes';

-- 删除测试通知
DELETE FROM telegram_notification_queue
WHERE user_address = '0x4512C6C2E2A450751979129f003Bf211e1C16F55'
  AND created_at >= NOW() - INTERVAL '10 minutes';

SELECT 'Test data cleaned' as status;
*/

-- ====================================
-- 系统健康检查
-- ====================================

-- 检查触发器状态
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_wallet_transaction_notification';

-- 检查监听地址统计
SELECT 
  COUNT(*) as total_addresses,
  COUNT(*) FILTER (WHERE is_active = true) as active_addresses,
  COUNT(*) FILTER (WHERE monitor_transactions = true) as monitoring_transactions
FROM wallet_monitor;

-- 检查交易处理统计
SELECT 
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE is_processed = true) as processed,
  COUNT(*) FILTER (WHERE is_processed = false) as unprocessed,
  COUNT(*) FILTER (WHERE notification_sent = true) as notified
FROM wallet_transactions;

-- 检查通知队列统计
SELECT 
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_sent = true) as sent,
  COUNT(*) FILTER (WHERE is_sent = false) as pending
FROM telegram_notification_queue
WHERE notification_type = 'wallet_transaction';

-- ====================================
-- 预期结果
-- ====================================
/*
如果系统工作正常，你应该看到：

1. 步骤4 插入测试交易后：
   - is_processed 应该变为 true
   - processed_at 应该有时间戳

2. 步骤6 检查通知队列：
   - 应该有一条新的通知记录
   - is_sent = false（等待 telegram-notifier 发送）
   - telegram_message 应该包含完整的消息内容

3. 步骤7 插入转出交易后：
   - 同样应该创建新的通知

4. 步骤9 查看完整消息：
   - 应该看到格式化的 Telegram 消息

如果以上结果不符合预期，请检查：
- 触发器是否正确创建（系统健康检查）
- 用户是否存在于 nh_member_new 表中
- 地址是否在 wallet_monitor 表中
*/


