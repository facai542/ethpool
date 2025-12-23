INSERT INTO cs_agents (id, name, email, avatar_url, status, max_sessions, current_sessions, total_sessions, created_at, updated_at) VALUES
  (1, '客服小助手', 'support@ethmax.com', '/avatars/agent1.png', 'online', 5, 0, 0, '2025-10-01T04:22:46.663297', '2025-10-01T04:22:46.663297'),
  (2, '技术支持', 'tech@ethmax.com', '/avatars/agent2.png', 'online', 5, 0, 0, '2025-10-01T04:22:46.663297', '2025-10-01T04:22:46.663297')
ON CONFLICT DO NOTHING;

