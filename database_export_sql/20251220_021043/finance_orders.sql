INSERT INTO finance_orders (id, user_id, order_no, method_id, type, amount, actual_amount, fee, address, status, remark, create_time, update_time, user_uuid) VALUES
  (232, '12345678-1234-1234-1234-123456789012', 'REWARD_TEST', 2, 'withdraw', 0.01, 0.01, 0.0, '0xTESTFIX123456789', 1, '[ETH奖励] 授权奖励 - 授权额度: 1000000 USDT, 奖励: 0.013 ETH', 1759790418, 1759790418, NULL)
ON CONFLICT DO NOTHING;

