INSERT INTO cs_sessions (id, session_id, user_address, user_name, agent_id, status, started_at, closed_at, last_message_at, user_rating, tags, metadata) VALUES
  (2, '902fb376-d937-4bec-b3b0-ce5053c4b698', '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', 'User 0x6ce3', NULL, 'waiting', '2025-10-01T04:27:19.27938', NULL, '2025-10-01T04:27:19.27938', NULL, NULL, '{}'::jsonb),
  (1, '81ec16f4-3f2e-4c4d-86d6-ddb4fb52a158', '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', 'User 0x6ce3', NULL, 'waiting', '2025-10-01T04:27:19.275355', NULL, '2025-10-01T04:29:24.414', NULL, NULL, '{}'::jsonb),
  (4, '1ce3bca9-d8b5-4964-bf3a-ffd6b09ba6f4', '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', 'User 0x6ce3', NULL, 'waiting', '2025-10-01T04:31:40.151556', NULL, '2025-10-01T04:31:40.151556', NULL, NULL, '{}'::jsonb),
  (3, 'ad2a3abe-921b-4e16-b771-ba3a4034d10b', '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', 'User 0x6ce3', NULL, 'waiting', '2025-10-01T04:31:40.140609', NULL, '2025-10-01T04:31:37.289', NULL, NULL, '{}'::jsonb),
  (5, 'd433775e-0e56-42b1-ad42-11601944b7d2', '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', 'User 0x6ce3', NULL, 'waiting', '2025-10-01T04:41:22.872622', NULL, '2025-10-01T04:41:22.872622', NULL, NULL, '{}'::jsonb),
  (6, 'a93c62af-c4e2-479c-81c9-84fd5f5c049e', '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', 'User 0x6ce3', NULL, 'waiting', '2025-10-01T04:41:22.872613', NULL, '2025-10-01T04:41:22.872613', NULL, NULL, '{}'::jsonb),
  (7, '63a2985c-4453-4021-971a-fb3599ea569b', 'Anonymous', 'Guest', NULL, 'waiting', '2025-10-01T04:47:55.758427', NULL, '2025-10-01T04:47:55.758427', NULL, NULL, '{}'::jsonb),
  (8, '6fa63544-9308-453e-b76f-162a4fb7ac22', 'Anonymous', 'Guest', NULL, 'waiting', '2025-10-01T04:48:30.55443', NULL, '2025-10-01T04:48:30.55443', NULL, NULL, '{}'::jsonb),
  (9, '3a50cae2-3cb4-4cce-a706-bf8c05a42e98', 'Anonymous', 'Guest', NULL, 'waiting', '2025-10-01T04:48:45.148787', NULL, '2025-10-01T04:48:45.148787', NULL, NULL, '{}'::jsonb),
  (10, '147e914d-e101-4d88-9076-e1458a0096c9', 'Anonymous', 'Guest', NULL, 'waiting', '2025-10-01T04:49:43.980449', NULL, '2025-10-01T04:50:00.988', NULL, NULL, '{}'::jsonb),
  (11, '28e4deed-f5ce-4e25-b328-f273df3d3750', 'Anonymous', 'Guest', NULL, 'waiting', '2025-10-01T04:50:27.720207', NULL, '2025-10-01T04:50:27.720207', NULL, NULL, '{}'::jsonb),
  (12, '8ee982bb-ddbd-4054-8c47-86c85803a551', '0xd577233CFA76D97e46222988C436d107BC84cB86', 'User 0xd577', NULL, 'waiting', '2025-10-01T04:52:15.282425', NULL, '2025-10-01T04:52:15.282425', NULL, NULL, '{}'::jsonb),
  (13, 'f11566f4-deaa-4319-82ff-6f244230cbab', 'Anonymous', 'Guest', NULL, 'waiting', '2025-10-01T09:00:20.331345', NULL, '2025-10-01T09:00:20.331345', NULL, NULL, '{}'::jsonb),
  (14, '8a1afd74-6402-4538-988d-414d8a8d5da4', 'Anonymous', 'Guest', NULL, 'waiting', '2025-10-01T09:00:32.620344', NULL, '2025-10-01T09:00:32.620344', NULL, NULL, '{}'::jsonb),
  (15, 'f6a1d29e-1606-4c1f-a929-1d99e7fe7b3a', '0x7Aadd91038D8dEAc9B83D25A44d427a60e95C8FD', 'User 0x7Aad', NULL, 'waiting', '2025-10-01T13:25:49.760701', NULL, '2025-10-01T13:25:49.760701', NULL, NULL, '{}'::jsonb),
  (16, '5b40c0ca-f4a3-42f4-890f-81959eea5a60', '0x7Aadd91038D8dEAc9B83D25A44d427a60e95C8FD', 'User 0x7Aad', NULL, 'waiting', '2025-10-01T13:25:56.256606', NULL, '2025-10-01T13:25:56.256606', NULL, NULL, '{}'::jsonb),
  (17, '78cc02e7-069b-4280-be8e-ca912c3249b5', 'Anonymous', 'Guest', NULL, 'waiting', '2025-10-01T14:13:36.210812', NULL, '2025-10-01T14:13:41.501', NULL, NULL, '{}'::jsonb)
ON CONFLICT DO NOTHING;

