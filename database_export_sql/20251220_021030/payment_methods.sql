INSERT INTO payment_methods (id, name, type, icon, min_amount, max_amount, rate, description, sort, status, is_del, create_time) VALUES
  (1, 'USDT-TRC20充值', 'recharge', NULL, 10.0, 50000.0, 0.0, 'USDT TRC20网络充值', 100, 1, 0, 1751031108),
  (2, 'USDT-ERC20充值', 'recharge', NULL, 10.0, 50000.0, 2.0, 'USDT ERC20网络充值，手续费2%', 90, 1, 0, 1751031108),
  (3, '银行卡充值', 'recharge', NULL, 100.0, 10000.0, 0.5, '银行卡充值，手续费0.5%', 80, 1, 0, 1751031108),
  (4, 'USDT-TRC20提现', 'withdraw', NULL, 20.0, 10000.0, 1.0, 'USDT TRC20网络提现，手续费1%', 100, 1, 0, 1751031108),
  (5, 'USDT-ERC20提现', 'withdraw', NULL, 50.0, 10000.0, 3.0, 'USDT ERC20网络提现，手续费3%', 90, 1, 0, 1751031108),
  (6, '银行卡提现', 'withdraw', NULL, 100.0, 5000.0, 2.0, '银行卡提现，手续费2%', 80, 1, 0, 1751031108)
ON CONFLICT DO NOTHING;

