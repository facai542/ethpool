INSERT INTO realtime_log_stream (id, log_level, category, message, details, related_log_id, created_at) VALUES
  (1, 'info', 'reward_distribution', '开始执行定时奖励发放任务', '{"taskName": "distribute_periodic_rewards", "executionTime": "2025-10-16T05:20:00.000Z"}'::jsonb, 1, '2025-10-16T05:42:06.39806+00:00'),
  (2, 'success', 'reward_distribution', '定时奖励发放任务完成', '{"totalUsers": 2, "successCount": 2, "totalEthDistributed": 0.0005580375}'::jsonb, 1, '2025-10-16T05:42:06.39806+00:00'),
  (3, 'info', 'system_event', '系统启动完成', '{"version": "1.0.0", "timestamp": "2025-10-16T05:20:00.000Z"}'::jsonb, NULL, '2025-10-16T05:42:06.39806+00:00')
ON CONFLICT DO NOTHING;

