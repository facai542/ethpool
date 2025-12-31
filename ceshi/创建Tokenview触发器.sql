-- =====================================================
-- Tokenview 集成 - 数据库触发器创建脚本
-- =====================================================
-- 
-- 用途：当 wallet_transactions 表插入新交易时
--      自动创建 Telegram 通知并添加到队列
-- 
-- 执行方式：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 粘贴并执行此脚本
-- 
-- =====================================================

-- =====================================================
-- 第1步：创建触发器函数
-- =====================================================

CREATE OR REPLACE FUNCTION handle_wallet_transaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_info RECORD;
  agent_info RECORD;
  message_text TEXT;
  transaction_emoji TEXT;
  transaction_action TEXT;
  amount_sign TEXT;
  target_address TEXT;
BEGIN
  -- 只处理未处理的交易
  IF NEW.is_processed = false AND NEW.notification_sent = false THEN
    
    RAISE NOTICE '🔔 处理交易通知: % % %', NEW.user_address, NEW.transaction_type, NEW.amount;
    
    -- 获取用户信息
    SELECT 
      id,
      wallet_address,
      auth_wallet_address,
      approved,
      first_approved_at,
      parent_id,
      telegram_user_id,
      telegram_username,
      nickname
    INTO user_info
    FROM nh_member_new
    WHERE LOWER(wallet_address) = LOWER(NEW.user_address)
    LIMIT 1;
    
    -- 如果找不到用户，仍然发送通知（使用默认信息）
    IF user_info IS NULL THEN
      RAISE NOTICE '⚠️ 找不到用户信息: %, 使用默认信息', NEW.user_address;
      user_info.id := 0;
      user_info.nickname := '未知用户';
      user_info.parent_id := NULL;
    END IF;
    
    -- 获取代理信息（如果有）
    IF user_info.parent_id IS NOT NULL THEN
      SELECT 
        id,
        nickname,
        wallet_address
      INTO agent_info
      FROM nh_member_new
      WHERE id = user_info.parent_id
      LIMIT 1;
    END IF;
    
    -- 设置消息参数
    IF NEW.transaction_type = 'in' THEN
      transaction_emoji := '🟢';
      transaction_action := '收入';
      amount_sign := '+';
      target_address := NEW.from_address;
    ELSE
      transaction_emoji := '🔴';
      transaction_action := '支出';
      amount_sign := '-';
      target_address := NEW.to_address;
    END IF;
    
    -- 构建 Telegram 消息
    message_text := transaction_emoji || transaction_action || 'USDT 提醒       ' || amount_sign || NEW.amount || ' USDT';
    
    message_text := message_text || E'\n\n';
    
    -- 添加代理信息（如果有）
    IF agent_info.nickname IS NOT NULL THEN
      message_text := message_text || '顶层代理：' || COALESCE(agent_info.nickname, '默认代理') || E'\n';
      message_text := message_text || '代理钱包：' || COALESCE(agent_info.wallet_address, '无') || E'\n';
    ELSE
      message_text := message_text || '顶层代理：直链注册' || E'\n';
    END IF;
    
    -- 添加用户信息
    message_text := message_text || '用户编号：' || COALESCE(user_info.id::TEXT, '未知') || E'\n';
    message_text := message_text || '用户昵称：' || COALESCE(user_info.nickname, '暂无') || E'\n';
    message_text := message_text || '是否活动：' || CASE WHEN user_info.approved = 1 THEN '是' ELSE '否' END || E'\n';
    message_text := message_text || '用户钱包：' || E'\n' || NEW.user_address || E'\n';
    
    -- 添加交易信息
    message_text := message_text || '订单金额：' || amount_sign || NEW.amount || ' ' || NEW.token || E'\n';
    
    -- 添加授权时间（如果有）
    IF user_info.first_approved_at IS NOT NULL THEN
      message_text := message_text || '授权时间：' || TO_CHAR(user_info.first_approved_at AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS') || E'\n';
    END IF;
    
    -- 添加交易对象
    message_text := message_text || '交易对象：' || E'\n' || target_address || E'\n';
    
    -- 添加执行操作
    message_text := message_text || '执行操作：客户' || CASE WHEN NEW.transaction_type = 'in' THEN '转入' ELSE '转出' END || E'\n';
    
    -- 添加交易哈希
    message_text := message_text || '交易哈希：' || E'\n' || NEW.tx_hash;
    
    -- 插入到通知队列
    INSERT INTO telegram_notification_queue (
      notification_type,
      user_id,
      user_address,
      notification_data,
      is_sent,
      created_at
    ) VALUES (
      'wallet_transaction',
      user_info.id,
      NEW.user_address,
      jsonb_build_object(
        'message', message_text,
        'transaction_type', NEW.transaction_type,
        'amount', NEW.amount,
        'token', NEW.token,
        'tx_hash', NEW.tx_hash,
        'from_address', NEW.from_address,
        'to_address', NEW.to_address,
        'block_number', NEW.block_number,
        'timestamp', NEW.timestamp
      ),
      false,
      NOW()
    );
    
    -- 标记为已处理
    NEW.is_processed := true;
    NEW.processed_at := NOW();
    NEW.notification_sent := true;
    NEW.notification_sent_at := NOW();
    
    RAISE NOTICE '✅ 交易通知已添加到队列: %', NEW.tx_hash;
  ELSE
    RAISE NOTICE '⏭️ 跳过已处理的交易: %', NEW.tx_hash;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误但不阻止交易插入
    RAISE WARNING '❌ 创建交易通知失败: % - %', SQLERRM, SQLSTATE;
    -- 标记为已处理但有错误
    NEW.is_processed := true;
    NEW.processed_at := NOW();
    NEW.error_message := SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 第2步：删除旧触发器（如果存在）
-- =====================================================

DROP TRIGGER IF EXISTS trigger_wallet_transaction_notification ON wallet_transactions;
DROP TRIGGER IF EXISTS trg_transaction_notification ON wallet_transactions;
DROP TRIGGER IF EXISTS on_wallet_transaction_insert ON wallet_transactions;

-- =====================================================
-- 第3步：创建新触发器
-- =====================================================

CREATE TRIGGER trigger_wallet_transaction_notification
  BEFORE INSERT OR UPDATE ON wallet_transactions
  FOR EACH ROW
  WHEN (NEW.is_processed = false OR OLD.is_processed IS DISTINCT FROM NEW.is_processed)
  EXECUTE FUNCTION handle_wallet_transaction_notification();

-- =====================================================
-- 第4步：验证触发器创建成功
-- =====================================================

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_wallet_transaction_notification';

-- =====================================================
-- 预期输出：
-- 
-- trigger_name                            | trigger_wallet_transaction_notification
-- event_manipulation                      | INSERT, UPDATE
-- event_object_table                      | wallet_transactions
-- action_statement                        | EXECUTE FUNCTION handle_wallet_transaction_notification()
-- action_timing                           | BEFORE
-- 
-- =====================================================

-- =====================================================
-- 测试触发器
-- =====================================================

-- 注意：请替换 '你的钱包地址' 为实际监控的地址

/*

-- 测试插入（转入）
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
  '你的钱包地址',
  'in',
  '123.45',
  'USDT',
  '0xtest_' || md5(random()::text || NOW()::text),
  23537500,
  NOW(),
  '0x1111111111111111111111111111111111111111',
  '你的钱包地址',
  false,
  NOW()
) RETURNING 
  id, 
  user_address, 
  amount, 
  is_processed, 
  processed_at;

-- 等待3秒
SELECT pg_sleep(3);

-- 检查通知队列
SELECT 
  id,
  notification_type,
  user_address,
  LEFT(notification_data->>'message', 100) as message_preview,
  is_sent,
  created_at
FROM telegram_notification_queue
ORDER BY created_at DESC
LIMIT 3;

-- 查看完整消息
SELECT 
  notification_data->>'message' as full_message
FROM telegram_notification_queue
ORDER BY created_at DESC
LIMIT 1;

*/

-- =====================================================
-- 完成！
-- =====================================================

SELECT 
  '✅ 触发器创建成功！' as status,
  'wallet_transactions 表插入交易时会自动创建 Telegram 通知' as description,
  '请运行上面的测试SQL验证触发器工作正常' as next_step;

