INSERT INTO reward_schedules (id, name, description, schedule_time, reward_rate, is_enabled, next_run_time, last_run_time, last_run_result, success_count, failure_count, created_at, updated_at, created_by, updated_by) VALUES
  ('04fa3e79-7493-4765-8527-2881a8659b52', 'periodic_rewards_6h', '每6小时发放定时奖励', '0 */6 * * *', 0.02, true, '2025-10-16T05:18:36.211083+00:00', NULL, NULL, 0, 0, '2025-10-16T04:57:47.413983+00:00', '2025-10-16T05:13:36.211083+00:00', 'system', 'system')
ON CONFLICT DO NOTHING;

