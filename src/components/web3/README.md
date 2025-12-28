# Web3检测组件

一个完整的Web3钱包检测和管理系统，支持多种主流钱包，提供优雅的用户体验。

## 功能特性

- ✅ **自动检测Web3支持** - 检测浏览器是否支持Web3
- 🔍 **多钱包识别** - 支持MetaMask、Coinbase Wallet、Trust Wallet等主流钱包
- 📱 **移动端适配** - 自动识别移动设备，提供相应下载链接
- 🎨 **优雅UI** - 现代化的渐变设计和动画效果
- 🔄 **实时状态管理** - 监听钱包连接状态变化
- 🌐 **网络切换** - 支持切换不同的区块链网络
- 🛡️ **TypeScript支持** - 完整的类型定义

## 支持的钱包

### 浏览器扩展钱包
- MetaMask 🦊
- Coinbase Wallet 🔵
- Trust Wallet 🛡️
- Phantom 👻
- imToken 🔐
- TokenPocket 🎯
- Crypto.com DeFi Wallet 💎
- Bitget Wallet 🦎
- OKX Wallet ⚡
- Rabby Wallet 🐰
- Rainbow 🌈
- Brave Wallet 🦁

### 移动端钱包
- 所有上述钱包的移动端版本
- 自动检测iOS/Android并提供相应下载链接

## 安装使用

### 1. 基本使用

```tsx
import { Web3Provider, Web3Detection } from '@/components/web3';

function App() {
  return (
    <Web3Provider>
      <Web3Detection>
        <YourAppContent />
      </Web3Detection>
    </Web3Provider>
  );
}
```

### 2. 高级使用

```tsx
import { 
  Web3Provider, 
  Web3Detection, 
  WalletStatus, 
  useWeb3 
} from '@/components/web3';

function AppContent() {
  const { web3State, connectWallet, disconnectWallet } = useWeb3();

  return (
    <div>
      <WalletStatus showDetails={true} />
      
      {web3State.isConnected ? (
        <div>
          <p>已连接: {web3State.account}</p>
          <button onClick={disconnectWallet}>断开连接</button>
        </div>
      ) : (
        <button onClick={connectWallet}>连接钱包</button>
      )}
    </div>
  );
}

function App() {
  return (
    <Web3Provider>
      <Web3Detection 
        showInstallGuide={true}
        fallback={<div>需要安装Web3钱包</div>}
      >
        <AppContent />
      </Web3Detection>
    </Web3Provider>
  );
}
```

### 3. 自定义安装引导

```tsx
import { WalletInstallGuide } from '@/components/web3';

function CustomInstallPage() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div>
      <button onClick={() => setShowGuide(true)}>
        选择钱包安装
      </button>
      
      {showGuide && (
        <WalletInstallGuide onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}
```

## API参考

### Web3Provider

Web3状态管理的上下文提供者。

```tsx
interface Web3ContextType {
  web3State: Web3State;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => Promise<void>;
  isLoading: boolean;
}
```

### Web3Detection

主要的Web3检测组件。

```tsx
interface Web3DetectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showInstallGuide?: boolean;
  autoShowGuide?: boolean;
}
```

### WalletStatus

钱包连接状态显示组件。

```tsx
interface WalletStatusProps {
  showDetails?: boolean;
  className?: string;
}
```

### WalletInstallGuide

钱包安装引导弹窗组件。

```tsx
interface WalletInstallGuideProps {
  onClose?: () => void;
}
```

## 网络支持

支持以下区块链网络：

- Ethereum Mainnet (Chain ID: 1)
- Goerli Testnet (Chain ID: 5)
- BSC Mainnet (Chain ID: 56)
- BSC Testnet (Chain ID: 97)
- Polygon (Chain ID: 137)
- Mumbai Testnet (Chain ID: 80001)

## 样式定制

组件使用Tailwind CSS构建，支持以下自定义：

```tsx
// 自定义样式类
<WalletStatus className="custom-wallet-status" />

// 自定义主题色彩
<div className="bg-custom-gradient">
  <Web3Detection>
    <YourContent />
  </Web3Detection>
</div>
```

## 错误处理

组件包含完整的错误处理机制：

- 网络连接错误
- 钱包拒绝连接
- 不支持的链ID
- 钱包未安装

## 移动端优化

- 自动检测移动设备
- 提供应用商店下载链接
- 响应式设计
- 触摸友好的交互

## 演示页面

访问 `/web3-demo` 查看完整的功能演示。

## 技术栈

- React 18
- TypeScript
- Tailwind CSS
- Web3.js
- Next.js (App Router)

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 许可证

MIT License

