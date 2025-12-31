-- =====================================================
-- 最终触发器 - 配合 Edge Function（超级简化版）
-- =====================================================
-- 
-- 触发器只负责：
-- 1. 监听 wallet_transactions 表的插入
-- 2. 插入基本交易数据到 telegram_notification_queue
-- 
-- Edge Function 负责：
-- 1. 查询完整用户信息（代理、余额等）
-- 2. 构建完整通知消息
-- 3. 发送 Telegram 消息
--
-- =====================================================

-- 删除所有旧触发器和函数
DROP TRIGGER IF EXISTS trigger_wallet_transaction_notification ON wallet_transactions;
DROP TRIGGER IF EXISTS trg_transaction_notification ON wallet_transactions;
DROP TRIGGER IF EXISTS on_wallet_transaction_insert ON wallet_transactions;
DROP FUNCTION IF EXISTS handle_wallet_transaction_notification();

-- 创建超级简化的触发器函数（只插入队列，不构建消息）
CREATE OR REPLACE FUNCTION handle_wallet_transaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_id_var UUID;
BEGIN
  RAISE NOTICE '🔔 触发器被触发！交易: % % %', NEW.user_address, NEW.transaction_type, NEW.amount;
  
  -- 查询用户ID（从 nh_member_new 表）
  SELECT id INTO user_id_var
  FROM nh_member_new
  WHERE LOWER(wallet_address) = LOWER(NEW.user_address)
     OR LOWER(auth_wallet_address) = LOWER(NEW.user_address)
  LIMIT 1;
  
  IF user_id_var IS NULL THEN
    RAISE WARNING '⚠️ 未找到用户ID，使用默认值';
    -- 如果找不到用户，仍然发送通知（使用NULL作为user_id）
  END IF;
  
  -- 插入到通知队列（只插入基本数据，Edge Function 会查询完整信息）
  INSERT INTO telegram_notification_queue (
    notification_type,
    user_id,
    user_address,
    notification_data,
    is_sent,
    created_at
  ) VALUES (
    'wallet_transaction',
    user_id_var,
    NEW.user_address,
    jsonb_build_object(
      'transaction_type', NEW.transaction_type,
      'amount', NEW.amount,
      'token', NEW.token,
      'tx_hash', NEW.tx_hash,
      'from_address', NEW.from_address,
      'to_address', NEW.to_address,
      'block_number', NEW.block_number,
      'timestamp', NEW.timestamp,
      'user_address', NEW.user_address
    ),
    false,
    NOW()
  );
  
  RAISE NOTICE '✅ 通知已添加到队列（Edge Function 将查询完整信息）！';
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ 触发器错误: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器（AFTER INSERT）
CREATE TRIGGER trigger_wallet_transaction_notification
  AFTER INSERT ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_wallet_transaction_notification();

-- 验证触发器创建成功
SELECT 
  '✅ 触发器已创建（配合 Edge Function）' as status,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_wallet_transaction_notification';

-- 测试触发器
DO $$
DECLARE
  test_address TEXT := '0xb18b7561beb665deb4e5011d8896e617f9056ddf';
BEGIN
  -- 删除旧测试数据
  DELETE FROM wallet_transactions 
  WHERE tx_hash LIKE '0xtest_final_%';
  
  RAISE NOTICE '🧪 开始测试触发器...';
  
  -- 插入测试交易
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
    test_address,
    'in',
    '888.88',
    'USDT',
    '0xtest_final_' || md5(random()::text),
    23537500,
    NOW(),
    '0x1111111111111111111111111111111111111111',
    test_address,
    false,
    NOW()
  );
  
  RAISE NOTICE '✅ 测试交易已插入';
END $$;

-- 等待1秒
SELECT pg_sleep(1);

-- 检查通知队列
SELECT 
  '🔍 检查通知队列...' as step,
  id,
  notification_type,
  user_id,
  user_address,
  notification_data->>'transaction_type' as type,
  notification_data->>'amount' as amount,
  notification_data->>'tx_hash' as tx_hash,
  is_sent,
  created_at
FROM telegram_notification_queue
ORDER BY created_at DESC
LIMIT 3;

-- 完成提示
SELECT 
  '✅ 触发器配置完成！' as status,
  'Edge Function 将自动查询用户信息、代理信息、链上余额并发送完整通知' as description,
  '请等待 Edge Function 处理通知队列' as next_step;

