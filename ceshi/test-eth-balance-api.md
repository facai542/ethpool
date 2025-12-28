# ETH余额更新API测试

## 修复内容

1. **表名修复**: 将 `users` 表改为 `nh_member` 表
2. **字段修复**: 使用正确的字段名称和格式
3. **时间格式**: 统一使用 ISO 字符串格式
4. **日志记录**: 使用 `nh_logs` 表记录操作日志

## 修复的字段

- `address`: 用户钱包地址
- `auth_address`: 认证地址（与address相同）
- `eth`: ETH余额
- `usdt`: USDT余额（默认为0）
- `cash`: 现金余额（默认为0）
- `withdrawal_usdt`: 提现USDT（默认为0）
- `gj_cash`: 奖励现金（默认为0）
- `status`: 状态（默认为1）
- `is_del`: 是否删除（默认为0）
- `is_effective`: 是否有效（默认为0）
- `approved`: 是否批准（默认为0）
- `add_time`: 添加时间（ISO格式）
- `update_time`: 更新时间（ISO格式）

## 测试步骤

1. 连接钱包
2. 进行verify操作
3. 检查ETH奖励是否正确添加
4. 检查数据库记录是否正确

## 预期结果

- 不再出现"创建用户记录失败"错误
- ETH余额正确更新
- 操作日志正确记录
