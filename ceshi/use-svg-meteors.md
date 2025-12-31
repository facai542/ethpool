# 使用SVG流星图片替换自定义流星

## 修改内容

### 1. 使用SVG图片
替换了自定义的CSS流星，现在使用11个SVG流星图片：
- `tw1.svg` 到 `tw11.svg`
- 每个流星都有独特的外观

### 2. 流星掉落方向
- **起始位置**: 屏幕左上角外边（负坐标区域）
- **掉落方向**: 向右下方45度角掉落
- **结束位置**: 屏幕右下角外边

### 3. 位置分布算法
```javascript
// 为每个流星创建不同的起始位置
const startLeft = -20 - (i * 5) - (Math.random() * 10);
const startTop = -20 - (i * 3) - (Math.random() * 15);
const delay = i * 0.5 + Math.random() * 4;
const duration = 3 + Math.random() * 2;
```

### 4. 动画参数
- **数量**: 11个SVG流星
- **大小**: 60px宽度，高度自适应
- **透明度**: 0.8
- **延迟时间**: 0.5秒间隔 + 0-4秒随机延迟
- **持续时间**: 3-5秒随机
- **旋转角度**: 45度（从左上到右下）

## 技术实现

### HTML结构
```jsx
{Array.from({ length: 11 }).map((_, i) => {
  const startLeft = -20 - (i * 5) - (Math.random() * 10);
  const startTop = -20 - (i * 3) - (Math.random() * 15);
  const delay = i * 0.5 + Math.random() * 4;
  const duration = 3 + Math.random() * 2;
  
  return (
    <img
      key={i}
      src={`/tw${i + 1}.svg`}
      alt={`meteor-${i + 1}`}
      className="meteor-svg"
      style={{
        left: `${startLeft}%`,
        top: `${startTop}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    />
  );
})}
```

### CSS样式
```css
.meteor-svg {
  position: absolute;
  width: 60px;
  height: auto;
  opacity: 0.8;
  animation: meteor-fall linear infinite;
  pointer-events: none;
}
```

### CSS动画
```css
@keyframes meteor-fall {
  0% {
    transform: translateX(-150px) translateY(-150px) rotate(45deg);
    opacity: 0;
  }
  5% {
    opacity: 0.8;
  }
  95% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(calc(100vw + 150px)) translateY(calc(100vh + 150px)) rotate(45deg);
    opacity: 0;
  }
}
```

## 视觉效果特点

### 1. 多样化外观
- 11种不同的SVG流星设计
- 每个流星都有独特的形状和细节
- 比之前的简单线条更生动

### 2. 自然分布
- 每个流星起始位置都不同
- 随机的水平和垂直偏移
- 避免流星重叠或排列整齐

### 3. 时间错开
- 基础延迟：每个流星间隔0.5秒
- 随机延迟：额外0-4秒随机延迟
- 持续时间：3-5秒随机变化

### 4. 掉落轨迹
- 从屏幕左上角外开始
- 45度角斜向掉落
- 在屏幕右下角外消失
- 符合真实流星雨的视觉效果

## 移动端适配

### 响应式设计
- SVG图片自动缩放
- 60px宽度适合手机屏幕
- 掉落轨迹覆盖整个屏幕区域

### 性能优化
- 使用SVG矢量图片，文件小
- CSS动画硬件加速
- 合理的流星数量（11个）

## 最终效果

启动屏现在展示：
- 🌞 中心的太阳系动画
- ✨ 背景的闪烁粒子
- 🌌 缓慢漂移的星云
- ☄️ **11个独特的SVG流星从左上角斜向掉落**

每个流星都有不同的外观、起始位置和掉落时间，营造出自然而丰富的流星雨效果。



