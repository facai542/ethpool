# Web3动画组件使用指南

一套完整的Web3检测动画系统，提供流畅的用户体验和现代化的视觉效果。

## 🎯 动画特性

### 1. 页面加载动画
- ✅ **旋转的以太坊图标** - 多圈旋转效果，带有发光动画
- ✅ **渐进式文字显示** - 逐字显示，从模糊到清晰
- ✅ **浮动粒子效果** - 20个粒子在背景中浮动
- ✅ **渐变光晕** - 动态的紫色和蓝色光晕

### 2. 切换动画
- ✅ **页面间滑动转场** - 平滑的进入和退出动画
- ✅ **元素渐入渐出** - 所有元素都有延迟进入效果
- ✅ **缩放和旋转** - 3D变换效果

### 3. 交互动画
- ✅ **按钮点击反馈** - 缩放和颜色变化
- ✅ **悬停效果** - 微妙的变换和阴影
- ✅ **钱包连接状态指示器** - 动态的状态显示
- ✅ **错误提示抖动** - 错误时的抖动效果

## 📁 组件结构

```
src/
├── components/
│   ├── AnimatedLoadingScreen.tsx    # 增强的加载界面
│   ├── AnimatedWeb3PromptPage.tsx   # 动画提示页面
│   ├── AnimatedApp.tsx             # 主应用组件
│   └── Web3Animation-Guide.md      # 使用指南
├── utils/
│   ├── WalletDetector.ts           # 钱包检测工具
│   └── AnimationOptimizer.ts       # 动画性能优化
├── styles/
│   └── animations.css              # 优化的CSS动画
└── app/
    └── web3-animated-demo/
        └── page.tsx                # 完整演示页面
```

## 🚀 快速开始

### 1. 基础使用

```tsx
import { AnimatedApp } from '@/components/AnimatedApp';

function MyApp() {
  return (
    <AnimatedApp>
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-white text-3xl">您的应用内容</h1>
      </div>
    </AnimatedApp>
  );
}
```

### 2. 带回调的使用

```tsx
import { AnimatedApp } from '@/components/AnimatedApp';
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
    <AnimatedApp
      onWeb3Ready={handleWeb3Ready}
      onWalletConnect={handleWalletConnect}
      loadingMessage="正在初始化Web3环境..."
    >
      <YourAppContent />
    </AnimatedApp>
  );
}
```

### 3. 自定义配置

```tsx
import { AnimatedApp } from '@/components/AnimatedApp';

function MyApp() {
  return (
    <AnimatedApp
      showLoadingScreen={true}
      loadingMessage="正在检测Web3钱包..."
    >
      <YourAppContent />
    </AnimatedApp>
  );
}
```

## 🎨 动画配置

### Framer Motion配置

```tsx
// 页面切换动画
const pageVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 1.05, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.6
};
```

### CSS动画类

```css
/* GPU加速 */
.transform-gpu
.will-change-transform
.backface-visibility-hidden

/* 动画效果 */
.animate-fade-in-up
.animate-scale-in
.animate-rotate-in
.animate-bounce
.animate-shake
.animate-glow
```

## 🔧 性能优化

### 1. GPU加速

```tsx
import { AnimationOptimizer } from '@/utils/AnimationOptimizer';

// 启用GPU加速
AnimationOptimizer.enableGPUAcceleration(element);

// 批量启用
AnimationOptimizer.enableBatchGPUAcceleration(elements);
```

### 2. 性能检测

```tsx
// 检测设备性能
const level = AnimationOptimizer.detectPerformanceLevel(); // 'low' | 'medium' | 'high'

// 获取性能配置
const settings = AnimationOptimizer.getPerformanceBasedSettings(level);

// 测量动画性能
const metrics = await AnimationOptimizer.measureAnimationPerformance(() => {
  // 触发动画
});
```

### 3. 动画优化

```tsx
// 创建优化的CSS动画
const css = AnimationOptimizer.createOptimizedCSSAnimation(
  'myAnimation',
  {
    '0%': { opacity: 0, transform: 'translateY(20px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' }
  },
  {
    duration: 0.6,
    easing: 'ease-out'
  }
);
```

## 📱 响应式设计

### 移动端优化

```tsx
// 检测移动设备
const isMobile = WalletDetector.detect().isMobile;

// 根据设备调整动画
const animationSettings = isMobile ? 
  { duration: 0.2, maxParticles: 10 } : 
  { duration: 0.5, maxParticles: 40 };
```

### 性能自适应

```tsx
import { AnimationOptimizer } from '@/utils/AnimationOptimizer';

// 根据性能等级调整设置
const performanceLevel = AnimationOptimizer.detectPerformanceLevel();
const settings = AnimationOptimizer.getPerformanceBasedSettings(performanceLevel);

// 应用设置
if (performanceLevel === 'low') {
  // 减少动画复杂度
  AnimationOptimizer.reduceAnimationComplexity(element);
}
```

## 🎯 使用场景

### 1. DeFi应用

```tsx
<AnimatedApp onWalletConnect={handleWalletConnect}>
  <DeFiDashboard />
</AnimatedApp>
```

### 2. NFT市场

```tsx
<AnimatedApp onWeb3Ready={initializeNFTMarketplace}>
  <NFTMarketplace />
</AnimatedApp>
```

### 3. 游戏应用

```tsx
<AnimatedApp loadingMessage="正在连接游戏钱包...">
  <GameInterface />
</AnimatedApp>
```

## 🔄 动画流程

1. **加载阶段** - 显示AnimatedLoadingScreen
2. **检测阶段** - 渐进式文字显示和旋转图标
3. **切换阶段** - 平滑转场到提示页面或应用
4. **交互阶段** - 丰富的悬停和点击反馈
5. **完成阶段** - 优雅的状态指示

## 🛠️ 自定义动画

### 1. 创建自定义动画

```tsx
const customVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

<motion.div
  variants={customVariants}
  initial="hidden"
  animate="visible"
>
  自定义动画内容
</motion.div>
```

### 2. 组合动画

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  whileHover={{ scale: 1.05, y: -5 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  组合动画元素
</motion.div>
```

## 📊 性能监控

### 实时性能监控

```tsx
useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`Animation ${entry.name}: ${entry.duration}ms`);
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
  
  return () => observer.disconnect();
}, []);
```

## 🎨 主题定制

### 修改动画颜色

```css
:root {
  --animation-primary: #8B5CF6;
  --animation-secondary: #3B82F6;
  --animation-accent: #10B981;
}

.animate-glow {
  box-shadow: 0 0 20px var(--animation-primary);
}
```

## 📖 演示页面

访问以下页面查看完整演示：
- `/web3-animated-demo` - 完整动画演示
- `/web3-prompt-demo` - 基础Web3检测演示

## 🔧 技术栈

- **React 18** - 前端框架
- **Framer Motion** - 动画库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **CSS3** - 高性能动画

## 📄 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个动画系统！

