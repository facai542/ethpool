-- 紧急诊断：检查刚才resend后的数据

-- 1. 最新的3条交易（应该有刚才resend的）
SELECT 
  '1️⃣ 最新交易记录' as step,
  id,
  user_address,
  amount,
  tx_hash,
  created_at
FROM wallet_transactions
ORDER BY created_at DESC
LIMIT 3;

-- 2. 最新的5条通知队列（检查触发器是否插入了新记录）
SELECT 
  '2️⃣ 最新通知队列' as step,
  id,
  notification_type,
  user_address,
  is_sent,
  sent_at,
  error_message,
  created_at
FROM telegram_notification_queue
ORDER BY created_at DESC
LIMIT 5;

-- 3. 检查是否有未发送的通知
SELECT 
  '3️⃣ 未发送的通知' as step,
  COUNT(*) as count
FROM telegram_notification_queue
WHERE is_sent = false;

-- 4. 检查触发器是否存在
SELECT 
  '4️⃣ 触发器状态' as step,
  trigger_name,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_wallet_transaction_notification';

