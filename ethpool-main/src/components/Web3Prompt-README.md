# Web3检测网站组件

一套完整的Web3钱包检测和管理系统，提供优雅的用户体验和现代化的UI设计。

## 🎯 功能特性

- ✅ **自动Web3检测** - 智能检测浏览器Web3支持
- 🔍 **多钱包识别** - 支持MetaMask、Coinbase Wallet、Trust Wallet、Phantom
- 📱 **移动端适配** - 自动识别设备并提供相应下载链接
- 🎨 **现代UI设计** - 玻璃态效果、渐变背景、平滑动画
- 🔄 **实时状态管理** - 监听钱包连接状态变化
- 🛡️ **TypeScript支持** - 完整的类型定义和类型安全

## 📁 组件结构

```
src/
├── components/
│   ├── App.tsx                 # 主应用组件
│   ├── Web3PromptPage.tsx      # Web3提示页面
│   ├── LoadingScreen.tsx       # 加载界面组件
│   └── Web3Examples.tsx        # 使用示例
├── utils/
│   └── WalletDetector.ts       # 钱包检测工具类
└── app/
    └── web3-prompt-demo/
        └── page.tsx            # 演示页面
```

## 🚀 快速开始

### 1. 基础使用

```tsx
import { App } from '@/components/App';

function MyApp() {
  return (
    <App>
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-white text-3xl">您的应用内容</h1>
      </div>
    </App>
  );
}
```

### 2. 带回调的使用

```tsx
import { App } from '@/components/App';
import { DetectionResult } from '@/utils/WalletDetector';

function MyApp() {
  const handleWeb3Ready = (result: DetectionResult) => {
    console.log('Web3就绪:', result);
    // 执行初始化逻辑
  };

  const handleWalletConnect = (account: string, chainId: number) => {
    console.log('钱包连接:', account, chainId);
    // 更新应用状态
  };

  return (
    <App
      onWeb3Ready={handleWeb3Ready}
      onWalletConnect={handleWalletConnect}
    >
      <YourAppContent />
    </App>
  );
}
```

### 3. 自定义配置

```tsx
import { App } from '@/components/App';

function MyApp() {
  return (
    <App
      showLoadingScreen={true}
      loadingMessage="正在初始化Web3环境..."
    >
      <YourAppContent />
    </App>
  );
}
```

### 4. 简化版本

```tsx
import { Web3App } from '@/components/App';

function MyApp() {
  return (
    <Web3App>
      <YourAppContent />
    </Web3App>
  );
}
```

## 🎨 UI设计特色

### 视觉风格
- **深色主题** - 紫色到蓝色的渐变背景
- **玻璃态效果** - backdrop-blur和半透明背景
- **柔和发光** - 渐变阴影和脉冲动画
- **科技感** - 几何图形和网格背景

### 交互效果
- **按钮悬停** - 缩放和颜色变化
- **平滑动画** - 渐入和过渡效果
- **脉冲效果** - 微妙的动画反馈
- **响应式** - 完美适配手机和桌面

## 🔧 API参考

### App组件

```tsx
interface AppProps {
  children?: React.ReactNode;
  onWeb3Ready?: (result: DetectionResult) => void;
  onWalletConnect?: (account: string, chainId: number) => void;
  showLoadingScreen?: boolean;
  loadingMessage?: string;
}
```

### WalletDetector工具类

```tsx
class WalletDetector {
  // 检测Web3状态
  static detect(): DetectionResult;
  
  // 等待Web3加载
  static waitForWeb3(timeout?: number): Promise<boolean>;
  
  // 检查连接状态
  static checkConnection(): Promise<ConnectionResult>;
  
  // 获取钱包下载链接
  static getWalletDownloadUrl(wallet: WalletInfo, userAgent?: string): string;
}
```

## 📱 支持的钱包

### 浏览器扩展
- 🦊 **MetaMask** - 最受欢迎的以太坊钱包
- 🔵 **Coinbase Wallet** - Coinbase官方钱包
- 🛡️ **Trust Wallet** - Binance官方钱包
- 👻 **Phantom** - Solana生态钱包

### 移动端支持
- 自动检测iOS/Android设备
- 提供应用商店下载链接
- 响应式设计适配

## 🎯 使用场景

### 1. DeFi应用
```tsx
<App onWalletConnect={handleWalletConnect}>
  <DeFiDashboard />
</App>
```

### 2. NFT市场
```tsx
<App onWeb3Ready={initializeNFTMarketplace}>
  <NFTMarketplace />
</App>
```

### 3. 游戏应用
```tsx
<App loadingMessage="正在连接游戏钱包...">
  <GameInterface />
</App>
```

## 🔄 状态流程

1. **加载阶段** - 显示LoadingScreen
2. **检测阶段** - 使用WalletDetector检测Web3
3. **提示阶段** - 如果未检测到，显示Web3PromptPage
4. **就绪阶段** - Web3可用，渲染应用内容
5. **连接阶段** - 监听钱包连接事件

## 🎨 自定义样式

### 修改主题色彩
```css
/* 在全局CSS中覆盖 */
:root {
  --web3-primary: #8B5CF6;
  --web3-secondary: #3B82F6;
  --web3-background: linear-gradient(135deg, #1e1b4b, #1e3a8a, #312e81);
}
```

### 自定义动画
```css
/* 自定义脉冲效果 */
@keyframes custom-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## 📖 演示页面

访问以下页面查看完整演示：
- `/web3-prompt-demo` - 完整功能演示
- `/web3-demo` - 之前的Web3组件演示

## 🛠️ 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Next.js** - 应用框架

## 📄 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个组件库！

