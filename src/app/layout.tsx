import './globals.css'
import type { Metadata, Viewport } from "next";
import "../styles/announcement-modal.css";
import "../styles/components.css";
import Script from "next/script";
import ClientBody from '@/app/ClientBody'
import { WalletProvider } from "@/contexts/WalletContext";
import ContextProvider from "@/contexts/ContextProvider";
import { I18nProvider } from "@/contexts/I18nContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { headers } from "next/headers";
import GlobalLoader from "@/components/GlobalLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// import AntiAIDetection from "@/components/AntiAIDetection";

// 导入日志控制（生产环境禁用日志）
import '@/lib/logger'

// 注意：钱包错误处理器和 Telegram 服务应在客户端组件中初始化
// 这些服务在 Netlify serverless 环境中不应自动启动

export const metadata: Metadata = {
  title: "Eth Max",
  description: "Eth Max - Professional ETH Mining Platform",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "Eth Max",
    description: "Eth Max - Professional ETH Mining Platform",
    images: [
      {
        url: '/ethereum.webp',
        width: 1200,
        height: 630,
        alt: 'Eth Max - Professional ETH Mining Platform',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Eth Max",
    description: "Eth Max - Professional ETH Mining Platform",
    images: ['/ethereum.webp'],
  },
  // 移除所有反AI检测metadata
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let cookies: string | undefined = undefined
  try {
    const headersList = await headers()
    cookies = headersList.get('cookie') || undefined
  } catch (error) {
    // 如果 headers() 失败，继续使用 undefined cookies
    console.warn('Failed to get headers:', error)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* 移除所有反AI检测meta标签 */}
        
        {/* 完全禁用所有检测脚本 */}
        
        <style dangerouslySetInnerHTML={{
          __html: `
            /* 保留基本的用户体验，移除过度限制 */
            .obfuscate-${Math.random().toString(36).substr(2, 9)} { display: none !important; }
            .anti-detect-${Math.random().toString(36).substr(2, 9)} { visibility: hidden !important; }
            
            /* 允许正常的文本选择 */
            /* ::selection { background: transparent; }
            ::-moz-selection { background: transparent; } */
            
            /* 移除对文本选择的禁用，让用户可以正常复制文本 */
            /* * {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              -webkit-touch-callout: none;
              -webkit-tap-highlight-color: transparent;
            } */
            
            /* 确保输入框可以正常使用 */
            input, textarea, button, [contenteditable] {
              -webkit-user-select: text;
              -moz-user-select: text;
              -ms-user-select: text;
              user-select: text;
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning className="antialiased bg-black">
        <Script
          src="https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js"
          strategy="lazyOnload"
        />
        {/* SVG 滤镜定义 - 用于液态玻璃效果 */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }} className="svg-filters">
          <defs>
            <filter id="liquid-distortion" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.015 0.005"
                numOctaves="2"
                result="warp"
              >
                <animate
                  attributeName="baseFrequency"
                  values="0.015 0.005;0.02 0.008;0.015 0.005"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                xChannelSelector="R"
                yChannelSelector="G"
                scale="40"
                in="SourceGraphic"
                in2="warp"
              >
                <animate
                  attributeName="scale"
                  values="40;50;40"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </feDisplacementMap>
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite operator="over" in="SourceGraphic" in2="blur" />
            </filter>
          </defs>
        </svg>
        {/* <AntiAIDetection /> */}
        <div suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ContextProvider cookies={cookies}>
              <I18nProvider>
                <WalletProvider>
                  <LoadingProvider>
                    <ErrorBoundary>
                      <ClientBody>{children}</ClientBody>
                    </ErrorBoundary>
                  </LoadingProvider>
                </WalletProvider>
              </I18nProvider>
            </ContextProvider>
          </ThemeProvider>
        </div>

      </body>
    </html>
  );
}
