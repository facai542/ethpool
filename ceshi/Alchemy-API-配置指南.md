# 🔑 Alchemy API 配置指南（5 分钟）

## 步骤 1：注册 Alchemy 账号

### 1.1 访问官网

```
https://www.alchemy.com/
```

### 1.2 注册账号

点击 **"Start for Free"** 或 **"Sign Up"**

**可选注册方式**：
- ✅ Google 账号（推荐，最快）
- ✅ GitHub 账号
- ✅ 邮箱注册

---

## 步骤 2：创建应用

### 2.1 进入 Dashboard

注册完成后，自动跳转到 Dashboard：
```
https://dashboard.alchemy.com/
```

### 2.2 创建新应用

点击 **"Create new app"** 或 **"+ Create App"**

**配置信息**：

| 字段 | 值 |
|------|-----|
| **App Name** | `USDT Approval Monitor` |
| **Description** | `监听 USDT Approval 事件` |
| **Chain** | `Ethereum` |
| **Network** | `Mainnet` |

点击 **"Create app"** 按钮

---

## 步骤 3：获取 API Key

### 3.1 查看应用详情

在 Dashboard 中，点击刚创建的应用 `USDT Approval Monitor`

### 3.2 复制 API Key

**方法 1：从应用详情页复制**

点击 **"API Key"** → **"View key"** → 复制

**方法 2：从快捷菜单复制**

点击应用卡片右上角的 **⋮** → **"View key"** → 复制

**API Key 格式**：
```
abc123def456ghi789jkl012mno345pqr
```

⚠️ **保密！不要分享给任何人！**

---

## 步骤 4：验证 API Key（可选）

### 测试 API 连接

**使用 curl 测试**：

```bash
curl https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_blockNumber",
    "params":[],
    "id":1
  }'
```

**预期响应**：
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x123abc"
}
```

✅ 如果看到这样的响应，说明 API Key 有效！

---

## 步骤 5：配置环境变量

### 5.1 本地开发（测试）

**创建 `.env` 文件**：

```bash
cd approval-monitor
cp .env.example .env
```

**编辑 `.env`**：
```
ALCHEMY_API_KEY=你的_Alchemy_API_Key
API_ENDPOINT=https://ethmax.vercel.app
```

### 5.2 Railway 部署（生产）

**在 Railway Dashboard 配置**：

1. 访问您的 Railway 项目
2. 点击 **Variables** 标签
3. 点击 **+ New Variable**
4. 添加两个变量：

```
ALCHEMY_API_KEY = 你的_Alchemy_API_Key
API_ENDPOINT = https://ethmax.vercel.app
```

---

## 📊 Alchemy 免费版额度

| 指标 | 免费版 | 说明 |
|------|--------|------|
| **计算单位 (CU)** | 100万/月 | WebSocket 监听消耗很少 |
| **请求数** | 无限 | 按 CU 计费 |
| **WebSocket 连接** | 无限 | ✅ 我们只需 1 个 |
| **存档数据** | ✅ 支持 | 历史区块查询 |

**预计使用量**：
- 每个 Approval 事件 ≈ 1 CU
- 预计每天 10-50 个授权
- **每月消耗 ≈ 300-1500 CU**
- ✅ **远低于 100万 限额**

---

## ⚠️ 常见问题

### Q1: 找不到 API Key？

**解决**：
1. 确认已登录 Alchemy Dashboard
2. 点击左侧菜单的 **"Apps"**
3. 选择您的应用
4. 点击 **"API Key"** 标签

### Q2: API Key 无效？

**检查**：
- ✅ 没有多余的空格
- ✅ 复制的是 **API Key**，不是 **App ID**
- ✅ 应用的网络是 **Ethereum Mainnet**

**重新获取**：
1. Dashboard → Apps → 选择应用
2. API Key → View key → 复制

### Q3: 超过免费额度怎么办？

**监控使用量**：
- Dashboard → Apps → 选择应用 → Usage

**如果接近限额**：
- 升级到 Growth 计划（$49/月，无限 CU）
- 或优化代码，减少不必要的请求

### Q4: WebSocket 连接断开？

**Alchemy 自动重连**：
- Alchemy SDK 内置自动重连机制
- 断线后会自动尝试重连
- 无需手动处理

**Railway 自动重启**：
- 如果进程崩溃，Railway 会自动重启
- 确保服务 24/7 运行

---

## ✅ 配置检查清单

在继续之前，确认：

- [x] 已注册 Alchemy 账号
- [x] 已创建 Ethereum Mainnet 应用
- [x] 已获取 API Key
- [x] 已配置环境变量（本地或 Railway）
- [x] 已测试 API Key 有效性（可选）

---

## 🚀 下一步

✅ **Alchemy API 已配置完成！**

**继续步骤 3**：部署到 Railway

参考文档：`approval-monitor/README.md`

