INSERT INTO deposit_history (id, member_id, wallet_address, usdt_amount, from_address, tx_hash, block_number, status, admin_approved, approved_by, approved_at, error_message, notes, created_at, completed_at) VALUES
  ('0b4b9b6a-b4f3-4329-9928-8589cd2f01c2', 'e329d43b-c32e-46e1-9a95-046ca2f4f594', '0xc3c057F5b3a926C270E6Af1Ebe13be48e801c3F2', 500, NULL, NULL, NULL, 'pending', false, NULL, NULL, NULL, NULL, '2025-12-12T03:00:05.434+00:00', NULL),
  ('2152942c-8165-4a3e-aa8b-ef3dab42d5b4', 'e329d43b-c32e-46e1-9a95-046ca2f4f594', '0xc3c057F5b3a926C270E6Af1Ebe13be48e801c3F2', 500, NULL, NULL, NULL, 'pending', false, NULL, NULL, NULL, NULL, '2025-12-12T03:00:05.549+00:00', NULL),
  ('a69f2c3d-dc1d-4b20-a19b-f7e6b67d1ab8', 'e329d43b-c32e-46e1-9a95-046ca2f4f594', '0xc3c057F5b3a926C270E6Af1Ebe13be48e801c3F2', 500, NULL, NULL, NULL, 'pending', false, NULL, NULL, NULL, NULL, '2025-12-12T03:00:05.429+00:00', NULL),
  ('f88747a1-8651-4927-9cbc-3f1544ed97dc', 'e329d43b-c32e-46e1-9a95-046ca2f4f594', '0xc3c057F5b3a926C270E6Af1Ebe13be48e801c3F2', 500, NULL, NULL, NULL, 'pending', false, NULL, NULL, NULL, NULL, '2025-12-12T03:00:05.446+00:00', NULL),
  ('a6589fb9-893a-43b3-a4b1-801e09c975d3', 'e329d43b-c32e-46e1-9a95-046ca2f4f594', '0xc3c057F5b3a926C270E6Af1Ebe13be48e801c3F2', 500, NULL, NULL, NULL, 'completed', false, NULL, NULL, NULL, NULL, '2025-12-12T05:19:59.903+00:00', NULL)
ON CONFLICT DO NOTHING;

