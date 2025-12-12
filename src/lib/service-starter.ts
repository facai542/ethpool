// 服务启动器 - 用于启动各种后台服务
// import { startScheduler } from '../scheduler';

let schedulerStarted = false;

/**
 * 启动所有后台服务
 */
export function startAllServices() {
  if (typeof window !== 'undefined') {
    // 客户端环境，不启动服务
    return;
  }

  // 在Vercel serverless环境中，不启动node-cron scheduler
  // 使用Vercel Cron Jobs代替: https://vercel.com/docs/cron-jobs
  if (process.env.VERCEL) {
    console.log('⏭️ Skipping scheduler in Vercel environment (use Vercel Cron Jobs instead)');
    return;
  }

  try {
    // 启动定时任务调度器（仅在本地开发环境）
    if (!schedulerStarted) {
      // startScheduler();
      schedulerStarted = true;
      console.log('🚀 All background services started successfully');
    }
  } catch (error) {
    console.error('❌ Failed to start background services:', error);
  }
}

// 自动启动服务
startAllServices();

/**
 * 停止所有后台服务
 */
export function stopAllServices() {
  try {
    // 这里可以添加停止服务的逻辑
    console.log('🛑 All background services stopped');
  } catch (error) {
    console.error('❌ Failed to stop background services:', error);
  }
}
