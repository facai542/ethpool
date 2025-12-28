# ✅ Tokenview 自动监控配置完成

## 📋 功能说明

现在当用户授权地址后，系统会**自动**将地址添加到以下监控服务：

### 1. Moralis Stream（主要）
- 实时监控 USDT 转账
- 推送到 `/api/moralis/webhook`
- 免费额度充足

### 2. Tokenview（备用）
- 作为 Moralis 的备份
- 推送到 `/api/tokenview/webhook`
- 提高监控可靠性

## 🔄 完整流程

```
用户授权地址
    ↓
保存到 wallet_monitor 表
    ↓
自动添加到 Moralis ✅
    ↓
自动添加到 Tokenview ✅ (新增)
    ↓
监听链上 USDT 交易
    ↓
Webhook 接收交易数据
    ↓
写入 wallet_transactions 表
    ↓
数据库触发器/Supabase Realtime
    ↓
写入 telegram_notification_queue
    ↓
TelegramRealtimeService 监听
    ↓
发送 Telegram 通知 🎉
```

## ⚙️ 需要配置的环境变量

### Vercel 环境变量

在 Vercel Dashboard → Settings → Environment Variables 添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `TOKENVIEW_API_KEY` | 你的 API Key | Tokenview API 密钥 |
| `TOKENVIEW_WEBHOOK_SECRET` | `fSpkcrSkEMrMOxY65gr0` | Webhook 验证密钥（已配置） |
| `NEXT_PUBLIC_APP_URL` | `https://ethmax.vercel.app` | 你的应用域名 |

### 获取 TOKENVIEW_API_KEY

1. 访问 https://services.tokenview.io/en/dashboard
2. 登录账号
3. 进入 API Keys 页面
4. 复制 API Key
5. 添加到 Vercel 环境变量

## ✅ 配置检查清单

- [ ] 已在 Tokenview Dashboard 配置 Webhook URL
- [ ] Webhook URL: `https://ethmax.vercel.app/api/tokenview/webhook`
- [ ] 已添加 `TOKENVIEW_WEBHOOK_SECRET` 环境变量
- [ ] 已添加 `TOKENVIEW_API_KEY` 环境变量（可选）
- [ ] 已重新部署项目
- [ ] 测试授权流程，查看日志确认自动添加

## 🧪 测试方法

### 1. 测试授权流程

1. 连接钱包并授权
2. 查看 Vercel 日志：
   ```
   🔍 添加地址到监控服务...
   📡 添加地址到 Moralis Stream: 0x...
   📡 添加地址到 Tokenview 监控: 0x...
   ✅ 地址已添加到监控服务（Moralis/Tokenview）
   ```

### 2. 测试 Webhook 接收

发送 USDT 到授权地址，查看日志：
```
📡 收到 Moralis Webhook
📝 保存交易到数据库: 0x... in 100.000000 USDT
✅ 交易已保存，触发器将自动发送通知
```

或

```
📡 收到 Tokenview Webhook  
📨 Tokenview Webhook 数据: {...}
✅ 交易已保存到数据库
```

### 3. 测试 Telegram 通知

检查 Telegram 群组是否收到通知：
```
🟢收入USDT 提醒       +100.000000 USDT

钱包余额：1000.000000
顶层代理：默认代理
...
```

## 🔧 故障排查

### Tokenview 未自动添加

**可能原因：**
1. `TOKENVIEW_API_KEY` 未配置
2. API Key 无效或过期
3. Tokenview API 请求失败

**解决方法：**
1. 检查环境变量是否正确
2. 查看 Vercel 日志中的错误信息
3. 手动在 Tokenview Dashboard 添加地址

### Webhook 未收到推送

**可能原因：**
1. Webhook URL 配置错误
2. 密钥验证失败
3. 地址未成功添加到监控

**解决方法：**
1. 确认 Webhook URL 正确
2. 检查 `TOKENVIEW_WEBHOOK_SECRET` 是否正确
3. 在 Tokenview Dashboard 查看监控列表

### 通知未发送

**可能原因：**
1. 数据库触发器未创建
2. Supabase Realtime 未启动
3. Telegram Bot 配置问题

**解决方法：**
1. 检查 `wallet_transactions` 表是否有新记录
2. 检查 `telegram_notification_queue` 表
3. 查看 TelegramRealtimeService 运行状态

## 📊 监控服务对比

| 特性 | Moralis | Tokenview |
|------|---------|-----------|
| **自动添加** | ✅ 是 | ✅ 是 |
| **实时性** | 优秀 | 良好 |
| **稳定性** | 中等 | 优秀 |
| **免费额度** | 有限 | 需付费 |
| **支持链** | 20+ | 100+ |
| **配置复杂度** | 低 | 中 |

## 🎯 推荐配置

### 方案1：仅使用 Moralis（推荐新手）
- ✅ 简单易配置
- ✅ 免费额度充足
- ✅ 适合小规模应用

**配置：**
- 只配置 `MORALIS_API_KEY`
- Tokenview 自动跳过

### 方案2：Moralis + Tokenview（推荐生产环境）
- ✅ 双重保障
- ✅ 监控更可靠
- ✅ 自动故障转移

**配置：**
- 配置 `MORALIS_API_KEY`
- 配置 `TOKENVIEW_API_KEY`
- 同时监控，自动去重

### 方案3：仅使用 Tokenview
- ✅ 支持更多区块链
- ✅ 更稳定的服务
- ❌ 需要付费

**配置：**
- 不配置 `MORALIS_API_KEY`
- 只配置 `TOKENVIEW_API_KEY`

## 📝 总结

通过 Supabase Realtime + 数据库触发器，你的系统可以：

1. ✅ **自动监控**：授权后自动添加到 Moralis/Tokenview
2. ✅ **实时通知**：交易发生立即推送 Telegram
3. ✅ **双重保障**：Moralis 主 + Tokenview 备
4. ✅ **自动去重**：同一交易不会重复通知
5. ✅ **故障容错**：一个服务失败不影响另一个

**是的，配置完成后就可以实现授权地址自动添加机器人实时 USDT 动账通知！** 🎉

---

**创建时间：** 2025-10-11  
**状态：** ✅ 已完成配置

