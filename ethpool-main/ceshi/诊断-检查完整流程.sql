-- =====================================================
-- 完整流程诊断 - 找出问题在哪一步
-- =====================================================

-- 1️⃣ 检查触发器是否存在
SELECT 
  '1️⃣ 检查触发器' as step,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'trigger_wallet_transaction_notification';

-- 如果上面没有返回结果，说明触发器不存在！需要先创建触发器

-- 2️⃣ 检查最近的 wallet_transactions 记录
SELECT 
  '2️⃣ 最近的交易记录' as step,
  id,
  user_address,
  transaction_type,
  amount,
  tx_hash,
  created_at,
  '✅' as status
FROM wallet_transactions
ORDER BY created_at DESC
LIMIT 3;

-- 3️⃣ 检查 telegram_notification_queue 是否有新记录
SELECT 
  '3️⃣ 通知队列' as step,
  id,
  notification_type,
  user_address,
  is_sent,
  sent_at,
  error_message,
  created_at,
  CASE 
    WHEN is_sent THEN '✅ 已发送'
    WHEN error_message IS NOT NULL THEN '❌ 失败: ' || error_message
    ELSE '⏳ 等待发送'
  END as status
FROM telegram_notification_queue
ORDER BY created_at DESC
LIMIT 5;

-- 4️⃣ 检查监控列表
SELECT 
  '4️⃣ 监控地址列表' as step,
  wallet_address,
  is_active,
  created_at
FROM wallet_monitor
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 5;

-- 5️⃣ 检查 Telegram 配置
SELECT 
  '5️⃣ Telegram 配置' as step,
  config_key,
  CASE 
    WHEN config_key = 'TELEGRAM_BOT_TOKEN' THEN LEFT(config_value, 10) || '...'
    ELSE config_value
  END as value,
  '✅' as status
FROM system_config
WHERE config_key IN ('TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID');

-- =====================================================
-- 根据以上结果判断：
-- 
-- 如果步骤1️⃣ 没有结果 → 触发器未创建，需要执行触发器SQL
-- 如果步骤2️⃣ 没有记录 → Tokenview webhook 未成功发送到数据库
-- 如果步骤3️⃣ 没有记录 → 触发器没有工作
-- 如果步骤3️⃣ 有记录但 is_sent=false → Edge Function 未被调用
-- 如果步骤3️⃣ 有 error_message → 查看具体错误
-- 如果步骤4️⃣ 没有地址 → 需要添加监控地址
-- =====================================================

