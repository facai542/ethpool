INSERT INTO daily_rewards (id, user_address, usdt_balance, reward_rate, usdt_reward, eth_reward, exchange_rate, reward_date, status, transaction_hash, error_message, created_at, updated_at) VALUES
  (1, '0x1234567890123456789012345678901234567890', 749.672625, 0.02, 14.993453, 0.003353, 0.00022364, '2025-10-04', 'completed', NULL, NULL, '2025-10-04T17:13:34.732879+00:00', '2025-10-04T17:13:34.732879+00:00')
ON CONFLICT DO NOTHING;

