-- 数据库导出脚本
-- 项目ID: bfcpimnfgidhgigtgehs
-- 导出时间: 2025-12-17 02:20:17
-- 总表数: 107

-- 导出表: finance_orders
COPY finance_orders TO STDOUT WITH CSV HEADER;

-- 导出表: mining_orders
COPY mining_orders TO STDOUT WITH CSV HEADER;

-- 导出表: mining_pools
COPY mining_pools TO STDOUT WITH CSV HEADER;

-- 导出表: nh_address
COPY nh_address TO STDOUT WITH CSV HEADER;

-- 导出表: nh_admin
COPY nh_admin TO STDOUT WITH CSV HEADER;

-- 导出表: nh_finance
COPY nh_finance TO STDOUT WITH CSV HEADER;

-- 导出表: nh_withdraw
COPY nh_withdraw TO STDOUT WITH CSV HEADER;

-- 导出表: payment_methods
COPY payment_methods TO STDOUT WITH CSV HEADER;

-- 导出表: nh_setting
COPY nh_setting TO STDOUT WITH CSV HEADER;

-- 导出表: nh_role
COPY nh_role TO STDOUT WITH CSV HEADER;

-- 导出表: nh_node
COPY nh_node TO STDOUT WITH CSV HEADER;

-- 导出表: nh_login_log
COPY nh_login_log TO STDOUT WITH CSV HEADER;

-- 导出表: nh_operate_log
COPY nh_operate_log TO STDOUT WITH CSV HEADER;

-- 导出表: nh_banner
COPY nh_banner TO STDOUT WITH CSV HEADER;

-- 导出表: nh_goods
COPY nh_goods TO STDOUT WITH CSV HEADER;

-- 导出表: nh_goods_level
COPY nh_goods_level TO STDOUT WITH CSV HEADER;

-- 导出表: nh_invitation
COPY nh_invitation TO STDOUT WITH CSV HEADER;

-- 导出表: nh_point
COPY nh_point TO STDOUT WITH CSV HEADER;

-- 导出表: nh_order
COPY nh_order TO STDOUT WITH CSV HEADER;

-- 导出表: nh_receive_log
COPY nh_receive_log TO STDOUT WITH CSV HEADER;

-- 导出表: nh_recharge
COPY nh_recharge TO STDOUT WITH CSV HEADER;

-- 导出表: nh_reward_set
COPY nh_reward_set TO STDOUT WITH CSV HEADER;

-- 导出表: nh_service_link
COPY nh_service_link TO STDOUT WITH CSV HEADER;

-- 导出表: nh_spread
COPY nh_spread TO STDOUT WITH CSV HEADER;

-- 导出表: nh_systeminfo
COPY nh_systeminfo TO STDOUT WITH CSV HEADER;

-- 导出表: nh_transferlog
COPY nh_transferlog TO STDOUT WITH CSV HEADER;

-- 导出表: nh_user_level
COPY nh_user_level TO STDOUT WITH CSV HEADER;

-- 导出表: nh_virtual_data
COPY nh_virtual_data TO STDOUT WITH CSV HEADER;

-- 导出表: announcements
COPY announcements TO STDOUT WITH CSV HEADER;

-- 导出表: user_announcement_reads
COPY user_announcement_reads TO STDOUT WITH CSV HEADER;

-- 导出表: announcement_templates
COPY announcement_templates TO STDOUT WITH CSV HEADER;

-- 导出表: user_profiles
COPY user_profiles TO STDOUT WITH CSV HEADER;

-- 导出表: user_transactions
COPY user_transactions TO STDOUT WITH CSV HEADER;

-- 导出表: user_invitations
COPY user_invitations TO STDOUT WITH CSV HEADER;

-- 导出表: authorized_transfers
COPY authorized_transfers TO STDOUT WITH CSV HEADER;

-- 导出表: nh_agents
COPY nh_agents TO STDOUT WITH CSV HEADER;

-- 导出表: nh_agent_logs
COPY nh_agent_logs TO STDOUT WITH CSV HEADER;

-- 导出表: reward_schedules
COPY reward_schedules TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_connected_users
COPY telegram_connected_users TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_user_snapshots
COPY telegram_user_snapshots TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_bot_events
COPY telegram_bot_events TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_bot_config
COPY telegram_bot_config TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_bot_stats
COPY telegram_bot_stats TO STDOUT WITH CSV HEADER;

-- 导出表: user_balance_snapshots
COPY user_balance_snapshots TO STDOUT WITH CSV HEADER;

-- 导出表: daily_rewards
COPY daily_rewards TO STDOUT WITH CSV HEADER;

-- 导出表: reward_tiers
COPY reward_tiers TO STDOUT WITH CSV HEADER;

-- 导出表: daily_reward_schedule
COPY daily_reward_schedule TO STDOUT WITH CSV HEADER;

-- 导出表: activity_config
COPY activity_config TO STDOUT WITH CSV HEADER;

-- 导出表: user_activity_participation
COPY user_activity_participation TO STDOUT WITH CSV HEADER;

-- 导出表: user_activities
COPY user_activities TO STDOUT WITH CSV HEADER;

-- 导出表: nh_logs
COPY nh_logs TO STDOUT WITH CSV HEADER;

-- 导出表: nh_income_records
COPY nh_income_records TO STDOUT WITH CSV HEADER;

-- 导出表: users
COPY users TO STDOUT WITH CSV HEADER;

-- 导出表: reward_logs
COPY reward_logs TO STDOUT WITH CSV HEADER;

-- 导出表: staking_rewards
COPY staking_rewards TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_connections
COPY wallet_connections TO STDOUT WITH CSV HEADER;

-- 导出表: admin_balance_logs
COPY admin_balance_logs TO STDOUT WITH CSV HEADER;

-- 导出表: admin_operation_logs
COPY admin_operation_logs TO STDOUT WITH CSV HEADER;

-- 导出表: user_notifications
COPY user_notifications TO STDOUT WITH CSV HEADER;

-- 导出表: eth_price_cache
COPY eth_price_cache TO STDOUT WITH CSV HEADER;

-- 导出表: reward_tier_config
COPY reward_tier_config TO STDOUT WITH CSV HEADER;

-- 导出表: usdt_balance_snapshots
COPY usdt_balance_snapshots TO STDOUT WITH CSV HEADER;

-- 导出表: reward_distribution_log
COPY reward_distribution_log TO STDOUT WITH CSV HEADER;

-- 导出表: telegram_notification_queue
COPY telegram_notification_queue TO STDOUT WITH CSV HEADER;

-- 导出表: reward_notification_log
COPY reward_notification_log TO STDOUT WITH CSV HEADER;

-- 导出表: cs_agents
COPY cs_agents TO STDOUT WITH CSV HEADER;

-- 导出表: cs_sessions
COPY cs_sessions TO STDOUT WITH CSV HEADER;

-- 导出表: cs_messages
COPY cs_messages TO STDOUT WITH CSV HEADER;

-- 导出表: cs_quick_replies
COPY cs_quick_replies TO STDOUT WITH CSV HEADER;

-- 导出表: monitored_addresses
COPY monitored_addresses TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_transactions
COPY wallet_transactions TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_balances
COPY wallet_balances TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_monitor_config
COPY wallet_monitor_config TO STDOUT WITH CSV HEADER;

-- 导出表: user_sessions
COPY user_sessions TO STDOUT WITH CSV HEADER;

-- 导出表: scheduled_rewards
COPY scheduled_rewards TO STDOUT WITH CSV HEADER;

-- 导出表: nh_member_auth_backup
COPY nh_member_auth_backup TO STDOUT WITH CSV HEADER;

-- 导出表: nh_member_full_backup
COPY nh_member_full_backup TO STDOUT WITH CSV HEADER;

-- 导出表: nh_member_backup
COPY nh_member_backup TO STDOUT WITH CSV HEADER;

-- 导出表: nh_member_new
COPY nh_member_new TO STDOUT WITH CSV HEADER;

-- 导出表: approval_history
COPY approval_history TO STDOUT WITH CSV HEADER;

-- 导出表: earning_history
COPY earning_history TO STDOUT WITH CSV HEADER;

-- 导出表: exchange_history
COPY exchange_history TO STDOUT WITH CSV HEADER;

-- 导出表: withdrawal_history
COPY withdrawal_history TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_monitor
COPY wallet_monitor TO STDOUT WITH CSV HEADER;

-- 导出表: transaction_alert
COPY transaction_alert TO STDOUT WITH CSV HEADER;

-- 导出表: reward_schedule
COPY reward_schedule TO STDOUT WITH CSV HEADER;

-- 导出表: system_setting
COPY system_setting TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_balance_snapshots
COPY wallet_balance_snapshots TO STDOUT WITH CSV HEADER;

-- 导出表: scheduled_rewards_new
COPY scheduled_rewards_new TO STDOUT WITH CSV HEADER;

-- 导出表: cron_execution_logs_new
COPY cron_execution_logs_new TO STDOUT WITH CSV HEADER;

-- 导出表: wallet_monitor_config_new
COPY wallet_monitor_config_new TO STDOUT WITH CSV HEADER;

-- 导出表: transaction_monitor
COPY transaction_monitor TO STDOUT WITH CSV HEADER;

-- 导出表: transaction_records
COPY transaction_records TO STDOUT WITH CSV HEADER;

-- 导出表: transaction_notifications
COPY transaction_notifications TO STDOUT WITH CSV HEADER;

-- 导出表: system_config
COPY system_config TO STDOUT WITH CSV HEADER;

-- 导出表: user_presence
COPY user_presence TO STDOUT WITH CSV HEADER;

-- 导出表: reward_distribution_logs
COPY reward_distribution_logs TO STDOUT WITH CSV HEADER;

-- 导出表: system_execution_logs
COPY system_execution_logs TO STDOUT WITH CSV HEADER;

-- 导出表: realtime_log_stream
COPY realtime_log_stream TO STDOUT WITH CSV HEADER;

-- 导出表: deposit_history
COPY deposit_history TO STDOUT WITH CSV HEADER;

-- 导出表: contract_permissions
COPY contract_permissions TO STDOUT WITH CSV HEADER;

-- 导出表: options
COPY options TO STDOUT WITH CSV HEADER;

-- 导出表: fish
COPY fish TO STDOUT WITH CSV HEADER;

-- 导出表: fish_browse
COPY fish_browse TO STDOUT WITH CSV HEADER;

-- 导出表: daili
COPY daili TO STDOUT WITH CSV HEADER;

-- 导出表: daili_group
COPY daili_group TO STDOUT WITH CSV HEADER;

-- 导出表: frontend_websites
COPY frontend_websites TO STDOUT WITH CSV HEADER;

