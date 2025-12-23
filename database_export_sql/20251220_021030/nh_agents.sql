INSERT INTO nh_agents (id, agent_code, agent_name, user_address, password, level, status, commission_rate, parent_agent_id, invite_code, invite_link, total_invites, valid_invites, total_commission, pending_commission, created_at, updated_at, permissions, referral_code) VALUES
  (11, 'XL003', 'XL003', '', '$2a$10$IzwGzd3HmuqhAL7EUmYkCeieYF3t5NA07U4L6roPGI.benXU12rEK', 1, 'active', 0.05, NULL, NULL, NULL, 0, 0, 0.0, 0.0, '2025-10-13T02:37:51.625177', '2025-10-13T02:37:51.625177', '[]', 'AGENT000011'),
  (9, 'XL002', 'XL002', '', '$2a$10$oHbLkf7ZXLMkOlE/UPkvTu0mZptoJU5sr1GtzjQ0b5CbbJMD1.UAK', 1, 'active', 0.05, NULL, NULL, NULL, 0, 0, 0.0, 0.0, '2025-10-08T17:04:41.806864', '2025-10-08T17:04:41.806864', '[]', 'AGENT000009'),
  (10, 'XL004', 'XL004', '0x0000000000000000000000000000000000000000', '123456', 1, 'active', 0.05, NULL, NULL, NULL, 0, 0, 0.0, 0.0, '2025-10-15T09:07:24.536326', '2025-10-15T09:07:24.536326', '[]', 'AGENT000010'),
  (8, 'XL001', 'XL001', '', '$2a$10$vr0CS1q23aV/ZFMbDmfgCenmogo8GshTZqqLwHyj1z.Ir4ViAZX8a', 1, 'active', 0.01, NULL, NULL, NULL, 4, 4, 0.0, 0.0, '2025-10-08T06:42:01.034821', '2025-10-08T17:59:38.864697', '[]', 'AGENT000008'),
  (12, 'XL005', 'XL005', '', '$2a$10$Hx31k23EsyAY35lbW5PgZO3wnojAyQ4n6CM9WC3J9/.T3Ze25ydcS', 1, 'active', 0.05, NULL, NULL, NULL, 1, 1, 0.0, 0.0, '2025-10-15T09:15:21.446514', '2025-10-15T09:15:21.446514', '[]', 'AGENT000012'),
  (13, 'XL006', 'XL006', '', '$2a$10$a33cGVKrBn7AvVbMhbAxTOdqbpPNSZNVMZc4l/gRWQLRIUoar.YFG', 1, 'active', 0.05, NULL, NULL, NULL, 16, 16, 0.0, 0.0, '2025-10-15T10:17:38.886709', '2025-10-15T10:17:38.886709', '[]', 'AGENT000013')
ON CONFLICT DO NOTHING;

