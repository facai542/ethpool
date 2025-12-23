INSERT INTO cron_execution_logs_new (id, task_name, status, affected_records, execution_time, details, created_at) VALUES
  (1, 'wallet_balance_reward_distribution', 'success', 25, '2025-10-05T01:56:49.698581+00:00', '{"eth_price": 2500.0, "daily_rate": 2.0, "max_rewards": 4}'::jsonb, '2025-10-05T01:56:49.698581+00:00'),
  (2, 'wallet_balance_reward_distribution', 'success', 23, '2025-10-08T01:54:53.229895+00:00', '{"eth_price": 4480.16, "max_rewards": 4, "using_realtime_price": true}'::jsonb, '2025-10-08T01:54:53.229895+00:00'),
  (3, 'wallet_balance_reward_distribution', 'success', 2, '2025-10-08T02:00:56.934519+00:00', '{"eth_price": 4480.16, "skip_count": 56, "success_count": 2, "processed_users": 58, "max_rewards_per_day": 4, "using_realtime_price": true, "using_onchain_balance": true}'::jsonb, '2025-10-08T02:00:56.934519+00:00')
ON CONFLICT DO NOTHING;

