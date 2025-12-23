INSERT INTO system_execution_logs (id, task_name, execution_type, status, total_users, success_count, failed_count, skipped_count, total_eth_distributed, execution_time_ms, error_message, error_details, metadata, created_at, updated_at) VALUES
  (1, 'distribute_periodic_rewards', 'scheduled', 'completed', 2, 2, 0, 0, 0.00055804, 5000, NULL, NULL, '{"message": "\u5b9a\u65f6\u5956\u52b1\u53d1\u653e\u4efb\u52a1\u5b8c\u6210"}'::jsonb, '2025-10-16T05:41:58.174944+00:00', '2025-10-16T05:41:58.174944+00:00'),
  (2, 'backfill_rewards', 'manual', 'completed', 2, 2, 0, 0, 0.00055804, 3000, NULL, NULL, '{"message": "\u8865\u53d1\u5956\u52b1\u4efb\u52a1\u5b8c\u6210"}'::jsonb, '2025-10-16T05:41:58.174944+00:00', '2025-10-16T05:41:58.174944+00:00')
ON CONFLICT DO NOTHING;

