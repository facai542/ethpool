/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Netlify 不需要 standalone 输出
  // output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
    ],
  },
  // 禁用开发工具指示器
  devIndicators: false,
  // 处理静态导出时的动态路由
  trailingSlash: false,
  // Turbopack 配置 - 解决 pino 和 thread-stream 模块问题
  turbopack: {
    resolveAlias: {
      'pino': './src/lib/pino-browser.js',
      'pino-pretty': { browser: './src/lib/empty-module.js' },
      'thread-stream': './src/lib/empty-module.js',
    },
  },
  webpack: (config, { isServer }) => {
    // 添加路径别名解析（先设置基础别名）
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    // 为 pino 和 React Native 模块提供 mock（客户端和服务器端都需要）
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino': path.resolve(__dirname, 'src/lib/pino-browser.js'),
      'pino-pretty': false,
      'thread-stream': false,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
    };
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
   
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
    }
   
    return config
  },
};

module.exports = nextConfig;
