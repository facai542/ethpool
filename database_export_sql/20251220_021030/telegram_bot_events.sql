INSERT INTO telegram_bot_events (id, event_type, wallet_address, event_data, message_sent, telegram_message_id, error_message, created_at) VALUES
  (1, 'user_connect', '0x1234567890123456789012345678901234567890', '{"demo": true}'::jsonb, false, NULL, NULL, '2025-09-27T14:15:08.399389+00:00'),
  (2, 'user_authorize', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', '{"demo": true}'::jsonb, false, NULL, NULL, '2025-09-27T14:15:08.671278+00:00'),
  (3, 'system', NULL, '{"action": "startup", "blockNumber": 23455115, "botUsername": "ethpoolusdtbot", "loadedUsers": 3, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-27T15:04:41.036859+00:00'),
  (4, 'balance_change', '0x9876543210987654321098765432109876543210', '{"address": "0x9876543210987654321098765432109876543210", "allowance": "0.0000", "ethBalance": "0.0001", "lastUpdated": "2025-09-27T15:05:09.656Z", "usdtBalance": "0.0000"}'::jsonb, true, '22', NULL, '2025-09-27T15:05:12.957799+00:00'),
  (5, 'balance_change', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', '{"address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", "allowance": "0.0000", "ethBalance": "0.0001", "lastUpdated": "2025-09-27T15:05:12.383Z", "usdtBalance": "0.0000"}'::jsonb, true, '23', NULL, '2025-09-27T15:05:15.654214+00:00'),
  (6, 'balance_change', '0x1234567890123456789012345678901234567890', '{"address": "0x1234567890123456789012345678901234567890", "allowance": "0.0000", "ethBalance": "17.2407", "lastUpdated": "2025-09-27T15:05:15.055Z", "usdtBalance": "749.6726"}'::jsonb, true, '26', NULL, '2025-09-27T15:05:18.784052+00:00'),
  (7, 'system', NULL, '{"action": "startup", "blockNumber": 23455278, "botUsername": "ethpoolusdtbot", "loadedUsers": 0, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-27T15:37:28.217145+00:00'),
  (8, 'system', NULL, '{"action": "startup", "blockNumber": 23455385, "botUsername": "ethpoolusdtbot", "loadedUsers": 1, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-27T15:58:59.269174+00:00'),
  (9, 'system', NULL, '{"action": "startup", "blockNumber": 23455670, "botUsername": "ethpoolusdtbot", "loadedUsers": 3, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-27T16:56:16.442077+00:00'),
  (10, 'system', NULL, '{"action": "startup", "blockNumber": 23455760, "botUsername": "ethpoolusdtbot", "loadedUsers": 3, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-27T17:14:20.263777+00:00'),
  (16, 'system', NULL, '{"action": "startup", "blockNumber": 23463246, "botUsername": "ethpoolusdtbot", "loadedUsers": 4, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-28T18:21:02.169245+00:00'),
  (17, 'system', NULL, '{"action": "startup", "blockNumber": 23464715, "botUsername": "ethpoolusdtbot", "loadedUsers": 4, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-28T23:17:01.594742+00:00'),
  (42, 'system', NULL, '{"action": "startup", "blockNumber": 23473351, "botUsername": "ethpoolusdtbot", "loadedUsers": 8, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-30T04:14:15.269232+00:00'),
  (44, 'system', NULL, '{"action": "startup", "blockNumber": 23473361, "botUsername": "ethpoolusdtbot", "loadedUsers": 8, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-30T04:16:23.92227+00:00'),
  (46, 'system', NULL, '{"action": "startup", "blockNumber": 23473452, "botUsername": "ethpoolusdtbot", "loadedUsers": 9, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-30T04:34:25.733598+00:00'),
  (50, 'system', NULL, '{"action": "startup", "blockNumber": 23473576, "botUsername": "ethpoolusdtbot", "loadedUsers": 10, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-30T04:59:17.547186+00:00'),
  (55, 'system', NULL, '{"action": "startup", "blockNumber": 23473659, "botUsername": "ethpoolusdtbot", "loadedUsers": 11, "webhookPort": "3001"}'::jsonb, false, NULL, NULL, '2025-09-30T05:15:50.828392+00:00')
ON CONFLICT DO NOTHING;

