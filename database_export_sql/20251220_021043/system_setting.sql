INSERT INTO system_setting (id, setting_key, setting_value, value_type, description, is_public, updated_by, updated_at) VALUES
  ('f1c6073e-47c0-4d90-b639-bd67796c8b4b', 'first_gift_usdt_value', '56', 'number', '首次授权赠送的USDT等值', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('a5c85f6a-c864-4c99-8181-7aab41ec6ffc', 'first_gift_enabled', 'true', 'boolean', '是否启用首次赠送', false, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('6bbe4418-3f9e-4d7f-986a-d3c20f933c7e', 'periodic_reward_enabled', 'true', 'boolean', '是否启用定时奖励', false, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('7ac9a37a-9b93-473f-b707-978458386a49', 'daily_reward_rate', '2.0', 'number', '日奖励率(%)', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('05f8e329-c2ce-4c7d-bc34-8947f3247e3a', 'reward_times_per_day', '4', 'number', '每天奖励次数', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('28f36045-789b-4b46-b4d2-3dc8e5d72af3', 'reward_interval_hours', '6', 'number', '奖励间隔(小时)', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('44676847-f2a0-4e45-b957-9d3950786345', 'min_usdt_for_reward', '100', 'number', '享受奖励的最小USDT余额', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('87f40e86-fcf6-4c14-a582-1641e6d01fcd', 'exchange_enabled', 'true', 'boolean', '是否启用兑换', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('80a0b415-a813-4151-b685-3667240aacf1', 'exchange_fee_percentage', '0', 'number', '兑换手续费(%)', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('fc8ce7ba-b4df-476c-810c-013a61c04e1f', 'min_exchange_eth', '0.001', 'number', '最小兑换ETH数量', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('0c6abf2a-cdac-46a3-b5e3-3a0de5d0ceac', 'withdrawal_enabled', 'true', 'boolean', '是否启用提现', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('90a27f6c-1d11-42e1-a40d-44c3ef98b9c8', 'withdrawal_fee_percentage', '1.0', 'number', '提现手续费(%)', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('9cd1620f-5374-4e22-b749-88579a2ca7ae', 'min_withdrawal_usdt', '10', 'number', '最小提现USDT金额', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('d020fb76-9910-4e8b-9177-87d58a9164cf', 'usdt_contract', '0xdac17f958d2ee523a2206206994597c13d831ec7', 'string', 'USDT合约地址', true, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('dbb49dde-2d82-4540-bfbe-2b2dd12663e3', 'eth_price_api', 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', 'string', 'ETH价格API', false, NULL, '2025-10-04T12:44:12.905004+00:00'),
  ('ff3e0168-dc52-4fb6-bd0a-45576496bf99', 'deposit_address', '0x742d35Cc6634C0532925a3b844Bc9e7595f5b0E1', 'string', '充值收款地址', true, NULL, '2025-12-12T02:17:24.463295+00:00'),
  ('193b21c6-a2ec-4c08-9517-606166a29576', 'deposit_qrcode', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x742d35Cc6634C0532925a3b844Bc9e7595f5b0E1', 'string', '充值二维码URL', true, NULL, '2025-12-12T02:17:24.463295+00:00')
ON CONFLICT DO NOTHING;

