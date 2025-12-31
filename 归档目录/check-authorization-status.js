const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAuthorizationStatus() {
  console.log('🔍 检查授权状态和通知队列');
  console.log('');
  
  // 1. 查询最新的用户记录
  console.log('📋 1. 查询最新授权的用户 (最近5个):');
  const { data: users, error: usersError } = await supabase
    .from('nh_member_new')
    .select('id, wallet_address, approved, first_approved_at, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (usersError) {
    console.log('❌ 查询失败:', usersError.message);
  } else if (users) {
    users.forEach((user, index) => {
      console.log(`${index + 1}. 地址: ${user.wallet_address}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   授权状态: ${user.approved}`);
      console.log(`   创建时间: ${user.created_at}`);
      console.log(`   首次授权: ${user.first_approved_at || '未授权'}`);
      console.log('');
    });
  }
  
  // 2. 查询通知队列
  console.log('📋 2. 查询最新的通知队列记录 (最近10条):');
  const { data: notifications, error: notifError } = await supabase
    .from('telegram_notification_queue')
    .select('id, notification_type, is_sent, telegram_message_id, created_at, notification_data')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (notifError) {
    console.log('❌ 查询失败:', notifError.message);
  } else if (notifications) {
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ID: ${notif.id}`);
      console.log(`   类型: ${notif.notification_type}`);
      console.log(`   已发送: ${notif.is_sent}`);
      console.log(`   消息ID: ${notif.telegram_message_id || '未发送'}`);
      console.log(`   创建时间: ${notif.created_at}`);
      if (notif.notification_data && notif.notification_data.wallet_address) {
        console.log(`   钱包地址: ${notif.notification_data.wallet_address}`);
      }
      console.log('');
    });
  }
  
  // 3. 检查数据库触发器是否存在
  console.log('📋 3. 检查数据库触发器:');
  const { data: triggers, error: triggersError } = await supabase.rpc('pg_get_triggerdef', {
    trigger_oid: 0
  }).select();
  
  console.log('');
  
  // 4. 查询最新的日志记录
  console.log('📋 4. 查询最新的日志记录 (最近5条):');
  const { data: logs, error: logsError } = await supabase
    .from('nh_logs')
    .select('id, user_uuid, action, description, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (logsError) {
    console.log('❌ 查询失败:', logsError.message);
  } else if (logs) {
    logs.forEach((log, index) => {
      console.log(`${index + 1}. 动作: ${log.action}`);
      console.log(`   用户ID: ${log.user_uuid}`);
      console.log(`   描述: ${log.description?.substring(0, 60)}...`);
      console.log(`   时间: ${log.created_at}`);
      console.log('');
    });
  }
}

checkAuthorizationStatus().catch(console.error);


