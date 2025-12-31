/**
 * Telegram自动启动服务
 * 在应用启动时自动启动Telegram实时监听服务
 */

import { telegramRealtimeService } from '@/services/telegramRealtimeService'

let isStarted = false

export async function autoStartTelegramService() {
  if (isStarted) {
    console.log('Telegram服务已启动，跳过重复启动')
    return
  }

  try {
    console.log('🚀 自动启动Telegram实时监听服务...')
    await telegramRealtimeService.start()
    isStarted = true
    console.log('✅ Telegram实时监听服务自动启动成功')
  } catch (error) {
    console.error('❌ Telegram实时监听服务自动启动失败:', error)
  }
}

// 在模块加载时自动启动（仅在生产环境中）
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // 延迟启动，确保其他服务已初始化
  setTimeout(() => {
    autoStartTelegramService()
  }, 5000)
}
