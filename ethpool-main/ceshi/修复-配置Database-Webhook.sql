-- =====================================================
-- 修复方案：直接在触发器中发送 Telegram 消息
-- 不依赖 Edge Function，直接调用 Telegram API
-- =====================================================

-- 删除旧触发器
DROP TRIGGER IF EXISTS trigger_wallet_transaction_notification ON wallet_transactions;
DROP FUNCTION IF EXISTS handle_wallet_transaction_notification();

-- 创建新的触发器函数（直接发送 Telegram）
CREATE OR REPLACE FUNCTION handle_wallet_transaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_id_var UUID;
  telegram_token TEXT;
  telegram_chat_id TEXT;
  message_text TEXT;
  emoji TEXT;
  action TEXT;
  sign TEXT;
  target_address TEXT;
  http_response TEXT;
BEGIN
  RAISE NOTICE '🔔 触发器触发！地址: %, 金额: %', NEW.user_address, NEW.amount;
  
  -- 获取 Telegram 配置
  SELECT config_value INTO telegram_token 
  FROM system_config 
  WHERE config_key = 'TELEGRAM_BOT_TOKEN';
  
  SELECT config_value INTO telegram_chat_id 
  FROM system_config 
  WHERE config_key = 'TELEGRAM_CHAT_ID';
  
  IF telegram_token IS NULL OR telegram_chat_id IS NULL THEN
    RAISE WARNING '❌ Telegram 配置缺失';
    RETURN NEW;
  END IF;
  
  -- 设置消息参数
  IF NEW.transaction_type = 'in' THEN
    emoji := '🟢';
    action := '收入';
    sign := '+';
    target_address := NEW.from_address;
  ELSE
    emoji := '🔴';
    action := '支出';
    sign := '-';
    target_address := NEW.to_address;
  END IF;
  
  -- 构建消息
  message_text := emoji || action || 'USDT 提醒       ' || sign || NEW.amount || ' USDT' || E'\n\n';
  message_text := message_text || '用户钱包：' || E'\n' || NEW.user_address || E'\n';
  message_text := message_text || '订单金额：' || sign || NEW.amount || ' ' || NEW.token || E'\n';
  message_text := message_text || '交易对象：' || E'\n' || target_address || E'\n';
  message_text := message_text || '执行操作：客户' || CASE WHEN NEW.transaction_type = 'in' THEN '转入' ELSE '转出' END || E'\n';
  message_text := message_text || '交易哈希：' || E'\n' || NEW.tx_hash;
  
  -- 使用 pg_net 扩展发送 HTTP 请求到 Telegram
  -- 注意：需要先启用 pg_net 扩展
  BEGIN
    -- 发送 Telegram 消息
    SELECT content::text INTO http_response
    FROM http_post(
      'https://api.telegram.org/bot' || telegram_token || '/sendMessage',
      '{"chat_id":"' || telegram_chat_id || '","text":"' || replace(message_text, '"', '\"') || '"}',
      'application/json'
    );
    
    RAISE NOTICE '✅ Telegram 消息已发送！响应: %', http_response;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING '❌ 发送 Telegram 失败: %', SQLERRM;
  END;
  
  -- 同时插入通知队列作为备份
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
      'transaction_type', NEW.transaction_type,
      'amount', NEW.amount,
      'token', NEW.token,
      'tx_hash', NEW.tx_hash,
      'from_address', NEW.from_address,
      'to_address', NEW.to_address
    ),
    true,
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ 触发器错误: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER trigger_wallet_transaction_notification
  AFTER INSERT ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_wallet_transaction_notification();

-- 验证
SELECT '✅ 新触发器已创建（直接发送 Telegram）' as status;

-- 启用 pg_net 扩展（如果还没启用）
-- 注意：需要数据库超级用户权限
-- CREATE EXTENSION IF NOT EXISTS pg_net;

