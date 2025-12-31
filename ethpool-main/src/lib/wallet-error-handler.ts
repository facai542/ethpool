// 钱包错误处理器 - 用于处理和抑制WalletConnect相关的已知错误

export class WalletErrorHandler {
  private static instance: WalletErrorHandler
  private isInitialized = false

  public static getInstance(): WalletErrorHandler {
    if (!WalletErrorHandler.instance) {
      WalletErrorHandler.instance = new WalletErrorHandler()
    }
    return WalletErrorHandler.instance
  }

  public initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    console.log('🔧 初始化钱包错误处理器...')

    // 处理全局错误
    window.addEventListener('error', this.handleGlobalError.bind(this))
    
    // 处理未处理的Promise rejection
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    
    // 重写console.error以过滤已知的WalletConnect错误
    this.setupConsoleErrorFilter()

    this.isInitialized = true
    console.log('✅ 钱包错误处理器初始化完成')
  }

  private handleGlobalError(event: ErrorEvent) {
    const message = event.message || ''
    
    if (this.isWalletConnectError(message)) {
      console.warn('🔧 WalletConnect错误已被抑制:', message)
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const reason = event.reason
    const message = reason?.message || reason?.toString() || ''
    
    if (this.isWalletConnectError(message)) {
      console.warn('🔧 WalletConnect Promise错误已被抑制:', message)
      event.preventDefault()
      return false
    }
  }

  private isWalletConnectError(message: string): boolean {
    const walletConnectErrorPatterns = [
      'Failed to decode message from topic',
      'No matching key',
      'keychain:',
      'Decoded payload on topic',
      'is not identifiable as a JSON-RPC request',
      'Missing or invalid',
      'clientId:',
      'did:key:',
      'Error: Missing or invalid. Decoded payload on topic',
      'Error: No matching key. keychain:',
      'Failed to decode message from topic:'
    ]

    return walletConnectErrorPatterns.some(pattern => 
      message.includes(pattern)
    )
  }

  private setupConsoleErrorFilter() {
    const originalConsoleError = console.error
    
    console.error = (...args) => {
      const message = args.join(' ')
      
      if (this.isWalletConnectError(message)) {
        console.warn('🔧 Console WalletConnect错误已被过滤:', message)
        return
      }
      
      // 调用原始的console.error
      originalConsoleError.apply(console, args)
    }
  }

  public cleanup() {
    if (!this.isInitialized) {
      return
    }

    window.removeEventListener('error', this.handleGlobalError.bind(this))
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    
    this.isInitialized = false
    console.log('🧹 钱包错误处理器已清理')
  }
}

// 导出单例实例
export const walletErrorHandler = WalletErrorHandler.getInstance()

// 自动初始化（如果在浏览器环境中）
if (typeof window !== 'undefined') {
  // 延迟初始化以确保所有脚本都已加载
  setTimeout(() => {
    walletErrorHandler.initialize()
  }, 100)
} 