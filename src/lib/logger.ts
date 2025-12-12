/**
 * 生产环境日志控制
 * 在生产环境下禁用所有console日志
 */

// 检查是否为生产环境
function isProductionEnv(): boolean {
  // 客户端检查
  if (typeof window !== 'undefined') {
    return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  }
  // 服务端检查
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
}

// 保存原始的console方法
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
}

let logsDisabled = false

// 在生产环境下禁用所有日志
export function disableProductionLogs() {
  if (logsDisabled) return // 避免重复禁用
  
  if (isProductionEnv()) {
    console.log = () => {}
    console.warn = () => {}
    console.info = () => {}
    console.debug = () => {}
    // 可选：也禁用 console.error
    console.error = () => {}
    
    logsDisabled = true
  }
}

// 恢复日志输出（用于调试）
export function enableLogs() {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
  console.info = originalConsole.info
  console.debug = originalConsole.debug
  
  logsDisabled = false
}

export default {
  disableProductionLogs,
  enableLogs,
  isProductionEnv,
}

