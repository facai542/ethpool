INSERT INTO mining_pools (id, name, coin_type, reward_rate, min_amount, description, icon, sort, status, is_del, create_time) VALUES
  (1, 'ETH矿池', 'ETH', 8.5, 100.0, '以太坊挖矿，日收益率8.5%', NULL, 100, 1, 0, 1751031078),
  (2, 'BTC矿池', 'BTC', 6.8, 500.0, '比特币挖矿，日收益率6.8%', NULL, 90, 1, 0, 1751031078),
  (3, 'USDT矿池', 'USDT', 12.0, 50.0, 'USDT理财，日收益率12%', NULL, 80, 1, 0, 1751031078),
  (4, 'TRX矿池', 'TRX', 15.6, 30.0, '波场挖矿，日收益率15.6%', NULL, 70, 1, 0, 1751031078)
ON CONFLICT DO NOTHING;

