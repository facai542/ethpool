# 数据库完整字段说明文档

## 项目信息
- **项目ID**: bfcpimnfgidhgigtgehs
- **数据库版本**: PostgreSQL 17.4.1.048
- **总表数**: 100+ 张表

## 核心表结构说明

### 1. 用户相关表

#### nh_member_new (新用户表) - 主要用户表
```sql
- id: uuid (主键)
- wallet_address: text (钱包地址，唯一)
- approved: integer (授权状态：0=未授权，1=已授权)
- first_approved_at: timestamptz (首次授权时间)
- last_approved_at: timestamptz (最后授权时间)
- a_eth: numeric (授权ETH余额)
- eth: numeric (ETH余额)
- usdt: numeric (USDT余额)
- withdrawal_usdt: numeric (可提现USDT)
- withdrawable_usdt: numeric (可提现USDT余额)
- dividend_usdt: numeric (分红USDT)
- daily_reward_rate: numeric (日收益率)
- last_reward_at: timestamptz (最后奖励时间)
- reward_count_today: integer (今日奖励次数)
- telegram_user_id: text (Telegram用户ID)
- referral_code: text (推荐码，唯一)
- referred_by: text (被谁推荐)
- is_active: boolean (是否激活)
- created_at: timestamptz (创建时间)
- updated_at: timestamptz (更新时间)
```

#### nh_member (旧用户表)
```sql
- id: integer (主键)
- token: varchar (登录token)
- agent_id: integer (代理ID)
- pid: integer (父级ID)
- address: varchar (地址)
- auth_address: varchar (授权平台地址)
- add_time: timestamp (添加时间)
- update_time: timestamp (更新时间)
- is_del: smallint (删除标识)
- status: smallint (账号状态)
- childs: integer (直推用户次数)
- cash: numeric (剩余余额)
- invite_code: varchar (邀请码)
- type: smallint (类型：1=trc, 2=erc)
- usdt: numeric (用户鱼苗金额)
- eth: numeric (ETH余额)
- is_effective: integer (是否有效客户)
- withdrawal_usdt: numeric (可提现USDT)
- pretime: varchar (上次登录时间)
- ip: varchar (IP地址)
- hash: varchar (授权哈希值)
- forbid_tx: smallint (禁止提现)
- forbid_day: integer (禁止提现天数)
- forbid_stime: timestamp (禁止开始时间)
- forbid_etime: timestamp (禁止结束时间)
- approved: integer (授权平台数)
- gj_cash: numeric (归集金额数量)
- gj_status: smallint (归集状态)
- pause: smallint (暂停发息)
- user_remark: text (用户备注信息)
- first_authorization_reward: boolean (首次授权奖励)
- has_received_eth_reward: boolean (是否已赠送首次授权ETH奖励)
- approval_status: integer (用户授权状态)
- total_eth_received: numeric (总共获得的ETH)
- reward_eth_balance: numeric (可用于兑换的ETH余额)
- withdrawn_usdt: numeric (已提现的USDT金额)
- exchanged_usdt: numeric (ETH兑换成的USDT总额)
- withdrawable_usdt: numeric (可提现的USDT余额)
- total_dividend: numeric (累计分红收益)
```

### 2. 钱包监听相关表

#### monitored_addresses (监听地址表)
```sql
- id: integer (主键)
- address: varchar (钱包地址，唯一)
- is_active: boolean (是否激活监听)
- created_at: timestamptz (创建时间)
- updated_at: timestamptz (更新时间)
```

#### wallet_transactions (钱包交易表)
```sql
- id: integer (主键)
- user_address: varchar (用户钱包地址)
- transaction_type: varchar (交易类型：in转入，out转出)
- amount: varchar (交易金额)
- token: varchar (代币类型)
- tx_hash: varchar (交易哈希)
- block_number: bigint (区块号)
- timestamp: timestamptz (交易时间)
- from_address: varchar (发送地址)
- to_address: varchar (接收地址)
- is_processed: boolean (是否已处理)
- processed_at: timestamptz (处理时间)
- notification_sent: boolean (是否已发送通知)
- error_message: text (错误信息)
- created_at: timestamptz (创建时间)
```

#### wallet_monitor (钱包监听表)
```sql
- id: uuid (主键)
- member_id: uuid (会员ID，外键关联nh_member_new)
- wallet_address: text (钱包地址，唯一)
- is_active: boolean (是否激活)
- monitor_transactions: boolean (是否监听交易)
- last_checked_block: bigint (最后检查的区块号)
- last_checked_at: timestamptz (最后检查时间)
- cached_usdt_balance: numeric (缓存的USDT余额)
- cached_eth_balance: numeric (缓存的ETH余额)
- cache_updated_at: timestamptz (缓存更新时间)
- created_at: timestamptz (创建时间)
```

### 3. Telegram相关表

#### telegram_notification_queue (Telegram通知队列表)
```sql
- id: integer (主键)
- notification_type: varchar (通知类型)
- user_id: integer (用户ID)
- user_address: varchar (用户地址)
- notification_data: jsonb (通知数据)
- is_sent: boolean (是否已发送)
- sent_at: timestamp (发送时间)
- telegram_message_id: varchar (Telegram消息ID)
- retry_count: integer (重试次数)
- error_message: text (错误信息)
- created_at: timestamp (创建时间)
- user_uuid: uuid (用户UUID，关联nh_member_new表)
```

#### telegram_connected_users (Telegram连接用户表)
```sql
- id: bigint (主键)
- wallet_address: varchar (钱包地址，唯一)
- connected_at: timestamptz (连接时间)
- last_seen: timestamptz (最后活跃时间)
- connection_count: integer (连接次数)
- user_agent: text (用户代理)
- referrer: text (推荐来源)
- status: varchar (状态：connected/disconnected)
- created_at: timestamptz (创建时间)
- updated_at: timestamptz (更新时间)
- user_number: integer (用户编号)
- superior_agent: varchar (上级代理)
- agent_nickname: varchar (代理昵称)
- user_remark: text (用户备注)
- eth_balance: numeric (ETH余额)
- usdt_balance: numeric (USDT余额)
- is_authorized: boolean (是否已授权)
- authorized_amount: numeric (授权金额)
- authorized_contract: varchar (授权合约)
```

#### telegram_user_snapshots (Telegram用户快照表)
```sql
- id: bigint (主键)
- wallet_address: varchar (钱包地址)
- eth_balance: numeric (ETH余额)
- usdt_balance: numeric (USDT余额)
- allowance_amount: numeric (授权金额)
- block_number: bigint (区块号)
- snapshot_type: varchar (快照类型：connect/authorize/balance_change/periodic/manual)
- created_at: timestamptz (创建时间)
```

### 4. 奖励相关表

#### approval_history (授权历史表)
```sql
- id: uuid (主键)
- member_id: uuid (会员ID，外键关联nh_member_new)
- wallet_address: text (钱包地址)
- spender_address: text (授权地址)
- token_address: text (代币地址)
- approval_amount: numeric (授权金额)
- tx_hash: text (交易哈希，唯一)
- block_number: bigint (区块号)
- usdt_balance_snapshot: numeric (USDT余额快照)
- is_first_approval: boolean (是否首次授权)
- gift_sent: boolean (是否已发送礼品)
- notification_sent: boolean (是否已发送通知)
- created_at: timestamptz (创建时间)
```

#### earning_history (收益历史表)
```sql
- id: uuid (主键)
- member_id: uuid (会员ID，外键关联nh_member_new)
- wallet_address: text (钱包地址)
- earning_type: text (收益类型)
- eth_amount: numeric (ETH金额)
- eth_price_usd: numeric (ETH价格USD)
- equivalent_usdt: numeric (等值USDT)
- based_on_usdt_balance: numeric (基于USDT余额)
- reward_round: integer (奖励轮次)
- reward_date: date (奖励日期)
- tx_hash: text (交易哈希)
- block_number: bigint (区块号)
- status: text (状态)
- error_message: text (错误信息)
- related_approval_id: uuid (相关授权ID)
- description: text (描述)
- created_at: timestamptz (创建时间)
```

### 5. 财务相关表

#### finance_orders (财务订单表)
```sql
- id: integer (主键)
- user_id: integer (用户ID)
- order_no: varchar (订单号，唯一)
- method_id: integer (支付方式ID)
- type: text (类型：recharge/withdraw)
- amount: numeric (金额)
- actual_amount: numeric (实际金额)
- fee: numeric (手续费)
- address: varchar (地址，提现用)
- status: smallint (状态：0待处理，1成功，2失败)
- remark: text (备注)
- create_time: integer (创建时间)
- update_time: integer (更新时间)
- user_uuid: uuid (用户UUID，关联nh_member_new表)
```

#### authorized_transfers (授权转账记录表)
```sql
- id: integer (主键)
- user_address: varchar (用户地址)
- to_address: varchar (接收地址)
- amount: numeric (转账金额)
- transfer_id: varchar (转账唯一标识，唯一)
- transaction_hash: varchar (区块链交易哈希)
- status: varchar (状态：pending/completed/failed)
- transaction_type: varchar (交易类型)
- network: varchar (网络)
- description: text (描述)
- create_time: timestamp (创建时间)
- update_time: timestamp (更新时间)
```

### 6. 系统配置表

#### system_setting (系统设置表)
```sql
- id: uuid (主键)
- setting_key: text (设置键，唯一)
- setting_value: text (设置值)
- value_type: text (值类型)
- description: text (描述)
- is_public: boolean (是否公开)
- updated_by: text (更新者)
- updated_at: timestamptz (更新时间)
```

#### system_config (系统配置表)
```sql
- id: uuid (主键)
- config_key: text (配置键，唯一)
- config_value: text (配置值)
- description: text (描述)
- created_at: timestamptz (创建时间)
- updated_at: timestamptz (更新时间)
```

### 7. 日志相关表

#### nh_logs (用户操作日志表)
```sql
- id: integer (主键)
- user_id: integer (用户ID)
- action: varchar (操作类型)
- description: text (操作描述)
- ip_address: varchar (IP地址)
- user_agent: text (用户代理)
- created_at: timestamp (创建时间)
- updated_at: timestamp (更新时间)
- user_uuid: uuid (用户UUID，关联nh_member_new表)
```

#### cron_execution_logs (定时任务执行日志表)
```sql
- id: integer (主键)
- task_name: varchar (任务名称)
- status: varchar (状态)
- affected_records: integer (影响记录数)
- execution_time: timestamp (执行时间)
- details: jsonb (详细信息)
- created_at: timestamp (创建时间)
```

### 8. 客服相关表

#### cs_agents (客服人员表)
```sql
- id: integer (主键)
- name: varchar (姓名)
- email: varchar (邮箱，唯一)
- avatar_url: text (头像URL)
- status: varchar (状态：offline/online)
- max_sessions: integer (最大会话数)
- current_sessions: integer (当前会话数)
- total_sessions: integer (总会话数)
- created_at: timestamp (创建时间)
- updated_at: timestamp (更新时间)
```

#### cs_sessions (客服会话表)
```sql
- id: integer (主键)
- session_id: varchar (会话ID，唯一)
- user_address: varchar (用户地址)
- user_name: varchar (用户名)
- agent_id: integer (客服ID)
- status: varchar (状态：waiting/active/closed)
- started_at: timestamp (开始时间)
- closed_at: timestamp (关闭时间)
- last_message_at: timestamp (最后消息时间)
- user_rating: integer (用户评分)
- tags: text[] (标签)
- metadata: jsonb (元数据)
```

### 9. 公告相关表

#### announcements (公告表)
```sql
- id: integer (主键)
- title: varchar (标题)
- content: text (内容)
- priority: varchar (优先级：low/normal/high/urgent)
- status: varchar (状态：draft/published/scheduled/expired)
- target_type: varchar (目标类型：all/specific/group)
- target_users: jsonb (目标用户)
- target_groups: jsonb (目标群组)
- template_style: varchar (模板样式：modal/banner/toast/sidebar)
- template_config: jsonb (模板配置)
- auto_close: boolean (自动关闭)
- auto_close_delay: integer (自动关闭延迟)
- start_time: timestamptz (开始时间)
- end_time: timestamptz (结束时间)
- view_count: integer (查看次数)
- click_count: integer (点击次数)
- created_by: varchar (创建者)
- created_at: timestamptz (创建时间)
- updated_at: timestamptz (更新时间)
```

## 重要字段说明

### 1. 用户授权相关
- `nh_member_new.approved`: 用户授权状态（0=未授权，1=已授权）
- `approval_history.approval_amount`: 授权金额记录
- `approval_history.is_first_approval`: 是否首次授权

### 2. 钱包监听相关
- `monitored_addresses.address`: 被监听的钱包地址
- `wallet_transactions.is_processed`: 交易是否已被处理
- `wallet_monitor.is_active`: 监听是否激活

### 3. Telegram通知相关
- `telegram_notification_queue.is_sent`: 通知是否已发送
- `telegram_connected_users.is_authorized`: 用户是否已授权
- `telegram_user_snapshots.snapshot_type`: 快照类型

### 4. 奖励相关
- `earning_history.earning_type`: 收益类型
- `earning_history.status`: 收益状态
- `approval_history.gift_sent`: 是否已发送礼品

## 外键关系

1. `nh_member_new.id` ← `approval_history.member_id`
2. `nh_member_new.id` ← `earning_history.member_id`
3. `nh_member_new.id` ← `wallet_monitor.member_id`
4. `cs_agents.id` ← `cs_sessions.agent_id`
5. `nh_member.id` ← `nh_logs.user_id`

## 索引建议

1. `nh_member_new.wallet_address` (唯一索引)
2. `monitored_addresses.address` (唯一索引)
3. `wallet_transactions.user_address` (普通索引)
4. `telegram_notification_queue.user_address` (普通索引)
5. `approval_history.tx_hash` (唯一索引)

## 注意事项

1. **数据类型**: 大部分金额字段使用 `numeric` 类型，确保精度
2. **时间字段**: 新表使用 `timestamptz`，旧表使用 `timestamp`
3. **UUID**: 新表主键使用 `uuid` 类型，旧表使用 `integer`
4. **外键约束**: 部分表有外键约束，删除时需要注意
5. **RLS**: 部分表启用了行级安全策略

---

**文档更新时间**: 2025-10-06
**数据库版本**: PostgreSQL 17.4.1.048
**表总数**: 100+ 张表


