INSERT INTO approval_history (id, member_id, wallet_address, spender_address, token_address, approval_amount, tx_hash, block_number, usdt_balance_snapshot, is_first_approval, gift_sent, notification_sent, created_at) VALUES
  ('337b2566-e33c-4474-9b63-ac81990d26d9', '78335f00-a7f7-4d87-baad-ee454ce0d8b7', '0x1234567890123456789012345678901234567890', '0xcontract123456789012345678901234567890', '0xdac17f958d2ee523a2206206994597c13d831ec7', 1000000, '0xtest123456789012345678901234567890', 12345678, 1000, true, false, false, '2025-10-04T12:45:34.824086+00:00'),
  ('5a1d6459-6964-4e1d-bb81-1788ef27bd26', '45035eb4-38f6-4537-a390-fdcb9c66d1b1', '0x2f77D8B6fd22816d6016fc0CE20F3b5E086F8FC5', '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218', '0xdAC17F958D2ee523a2206206994597C13D831ec7', 1000000, 'System Authorization', NULL, NULL, true, false, false, '2025-10-06T20:27:12.072819+00:00')
ON CONFLICT DO NOTHING;

