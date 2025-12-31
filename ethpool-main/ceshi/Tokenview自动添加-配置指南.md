# Tokenview 自动添加地址监控 - 配置指南

## 🎯 目标

实现：**用户授权地址后，自动添加到 Tokenview 监控，无需手动配置**

## ✅ 代码已完成

以下代码已经创建并部署：

### 1. 自动添加函数
- 文件：`src/lib/tokenview.ts`
- 功能：调用 Tokenview API 自动添加地址监控

### 2. 授权时自动调用
- 文件：`src/app/api/user/authorize/route.ts`
- 功能：用户授权时自动添加到 Moralis + Tokenview

### 3. Webhook 接收
- 文件：`src/app/api/tokenview/webhook/route.ts`
- 功能：接收 Tokenview 推送的交易数据

## ⚙️ 需要配置的环境变量

### 必需配置（实现自动添加）

在 Vercel Dashboard → Settings → Environment Variables 添加：

```
TOKENVIEW_API_KEY=你的API Key
```

**如何获取：**

1. 访问 https://services.tokenview.io/en/dashboard
2. 登录你的账号
3. 找到 **API Keys** 或 **API 管理** 菜单
4. 复制 API Key（通常是一串长字符）
5. 粘贴到 Vercel 环境变量

### 已配置（Webhook 接收）

```
TOKENVIEW_WEBHOOK_SECRET=fSpkcrSkEMrMOxY65gr0
```

## 🔄 完整自动化流程

```
用户在前端授权地址
    ↓
POST /api/user/authorize
    ↓
保存到 wallet_monitor 表
    ↓
调用 addAddressToMonitoring(address)
    ↓
├─ addAddressToMoralisStream(address)
│  └─ Moralis API: 添加地址到 Stream ✅
│
└─ addAddressToTokenview(address)
   └─ Tokenview API: POST /address/monitor ✅
      ├─ address: 0x...
      ├─ chain: eth
      ├─ webhook_url: https://ethmax.vercel.app/api/tokenview/webhook
      ├─ events: ['transfer']
      └─ contract: 0xdAC17F958D2ee523a2206206994597C13D831ec7 (USDT)
    ↓
Tokenview 开始监控该地址
    ↓
有 USDT 交易时
    ↓
Tokenview 推送到 /api/tokenview/webhook
    ↓
保存到 wallet_transactions 表
    ↓
触发 Telegram 通知
```

## 🧪 测试自动添加

### 测试步骤

1. **配置 API Key**（上面的步骤）

2. **重新部署**
   ```bash
   git push
   # 或在 Vercel Dashboard 点击 Redeploy
   ```

3. **清空测试**（可选）
   - 在 Tokenview Dashboard 删除所有手动添加的地址
   - 确保从零开始测试自动添加

4. **授权新地址**
   - 在前端连接钱包
   - 授权 USDT 合约
   - 提交授权

5. **查看 Vercel 日志**
   
   成功的日志应该显示：
   ```
   🔍 添加地址到监控服务... 0x1234567890abcdef...
   📡 添加地址到 Moralis Stream: 0x1234567890abcdef...
   📡 添加地址到 Tokenview 监控: 0x1234567890abcdef...
   ✅ 地址已添加到 Tokenview 监控
   ✅ 地址已添加到监控服务（Moralis/Tokenview）
   ```
   
   如果 API Key 未配置，会显示：
   ```
   ⚠️ TOKENVIEW_API_KEY 未配置，跳过 Tokenview 监控
   ```

6. **验证地址已添加**
   - 访问 Tokenview Dashboard
   - 进入 Address Monitor 或监控地址列表
   - 应该看到刚授权的地址**自动出现**

7. **测试交易监控**
   - 向该地址发送 0.1 USDT
   - 查看 Vercel 日志确认收到 Webhook
   - 检查 Telegram 群组收到通知

## 🔍 故障排查

### 问题1：自动添加失败

**日志显示：**
```
⚠️ TOKENVIEW_API_KEY 未配置，跳过 Tokenview 监控
```

**解决方法：**
1. 确认在 Vercel 添加了 `TOKENVIEW_API_KEY`
2. 确认变量名拼写正确（区分大小写）
3. 重新部署项目

### 问题2：API Key 无效

**日志显示：**
```
❌ 添加到 Tokenview 失败: {"code": 401, "message": "Unauthorized"}
```

**解决方法：**
1. 检查 API Key 是否正确
2. 确认 API Key 是否过期
3. 在 Tokenview Dashboard 重新生成 API Key

### 问题3：API 请求失败

**日志显示：**
```
❌ 添加到 Tokenview 异常: Network error
```

**解决方法：**
1. 检查网络连接
2. 确认 Tokenview API 服务正常
3. 检查是否达到 API 请求限制

### 问题4：地址未出现在 Dashboard

**可能原因：**
1. API 返回成功但实际未添加
2. Dashboard 显示延迟
3. 账户权限问题

**解决方法：**
1. 刷新 Tokenview Dashboard
2. 等待 1-2 分钟后再查看
3. 查看 Vercel 日志确认 API 返回值
4. 联系 Tokenview 技术支持

## 📊 对比：Moralis vs Tokenview

### Moralis（主要监控）

**自动添加：** ✅ 是
- 使用 Moralis SDK
- 创建/更新 Stream
- 添加地址到 Stream

**优点：**
- 免费额度充足
- 实时性好
- SDK 完善

### Tokenview（备用监控）

**自动添加：** ✅ 是（需要 API Key）
- 使用 REST API
- POST /address/monitor
- 返回监控ID

**优点：**
- 支持更多链
- 稳定性高
- 功能丰富

### 双监控优势

1. **可靠性** - 一个失败不影响另一个
2. **去重** - 同一交易只通知一次
3. **互补** - 相互备份

## 💡 常见问题

### Q1：Tokenview 需要付费吗？

A：是的，Tokenview 通常需要付费套餐。建议：
- 新用户：只使用 Moralis（免费）
- 生产环境：Moralis + Tokenview（双保险）

### Q2：可以只用 Tokenview 吗？

A：可以！如果不配置 `MORALIS_API_KEY`，系统会只使用 Tokenview。

### Q3：如何知道哪个服务推送的交易？

A：查看数据库 `blockchain_transactions` 表的 `source` 字段：
- `source = 'moralis'` - Moralis 推送
- `source = 'tokenview'` - Tokenview 推送

### Q4：两个服务都推送会重复通知吗？

A：不会！代码会自动去重：
- 通过 `tx_hash` 判断
- 相同交易只保存一次
- 只发送一次通知

## ✅ 配置检查清单

完成自动添加配置，请确认：

- [ ] 已在 Vercel 添加 `TOKENVIEW_API_KEY` 环境变量
- [ ] 已重新部署项目
- [ ] 已测试授权新地址
- [ ] 查看 Vercel 日志确认自动添加成功
- [ ] 在 Tokenview Dashboard 看到地址自动出现
- [ ] 已测试交易监控和通知

## 🎉 完成后的效果

配置完成后：

1. **用户授权** → 地址自动添加到 Moralis + Tokenview
2. **无需手动** → 完全自动化，0 人工操作
3. **双重监控** → 提高可靠性
4. **实时通知** → Telegram 群组收到通知
5. **自动去重** → 不会重复通知

**这就是你需要的自动化监控系统！** 🎯

---

**创建时间：** 2025-10-11  
**状态：** 等待配置 TOKENVIEW_API_KEY

