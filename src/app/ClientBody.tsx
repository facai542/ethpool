"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import GlobalLoader from "@/components/GlobalLoader";
import LoadingScreen from "@/components/LoadingScreen";
import NetworkStatus from "@/components/NetworkStatus";
import { Footer } from "@/components/ui/footer-section";
import { initializeMobileOptimizations } from '@/lib/mobile-optimization';
import { disableProductionLogs } from '@/lib/logger';

// 在客户端初始化钱包错误处理器
if (typeof window !== 'undefined') {
  import('@/lib/wallet-error-handler').catch(() => {
    // 静默失败，不影响应用启动
  });
}

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 检查是否是管理后台路由
  const isAdminRoute = pathname?.startsWith('/admin');
  // 检查是否是邀请页面路由（邀请页面不显示页脚）
  const isInviteRoute = pathname === '/invite';
  
  // 检查是否已经显示过启动屏（只在首次打开网站时显示）
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    if (typeof window === 'undefined') {
      return true; // 服务器端默认显示
    }
    // 检查 localStorage 中是否已经标记为已显示过
    const hasShownSplash = localStorage.getItem('hasShownSplash');
    return !hasShownSplash; // 如果没有标记，则显示启动屏
  });
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased bg-black";
    document.body.style.backgroundColor = "#000000";
    document.documentElement.style.backgroundColor = "#000000";

    // 生产环境禁用所有日志
    disableProductionLogs();

    // 初始化移动端优化
    initializeMobileOptimizations();

    // 临时禁用错误抑制以调试问题
    /*
    // 强化WalletConnect相关的console错误抑制
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    
    console.error = (...args) => {
      const message = args.join(' ')
      
      // 检查是否是WalletConnect相关的已知错误或React DevTools错误
      const isWalletConnectError = [
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
        'Failed to decode message from topic:',
        'Local configuration ignored',
        'Your local configuration',
        'was ignored because a remote configuration',
        'Please manage these features via your project dashboard',
        '__reactContextDevtoolDebugId',
        '_context is undefined',
        'onCommitFiberRoot',
        'ReactDOMDevtools',
        'setImmediate.js'
      ].some(pattern => message.includes(pattern))
      
      if (isWalletConnectError) {
        console.warn('🔧 WalletConnect错误已被过滤:', message)
        return
      }
      
      // 调用原始的console.error
      originalConsoleError.apply(console, args)
    }

    console.warn = (...args) => {
      const message = args.join(' ')
      
      // 过滤配置相关警告
      const isConfigWarning = [
        'Local configuration ignored',
        'Your local configuration',
        'was ignored because a remote configuration',
        'Please manage these features via your project dashboard'
      ].some(pattern => message.includes(pattern))
      
      if (isConfigWarning) {
        console.log('🔧 配置警告已被过滤:', message)
        return
      }
      
      // 调用原始的console.warn
      originalConsoleWarn.apply(console, args)
    }

    // 处理全局错误事件
    const handleGlobalError = (event: ErrorEvent) => {
      const message = event.message || ''
      
      if (message.includes('Failed to decode message from topic') || 
          message.includes('No matching key') ||
          message.includes('keychain') ||
          message.includes('Local configuration ignored')) {
        console.warn('🔧 全局WalletConnect错误已被抑制:', message)
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    // 处理未处理的Promise rejection
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message = reason?.message || reason?.toString() || ''
      
      if (message.includes('Failed to decode message from topic') ||
          message.includes('No matching key') ||
          message.includes('keychain') ||
          message.includes('Local configuration ignored')) {
        console.warn('🔧 Promise WalletConnect错误已被抑制:', message)
        event.preventDefault()
        return false
      }
    }

    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    console.log('✅ WalletConnect错误抑制器已激活')

    // 初始化移动端优化
    initializeMobileOptimizations()

    */
    
    // 简化的清理函数
    return () => {
      console.log('✅ ClientBody useEffect cleanup');
    }
  }, []);

  // 管理后台和邀请页面不显示加载动画和页脚
  if (isAdminRoute || isInviteRoute) {
    return (
      <div className="antialiased flex flex-col min-h-screen">
        {children}
      </div>
    );
  }

  // 启动屏加载完成的处理函数
  const handleLoadingComplete = () => {
    // 标记已经显示过启动屏
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasShownSplash', 'true');
    }
    setIsInitialLoading(false);
  };

  return (
    <div className="antialiased flex flex-col min-h-screen">
      {isInitialLoading ? (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      ) : (
        <>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <GlobalLoader />
          <NetworkStatus />
        </>
      )}
    </div>
  );
}