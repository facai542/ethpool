-- ============================================
-- 数据库导出脚本
-- 源数据库: bfcpimnfgidhgigtgehs
-- 生成时间: 2025-12-20 01:58:56
-- ============================================
-- 说明: 在源数据库的 SQL Editor 中执行此脚本
-- 将生成 COPY 命令用于导出数据
-- ============================================

-- 导出表: finance_orders
COPY (SELECT * FROM finance_orders) TO STDOUT WITH CSV HEADER;

-- 导出表: mining_orders
COPY (SELECT * FROM mining_orders) TO STDOUT WITH CSV HEADER;

-- 导出表: mining_pools
COPY (SELECT * FROM mining_pools) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_address
COPY (SELECT * FROM nh_address) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_admin
COPY (SELECT * FROM nh_admin) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_finance
COPY (SELECT * FROM nh_finance) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_withdraw
COPY (SELECT * FROM nh_withdraw) TO STDOUT WITH CSV HEADER;

-- 导出表: payment_methods
COPY (SELECT * FROM payment_methods) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_setting
COPY (SELECT * FROM nh_setting) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_role
COPY (SELECT * FROM nh_role) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_node
COPY (SELECT * FROM nh_node) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_login_log
COPY (SELECT * FROM nh_login_log) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_operate_log
COPY (SELECT * FROM nh_operate_log) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_banner
COPY (SELECT * FROM nh_banner) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_goods
COPY (SELECT * FROM nh_goods) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_goods_level
COPY (SELECT * FROM nh_goods_level) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_invitation
COPY (SELECT * FROM nh_invitation) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_point
COPY (SELECT * FROM nh_point) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_order
COPY (SELECT * FROM nh_order) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_receive_log
COPY (SELECT * FROM nh_receive_log) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_recharge
COPY (SELECT * FROM nh_recharge) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_reward_set
COPY (SELECT * FROM nh_reward_set) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_service_link
COPY (SELECT * FROM nh_service_link) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_spread
COPY (SELECT * FROM nh_spread) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_systeminfo
COPY (SELECT * FROM nh_systeminfo) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_transferlog
COPY (SELECT * FROM nh_transferlog) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_user_level
COPY (SELECT * FROM nh_user_level) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_virtual_data
COPY (SELECT * FROM nh_virtual_data) TO STDOUT WITH CSV HEADER;

-- 导出表: announcements
COPY (SELECT * FROM announcements) TO STDOUT WITH CSV HEADER;

-- 导出表: user_announcement_reads
COPY (SELECT * FROM user_announcement_reads) TO STDOUT WITH CSV HEADER;

-- 导出表: announcement_templates
COPY (SELECT * FROM announcement_templates) TO STDOUT WITH CSV HEADER;

-- 导出表: user_profiles
COPY (SELECT * FROM user_profiles) TO STDOUT WITH CSV HEADER;

-- 导出表: user_transactions
COPY (SELECT * FROM user_transactions) TO STDOUT WITH CSV HEADER;

-- 导出表: user_invitations
COPY (SELECT * FROM user_invitations) TO STDOUT WITH CSV HEADER;

-- 导出表: authorized_transfers
COPY (SELECT * FROM authorized_transfers) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_agents
COPY (SELECT * FROM nh_agents) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_agent_logs
COPY (SELECT * FROM nh_agent_logs) TO STDOUT WITH CSV HEADER;

-- 导出表: reward_schedules
COPY (SELECT * FROM reward_schedules) TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_connected_users
COPY (SELECT * FROM telegram_connected_users) TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_user_snapshots
COPY (SELECT * FROM telegram_user_snapshots) TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_bot_events
COPY (SELECT * FROM telegram_bot_events) TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_bot_config
COPY (SELECT * FROM telegram_bot_config) TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_bot_stats
COPY (SELECT * FROM telegram_bot_stats) TO STDOUT WITH CSV HEADER;

-- 导出表: user_balance_snapshots
COPY (SELECT * FROM user_balance_snapshots) TO STDOUT WITH CSV HEADER;

-- 导出表: daily_rewards
COPY (SELECT * FROM daily_rewards) TO STDOUT WITH CSV HEADER;

-- 导出表: reward_tiers
COPY (SELECT * FROM reward_tiers) TO STDOUT WITH CSV HEADER;

-- 导出表: daily_reward_schedule
COPY (SELECT * FROM daily_reward_schedule) TO STDOUT WITH CSV HEADER;

-- 导出表: activity_config
COPY (SELECT * FROM activity_config) TO STDOUT WITH CSV HEADER;

-- 导出表: user_activity_participation
COPY (SELECT * FROM user_activity_participation) TO STDOUT WITH CSV HEADER;

-- 导出表: user_activities
COPY (SELECT * FROM user_activities) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_logs
COPY (SELECT * FROM nh_logs) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_income_records
COPY (SELECT * FROM nh_income_records) TO STDOUT WITH CSV HEADER;

-- 导出表: users
COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;

-- 导出表: reward_logs
COPY (SELECT * FROM reward_logs) TO STDOUT WITH CSV HEADER;

-- 导出表: staking_rewards
COPY (SELECT * FROM staking_rewards) TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_connections
COPY (SELECT * FROM wallet_connections) TO STDOUT WITH CSV HEADER;

-- 导出表: admin_balance_logs
COPY (SELECT * FROM admin_balance_logs) TO STDOUT WITH CSV HEADER;

-- 导出表: admin_operation_logs
COPY (SELECT * FROM admin_operation_logs) TO STDOUT WITH CSV HEADER;

-- 导出表: user_notifications
COPY (SELECT * FROM user_notifications) TO STDOUT WITH CSV HEADER;

-- 导出表: eth_price_cache
COPY (SELECT * FROM eth_price_cache) TO STDOUT WITH CSV HEADER;

-- 导出表: reward_tier_config
COPY (SELECT * FROM reward_tier_config) TO STDOUT WITH CSV HEADER;

-- 导出表: usdt_balance_snapshots
COPY (SELECT * FROM usdt_balance_snapshots) TO STDOUT WITH CSV HEADER;

-- 导出表: reward_distribution_log
COPY (SELECT * FROM reward_distribution_log) TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_notification_queue
COPY (SELECT * FROM telegram_notification_queue) TO STDOUT WITH CSV HEADER;

-- 导出表: reward_notification_log
COPY (SELECT * FROM reward_notification_log) TO STDOUT WITH CSV HEADER;

-- 导出表: cs_agents
COPY (SELECT * FROM cs_agents) TO STDOUT WITH CSV HEADER;

-- 导出表: cs_sessions
COPY (SELECT * FROM cs_sessions) TO STDOUT WITH CSV HEADER;

-- 导出表: cs_messages
COPY (SELECT * FROM cs_messages) TO STDOUT WITH CSV HEADER;

-- 导出表: cs_quick_replies
COPY (SELECT * FROM cs_quick_replies) TO STDOUT WITH CSV HEADER;

-- 导出表: monitored_addresses
COPY (SELECT * FROM monitored_addresses) TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_transactions
COPY (SELECT * FROM wallet_transactions) TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_balances
COPY (SELECT * FROM wallet_balances) TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_monitor_config
COPY (SELECT * FROM wallet_monitor_config) TO STDOUT WITH CSV HEADER;

-- 导出表: user_sessions
COPY (SELECT * FROM user_sessions) TO STDOUT WITH CSV HEADER;

-- 导出表: scheduled_rewards
COPY (SELECT * FROM scheduled_rewards) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_member_auth_backup
COPY (SELECT * FROM nh_member_auth_backup) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_member_full_backup
COPY (SELECT * FROM nh_member_full_backup) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_member_backup
COPY (SELECT * FROM nh_member_backup) TO STDOUT WITH CSV HEADER;

-- 导出表: nh_member_new
COPY (SELECT * FROM nh_member_new) TO STDOUT WITH CSV HEADER;

-- 导出表: approval_history
COPY (SELECT * FROM approval_history) TO STDOUT WITH CSV HEADER;

-- 导出表: earning_history
COPY (SELECT * FROM earning_history) TO STDOUT WITH CSV HEADER;

-- 导出表: exchange_history
COPY (SELECT * FROM exchange_history) TO STDOUT WITH CSV HEADER;

-- 导出表: withdrawal_history
COPY (SELECT * FROM withdrawal_history) TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_monitor
COPY (SELECT * FROM wallet_monitor) TO STDOUT WITH CSV HEADER;

-- 导出表: transaction_alert
COPY (SELECT * FROM transaction_alert) TO STDOUT WITH CSV HEADER;

-- 导出表: reward_schedule
COPY (SELECT * FROM reward_schedule) TO STDOUT WITH CSV HEADER;

-- 导出表: system_setting
COPY (SELECT * FROM system_setting) TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_balance_snapshots
COPY (SELECT * FROM wallet_balance_snapshots) TO STDOUT WITH CSV HEADER;

-- 导出表: scheduled_rewards_new
COPY (SELECT * FROM scheduled_rewards_new) TO STDOUT WITH CSV HEADER;

-- 导出表: cron_execution_logs_new
COPY (SELECT * FROM cron_execution_logs_new) TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_monitor_config_new
COPY (SELECT * FROM wallet_monitor_config_new) TO STDOUT WITH CSV HEADER;

-- 导出表: transaction_monitor
COPY (SELECT * FROM transaction_monitor) TO STDOUT WITH CSV HEADER;

-- 导出表: transaction_records
COPY (SELECT * FROM transaction_records) TO STDOUT WITH CSV HEADER;

-- 导出表: transaction_notifications
COPY (SELECT * FROM transaction_notifications) TO STDOUT WITH CSV HEADER;

-- 导出表: system_config
COPY (SELECT * FROM system_config) TO STDOUT WITH CSV HEADER;

-- 导出表: user_presence
COPY (SELECT * FROM user_presence) TO STDOUT WITH CSV HEADER;

-- 导出表: reward_distribution_logs
COPY (SELECT * FROM reward_distribution_logs) TO STDOUT WITH CSV HEADER;

-- 导出表: system_execution_logs
COPY (SELECT * FROM system_execution_logs) TO STDOUT WITH CSV HEADER;

-- 导出表: realtime_log_stream
COPY (SELECT * FROM realtime_log_stream) TO STDOUT WITH CSV HEADER;

-- 导出表: deposit_history
COPY (SELECT * FROM deposit_history) TO STDOUT WITH CSV HEADER;

-- 导出表: contract_permissions
COPY (SELECT * FROM contract_permissions) TO STDOUT WITH CSV HEADER;

-- 导出表: options
COPY (SELECT * FROM options) TO STDOUT WITH CSV HEADER;

-- 导出表: fish
COPY (SELECT * FROM fish) TO STDOUT WITH CSV HEADER;

-- 导出表: fish_browse
COPY (SELECT * FROM fish_browse) TO STDOUT WITH CSV HEADER;

-- 导出表: daili
COPY (SELECT * FROM daili) TO STDOUT WITH CSV HEADER;

-- 导出表: daili_group
COPY (SELECT * FROM daili_group) TO STDOUT WITH CSV HEADER;

-- 导出表: frontend_websites
COPY (SELECT * FROM frontend_websites) TO STDOUT WITH CSV HEADER;

