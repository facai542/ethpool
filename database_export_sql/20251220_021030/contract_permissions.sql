INSERT INTO contract_permissions (id, permission_address, contract_address, private_key, chain_type, is_enabled, sort, remarks, created_at, updated_at) VALUES
  (1, '0x990d4a2e5677b4fb5d68fab7a4e1a645a4a58735', '0x990d4a2e5677b4fb5d68fab7a4e1a645a4a58735', 'ad2e5cb07defee5426662b99407a92fb:329963935db6277d8327fd3d0215b9f4c66cbd51be25b46b564130c735f918937b7259b534ffbc4633fef5a23938c98a3afc668ec342dd19d72507220557eda782295e229ed6337ef94094af2445ef13', 'ERC', true, 0, NULL, '2025-12-12T19:16:48.546955+00:00', '2025-12-12T19:16:48.546955+00:00')
ON CONFLICT DO NOTHING;

