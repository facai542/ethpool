# USDT Approval 监听服务

## 功能

- 🎯 监听 USDT 合约的 Approval 事件
- ✅ 只处理授权给我们质押合约的事件 (0xc8aC...218)
- 🚀 自动调用后端 API 处理授权
- 📡 自动添加用户地址到交易监听
- 💓 24/7 运行，自动健康检查

## 技术栈

- **Alchemy SDK**: WebSocket 实时监听
- **Ethers.js**: 事件解析
- **Node.js**: 运行时环境
- **Railway**: 部署平台

## 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ALCHEMY_API_KEY` | Alchemy API 密钥 | `abc123...` |
| `API_ENDPOINT` | 后端 API 地址 | `https://ethmax.vercel.app` |

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```bash
cp .env.example .env
```

编辑 `.env`：
```
ALCHEMY_API_KEY=你的_Alchemy_API_密钥
API_ENDPOINT=https://ethmax.vercel.app
```

### 3. 运行

```bash
npm start
```

## 部署到 Railway

### 方法 1: 从 GitHub 部署（推荐）

1. 将代码推送到 GitHub
2. 访问 https://railway.app
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择仓库
5. 配置环境变量（见上表）
6. 自动部署

### 方法 2: 使用 Railway CLI

```bash
# 安装 CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up

# 配置环境变量
railway variables set ALCHEMY_API_KEY=你的密钥
railway variables set API_ENDPOINT=https://ethmax.vercel.app
```

## 监控

### 查看日志

**Railway Dashboard**:
- 访问项目 → Deployments → 选择部署 → Logs

**Railway CLI**:
```bash
railway logs
```

### 健康检查

服务每分钟输出健康检查信息：

```
💓 健康检查
────────────────────────────────────────────────────────────
⏰ 运行时间: 2时15分30秒
📊 总计 Approval 事件: 15
✅ 处理成功: 14
❌ 处理失败: 1
🕐 最后事件时间: 2025-10-12 18:30:25
📅 当前时间: 2025-10-12 18:31:00
────────────────────────────────────────────────────────────
```

## 事件处理流程

```
用户授权
   ↓
USDT.approve(0xc8aC...218, 1000000)
   ↓
触发 Approval 事件
   ↓
Alchemy WebSocket 接收 (< 15秒)
   ↓
验证 spender = 我们的合约
   ↓
调用 /api/user/authorize
   ↓
后端处理:
  - 更新数据库
  - 发放奖励
  - 添加到交易监听
  - 发送 Telegram 通知
```

## 故障排查

### 1. 未收到 Approval 事件

**检查**:
- ✅ ALCHEMY_API_KEY 是否正确
- ✅ 网络是否正常
- ✅ Railway 服务是否运行中

**解决**:
```bash
# 查看日志
railway logs

# 重启服务
railway up
```

### 2. 后端 API 调用失败

**检查**:
- ✅ API_ENDPOINT 是否正确
- ✅ 后端服务是否正常
- ✅ 网络连接是否正常

**解决**:
```bash
# 测试 API
curl https://ethmax.vercel.app/api/user/authorize
```

### 3. 内存不足

**Railway 免费版限制**: 512MB RAM

**优化**:
- 服务设计已优化，内存占用 < 100MB
- 如果需要，可升级 Railway 计划

## 成本

| 服务 | 免费额度 | 成本 |
|------|----------|------|
| **Alchemy** | 100万 CU/月 | $0 |
| **Railway** | 500 小时/月 | $0 |
| **总计** | - | **$0/月** |

## 支持

如有问题，请查看：
- Railway 文档: https://docs.railway.app
- Alchemy 文档: https://docs.alchemy.com
- 项目文档: `ceshi/最优监听方案-完整版.md`

