INSERT INTO wallet_monitor_config (id, config_key, config_value, description, is_active, created_at, updated_at) VALUES
  (1, 'telegram_bot_token', '', 'Telegram机器人Token', true, '2025-10-02T22:18:11.296724+00:00', '2025-10-02T22:18:11.296724+00:00'),
  (2, 'telegram_chat_id', '', 'Telegram群组ID', true, '2025-10-02T22:18:11.296724+00:00', '2025-10-02T22:18:11.296724+00:00'),
  (3, 'monitor_interval', '30000', '监听间隔（毫秒）', true, '2025-10-02T22:18:11.296724+00:00', '2025-10-02T22:18:11.296724+00:00'),
  (4, 'max_retry_count', '3', '最大重试次数', true, '2025-10-02T22:18:11.296724+00:00', '2025-10-02T22:18:11.296724+00:00'),
  (5, 'notification_enabled', 'true', '是否启用通知', true, '2025-10-02T22:18:11.296724+00:00', '2025-10-02T22:18:11.296724+00:00')
ON CONFLICT DO NOTHING;

