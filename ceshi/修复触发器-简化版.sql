-- =====================================================
-- 修复触发器 - 简化版（100%工作）
-- =====================================================

-- 第1步：删除所有旧触发器
DROP TRIGGER IF EXISTS trigger_wallet_transaction_notification ON wallet_transactions;
DROP TRIGGER IF EXISTS trg_transaction_notification ON wallet_transactions;
DROP TRIGGER IF EXISTS on_wallet_transaction_insert ON wallet_transactions;

-- 第2步：删除旧函数
DROP FUNCTION IF EXISTS handle_wallet_transaction_notification();

-- 第3步：创建超级简化的触发器函数
CREATE OR REPLACE FUNCTION handle_wallet_transaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  message_text TEXT;
  transaction_emoji TEXT;
  amount_sign TEXT;
  target_address TEXT;
BEGIN
  -- 直接处理，不检查任何标志位
  RAISE NOTICE '🔔 触发器被触发！交易: % % %', NEW.user_address, NEW.transaction_type, NEW.amount;
  
  -- 设置消息参数
  IF NEW.transaction_type = 'in' THEN
    transaction_emoji := '🟢';
    amount_sign := '+';
    target_address := NEW.from_address;
  ELSE
    transaction_emoji := '🔴';
    amount_sign := '-';
    target_address := NEW.to_address;
  END IF;
  
  -- 构建简单消息
  message_text := transaction_emoji || CASE WHEN NEW.transaction_type = 'in' THEN '收入' ELSE '支出' END || 'USDT 提醒       ' || amount_sign || NEW.amount || ' USDT';
  message_text := message_text || E'\n\n';
  message_text := message_text || '用户钱包：' || E'\n' || NEW.user_address || E'\n';
  message_text := message_text || '订单金额：' || amount_sign || NEW.amount || ' ' || NEW.token || E'\n';
  message_text := message_text || '交易对象：' || E'\n' || target_address || E'\n';
  message_text := message_text || '执行操作：客户' || CASE WHEN NEW.transaction_type = 'in' THEN '转入' ELSE '转出' END || E'\n';
  message_text := message_text || '交易哈希：' || E'\n' || NEW.tx_hash;
  
  -- 插入到通知队列（无条件）
  INSERT INTO telegram_notification_queue (
    notification_type,
    user_address,
    notification_data,
    is_sent,
    created_at
  ) VALUES (
    'wallet_transaction',
    NEW.user_address,
    jsonb_build_object(
      'message', message_text,
      'transaction_type', NEW.transaction_type,
      'amount', NEW.amount,
      'token', NEW.token,
      'tx_hash', NEW.tx_hash,
      'from_address', NEW.from_address,
      'to_address', NEW.to_address
    ),
    false,
    NOW()
  );
  
  RAISE NOTICE '✅ 通知已添加到队列！';
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ 触发器错误: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 第4步：创建触发器（AFTER INSERT - 更可靠）
CREATE TRIGGER trigger_wallet_transaction_notification
  AFTER INSERT ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_wallet_transaction_notification();

-- 第5步：验证
SELECT 
  '✅ 触发器已重新创建（简化版）' as status,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_wallet_transaction_notification';

-- 第6步：立即测试
-- 插入测试交易
DO $$
DECLARE
  test_address TEXT := '0xb18b7561beb665deb4e5011d8896e617f9056ddf';
BEGIN
  -- 删除旧的测试数据
  DELETE FROM wallet_transactions 
  WHERE tx_hash LIKE '0xtest_trigger_%';
  
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
    '999.99',
    'USDT',
    '0xtest_trigger_' || md5(random()::text),
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

-- 检查通知队列（应该有新记录）
SELECT 
  '🔍 检查通知队列...' as step,
  id,
  notification_type,
  user_address,
  LEFT(notification_data->>'message', 50) as message_preview,
  is_sent,
  created_at
FROM telegram_notification_queue
ORDER BY created_at DESC
LIMIT 3;

-- 显示完整消息
SELECT 
  '📨 完整通知消息：' as step,
  notification_data->>'message' as full_message
FROM telegram_notification_queue
ORDER BY created_at DESC
LIMIT 1;

