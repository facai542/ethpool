INSERT INTO nh_admin (admin_id, p_agentid, admin_name, admin_password, role_id, promo_code, status, add_time, last_login_time, update_time, google_secret, two_factor_enabled, two_factor_secret, two_factor_backup_codes, two_factor_enabled_at) VALUES
  (1, 0, 'it@haixin.org', '943a44a5c992c8fade8305f796c3afdc', 1, 'H87ZQ5', 1, '2019-09-03T13:31:20', '2025-12-13T14:36:34.197', '2025-07-04T08:26:12.226789', 'CARFWHY7NYWQ6QKT,MYWSDWJOT3KIMU35,YEOVTHDWNSA6N4QN', false, NULL, NULL, NULL),
  (3, 0, '代理A', '123456', 2, 'AG002', 1, '2025-07-10T12:23:09.263388', NULL, '2025-07-10T12:23:09.263388', NULL, false, NULL, NULL, NULL),
  (2, 0, 'agent001', '123456', 2, 'AG001', 1, '2025-07-10T12:23:02.664208', '2025-07-10T12:28:41.379', '2025-07-10T12:23:02.664208', NULL, false, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

