# Tokenview 地址监控配置指南

## 📋 前提条件

1. 注册 Tokenview 账号：https://services.tokenview.io/en/dashboard
2. 获取 API Key
3. 确认你的项目已部署到 Vercel

## 🎯 Webhook 网址配置

### 第一步：确定你的域名

你的 Vercel 项目域名格式：
```
https://项目名.vercel.app
```

**示例：**
- `https://ethmax.vercel.app`
- `https://newdapp-master.vercel.app`

### 第二步：填写 Webhook URL

在 Tokenview Dashboard 中填写：

```
https://你的域名.vercel.app/api/tokenview/webhook
```

**完整示例：**
```
https://ethmax.vercel.app/api/tokenview/webhook
```

## ⚙️ Tokenview Dashboard 配置步骤

### 1. 登录 Tokenview

访问：https://services.tokenview.io/en/dashboard

### 2. 创建地址监控

1. 点击 "Address Monitor" 或 "监控地址"
2. 选择区块链：**Ethereum (ETH)**
3. 填写配置：

| 字段 | 值 |
|------|------|
| **Address** | 要监控的钱包地址 |
| **Chain** | Ethereum |
| **Webhook URL** | `https://你的域名.vercel.app/api/tokenview/webhook` |
| **Events** | Transfer (转账事件) |
| **Confirmations** | 1 (最少确认数) |

### 3. 配置 USDT 合约（可选）

如果只监控 USDT 交易，可以添加合约地址过滤：

**USDT 合约地址：**
```
0xdAC17F958D2ee523a2206206994597C13D831ec7
```

## 🧪 测试 Webhook

### 方法1：Tokenview 测试按钮

在 Tokenview Dashboard 中：
1. 找到你配置的监控
2. 点击 "Test" 或 "测试" 按钮
3. 检查日志输出

### 方法2：访问验证端点

在浏览器中访问：
```
https://你的域名.vercel.app/api/tokenview/webhook
```

应该看到：
```json
{
  "service": "Tokenview Webhook Receiver",
  "status": "active",
  "endpoint": "/api/tokenview/webhook",
  "timestamp": "2025-10-11T..."
}
```

### 方法3：查看 Vercel 日志

1. 访问 Vercel Dashboard
2. 进入你的项目
3. 点击 "Logs" 查看实时日志
4. 发送测试交易后，应该看到：
   ```
   📡 收到 Tokenview Webhook
   ✅ Tokenview Webhook 测试成功
   ```

## 📊 Webhook 数据格式

Tokenview 会推送以下格式的数据：

```json
{
  "txid": "0x1234...",
  "from": "0xabcd...",
  "to": "0xefgh...",
  "value": "1000000",
  "confirmations": 1,
  "height": 18500000,
  "time": 1697000000,
  "chain": "eth",
  "contract": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "token_symbol": "USDT"
}
```

## 🔄 与 Moralis 的区别

| 特性 | Moralis | Tokenview |
|------|---------|-----------|
| **Webhook URL** | `/api/moralis/webhook` | `/api/tokenview/webhook` |
| **配置方式** | 代码自动创建 | 手动在 Dashboard 配置 |
| **实时性** | 优秀 | 良好 |
| **稳定性** | 中等 | 优秀 |
| **支持链** | 20+ | 100+ |
| **免费额度** | 有限 | 需查看套餐 |

## 💡 推荐使用场景

### 使用 Tokenview 当：
- ✅ Moralis 出现问题需要备用方案
- ✅ 需要监控更多区块链
- ✅ 需要更高的稳定性

### 继续使用 Moralis 当：
- ✅ 免费额度足够
- ✅ 需要更实时的推送
- ✅ 已经配置好且运行稳定

## 🚨 注意事项

1. **同时使用两个服务**
   - 可以同时配置 Moralis 和 Tokenview
   - 系统会自动去重（通过 tx_hash）
   - 提高监控可靠性

2. **确认数设置**
   - 建议设置为 1（快速通知）
   - 如果需要更高安全性，可设置为 3-6

3. **监控地址数量**
   - 检查你的 Tokenview 套餐限制
   - 合理分配监控地址

4. **调试日志**
   - 查看 Vercel Logs 了解运行状态
   - 查看 Supabase 数据库确认数据写入

## 📝 快速检查清单

- [ ] 已注册 Tokenview 账号
- [ ] 已获取 API Key
- [ ] 已确定 Vercel 域名
- [ ] 已创建 webhook 端点文件
- [ ] 已在 Tokenview 配置监控地址
- [ ] 已填写正确的 Webhook URL
- [ ] 已测试 webhook 连通性
- [ ] 已查看 Vercel 日志确认收到推送

## 🆘 故障排查

### Webhook 没有收到推送

1. **检查 URL 是否正确**
   ```bash
   curl https://你的域名.vercel.app/api/tokenview/webhook
   ```

2. **检查 Tokenview 配置**
   - 地址是否正确
   - Chain 是否选对
   - Webhook URL 是否填对

3. **查看 Vercel 日志**
   - 是否有错误信息
   - 是否收到请求

### 交易未写入数据库

1. **检查环境变量**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **检查数据库表**
   ```sql
   SELECT * FROM blockchain_transactions 
   WHERE source = 'tokenview' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

## 📞 获取帮助

- Tokenview 文档：https://services.tokenview.io/docs
- Tokenview 支持：通过 Dashboard 联系客服

---

**创建时间：** 2025-10-11  
**最后更新：** 2025-10-11

