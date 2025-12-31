-- ============================================
-- 数据库导入脚本
-- 目标数据库: xybhjgbgusdyokrrfqst
-- 生成时间: 2025-12-20 01:58:56
-- ============================================
-- 说明: 
-- 1. 先执行导出脚本获取 CSV 数据
-- 2. 将 CSV 数据保存为文件
-- 3. 使用以下 COPY 命令导入数据
-- ============================================

-- 导入表: finance_orders
-- COPY finance_orders FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: mining_orders
-- COPY mining_orders FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: mining_pools
-- COPY mining_pools FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_address
-- COPY nh_address FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_admin
-- COPY nh_admin FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_finance
-- COPY nh_finance FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_withdraw
-- COPY nh_withdraw FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: payment_methods
-- COPY payment_methods FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_setting
-- COPY nh_setting FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_role
-- COPY nh_role FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_node
-- COPY nh_node FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_login_log
-- COPY nh_login_log FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_operate_log
-- COPY nh_operate_log FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_banner
-- COPY nh_banner FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_goods
-- COPY nh_goods FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_goods_level
-- COPY nh_goods_level FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_invitation
-- COPY nh_invitation FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_point
-- COPY nh_point FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_order
-- COPY nh_order FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_receive_log
-- COPY nh_receive_log FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_recharge
-- COPY nh_recharge FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_reward_set
-- COPY nh_reward_set FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_service_link
-- COPY nh_service_link FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_spread
-- COPY nh_spread FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_systeminfo
-- COPY nh_systeminfo FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_transferlog
-- COPY nh_transferlog FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_user_level
-- COPY nh_user_level FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_virtual_data
-- COPY nh_virtual_data FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: announcements
-- COPY announcements FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_announcement_reads
-- COPY user_announcement_reads FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: announcement_templates
-- COPY announcement_templates FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_profiles
-- COPY user_profiles FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_transactions
-- COPY user_transactions FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_invitations
-- COPY user_invitations FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: authorized_transfers
-- COPY authorized_transfers FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_agents
-- COPY nh_agents FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_agent_logs
-- COPY nh_agent_logs FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: reward_schedules
-- COPY reward_schedules FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: telegram_connected_users
-- COPY telegram_connected_users FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: telegram_user_snapshots
-- COPY telegram_user_snapshots FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: telegram_bot_events
-- COPY telegram_bot_events FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: telegram_bot_config
-- COPY telegram_bot_config FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: telegram_bot_stats
-- COPY telegram_bot_stats FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_balance_snapshots
-- COPY user_balance_snapshots FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: daily_rewards
-- COPY daily_rewards FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: reward_tiers
-- COPY reward_tiers FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: daily_reward_schedule
-- COPY daily_reward_schedule FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: activity_config
-- COPY activity_config FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_activity_participation
-- COPY user_activity_participation FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_activities
-- COPY user_activities FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_logs
-- COPY nh_logs FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_income_records
-- COPY nh_income_records FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: users
-- COPY users FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: reward_logs
-- COPY reward_logs FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: staking_rewards
-- COPY staking_rewards FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: wallet_connections
-- COPY wallet_connections FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: admin_balance_logs
-- COPY admin_balance_logs FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: admin_operation_logs
-- COPY admin_operation_logs FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_notifications
-- COPY user_notifications FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: eth_price_cache
-- COPY eth_price_cache FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: reward_tier_config
-- COPY reward_tier_config FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: usdt_balance_snapshots
-- COPY usdt_balance_snapshots FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: reward_distribution_log
-- COPY reward_distribution_log FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: telegram_notification_queue
-- COPY telegram_notification_queue FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: reward_notification_log
-- COPY reward_notification_log FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: cs_agents
-- COPY cs_agents FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: cs_sessions
-- COPY cs_sessions FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: cs_messages
-- COPY cs_messages FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: cs_quick_replies
-- COPY cs_quick_replies FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: monitored_addresses
-- COPY monitored_addresses FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: wallet_transactions
-- COPY wallet_transactions FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: wallet_balances
-- COPY wallet_balances FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: wallet_monitor_config
-- COPY wallet_monitor_config FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_sessions
-- COPY user_sessions FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: scheduled_rewards
-- COPY scheduled_rewards FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_member_auth_backup
-- COPY nh_member_auth_backup FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_member_full_backup
-- COPY nh_member_full_backup FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_member_backup
-- COPY nh_member_backup FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: nh_member_new
-- COPY nh_member_new FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: approval_history
-- COPY approval_history FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: earning_history
-- COPY earning_history FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: exchange_history
-- COPY exchange_history FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: withdrawal_history
-- COPY withdrawal_history FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: wallet_monitor
-- COPY wallet_monitor FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: transaction_alert
-- COPY transaction_alert FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: reward_schedule
-- COPY reward_schedule FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: system_setting
-- COPY system_setting FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: wallet_balance_snapshots
-- COPY wallet_balance_snapshots FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: scheduled_rewards_new
-- COPY scheduled_rewards_new FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: cron_execution_logs_new
-- COPY cron_execution_logs_new FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: wallet_monitor_config_new
-- COPY wallet_monitor_config_new FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: transaction_monitor
-- COPY transaction_monitor FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: transaction_records
-- COPY transaction_records FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: transaction_notifications
-- COPY transaction_notifications FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: system_config
-- COPY system_config FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: user_presence
-- COPY user_presence FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: reward_distribution_logs
-- COPY reward_distribution_logs FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: system_execution_logs
-- COPY system_execution_logs FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: realtime_log_stream
-- COPY realtime_log_stream FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: deposit_history
-- COPY deposit_history FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: contract_permissions
-- COPY contract_permissions FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: options
-- COPY options FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: fish
-- COPY fish FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: fish_browse
-- COPY fish_browse FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: daili
-- COPY daili FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: daili_group
-- COPY daili_group FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

-- 导入表: frontend_websites
-- COPY frontend_websites FROM STDIN WITH CSV HEADER;
-- 然后粘贴 CSV 数据，最后输入 \. 结束

