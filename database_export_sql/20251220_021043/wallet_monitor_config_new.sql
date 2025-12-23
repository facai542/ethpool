INSERT INTO wallet_monitor_config_new (id, config_key, config_value, description, is_active, created_at, updated_at) VALUES
  (1, 'usdt_contract_address', '0xdAC17F958D2ee523a2206206994597C13D831ec7', 'USDT合约地址', true, '2025-10-04T22:21:07.572385+00:00', '2025-10-04T22:21:07.572385+00:00'),
  (2, 'eth_mainnet_rpc_url', 'https://eth-mainnet.g.alchemy.com/v2/demo', 'ETH主网RPC地址', true, '2025-10-04T22:21:07.572385+00:00', '2025-10-04T22:21:07.572385+00:00'),
  (3, 'reward_schedule_cron', '0 */6 * * *', '奖励发放定时任务（每6小时）', true, '2025-10-04T22:21:07.572385+00:00', '2025-10-04T22:21:07.572385+00:00'),
  (4, 'min_usdt_balance', '1', '最小USDT余额要求', true, '2025-10-04T22:21:07.572385+00:00', '2025-10-04T22:21:07.572385+00:00'),
  (5, 'max_rewards_per_day', '4', '每日最大奖励次数', true, '2025-10-04T22:21:07.572385+00:00', '2025-10-04T22:21:07.572385+00:00'),
  (6, 'eth_price_usdt', '2500', 'ETH价格（USDT）', true, '2025-10-04T22:21:07.572385+00:00', '2025-10-04T22:21:07.572385+00:00'),
  (7, 'daily_reward_rate', '2.0', '日收益率（%）', true, '2025-10-04T22:21:07.572385+00:00', '2025-10-04T22:21:07.572385+00:00')
ON CONFLICT DO NOTHING;

