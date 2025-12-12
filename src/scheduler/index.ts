import cron from 'node-cron';
import { periodicRewardJob } from '../jobs/periodic-rewards';

/**
 * 启动定时任务调度器
 */
export function startScheduler() {
  console.log('🕐 Starting scheduler...');

  // 每6小时执行一次定时奖励 (0点、6点、12点、18点)
  cron.schedule('0 0,6,12,18 * * *', async () => {
    console.log('⏰ Running periodic reward job...');
    try {
      const result = await periodicRewardJob.execute();
      console.log('✅ Periodic reward job completed:', result);
    } catch (error) {
      console.error('❌ Periodic reward job error:', error);
    }
  });

  // 每天0点重置奖励计数
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Resetting daily reward counts...');
    try {
      await resetDailyRewardCounts();
      console.log('✅ Daily reward counts reset completed');
    } catch (error) {
      console.error('❌ Reset daily reward counts error:', error);
    }
  });

  console.log('✅ Scheduler started successfully');
}

/**
 * 重置每日奖励计数
 */
async function resetDailyRewardCounts() {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from('nh_member_new')
    .update({ 
      reward_count_today: 0,
      updated_at: new Date().toISOString()
    })
    .eq('is_active', true);

  if (error) {
    console.error('Failed to reset daily reward counts:', error);
    throw error;
  }
}

/**
 * 停止定时任务调度器
 */
export function stopScheduler() {
  console.log('🛑 Stopping scheduler...');
  // cron任务会在进程结束时自动停止
  console.log('✅ Scheduler stopped');
}
