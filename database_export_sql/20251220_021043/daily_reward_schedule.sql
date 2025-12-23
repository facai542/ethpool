INSERT INTO daily_reward_schedule (id, task_name, is_enabled, cron_expression, last_run_time, next_run_time, run_count, success_count, failure_count, last_error_message, created_at, updated_at) VALUES
  (1, 'daily_reward_distribution', true, '0 0 * * *', NULL, NULL, 0, 0, 0, NULL, '2025-09-29T17:23:50.336648+00:00', '2025-09-29T17:23:50.336648+00:00')
ON CONFLICT DO NOTHING;

