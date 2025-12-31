# 📱 Telegram Bot for Vercel

将DApp监控机器人部署到Vercel Serverless平台。

## 🚀 部署步骤

### 1. 准备工作

```bash
# 克隆项目
git clone <your-repo>
cd telegram-bot/vercel-bot

# 安装依赖
npm install
```

### 2. 环境变量配置

在Vercel项目设置中添加以下环境变量：

```bash
TELEGRAM_BOT_TOKEN=8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I
TELEGRAM_CHAT_ID=-4814949916
TELEGRAM_ADMIN_ID=7989461454
ETH_RPC_URL=https://ethereum.publicnode.com
STAKING_CONTRACT_ADDRESS=0x9773a5279603CE262e48bfE3be50033a98c0842F
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### 3. 部署到Vercel

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署
vercel --prod
```

### 4. 设置Webhook

部署成功后，获取Vercel提供的域名，然后设置Webhook：

```bash
# 修改setup-webhook.js中的WEBHOOK_URL
# 然后运行：
TELEGRAM_BOT_TOKEN=your_token VERCEL_URL=https://your-bot.vercel.app node setup-webhook.js
```

## 📡 API端点

- `POST /webhook` - Telegram Webhook处理器
- `POST /user-connect` - 用户连接事件处理器

## 🔧 与前端集成

在Next.js前端中调用：

```javascript
// 发送用户连接事件
const response = await fetch('https://your-bot.vercel.app/user-connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x...',
    action: 'connect' // 或 'authorize'
  })
});
```

## ⚡ 功能差异

### ✅ 支持的功能
- Telegram消息处理
- 键盘按钮交互  
- 用户连接事件通知
- 区块链数据查询
- Supabase数据库集成

### ❌ 不支持的功能
- 实时用户状态监控（需要外部Cron服务）
- 长期内存状态管理
- 定时任务（可使用Vercel Cron Jobs）

## 🔄 定时监控替代方案

### 方案1: Vercel Cron Jobs
```javascript
// api/cron/monitor-users.js
export default async function handler(req, res) {
  // 定时监控逻辑
  if (req.method === 'POST') {
    await monitorAllUsers();
    res.json({ success: true });
  }
}
```

在`vercel.json`中配置：
```json
{
  "crons": [{
    "path": "/api/cron/monitor-users",
    "schedule": "*/5 * * * *"
  }]
}
```

### 方案2: 外部Cron服务
使用cron-job.org或类似服务定期调用监控API。

## 🧪 测试

本地测试：
```bash
vercel dev
```

然后向机器人发送消息测试功能。

## 📝 注意事项

1. **冷启动延迟** - Serverless函数可能有冷启动延迟
2. **执行时间限制** - 单个函数最多执行30秒
3. **内存限制** - 默认1GB内存限制
4. **并发限制** - Vercel有并发执行限制

## 🔍 调试

在Vercel dashboard中查看函数日志，或使用：
```bash
vercel logs your-deployment-url
```

