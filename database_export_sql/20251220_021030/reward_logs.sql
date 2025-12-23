INSERT INTO reward_logs (id, user_id, amount, reward_type, transaction_hash, created_at, user_address, reason) VALUES
  (3, NULL, 0.012738, 'eth_bonus', NULL, '2025-10-02T03:28:36.39', '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', 'authorization_bonus'),
  (4, NULL, 0.012748, 'eth_bonus', NULL, '2025-10-02T13:30:21.85', '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', 'first_authorization_bonus'),
  (5, NULL, 0.012684, 'eth_bonus', NULL, '2025-10-02T14:06:20.968', '0x119f61A8F63681BEd88eCE62ecD0af5856c16b24', 'first_authorization_bonus'),
  (6, NULL, 0.012694, 'eth_bonus', NULL, '2025-10-02T14:08:17.785', '0x8A5F7289AE958AB99Ca6a552Ac4164Ae8008247e', 'first_authorization_bonus'),
  (7, NULL, 0.0125, 'eth_bonus', NULL, '2025-10-02T22:52:32.071', '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', 'first_authorization_bonus'),
  (8, NULL, 0.0125, 'eth_bonus', NULL, '2025-10-03T00:22:11.397', '0x0af7291d58705000000000000000000000000000', '测试奖励'),
  (9, NULL, 0.01, 'eth_bonus', NULL, '2025-10-03T01:52:57.152', '0x1234567890123456789012345678901234567890', '测试奖励'),
  (10, NULL, 0.0125, 'eth_bonus', NULL, '2025-10-03T01:53:26.453', '0x677f06415cd6b000000000000000000000000000', 'first_authorization_bonus')
ON CONFLICT DO NOTHING;

